import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AdminRequest {
  action: "list_users" | "approve_user" | "reject_user" | "suspend_user" | "unsuspend_user" | "reset_password" | "delete_user" | "get_pending_count";
  userId?: string;
  reason?: string;
  newPassword?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create regular client to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

  const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.log("User is not an admin:", user.id);
      throw new Error("Forbidden: Admin access required");
    }

    const body: AdminRequest = await req.json();
    console.log("Admin action:", body.action, "by user:", user.id);

    switch (body.action) {
      case "list_users": {
        // Get all users from auth.users via admin API
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        // Get approval statuses
        const { data: approvals, error: approvalError } = await supabaseAdmin
          .from("user_approvals")
          .select("*");
        if (approvalError) throw approvalError;

        // Get roles
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from("user_roles")
          .select("*");
        if (rolesError) throw rolesError;

        // Combine data
        const users = authUsers.users.map(authUser => {
          const approval = approvals?.find(a => a.user_id === authUser.id);
          const userRoles = roles?.filter(r => r.user_id === authUser.id).map(r => r.role) || [];
          
          return {
            id: authUser.id,
            email: authUser.email,
            display_name: approval?.display_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name,
            status: approval?.status || "pending",
            auth_provider: authUser.app_metadata?.provider || "email",
            roles: userRoles,
            created_at: authUser.created_at,
            last_sign_in: authUser.last_sign_in_at,
            email_confirmed: authUser.email_confirmed_at !== null,
          };
        });

        return new Response(JSON.stringify({ users }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "get_pending_count": {
        const { count, error } = await supabaseAdmin
          .from("user_approvals")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ count: count || 0 }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "approve_user": {
        if (!body.userId) throw new Error("userId required");

        // Update approval status
        const { error: updateError } = await supabaseAdmin
          .from("user_approvals")
          .update({ 
            status: "approved", 
            reviewed_by: user.id, 
            reviewed_at: new Date().toISOString() 
          })
          .eq("user_id", body.userId);

        if (updateError) throw updateError;

        // Add user role if not exists
        const { error: roleInsertError } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: body.userId, role: "user" }, { onConflict: "user_id,role" });

        if (roleInsertError) throw roleInsertError;

        console.log("User approved:", body.userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "reject_user": {
        if (!body.userId) throw new Error("userId required");

        const { error: updateError } = await supabaseAdmin
          .from("user_approvals")
          .update({ 
            status: "rejected", 
            reviewed_by: user.id, 
            reviewed_at: new Date().toISOString(),
            rejection_reason: body.reason || "Registration rejected by admin"
          })
          .eq("user_id", body.userId);

        if (updateError) throw updateError;

        console.log("User rejected:", body.userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "suspend_user": {
        if (!body.userId) throw new Error("userId required");

        const { error: updateError } = await supabaseAdmin
          .from("user_approvals")
          .update({ 
            status: "suspended", 
            reviewed_by: user.id, 
            reviewed_at: new Date().toISOString(),
            rejection_reason: body.reason || "Account suspended"
          })
          .eq("user_id", body.userId);

        if (updateError) throw updateError;

        console.log("User suspended:", body.userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "unsuspend_user": {
        if (!body.userId) throw new Error("userId required");

        const { error: updateError } = await supabaseAdmin
          .from("user_approvals")
          .update({ 
            status: "approved", 
            reviewed_by: user.id, 
            reviewed_at: new Date().toISOString(),
            rejection_reason: null
          })
          .eq("user_id", body.userId);

        if (updateError) throw updateError;

        console.log("User unsuspended:", body.userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "reset_password": {
        if (!body.userId) throw new Error("userId required");

        // Generate a temporary password
        const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          body.userId,
          { password: tempPassword }
        );

        if (updateError) throw updateError;

        console.log("Password reset for user:", body.userId);
        return new Response(JSON.stringify({ success: true, tempPassword }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "delete_user": {
        if (!body.userId) throw new Error("userId required");

        // Delete from auth.users (cascades to other tables)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(body.userId);
        if (deleteError) throw deleteError;

        console.log("User deleted:", body.userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Admin users error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.message.includes("Forbidden") ? 403 : 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
