import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PendingApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (user) {
      checkApprovalStatus();
    }
  }, [user]);

  const checkApprovalStatus = async () => {
    if (!user) return;
    
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("user_approvals")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.status === "approved") {
        toast.success("Your account has been approved!");
        navigate("/");
      } else if (data?.status === "rejected") {
        setStatus("rejected");
      } else if (data?.status === "suspended") {
        setStatus("suspended");
      } else {
        setStatus("pending");
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center" hover={false}>
              {status === "pending" && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <Clock className="w-16 h-16 text-yellow-400" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-4">Pending Approval</h1>
                  <p className="text-muted-foreground mb-6">
                    Your account registration is being reviewed by our administrators. 
                    You'll be notified once your account has been approved.
                  </p>
                </>
              )}

              {status === "rejected" && (
                <>
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-3xl">❌</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-4 text-red-400">Registration Rejected</h1>
                  <p className="text-muted-foreground mb-6">
                    Unfortunately, your registration request was not approved. 
                    Please contact support for more information.
                  </p>
                </>
              )}

              {status === "suspended" && (
                <>
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-3xl">⚠️</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-4 text-orange-400">Account Suspended</h1>
                  <p className="text-muted-foreground mb-6">
                    Your account has been suspended. Please contact support for more information.
                  </p>
                </>
              )}

              <div className="space-y-3">
                <Button
                  onClick={checkApprovalStatus}
                  disabled={checking}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                  Check Status
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
