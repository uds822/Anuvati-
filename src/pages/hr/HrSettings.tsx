import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Users, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const hrRoles = ["super_admin", "hr_admin", "manager", "employee", "volunteer", "finance"];

const HrSettings = () => {
  const { isSuperAdmin } = useHrRole();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState({ email: "", role: "employee" });
  const [newLeaveType, setNewLeaveType] = useState({ name: "", annual_quota: "12", description: "" });

  const fetchData = async () => {
    const [rolesRes, leaveRes] = await Promise.all([
      supabase.from("hr_user_roles").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_leave_types").select("*").order("name"),
    ]);
    setUserRoles(rolesRes.data || []);
    setLeaveTypes(leaveRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const assignRole = async () => {
    if (!newRole.email) { toast.error("Enter user email or UUID"); return; }
    let userId = newRole.email.trim();
    // If input looks like an email, resolve to UUID via profiles table
    if (userId.includes("@")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", userId)
        .maybeSingle();
      if (!profile) { toast.error("No user found with that email"); return; }
      userId = profile.user_id;
    }
    const { error } = await supabase.from("hr_user_roles").insert({
      user_id: userId,
      role: newRole.role as any,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Role assigned");
    setNewRole({ email: "", role: "employee" });
    fetchData();
  };

  const removeRole = async (id: string) => {
    const { error } = await supabase.from("hr_user_roles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Role removed");
    fetchData();
  };

  const addLeaveType = async () => {
    const { error } = await supabase.from("hr_leave_types").insert({
      name: newLeaveType.name,
      annual_quota: parseInt(newLeaveType.annual_quota) || 12,
      description: newLeaveType.description || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Leave type added");
    setNewLeaveType({ name: "", annual_quota: "12", description: "" });
    fetchData();
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Super Admin Only</h2>
        <p className="text-muted-foreground">Only super admins can access settings.</p>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR Settings</h1>
        <p className="text-muted-foreground">Manage roles, leave types, and system configuration</p>
      </div>

      <Tabs defaultValue="roles">
        <TabsList><TabsTrigger value="roles">User Roles</TabsTrigger><TabsTrigger value="leave-types">Leave Types</TabsTrigger></TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign HR Role</CardTitle>
              <CardDescription>Enter the user's email address or UUID to assign an HR portal role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end">
                <div className="flex-1"><Label>User Email or UUID</Label><Input value={newRole.email} onChange={e => setNewRole(p => ({ ...p, email: e.target.value }))} placeholder="e.g. user@example.com or a1b2c3d4-..." /></div>
                <div className="w-40"><Label>Role</Label>
                  <Select value={newRole.role} onValueChange={v => setNewRole(p => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{hrRoles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={assignRole}><Plus className="h-4 w-4 mr-1" />Assign</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Role</TableHead><TableHead>Assigned</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {userRoles.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.user_id}</TableCell>
                    <TableCell><Badge>{r.role}</Badge></TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeRole(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {userRoles.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No roles assigned</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="leave-types" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Leave Type</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end">
                <div className="flex-1"><Label>Name</Label><Input value={newLeaveType.name} onChange={e => setNewLeaveType(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Casual Leave" /></div>
                <div className="w-32"><Label>Annual Quota</Label><Input type="number" value={newLeaveType.annual_quota} onChange={e => setNewLeaveType(p => ({ ...p, annual_quota: e.target.value }))} /></div>
                <Button onClick={addLeaveType} disabled={!newLeaveType.name}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Annual Quota</TableHead><TableHead>Carry Forward</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {leaveTypes.map(lt => (
                  <TableRow key={lt.id}>
                    <TableCell className="font-medium">{lt.name}</TableCell>
                    <TableCell>{lt.annual_quota} days</TableCell>
                    <TableCell>{lt.carry_forward ? "Yes" : "No"}</TableCell>
                    <TableCell><Badge variant={lt.is_active ? "default" : "secondary"}>{lt.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  </TableRow>
                ))}
                {leaveTypes.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No leave types configured</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrSettings;
