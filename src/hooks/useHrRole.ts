import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type HrRole = "super_admin" | "hr_admin" | "manager" | "employee" | "volunteer" | "finance";

export const useHrRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<HrRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("hr_user_roles")
        .select("role")
        .eq("user_id", user.id);

      setRoles((data || []).map((r: any) => r.role as HrRole));
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: HrRole) => roles.includes(role);
  const hasAnyRole = () => roles.length > 0;
  const isSuperAdmin = () => hasRole("super_admin");
  const isHrAdmin = () => hasRole("hr_admin") || hasRole("super_admin");
  const isManager = () => hasRole("manager") || isHrAdmin();
  const canManageEmployees = () => isHrAdmin();

  return { roles, loading, hasRole, hasAnyRole, isSuperAdmin, isHrAdmin, isManager, canManageEmployees };
};
