import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended" | "no_record" | "loading";

export const useApprovalStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus>("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStatus("no_record");
      setLoading(false);
      return;
    }

    checkStatus();
  }, [user, authLoading]);

  const checkStatus = async () => {
    if (!user) return;

    try {
      // Check if user is admin first
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsAdmin(true);
        setStatus("approved");
        setLoading(false);
        return;
      }

      // Check approval status
      const { data: approvalData, error } = await supabase
        .from("user_approvals")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (approvalData) {
        setStatus(approvalData.status as ApprovalStatus);
      } else {
        setStatus("no_record");
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setStatus("no_record");
    } finally {
      setLoading(false);
    }
  };

  return { status, isAdmin, loading, refetch: checkStatus };
};
