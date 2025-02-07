
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserFormData } from "../types";
import { AppRole } from "../types";

interface UserFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

export const UserForm = ({ formData, setFormData, onSubmit, onCancel, isEditMode = false }: UserFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isEditMode}
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
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{isEditMode ? 'Save Changes' : 'Create User'}</Button>
      </DialogFooter>
    </div>
  );
};
