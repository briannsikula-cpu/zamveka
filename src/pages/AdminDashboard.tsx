import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  RefreshCw,
  KeyRound,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Mail,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  auth_provider: string;
  roles: string[];
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsAdmin(true);
        fetchUsers();
      } else {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list_users" },
      });

      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, userId: string) => {
    try {
      const body: any = { action, userId };
      if (actionReason) body.reason = actionReason;

      const { data, error } = await supabase.functions.invoke("admin-users", {
        body,
      });

      if (error) throw error;

      if (action === "reset_password" && data.tempPassword) {
        setTempPassword(data.tempPassword);
        return; // Don't close dialog yet
      }

      toast.success(`User ${action.replace("_", " ")} successfully`);
      setDialogAction(null);
      setSelectedUser(null);
      setActionReason("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error performing action:", error);
      toast.error(error.message || "Failed to perform action");
    }
  };

  const openActionDialog = (user: UserData, action: string) => {
    setSelectedUser(user);
    setDialogAction(action);
    setActionReason("");
    setTempPassword(null);
  };

  const closeDialog = () => {
    setDialogAction(null);
    setSelectedUser(null);
    setActionReason("");
    setTempPassword(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && u.status === activeTab;
  });

  const stats = {
    total: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Manage user accounts, approvals, and access control
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.total, icon: Users, color: "text-blue-400" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
              { label: "Approved", value: stats.approved, icon: UserCheck, color: "text-green-400" },
              { label: "Suspended", value: stats.suspended, icon: UserX, color: "text-orange-400" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Users Table */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Button onClick={fetchUsers} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-background/50">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="suspended">Suspended ({stats.suspended})</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredUsers.map((userData) => (
                        <motion.tr
                          key={userData.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-border/50"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {userData.display_name || "No name"}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {userData.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {userData.auth_provider}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(userData.status)}</TableCell>
                          <TableCell>
                            {userData.roles.includes("admin") ? (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(userData.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              {userData.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-green-400 hover:text-green-300"
                                    onClick={() => openActionDialog(userData, "approve_user")}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-red-400 hover:text-red-300"
                                    onClick={() => openActionDialog(userData, "reject_user")}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {userData.status === "approved" && !userData.roles.includes("admin") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-orange-400 hover:text-orange-300"
                                  onClick={() => openActionDialog(userData, "suspend_user")}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {userData.status === "suspended" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-green-400 hover:text-green-300"
                                  onClick={() => openActionDialog(userData, "unsuspend_user")}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {!userData.roles.includes("admin") && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => openActionDialog(userData, "reset_password")}
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-red-400 hover:text-red-300"
                                    onClick={() => openActionDialog(userData, "delete_user")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* Action Dialogs */}
      <Dialog open={!!dialogAction} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogAction === "approve_user" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {dialogAction === "reject_user" && <XCircle className="w-5 h-5 text-red-400" />}
              {dialogAction === "suspend_user" && <Ban className="w-5 h-5 text-orange-400" />}
              {dialogAction === "unsuspend_user" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {dialogAction === "reset_password" && <KeyRound className="w-5 h-5 text-blue-400" />}
              {dialogAction === "delete_user" && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {dialogAction?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Password has been reset. Share this temporary password with the user:
              </p>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <code className="flex-1 font-mono">{tempPassword}</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(tempPassword)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={closeDialog}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              {(dialogAction === "reject_user" || dialogAction === "suspend_user") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason (optional)</label>
                  <Input
                    placeholder="Enter reason..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              )}

              {dialogAction === "delete_user" && (
                <p className="text-sm text-destructive">
                  This action cannot be undone. The user's account and all associated data will be permanently deleted.
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  variant={dialogAction === "delete_user" || dialogAction === "reject_user" ? "destructive" : "default"}
                  onClick={() => handleAction(dialogAction!, selectedUser!.id)}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
