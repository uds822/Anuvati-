import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, CheckCircle, XCircle, Clock, Eye, UserPlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import EmployeeDetailDialog from "@/components/hr/EmployeeDetailDialog";

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  department_id: string | null;
  designation: string | null;
  joining_date: string | null;
  employment_type: string;
  employment_status: string;
  lifecycle_stage: string;
  onboarding_status: string;
}

interface Dept {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-muted text-muted-foreground",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-destructive/10 text-destructive",
};

const onboardingStatusColors: Record<string, string> = {
  pending_documents: "bg-yellow-100 text-yellow-800",
  documents_submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-destructive/10 text-destructive",
};

const HrEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_id: "", full_name: "", email: "", phone: "", gender: "",
    department_id: "", designation: "", joining_date: "", employment_type: "full_time",
    reporting_manager_id: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { canManageEmployees } = useHrRole();
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: emps }, { data: depts }] = await Promise.all([
      supabase.from("hr_employees").select("*").order("full_name"),
      supabase.from("hr_departments").select("id, name").order("name"),
    ]);
    setEmployees(emps || []);
    setDepartments(depts || []);
  };

  useEffect(() => { fetchData(); }, []);

  const activeEmployees = employees.filter(e => e.onboarding_status === "approved" && e.employment_status === "active");
  const pendingEmployees = employees.filter(e => e.onboarding_status !== "approved");

  const filtered = (activeTab === "active" ? activeEmployees : pendingEmployees).filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ employee_id: "", full_name: "", email: "", phone: "", gender: "", department_id: "", designation: "", joining_date: "", employment_type: "full_time", reporting_manager_id: "" });
    setEditingEmployee(null);
  };

  const openEdit = (e: Employee) => {
    setEditingEmployee(e);
    setForm({
      employee_id: e.employee_id, full_name: e.full_name, email: e.email,
      phone: e.phone || "", gender: e.gender || "", department_id: e.department_id || "",
      designation: e.designation || "", joining_date: e.joining_date || "",
      employment_type: e.employment_type, reporting_manager_id: (e as any).reporting_manager_id || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.full_name || !form.email) {
      toast({ title: "Error", description: "Employee ID, name, and email are required.", variant: "destructive" });
      return;
    }

    let photo_url: string | null = null;
    if (photoFile) {
      setUploading(true);
      const ext = photoFile.name.split(".").pop();
      const path = `photos/${form.employee_id}_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("hr-documents").upload(path, photoFile);
      setUploading(false);
      if (uploadErr) { toast({ title: "Upload Error", description: uploadErr.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("hr-documents").getPublicUrl(path);
      photo_url = urlData.publicUrl;
    }

    const payload: any = {
      employee_id: form.employee_id, full_name: form.full_name, email: form.email,
      phone: form.phone || null, gender: form.gender || null, department_id: form.department_id || null,
      designation: form.designation || null, joining_date: form.joining_date || null,
      employment_type: form.employment_type, reporting_manager_id: form.reporting_manager_id || null,
    };
    if (photo_url) payload.photo_url = photo_url;

    if (editingEmployee) {
      const { error } = await supabase.from("hr_employees").update(payload).eq("id", editingEmployee.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Employee record updated." });
    } else {
      // New employee - set pending status
      payload.onboarding_status = "pending_documents";
      payload.employment_status = "active";
      payload.lifecycle_stage = "onboarding";

      const { data: newEmp, error } = await supabase.from("hr_employees").insert(payload).select().single();
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

      // Automatically send onboarding invite
      toast({ title: "Employee Created", description: "Sending onboarding invite..." });
      sendOnboardingInvite(newEmp.id, form.email, form.full_name);
    }

    setDialogOpen(false);
    resetForm();
    setPhotoFile(null);
    fetchData();
  };

  const sendOnboardingInvite = async (employeeId: string, email: string, fullName: string) => {
    setInviteLoading(employeeId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("onboarding-invite", {
        body: { employee_id: employeeId, email, full_name: fullName },
      });

      if (res.error) {
        toast({ title: "Invite Error", description: res.error.message, variant: "destructive" });
      } else {
        const result = res.data;
        toast({ title: "Onboarding Invite Sent", description: result.message || `Invitation email sent to ${email}.` });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setInviteLoading(null);
  };

  const approveEmployee = async (emp: Employee) => {
    const { error } = await supabase.from("hr_employees").update({
      onboarding_status: "approved",
      lifecycle_stage: "probation",
    }).eq("id", emp.id);

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Approved", description: `${emp.full_name} has been approved and added to active employees.` });
    fetchData();
  };

  const rejectEmployee = async (emp: Employee) => {
    const { error } = await supabase.from("hr_employees").update({
      onboarding_status: "rejected",
      lifecycle_stage: "rejected",
    }).eq("id", emp.id);

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Rejected", description: `${emp.full_name}'s onboarding has been rejected.` });
    fetchData();
  };

  const removeEmployee = async (emp: Employee) => {
    const { error } = await supabase.from("hr_employees").delete().eq("id", emp.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Removed", description: `${emp.full_name} has been removed.` });
    fetchData();
  };

  const getDeptName = (id: string | null) => departments.find((d) => d.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">{activeEmployees.length} active · {pendingEmployees.length} pending onboarding</p>
        </div>
        {canManageEmployees() && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />Onboard Employee</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Onboard New Employee"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Employee ID *</Label><Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="EMP001" /></div>
                  <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@email.com" /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Department</Label>
                    <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
                  <div><Label>Employment Type</Label>
                    <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Joining Date</Label><Input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} /></div>
                  <div><Label>Reporting Manager</Label>
                    <Select value={form.reporting_manager_id} onValueChange={(v) => setForm({ ...form, reporting_manager_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{employees.filter(e => e.id !== editingEmployee?.id).map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Profile Photo</Label><Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} /></div>
                {!editingEmployee && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    📧 An onboarding invite will be sent automatically to the employee's email. They'll be asked to sign up, upload their documents (Aadhaar, PAN, Resume, Degree), and fill in personal details. You can approve them once everything is verified.
                  </p>
                )}
                <Button onClick={handleSubmit} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : editingEmployee ? "Update" : "Add & Send Invite"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Employees ({activeEmployees.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Onboarding ({pendingEmployees.length})
            {pendingEmployees.some(p => p.onboarding_status === "documents_submitted") && (
              <span className="ml-1.5 h-2 w-2 bg-destructive rounded-full inline-block animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0 p-0" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    {canManageEmployees() && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {employees.length === 0 ? "No employees yet. Onboard your first employee." : "No results found."}
                    </TableCell></TableRow>
                  ) : (
                    filtered.map((e) => (
                      <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailEmployeeId(e.id)}>
                        <TableCell className="font-mono text-xs">{e.employee_id}</TableCell>
                        <TableCell>
                          <div><div className="font-medium">{e.full_name}</div><div className="text-xs text-muted-foreground">{e.email}</div></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{getDeptName(e.department_id)}</TableCell>
                        <TableCell className="hidden md:table-cell">{e.designation || "—"}</TableCell>
                        <TableCell><Badge variant="secondary" className={statusColors[e.employment_status] || ""}>{e.employment_status}</Badge></TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{e.employment_type.replace("_", " ")}</TableCell>
                        {canManageEmployees() && (
                          <TableCell onClick={ev => ev.stopPropagation()}>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Employee</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to remove {e.full_name}? This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeEmployee(e)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search pending employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0 p-0" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Onboarding Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending employees</TableCell></TableRow>
                  ) : (
                    filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs">{e.employee_id}</TableCell>
                        <TableCell className="font-medium">{e.full_name}</TableCell>
                        <TableCell className="text-sm">{e.email}</TableCell>
                        <TableCell>
                          <Badge className={onboardingStatusColors[e.onboarding_status] || ""}>
                            {e.onboarding_status === "pending_documents" && <Clock className="h-3 w-3 mr-1" />}
                            {e.onboarding_status === "documents_submitted" && <Eye className="h-3 w-3 mr-1" />}
                            {e.onboarding_status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {e.onboarding_status === "pending_documents" && (
                              <Button size="sm" variant="outline" disabled={inviteLoading === e.id}
                                onClick={() => sendOnboardingInvite(e.id, e.email, e.full_name)}>
                                {inviteLoading === e.id ? "Sending..." : "Resend Invite"}
                              </Button>
                            )}
                            {e.onboarding_status === "documents_submitted" && canManageEmployees() && (
                              <>
                                <Button size="sm" onClick={() => approveEmployee(e)} className="gap-1">
                                  <CheckCircle className="h-3 w-3" />Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => rejectEmployee(e)} className="gap-1">
                                  <XCircle className="h-3 w-3" />Reject
                                </Button>
                              </>
                            )}
                            {e.onboarding_status === "rejected" && canManageEmployees() && (
                              <Button size="sm" variant="outline"
                                onClick={() => sendOnboardingInvite(e.id, e.email, e.full_name)}>
                                Re-invite
                              </Button>
                            )}
                            {canManageEmployees() && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1"><Trash2 className="h-3 w-3" />Remove</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Employee</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to remove {e.full_name} from onboarding? This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeEmployee(e)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EmployeeDetailDialog
        employeeId={detailEmployeeId}
        open={!!detailEmployeeId}
        onClose={() => setDetailEmployeeId(null)}
        departments={departments}
        allEmployees={employees.map(e => ({ id: e.id, full_name: e.full_name }))}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default HrEmployees;
