import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  User, Calendar, Clock, Wallet, FileText, FolderKanban,
  Upload, Download, CalendarOff, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const documentTypes = ["resume", "id_proof", "certificate", "offer_letter", "contract", "other"];

const HrMyProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", document_type: "other", file: null as File | null });

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      // Get employee record for current user
      const { data: emp } = await supabase
        .from("hr_employees")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!emp) { setLoading(false); return; }
      setEmployee(emp);

      // Fetch all related data in parallel
      const [deptRes, attRes, leaveRes, balRes, payRes, taskRes, docRes] = await Promise.all([
        emp.department_id ? supabase.from("hr_departments").select("name").eq("id", emp.department_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("hr_attendance").select("*").eq("employee_id", emp.id).order("date", { ascending: false }).limit(30),
        supabase.from("hr_leave_requests").select("*, hr_leave_types(name)").eq("employee_id", emp.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("hr_leave_balances").select("*, hr_leave_types(name)").eq("employee_id", emp.id).eq("year", new Date().getFullYear()),
        supabase.from("hr_payslips").select("*").eq("employee_id", emp.id).order("year", { ascending: false }).limit(12),
        supabase.from("hr_tasks").select("*, hr_projects(name)").eq("assigned_to", emp.id).order("due_date").limit(20),
        supabase.from("hr_employee_documents").select("*").eq("employee_id", emp.id).order("uploaded_at", { ascending: false }),
      ]);
      setDepartment(deptRes.data);
      setAttendance(attRes.data || []);
      setLeaveRequests(leaveRes.data || []);
      setLeaveBalances(balRes.data || []);
      setPayslips(payRes.data || []);
      setTasks(taskRes.data || []);
      setDocuments(docRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const handleUpload = async () => {
    if (!uploadForm.file || !employee) return;
    const filePath = `${employee.id}/${Date.now()}_${uploadForm.file.name}`;
    const { error: storageError } = await supabase.storage
      .from("hr-documents")
      .upload(filePath, uploadForm.file);
    if (storageError) { toast.error(storageError.message); return; }

    const { error } = await supabase.from("hr_employee_documents").insert({
      employee_id: employee.id,
      title: uploadForm.title || uploadForm.file.name,
      document_type: uploadForm.document_type,
      file_path: filePath,
      file_size: uploadForm.file.size,
      uploaded_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Document uploaded");
    setUploadOpen(false);
    setUploadForm({ title: "", document_type: "other", file: null });
    // Refresh documents
    const { data } = await supabase.from("hr_employee_documents").select("*").eq("employee_id", employee.id).order("uploaded_at", { ascending: false });
    setDocuments(data || []);
  };

  const downloadDoc = async (filePath: string, title: string) => {
    const { data, error } = await supabase.storage.from("hr-documents").download(filePath);
    if (error) { toast.error(error.message); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = title; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (!employee) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <User className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-xl font-bold">No Employee Record Found</h2>
      <p className="text-muted-foreground">Your account is not linked to an employee profile. Contact HR admin.</p>
    </div>
  );

  const initials = employee.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
  const presentDays = attendance.filter(a => a.status === "present").length;
  const pendingLeaves = leaveRequests.filter(l => l.status === "pending").length;
  const pendingTasks = tasks.filter(t => t.status !== "done").length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{employee.full_name}</h1>
              <p className="text-muted-foreground">{employee.designation || "No designation"} · {department?.name || "No department"}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{employee.employee_id}</Badge>
                <Badge variant="outline">{employee.employment_type?.replace(/_/g, " ") || "—"}</Badge>
                <Badge variant={employee.employment_status === "active" ? "default" : "secondary"}>{employee.employment_status}</Badge>
                {employee.lifecycle_stage && <Badge variant="outline">{employee.lifecycle_stage}</Badge>}
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📧 {employee.email}</p>
              {employee.phone && <p>📱 {employee.phone}</p>}
              {employee.joining_date && <p>📅 Joined: {format(new Date(employee.joining_date), "MMM d, yyyy")}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><Clock className="h-6 w-6 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{presentDays}</p><p className="text-xs text-muted-foreground">Days Present (30d)</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><CalendarOff className="h-6 w-6 mx-auto text-orange-500 mb-1" /><p className="text-2xl font-bold">{pendingLeaves}</p><p className="text-xs text-muted-foreground">Pending Leaves</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><FolderKanban className="h-6 w-6 mx-auto text-blue-500 mb-1" /><p className="text-2xl font-bold">{pendingTasks}</p><p className="text-xs text-muted-foreground">Active Tasks</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><FileText className="h-6 w-6 mx-auto text-green-500 mb-1" /><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Documents</p></CardContent></Card>
      </div>

      <Tabs defaultValue="leave">
        <TabsList className="flex-wrap"><TabsTrigger value="leave">Leave Balance</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger><TabsTrigger value="payslips">Payslips</TabsTrigger><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger></TabsList>

        {/* Leave Balance */}
        <TabsContent value="leave" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveBalances.map(lb => (
              <Card key={lb.id}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{lb.hr_leave_types?.name || "Leave"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Used: {lb.used}</span><span>Total: {lb.total_allocated}</span>
                  </div>
                  <Progress value={lb.total_allocated ? (lb.used / lb.total_allocated) * 100 : 0} className="h-2" />
                  <p className="text-sm font-medium mt-1 text-primary">Remaining: {lb.remaining ?? (lb.total_allocated - lb.used)}</p>
                </CardContent>
              </Card>
            ))}
            {leaveBalances.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-4">No leave balances configured for this year</p>}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg">Leave History</CardTitle></CardHeader>
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {leaveRequests.map(lr => (
                  <TableRow key={lr.id}>
                    <TableCell>{lr.hr_leave_types?.name || "—"}</TableCell>
                    <TableCell>{lr.start_date}</TableCell>
                    <TableCell>{lr.end_date}</TableCell>
                    <TableCell>{lr.total_days}</TableCell>
                    <TableCell><Badge variant={lr.status === "approved" ? "default" : lr.status === "rejected" ? "destructive" : "outline"}>{lr.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {leaveRequests.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No leave requests</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Mode</TableHead></TableRow></TableHeader>
              <TableBody>
                {attendance.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {a.status === "present" ? <CheckCircle className="h-4 w-4 text-green-500" /> : a.status === "absent" ? <XCircle className="h-4 w-4 text-red-500" /> : <AlertCircle className="h-4 w-4 text-orange-500" />}
                        {a.status}
                      </div>
                    </TableCell>
                    <TableCell>{a.check_in ? format(new Date(a.check_in), "hh:mm a") : "—"}</TableCell>
                    <TableCell>{a.check_out ? format(new Date(a.check_out), "hh:mm a") : "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.work_mode || "office"}</Badge></TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No attendance records</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Payslips */}
        <TabsContent value="payslips">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Year</TableHead><TableHead>Basic</TableHead><TableHead>Earnings</TableHead><TableHead>Deductions</TableHead><TableHead>Net Salary</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {payslips.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.month}</TableCell>
                    <TableCell>{p.year}</TableCell>
                    <TableCell>₹{Number(p.basic_salary).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(p.total_earnings).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(p.total_deductions).toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{Number(p.net_salary).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={p.status === "finalized" ? "default" : "outline"}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {payslips.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-4">No payslips</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Priority</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {tasks.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.hr_projects?.name || "—"}</TableCell>
                    <TableCell><Badge variant={t.priority === "high" ? "destructive" : "outline"}>{t.priority}</Badge></TableCell>
                    <TableCell>{t.due_date || "—"}</TableCell>
                    <TableCell><Badge variant={t.status === "done" ? "default" : t.status === "in_progress" ? "secondary" : "outline"}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No tasks assigned</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild><Button><Upload className="h-4 w-4 mr-2" />Upload Document</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} placeholder="Document title" /></div>
                  <div><Label>Type</Label>
                    <Select value={uploadForm.document_type} onValueChange={v => setUploadForm(p => ({ ...p, document_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{documentTypes.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>File</Label><Input type="file" onChange={e => setUploadForm(p => ({ ...p, file: e.target.files?.[0] || null }))} /></div>
                  <Button onClick={handleUpload} disabled={!uploadForm.file} className="w-full">Upload</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Uploaded</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {documents.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell><Badge variant="outline">{d.document_type.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{format(new Date(d.uploaded_at), "MMM d, yyyy")}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => downloadDoc(d.file_path, d.title)}><Download className="h-3 w-3 mr-1" />Download</Button></TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">No documents uploaded</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrMyProfile;
