import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password required");
    }

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users.find(u => u.email === email);

    let adminUserId: string;

    if (existingAdmin) {
      // Update password if user exists
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        existingAdmin.id,
        { password, email_confirm: true }
      );
      if (error) throw error;
      adminUserId = existingAdmin.id;
      console.log("Updated existing admin user:", adminUserId);
    } else {
      // Create new admin user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      adminUserId = data.user.id;
      console.log("Created new admin user:", adminUserId);
    }

    // Check if admin role exists
    const { data: roleExists } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleExists) {
      // Add admin role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: adminUserId, role: "admin" });
      
      if (roleError) throw roleError;
      console.log("Added admin role");
    }

    // Check if approval record exists
    const { data: approvalExists } = await supabaseAdmin
      .from("user_approvals")
      .select("id")
      .eq("user_id", adminUserId)
      .maybeSingle();

    if (!approvalExists) {
      // Add approval record
      const { error: approvalError } = await supabaseAdmin
        .from("user_approvals")
        .insert({
          user_id: adminUserId,
          email,
          display_name: "Admin",
          status: "approved",
          auth_provider: "email",
        });
      
      if (approvalError) throw approvalError;
      console.log("Added approval record");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin account configured successfully" }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Setup admin error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
