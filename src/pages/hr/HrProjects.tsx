import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, FolderKanban, Users, Calendar, Search, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(350,65%,42%)", "hsl(28,85%,55%)", "hsl(280,45%,35%)", "hsl(160,50%,40%)", "hsl(210,60%,50%)"];
const STATUS_OPTIONS = ["planning", "active", "on_hold", "completed", "cancelled"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

const statusColor = (s: string) => {
  switch (s) {
    case "active": return "default";
    case "completed": return "secondary";
    case "on_hold": return "outline";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

const HrProjects = () => {
  const { isHrAdmin, isManager } = useHrRole();
  const canManage = isHrAdmin() || isManager();
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "planning", priority: "medium", department_id: "", project_lead_id: "", start_date: "", end_date: "", budget: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "todo", priority: "medium", assigned_to: "", due_date: "" });
  const [memberEmployee, setMemberEmployee] = useState("");

  const fetchAll = async () => {
    const [p, e, d, t, m] = await Promise.all([
      supabase.from("hr_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name, employee_id, department_id").eq("employment_status", "active"),
      supabase.from("hr_departments").select("id, name"),
      supabase.from("hr_tasks").select("*"),
      supabase.from("hr_project_members").select("*"),
    ]);
    setProjects(p.data || []);
    setEmployees(e.data || []);
    setDepartments(d.data || []);
    setTasks(t.data || []);
    setMembers(m.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveProject = async () => {
    if (!form.name) { toast({ title: "Project name required", variant: "destructive" }); return; }
    const payload: any = {
      name: form.name,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      department_id: form.department_id || null,
      project_lead_id: form.project_lead_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : 0,
    };

    let error;
    if (selectedProject) {
      ({ error } = await supabase.from("hr_projects").update(payload).eq("id", selectedProject.id));
    } else {
      ({ error } = await supabase.from("hr_projects").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: selectedProject ? "Project updated" : "Project created" });
    setDialogOpen(false);
    setSelectedProject(null);
    setForm({ name: "", description: "", status: "planning", priority: "medium", department_id: "", project_lead_id: "", start_date: "", end_date: "", budget: "" });
    fetchAll();
  };

  const handleAddTask = async () => {
    if (!taskForm.title || !selectedProject) return;
    const { error } = await supabase.from("hr_tasks").insert({
      project_id: selectedProject.id,
      title: taskForm.title,
      description: taskForm.description || null,
      status: taskForm.status,
      priority: taskForm.priority,
      assigned_to: taskForm.assigned_to || null,
      due_date: taskForm.due_date || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Task added" });
    setTaskDialogOpen(false);
    setTaskForm({ title: "", description: "", status: "todo", priority: "medium", assigned_to: "", due_date: "" });
    fetchAll();
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    await supabase.from("hr_tasks").update({ status, completed_at: status === "done" ? new Date().toISOString() : null }).eq("id", taskId);
    fetchAll();
  };

  const handleAddMember = async () => {
    if (!memberEmployee || !selectedProject) return;
    const { error } = await supabase.from("hr_project_members").insert({ project_id: selectedProject.id, employee_id: memberEmployee });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Member added" });
    setMemberDialogOpen(false);
    setMemberEmployee("");
    fetchAll();
  };

  const handleRemoveMember = async (memberId: string) => {
    await supabase.from("hr_project_members").delete().eq("id", memberId);
    fetchAll();
  };

  const openEdit = (p: any) => {
    setSelectedProject(p);
    setForm({
      name: p.name, description: p.description || "", status: p.status, priority: p.priority || "medium",
      department_id: p.department_id || "", project_lead_id: p.project_lead_id || "",
      start_date: p.start_date || "", end_date: p.end_date || "", budget: String(p.budget || ""),
    });
    setDialogOpen(true);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const empName = (id: string) => employees.find(e => e.id === id)?.full_name || "—";
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || "—";

  const projectTasks = (pid: string) => tasks.filter(t => t.project_id === pid);
  const projectMembers = (pid: string) => members.filter(m => m.project_id === pid);

  const calcProgress = (pid: string) => {
    const pt = projectTasks(pid);
    if (!pt.length) return 0;
    return Math.round((pt.filter(t => t.status === "done").length / pt.length) * 100);
  };

  // Dashboard stats
  const statusDist = STATUS_OPTIONS.map(s => ({ name: s, count: projects.filter(p => p.status === s).length })).filter(s => s.count > 0);
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects & Tasks</h1>
            <p className="text-muted-foreground text-sm">Manage projects, assign teams, and track task progress</p>
          </div>
          <TabsList>
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="projects"><FolderKanban className="h-4 w-4 mr-1" />Projects</TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{projects.length}</div><p className="text-muted-foreground text-sm">Total Projects</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{projects.filter(p => p.status === "active").length}</div><p className="text-muted-foreground text-sm">Active Projects</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</div><p className="text-muted-foreground text-sm">Tasks Completed</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-destructive">{overdueTasks}</div><p className="text-muted-foreground text-sm">Overdue Tasks</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Projects by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => `${name}: ${count}`}>
                      {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Task Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: "To Do", count: tasks.filter(t => t.status === "todo").length },
                    { name: "In Progress", count: tasks.filter(t => t.status === "in_progress").length },
                    { name: "Review", count: tasks.filter(t => t.status === "review").length },
                    { name: "Done", count: tasks.filter(t => t.status === "done").length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {canManage && (
              <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setSelectedProject(null); setForm({ name: "", description: "", status: "planning", priority: "medium", department_id: "", project_lead_id: "", start_date: "", end_date: "", budget: "" }); } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Project</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{selectedProject ? "Edit Project" : "Create Project"}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Status</Label>
                        <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Priority</Label>
                        <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Department</Label>
                        <Select value={form.department_id} onValueChange={v => setForm({ ...form, department_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Project Lead</Label>
                        <Select value={form.project_lead_id} onValueChange={v => setForm({ ...form, project_lead_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                      <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
                    </div>
                    <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></div>
                    <Button onClick={handleSaveProject} className="w-full">{selectedProject ? "Update" : "Create"} Project</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const prog = calcProgress(p.id);
              const pt = projectTasks(p.id);
              const pm = projectMembers(p.id);
              return (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedProject(p); }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <Badge variant={statusColor(p.status)}>{p.status.replace("_", " ")}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{p.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span><Users className="inline h-3 w-3 mr-1" />{pm.length} members</span>
                      <span><Calendar className="inline h-3 w-3 mr-1" />{p.end_date ? format(new Date(p.end_date), "dd MMM yyyy") : "No deadline"}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{pt.filter(t => t.status === "done").length}/{pt.length} tasks</span>
                        <span>{prog}%</span>
                      </div>
                      <Progress value={prog} className="h-2" />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{p.priority}</Badge>
                      {p.department_id && <Badge variant="secondary" className="text-xs">{deptName(p.department_id)}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!filtered.length && <p className="text-muted-foreground col-span-full text-center py-10">No projects found</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      {selectedProject && !dialogOpen && (
        <Dialog open={!!selectedProject && !dialogOpen} onOpenChange={(o) => { if (!o) setSelectedProject(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle>{selectedProject.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.description || ""}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusColor(selectedProject.status)}>{selectedProject.status.replace("_", " ")}</Badge>
                  {canManage && <Button size="sm" variant="outline" onClick={() => openEdit(selectedProject)}>Edit</Button>}
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground">Lead:</span> {empName(selectedProject.project_lead_id)}</div>
              <div><span className="text-muted-foreground">Dept:</span> {deptName(selectedProject.department_id)}</div>
              <div><span className="text-muted-foreground">Start:</span> {selectedProject.start_date ? format(new Date(selectedProject.start_date), "dd MMM yy") : "—"}</div>
              <div><span className="text-muted-foreground">End:</span> {selectedProject.end_date ? format(new Date(selectedProject.end_date), "dd MMM yy") : "—"}</div>
            </div>

            {/* Members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Team Members ({projectMembers(selectedProject.id).length})</h3>
                {canManage && (
                  <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                      <Select value={memberEmployee} onValueChange={setMemberEmployee}>
                        <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                        <SelectContent>{employees.filter(e => !projectMembers(selectedProject.id).find(m => m.employee_id === e.id)).map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {projectMembers(selectedProject.id).map(m => (
                  <Badge key={m.id} variant="secondary" className="gap-1">
                    {empName(m.employee_id)}
                    {canManage && <button className="ml-1 text-xs hover:text-destructive" onClick={() => handleRemoveMember(m.id)}>×</button>}
                  </Badge>
                ))}
                {!projectMembers(selectedProject.id).length && <span className="text-muted-foreground text-sm">No members assigned</span>}
              </div>
            </div>

            {/* Tasks */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Tasks ({projectTasks(selectedProject.id).length})</h3>
                {canManage && (
                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add Task</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div><Label>Title *</Label><Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
                        <div><Label>Description</Label><Textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Priority</Label>
                            <Select value={taskForm.priority} onValueChange={v => setTaskForm({ ...taskForm, priority: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div><Label>Assign To</Label>
                            <Select value={taskForm.assigned_to} onValueChange={v => setTaskForm({ ...taskForm, assigned_to: v })}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div><Label>Due Date</Label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
                        <Button onClick={handleAddTask} className="w-full">Add Task</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectTasks(selectedProject.id).map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{empName(t.assigned_to)}</TableCell>
                      <TableCell><Badge variant={t.priority === "critical" ? "destructive" : "outline"} className="text-xs">{t.priority}</Badge></TableCell>
                      <TableCell className={t.due_date && new Date(t.due_date) < new Date() && t.status !== "done" ? "text-destructive" : ""}>
                        {t.due_date ? format(new Date(t.due_date), "dd MMM") : "—"}
                      </TableCell>
                      <TableCell>
                        <Select value={t.status} onValueChange={v => handleUpdateTaskStatus(t.id, v)}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["todo", "in_progress", "review", "done"].map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!projectTasks(selectedProject.id).length && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No tasks yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HrProjects;
