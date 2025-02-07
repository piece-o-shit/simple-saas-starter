
import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  roles: AppRole[];
}

export interface UserFormData {
  email: string;
  full_name: string;
  subscription_tier: string;
  roles: AppRole[];
}
