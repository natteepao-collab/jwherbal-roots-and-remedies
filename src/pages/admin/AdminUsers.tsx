import { useEffect, useState } from "react";
import { Search, Shield, User, MoreHorizontal, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch roles for all users
    const usersWithRoles = await Promise.all(
      (profilesData || []).map(async (profile) => {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .eq("role", "admin")
          .single();

        return {
          ...profile,
          isAdmin: !!roleData,
        };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    if (actionType === "remove") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id)
        .eq("role", "admin");

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "ลบสิทธิ์ Admin เรียบร้อยแล้ว" });
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUser.id, role: "admin" });

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "เพิ่มสิทธิ์ Admin เรียบร้อยแล้ว" });
        fetchUsers();
      }
    }

    setIsConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "เกิดข้อผิดพลาด", description: "กรุณาเข้าสู่ระบบใหม่", variant: "destructive" });
        return;
      }

      const response = await supabase.functions.invoke("delete-user", {
        body: { userId: selectedUser.id },
      });

      if (response.error) {
        toast({ 
          title: "เกิดข้อผิดพลาด", 
          description: response.error.message || "ไม่สามารถลบผู้ใช้ได้", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "สำเร็จ", description: "ลบผู้ใช้เรียบร้อยแล้ว" });
        fetchUsers();
      }
    } catch (error: any) {
      toast({ 
        title: "เกิดข้อผิดพลาด", 
        description: error.message || "ไม่สามารถลบผู้ใช้ได้", 
        variant: "destructive" 
      });
    } finally {
      setDeleting(false);
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const adminCount = users.filter((u) => u.isAdmin).length;
  const userCount = users.filter((u) => !u.isAdmin).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการผู้ใช้</h1>
        <p className="text-muted-foreground mt-1">จัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary">
          <Shield className="h-4 w-4" />
          <span className="font-medium">{adminCount} Admin</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium">{userCount} User</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาผู้ใช้..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>วันที่สมัคร</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  ไม่พบผู้ใช้
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.isAdmin ? (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("remove");
                              setIsConfirmOpen(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            ลบสิทธิ์ Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("add");
                              setIsConfirmOpen(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            เพิ่มสิทธิ์ Admin
                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setIsDeleteConfirmOpen(true);
                                          }}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          ลบผู้ใช้
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Role Change Confirmation Dialog */}
                      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {actionType === "add" ? "เพิ่มสิทธิ์ Admin" : "ลบสิทธิ์ Admin"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {actionType === "add"
                                ? `คุณต้องการเพิ่มสิทธิ์ Admin ให้กับ "${selectedUser?.full_name || selectedUser?.email}" หรือไม่?`
                                : `คุณต้องการลบสิทธิ์ Admin ของ "${selectedUser?.full_name || selectedUser?.email}" หรือไม่?`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRoleChange}>
                              ยืนยัน
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Delete User Confirmation Dialog */}
                      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">ลบผู้ใช้ออกจากระบบ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณต้องการลบผู้ใช้ "{selectedUser?.full_name || selectedUser?.email}" ออกจากระบบหรือไม่?
                              <br /><br />
                              <strong className="text-destructive">คำเตือน:</strong> การดำเนินการนี้ไม่สามารถยกเลิกได้ ข้อมูลผู้ใช้ทั้งหมดจะถูกลบอย่างถาวร
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteUser}
                              disabled={deleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {deleting ? "กำลังลบ..." : "ยืนยันการลบ"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                };

                export default AdminUsers;
