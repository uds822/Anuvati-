import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CrmRole = "crm_admin" | "supervisor" | "facilitator" | "finance" | "funder";

export const useCrmRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<CrmRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("crm_user_roles")
        .select("role")
        .eq("user_id", user.id);

      setRoles((data || []).map((r: any) => r.role as CrmRole));
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: CrmRole) => roles.includes(role);
  const hasAnyRole = () => roles.length > 0;
  const isAdmin = () => hasRole("crm_admin");
  const canWrite = () => hasRole("crm_admin") || hasRole("supervisor");
  const isFunder = () => hasRole("funder");

  return { roles, loading, hasRole, hasAnyRole, isAdmin, canWrite, isFunder };
};
