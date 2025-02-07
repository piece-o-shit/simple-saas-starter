import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  roles: AppRole[];
}

interface UserFormData {
  email: string;
  full_name: string;
  subscription_tier: string;
  roles: AppRole[];
}

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    full_name: "",
    subscription_tier: "free",
    roles: ["user"],
  });

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: roles?.map(r => r.role) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        user_metadata: { full_name: formData.full_name }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          subscription_tier: formData.subscription_tier
        });

      if (profileError) throw profileError;

      // Assign roles
      const rolePromises = formData.roles.map(role =>
        supabase
          .from('user_roles')
          .insert({ 
            user_id: authData.user.id, 
            role: role as AppRole 
          })
      );

      await Promise.all(rolePromises);

      // Log admin action
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        await supabase
          .from('admin_audit_logs')
          .insert({
            admin_id: currentUser.id,
            action_type: 'CREATE',
            table_name: 'profiles',
            record_id: authData.user.id,
            changes: JSON.stringify(formData)
          });
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.message,
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          subscription_tier: formData.subscription_tier
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Update roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      const rolePromises = formData.roles.map(role =>
        supabase
          .from('user_roles')
          .insert({ 
            user_id: selectedUser.id, 
            role: role as AppRole 
          })
      );

      await Promise.all(rolePromises);

      // Log admin action
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        await supabase
          .from('admin_audit_logs')
          .insert({
            admin_id: currentUser.id,
            action_type: 'UPDATE',
            table_name: 'profiles',
            record_id: selectedUser.id,
            changes: JSON.stringify(formData)
          });
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Log admin action
      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          table_name: 'profiles',
          record_id: userId,
          changes: null
        });

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      subscription_tier: user.subscription_tier,
      roles: user.roles,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. They will receive an email to set their password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subscription Tier</label>
                  <Select
                    value={formData.subscription_tier}
                    onValueChange={(value) => setFormData({ ...formData, subscription_tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={formData.roles[0]}
                    onValueChange={(value: AppRole) => setFormData({ ...formData, roles: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="text-center">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.roles.map((role) => (
                        <Badge key={role} className="capitalize">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Modify user details and roles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={formData.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subscription Tier</label>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) => setFormData({ ...formData, subscription_tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.roles[0]}
                  onValueChange={(value: AppRole) => setFormData({ ...formData, roles: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
