
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserForm } from "./components/UserForm";
import { UserTable } from "./components/UserTable";
import { useUsers } from "./hooks/useUsers";
import { UserFormData, UserProfile, AppRole } from "./types";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const AdminContent = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { users, loading, fetchUsers } = useUsers();

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    full_name: "",
    subscription_tier: "free",
    roles: ["user"],
  });

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
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        await supabase
          .from('admin_audit_logs')
          .insert({
            admin_id: currentUser.id,
            action_type: 'DELETE',
            table_name: 'profiles',
            record_id: userId,
            changes: null
          });
      }

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
            <ErrorBoundary>
              <UserForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateUser}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <ErrorBoundary>
          <UserTable
            users={users}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteUser}
          />
        </ErrorBoundary>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user details and roles.
            </DialogDescription>
          </DialogHeader>
          <ErrorBoundary>
            <UserForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEditUser}
              onCancel={() => setIsEditDialogOpen(false)}
              isEditMode
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Admin = () => {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <AdminContent />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default Admin;

