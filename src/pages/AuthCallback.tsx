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

           // If no approval record, user is a regular user - allow immediate access
           if (!approvalData) {
             toast.success("Welcome!");
             navigate("/");
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
           } else if (approvalData.status === "pending") {
             // Only artists wait for approval
            navigate("/pending-approval");
           } else {
             toast.success("Welcome!");
             navigate("/");
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
