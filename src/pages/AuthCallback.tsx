import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          // Check if approval record exists, create if not (for social login)
          const { data: approvalData } = await supabase
            .from("user_approvals")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (!approvalData) {
            // Create approval record for social login users
            await supabase.from("user_approvals").insert({
              user_id: session.user.id,
              email: session.user.email || "",
              display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              auth_provider: session.user.app_metadata?.provider || "google",
              status: "pending",
            });
            
            toast.info("Account created! Awaiting admin approval.");
            navigate("/pending-approval");
            return;
          }

          // Check if user is admin
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (roleData) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
            return;
          }

          // Check approval status
          if (approvalData.status === "approved") {
            toast.success("Welcome back!");
            navigate("/");
          } else if (approvalData.status === "suspended") {
            toast.error("Your account has been suspended");
            await supabase.auth.signOut();
            navigate("/auth");
          } else if (approvalData.status === "rejected") {
            toast.error("Your registration was rejected");
            await supabase.auth.signOut();
            navigate("/auth");
          } else {
            navigate("/pending-approval");
          }
        } else {
          navigate("/auth");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed");
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
