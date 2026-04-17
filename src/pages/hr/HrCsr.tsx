import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Building2, Users, Clock, BarChart3 } from "lucide-react";

interface CsrProject {
  id: string;
  project_name: string;
  csr_partner: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  created_at: string;
}

interface CsrAllocation {
  id: string;
  csr_project_id: string;
  employee_id: string;
  role: string | null;
  hours_spent: number | null;
  activity_log: string | null;
  assigned_date: string | null;
  hr_employees?: { full_name: string; employee_id: string };
  hr_csr_projects?: { project_name: string };
}

const HrCsr = () => {
  const { isHrAdmin } = useHrRole();
  const [projects, setProjects] = useState<CsrProject[]>([]);
  const [allocations, setAllocations] = useState<CsrAllocation[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; employee_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allocDialogOpen, setAllocDialogOpen] = useState(false);

  const [form, setForm] = useState({ project_name: "", csr_partner: "", description: "", start_date: "", end_date: "", budget: "", status: "active" });
  const [allocForm, setAllocForm] = useState({ csr_project_id: "", employee_id: "", role: "member", hours_spent: "0", activity_log: "" });

  const fetchData = async () => {
    setLoading(true);
    const [{ data: p }, { data: a }, { data: e }] = await Promise.all([
      supabase.from("hr_csr_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_csr_allocations").select("*, hr_employees(full_name, employee_id), hr_csr_projects(project_name)").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name, employee_id").eq("employment_status", "active"),
    ]);
    setProjects(p || []);
    setAllocations((a || []) as any);
    setEmployees(e || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateProject = async () => {
    const { error } = await supabase.from("hr_csr_projects").insert({
      project_name: form.project_name,
      csr_partner: form.csr_partner || null,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : 0,
      status: form.status,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("CSR project created");
    setDialogOpen(false);
    setForm({ project_name: "", csr_partner: "", description: "", start_date: "", end_date: "", budget: "", status: "active" });
    fetchData();
  };

  const handleAllocate = async () => {
    const { error } = await supabase.from("hr_csr_allocations").insert({
      csr_project_id: allocForm.csr_project_id,
      employee_id: allocForm.employee_id,
      role: allocForm.role,
      hours_spent: Number(allocForm.hours_spent) || 0,
      activity_log: allocForm.activity_log || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Staff allocated to CSR project");
    setAllocDialogOpen(false);
    setAllocForm({ csr_project_id: "", employee_id: "", role: "member", hours_spent: "0", activity_log: "" });
    fetchData();
  };

  const totalHours = allocations.reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const totalBudget = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const activeProjects = projects.filter(p => p.status === "active").length;

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "default";
      case "completed": return "secondary";
      case "on_hold": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CSR Staff Allocation</h1>
          <p className="text-muted-foreground">Track employees assigned to CSR-funded projects</p>
        </div>
        {isHrAdmin() && (
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New CSR Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create CSR Project</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Project Name *" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} />
                  <Input placeholder="CSR Partner" value={form.csr_partner} onChange={e => setForm({ ...form, csr_partner: e.target.value })} />
                  <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                    <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                  <Input type="number" placeholder="Budget (₹)" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateProject} disabled={!form.project_name} className="w-full">Create Project</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={allocDialogOpen} onOpenChange={setAllocDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Users className="h-4 w-4 mr-2" />Allocate Staff</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Allocate Staff to CSR Project</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={allocForm.csr_project_id} onValueChange={v => setAllocForm({ ...allocForm, csr_project_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={allocForm.employee_id} onValueChange={v => setAllocForm({ ...allocForm, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Role" value={allocForm.role} onChange={e => setAllocForm({ ...allocForm, role: e.target.value })} />
                  <Input type="number" placeholder="Hours Spent" value={allocForm.hours_spent} onChange={e => setAllocForm({ ...allocForm, hours_spent: e.target.value })} />
                  <Textarea placeholder="Activity Log" value={allocForm.activity_log} onChange={e => setAllocForm({ ...allocForm, activity_log: e.target.value })} />
                  <Button onClick={handleAllocate} disabled={!allocForm.csr_project_id || !allocForm.employee_id} className="w-full">Allocate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{projects.length}</p><p className="text-xs text-muted-foreground">Total CSR Projects</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{activeProjects}</p><p className="text-xs text-muted-foreground">Active Projects</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{allocations.length}</p><p className="text-xs text-muted-foreground">Staff Allocated</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalHours}</p><p className="text-xs text-muted-foreground">Total Hours</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">CSR Projects</TabsTrigger>
          <TabsTrigger value="allocations">Staff Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>CSR Partner</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No CSR projects yet</TableCell></TableRow>
                  ) : projects.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.project_name}</TableCell>
                      <TableCell>{p.csr_partner || "—"}</TableCell>
                      <TableCell className="text-sm">{p.start_date || "—"} → {p.end_date || "—"}</TableCell>
                      <TableCell>₹{Number(p.budget || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColor(p.status)}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : allocations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No allocations yet</TableCell></TableRow>
                  ) : allocations.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{(a as any).hr_employees?.full_name || "—"}</TableCell>
                      <TableCell>{(a as any).hr_csr_projects?.project_name || "—"}</TableCell>
                      <TableCell>{a.role}</TableCell>
                      <TableCell>{a.hours_spent}h</TableCell>
                      <TableCell className="max-w-[200px] truncate">{a.activity_log || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrCsr;
