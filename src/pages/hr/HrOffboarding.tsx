import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UserMinus, CheckCircle, Clock, XCircle, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const CLEARANCE_DEPARTMENTS = [
  { key: "reporting_manager", label: "Reporting Manager", description: "Knowledge transfer & work handover" },
  { key: "it_assets", label: "IT / Asset Clearance", description: "Laptops, phones, ID cards returned" },
  { key: "finance", label: "Finance / Payroll", description: "Settle dues, reimbursements, full & final" },
  { key: "hr_final", label: "HR Final Clearance", description: "Experience letter, offboarding complete" },
];

const statusColors: Record<string, string> = {
  initiated: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-muted text-muted-foreground",
};

const clearanceColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-destructive/10 text-destructive",
};

interface Employee { id: string; employee_id: string; full_name: string; email: string; designation: string | null; department_id: string | null; }
interface OffboardingRequest { id: string; employee_id: string; initiated_by: string | null; reason: string; last_working_date: string | null; status: string; notes: string | null; created_at: string; }
interface Clearance { id: string; offboarding_id: string; department: string; status: string; approved_by: string | null; remarks: string | null; updated_at: string; }

const HrOffboarding = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<OffboardingRequest[]>([]);
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ employee_id: "", reason: "resignation", last_working_date: "", notes: "" });

  const fetchData = async () => {
    const [{ data: emps }, { data: reqs }, { data: clears }] = await Promise.all([
      supabase.from("hr_employees").select("id, employee_id, full_name, email, designation, department_id").eq("employment_status", "active").order("full_name"),
      supabase.from("hr_offboarding_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_offboarding_clearances").select("*"),
    ]);
    setEmployees(emps || []);
    setRequests((reqs || []) as OffboardingRequest[]);
    setClearances((clears || []) as Clearance[]);
  };

  useEffect(() => { fetchData(); }, []);

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.full_name || "Unknown";
  const getEmpCode = (id: string) => employees.find(e => e.id === id)?.employee_id || "";

  const handleInitiateOffboarding = async () => {
    if (!form.employee_id) {
      toast({ title: "Error", description: "Select an employee", variant: "destructive" });
      return;
    }

    // Create offboarding request
    const { data: req, error } = await supabase.from("hr_offboarding_requests").insert({
      employee_id: form.employee_id,
      initiated_by: user?.id,
      reason: form.reason,
      last_working_date: form.last_working_date || null,
      notes: form.notes || null,
      status: "initiated",
    }).select().single();

    if (error) {
      if (error.code === "23505") toast({ title: "Error", description: "Offboarding already initiated for this employee.", variant: "destructive" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Create clearance entries for each department
    const clearanceRows = CLEARANCE_DEPARTMENTS.map(d => ({
      offboarding_id: req.id,
      department: d.key,
      status: "pending",
    }));

    await supabase.from("hr_offboarding_clearances").insert(clearanceRows);

    // Update employee lifecycle stage
    await supabase.from("hr_employees").update({
      lifecycle_stage: "offboarding",
    }).eq("id", form.employee_id);

    toast({ title: "Offboarding Initiated", description: `Offboarding started for ${getEmpName(form.employee_id)}. Clearance approvals are now required.` });
    setDialogOpen(false);
    setForm({ employee_id: "", reason: "resignation", last_working_date: "", notes: "" });
    fetchData();
  };

  const handleClearanceAction = async (clearanceId: string, action: "approved" | "rejected", remarks: string) => {
    const { error } = await supabase.from("hr_offboarding_clearances").update({
      status: action,
      approved_by: user?.id,
      remarks: remarks || null,
    }).eq("id", clearanceId);

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Check if all clearances for this request are now approved
    const clearance = clearances.find(c => c.id === clearanceId);
    if (clearance && action === "approved") {
      const reqClearances = clearances.filter(c => c.offboarding_id === clearance.offboarding_id);
      const allApproved = reqClearances.every(c => c.id === clearanceId ? true : c.status === "approved");

      if (allApproved) {
        await supabase.from("hr_offboarding_requests").update({ status: "completed" }).eq("id", clearance.offboarding_id);

        // Update employee status
        const req = requests.find(r => r.id === clearance.offboarding_id);
        if (req) {
          await supabase.from("hr_employees").update({
            employment_status: "terminated",
            lifecycle_stage: "exited",
          }).eq("id", req.employee_id);
        }

        toast({ title: "Offboarding Complete", description: "All clearances approved. Employee has been marked as exited." });
      } else {
        // Update status to in_progress if at least one is approved
        await supabase.from("hr_offboarding_requests").update({ status: "in_progress" }).eq("id", clearance.offboarding_id);
        toast({ title: "Clearance Approved" });
      }
    } else {
      toast({ title: action === "approved" ? "Approved" : "Rejected" });
    }

    fetchData();
  };

  const getClearancesForRequest = (reqId: string) => clearances.filter(c => c.offboarding_id === reqId);
  const getClearanceProgress = (reqId: string) => {
    const reqClearances = getClearancesForRequest(reqId);
    if (reqClearances.length === 0) return 0;
    return (reqClearances.filter(c => c.status === "approved").length / reqClearances.length) * 100;
  };

  const activeRequests = requests.filter(r => r.status !== "completed" && r.status !== "cancelled");
  const completedRequests = requests.filter(r => r.status === "completed" || r.status === "cancelled");

  // Employees not already in offboarding
  const eligibleEmployees = employees.filter(e => !requests.find(r => r.employee_id === e.id && r.status !== "cancelled"));

  const selectedRequest = requests.find(r => r.id === detailId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offboarding</h1>
          <p className="text-muted-foreground">{activeRequests.length} active · {completedRequests.length} completed</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserMinus className="h-4 w-4" />Initiate Offboarding</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Initiate Employee Offboarding</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Employee *</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {eligibleEmployees.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Resignation</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="contract_end">Contract End</SelectItem>
                      <SelectItem value="mutual_agreement">Mutual Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Last Working Date</Label>
                  <Input type="date" value={form.last_working_date} onChange={e => setForm({ ...form, last_working_date: e.target.value })} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                  📋 This will create clearance tasks for: Reporting Manager → IT/Assets → Finance/Payroll → HR Final. Each department must approve before the offboarding is complete.
                </div>
                <Button onClick={handleInitiateOffboarding}>Initiate Offboarding</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{requests.length}</div>
          <div className="text-xs text-muted-foreground">Total Requests</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{activeRequests.length}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedRequests.filter(r => r.status === "completed").length}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{clearances.filter(c => c.status === "pending").length}</div>
          <div className="text-xs text-muted-foreground">Pending Approvals</div>
        </CardContent></Card>
      </div>

      {/* Detail View */}
      {selectedRequest && (
        <OffboardingDetail
          request={selectedRequest}
          clearances={getClearancesForRequest(selectedRequest.id)}
          empName={getEmpName(selectedRequest.employee_id)}
          empCode={getEmpCode(selectedRequest.employee_id)}
          isAdmin={isHrAdmin()}
          onAction={handleClearanceAction}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* Request List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Last Working Day</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No active offboarding requests</TableCell></TableRow>
                  ) : activeRequests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{getEmpName(r.employee_id)}</div>
                        <div className="text-xs text-muted-foreground">{getEmpCode(r.employee_id)}</div>
                      </TableCell>
                      <TableCell className="capitalize">{r.reason.replace(/_/g, " ")}</TableCell>
                      <TableCell>{r.last_working_date ? format(new Date(r.last_working_date), "dd MMM yyyy") : "—"}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={getClearanceProgress(r.id)} className="h-2" />
                          <span className="text-xs text-muted-foreground">{Math.round(getClearanceProgress(r.id))}%</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={statusColors[r.status] || ""}>{r.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setDetailId(r.id)}>
                          <Eye className="h-3 w-3" />View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Last Working Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No completed offboarding</TableCell></TableRow>
                  ) : completedRequests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{getEmpName(r.employee_id)}</div>
                        <div className="text-xs text-muted-foreground">{getEmpCode(r.employee_id)}</div>
                      </TableCell>
                      <TableCell className="capitalize">{r.reason.replace(/_/g, " ")}</TableCell>
                      <TableCell>{r.last_working_date ? format(new Date(r.last_working_date), "dd MMM yyyy") : "—"}</TableCell>
                      <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => setDetailId(r.id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
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

// Detail component showing clearance steps
const OffboardingDetail = ({
  request, clearances, empName, empCode, isAdmin, onAction, onClose,
}: {
  request: OffboardingRequest;
  clearances: Clearance[];
  empName: string;
  empCode: string;
  isAdmin: boolean;
  onAction: (id: string, action: "approved" | "rejected", remarks: string) => void;
  onClose: () => void;
}) => {
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const getDeptInfo = (key: string) => CLEARANCE_DEPARTMENTS.find(d => d.key === key);

  const getIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "rejected") return <XCircle className="h-5 w-5 text-destructive" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  // Check if previous steps are complete (sequential flow)
  const canApprove = (index: number) => {
    if (index === 0) return true;
    return clearances.slice(0, index).every(c => c.status === "approved");
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Offboarding: {empName} ({empCode})</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">
              Reason: {request.reason.replace(/_/g, " ")} · 
              {request.last_working_date && ` LWD: ${format(new Date(request.last_working_date), "dd MMM yyyy")} ·`}
              {" "}Started: {format(new Date(request.created_at), "dd MMM yyyy")}
            </p>
            {request.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {request.notes}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CLEARANCE_DEPARTMENTS.map((dept, index) => {
            const clearance = clearances.find(c => c.department === dept.key);
            if (!clearance) return null;
            const isUnlocked = canApprove(index);

            return (
              <div
                key={dept.key}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  clearance.status === "approved" ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" :
                  clearance.status === "rejected" ? "bg-destructive/5 border-destructive/20" :
                  isUnlocked ? "bg-card border-border" : "bg-muted/30 border-muted opacity-60"
                }`}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    clearance.status === "approved" ? "bg-green-600 text-white" :
                    clearance.status === "rejected" ? "bg-destructive text-destructive-foreground" :
                    isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  {index < CLEARANCE_DEPARTMENTS.length - 1 && (
                    <div className={`w-0.5 h-8 ${clearance.status === "approved" ? "bg-green-400" : "bg-muted"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {getIcon(clearance.status)}
                        {dept.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">{dept.description}</p>
                    </div>
                    <Badge className={clearanceColors[clearance.status] || ""}>{clearance.status}</Badge>
                  </div>

                  {clearance.remarks && (
                    <p className="text-sm mt-2 text-muted-foreground italic">"{clearance.remarks}"</p>
                  )}

                  {/* Action buttons for admins */}
                  {isAdmin && clearance.status === "pending" && isUnlocked && (
                    <div className="mt-3 flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Remarks (optional)"
                          value={remarks[clearance.id] || ""}
                          onChange={e => setRemarks({ ...remarks, [clearance.id]: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <Button size="sm" onClick={() => onAction(clearance.id, "approved", remarks[clearance.id] || "")} className="gap-1">
                        <CheckCircle className="h-3 w-3" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onAction(clearance.id, "rejected", remarks[clearance.id] || "")} className="gap-1">
                        <XCircle className="h-3 w-3" />Reject
                      </Button>
                    </div>
                  )}

                  {!isUnlocked && clearance.status === "pending" && (
                    <p className="text-xs text-muted-foreground mt-2 italic">⏳ Waiting for previous step approval</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HrOffboarding;
