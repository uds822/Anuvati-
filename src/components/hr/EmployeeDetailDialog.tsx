import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useHrRole } from "@/hooks/useHrRole";
import {
  User, Briefcase, Calendar, MapPin, Phone, Mail, Clock, ArrowUpCircle, ArrowDownCircle,
  CalendarDays, Shield, FileText, AlertTriangle, TrendingUp, ChevronRight,
} from "lucide-react";
import { format, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";

interface Props {
  employeeId: string | null;
  open: boolean;
  onClose: () => void;
  departments: { id: string; name: string }[];
  allEmployees: { id: string; full_name: string }[];
  onRefresh: () => void;
}

const EmployeeDetailDialog = ({ employeeId, open, onClose, departments, allEmployees, onRefresh }: Props) => {
  const { toast } = useToast();
  const { isHrAdmin } = useHrRole();
  const canManage = isHrAdmin();

  const [emp, setEmp] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Designation change state
  const [designationDialog, setDesignationDialog] = useState(false);
  const [changeType, setChangeType] = useState<"promote" | "demote">("promote");
  const [newDesignation, setNewDesignation] = useState("");
  const [changeReasons, setChangeReasons] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [changeSaving, setChangeSaving] = useState(false);

  useEffect(() => {
    if (!employeeId || !open) return;
    setLoading(true);
    fetchEmployeeDetails();
  }, [employeeId, open]);

  const fetchEmployeeDetails = async () => {
    if (!employeeId) return;

    const [empRes, leavReqRes, leavBalRes, leavTypeRes, attRes, lcRes] = await Promise.all([
      supabase.from("hr_employees").select("*").eq("id", employeeId).single(),
      supabase.from("hr_leave_requests").select("*").eq("employee_id", employeeId).order("created_at", { ascending: false }).limit(20),
      supabase.from("hr_leave_balances").select("*").eq("employee_id", employeeId),
      supabase.from("hr_leave_types").select("*"),
      supabase.from("hr_attendance").select("*").eq("employee_id", employeeId).order("date", { ascending: false }).limit(30),
      supabase.from("hr_lifecycle_events").select("*").eq("employee_id", employeeId).order("event_date", { ascending: false }),
    ]);

    setEmp(empRes.data);
    setLeaveRequests(leavReqRes.data || []);
    setLeaveBalances(leavBalRes.data || []);
    setLeaveTypes(leavTypeRes.data || []);
    setAttendance(attRes.data || []);
    setLifecycleEvents(lcRes.data || []);
    setLoading(false);
  };

  if (!open || !employeeId) return null;

  const getDeptName = (id: string | null) => departments.find(d => d.id === id)?.name || "—";
  const getManagerName = (id: string | null) => allEmployees.find(e => e.id === id)?.full_name || "—";
  const getLeaveTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.name || "Unknown";

  const tenure = emp?.joining_date ? (() => {
    const years = differenceInYears(new Date(), new Date(emp.joining_date));
    const months = differenceInMonths(new Date(), new Date(emp.joining_date)) % 12;
    const days = differenceInDays(new Date(), new Date(emp.joining_date));
    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months}m`;
    return `${days}d`;
  })() : "—";

  const totalLeavesTaken = leaveRequests.filter(l => l.status === "approved").reduce((sum, l) => sum + l.total_days, 0);
  const presentDays = attendance.filter(a => a.status === "present").length;
  const absentDays = attendance.filter(a => a.status === "absent").length;

  const initials = emp?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const handleDesignationChange = async () => {
    if (!newDesignation.trim()) {
      toast({ title: "Error", description: "New designation is required.", variant: "destructive" });
      return;
    }
    if (changeType === "demote" && !changeReasons.trim()) {
      toast({ title: "Error", description: "Reasons are required for demotion.", variant: "destructive" });
      return;
    }

    setChangeSaving(true);
    const oldDesignation = emp.designation || "N/A";

    // Update designation
    const { error: updateErr } = await supabase.from("hr_employees").update({
      designation: newDesignation,
    }).eq("id", emp.id);

    if (updateErr) {
      toast({ title: "Error", description: updateErr.message, variant: "destructive" });
      setChangeSaving(false);
      return;
    }

    // Log lifecycle event
    await supabase.from("hr_lifecycle_events").insert({
      employee_id: emp.id,
      from_stage: oldDesignation,
      to_stage: newDesignation,
      event_date: effectiveDate,
      notes: `${changeType === "promote" ? "Promotion" : "Demotion"}: ${oldDesignation} → ${newDesignation}. ${changeReasons ? `Reason: ${changeReasons}` : ""}`,
    });

    // Log activity
    await supabase.from("hr_activity_log").insert({
      action: changeType === "promote" ? "employee_promoted" : "employee_demoted",
      entity_type: "employee",
      entity_id: emp.id,
      details: { old_designation: oldDesignation, new_designation: newDesignation, reason: changeReasons },
    });

    // Send AI-generated email via edge function
    try {
      await supabase.functions.invoke("designation-change-email", {
        body: {
          employee_name: emp.full_name,
          employee_email: emp.email,
          change_type: changeType,
          old_designation: oldDesignation,
          new_designation: newDesignation,
          reasons: changeReasons,
          effective_date: effectiveDate,
        },
      });
      toast({ title: "Success", description: `${emp.full_name} has been ${changeType === "promote" ? "promoted" : "demoted"} to ${newDesignation}. Notification email sent.` });
    } catch {
      toast({ title: "Designation Updated", description: `${emp.full_name}'s designation changed, but email notification could not be sent.` });
    }

    setDesignationDialog(false);
    setNewDesignation("");
    setChangeReasons("");
    setChangeSaving(false);
    fetchEmployeeDetails();
    onRefresh();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : emp ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-foreground">{emp.full_name}</h2>
                    <Badge variant="secondary" className={emp.employment_status === "active" ? "bg-green-100 text-green-800" : "bg-destructive/10 text-destructive"}>
                      {emp.employment_status}
                    </Badge>
                    {emp.lifecycle_stage && <Badge variant="outline">{emp.lifecycle_stage}</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1">{emp.designation || "No designation"} · {getDeptName(emp.department_id)}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{emp.email}</span>
                    {emp.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{emp.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined: {emp.joining_date ? format(new Date(emp.joining_date), "dd MMM yyyy") : "—"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Tenure: {tenure}</span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-300 hover:bg-green-50" onClick={() => { setChangeType("promote"); setDesignationDialog(true); }}>
                      <ArrowUpCircle className="h-4 w-4" />Promote
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => { setChangeType("demote"); setDesignationDialog(true); }}>
                      <ArrowDownCircle className="h-4 w-4" />Demote
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-4">
              <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{tenure}</p><p className="text-xs text-muted-foreground">Tenure</p></Card>
              <Card className="p-3 text-center"><p className="text-2xl font-bold">{presentDays}</p><p className="text-xs text-muted-foreground">Present (30d)</p></Card>
              <Card className="p-3 text-center"><p className="text-2xl font-bold text-destructive">{absentDays}</p><p className="text-xs text-muted-foreground">Absent (30d)</p></Card>
              <Card className="p-3 text-center"><p className="text-2xl font-bold">{totalLeavesTaken}</p><p className="text-xs text-muted-foreground">Leaves Taken</p></Card>
              <Card className="p-3 text-center"><p className="text-2xl font-bold">{lifecycleEvents.length}</p><p className="text-xs text-muted-foreground">Lifecycle Events</p></Card>
            </div>

            {/* Tabs */}
            <div className="px-6 pb-6">
              <Tabs defaultValue="personal">
                <TabsList className="w-full justify-start flex-wrap">
                  <TabsTrigger value="personal"><User className="h-3 w-3 mr-1" />Personal</TabsTrigger>
                  <TabsTrigger value="employment"><Briefcase className="h-3 w-3 mr-1" />Employment</TabsTrigger>
                  <TabsTrigger value="leaves"><CalendarDays className="h-3 w-3 mr-1" />Leaves</TabsTrigger>
                  <TabsTrigger value="attendance"><Clock className="h-3 w-3 mr-1" />Attendance</TabsTrigger>
                  <TabsTrigger value="lifecycle"><TrendingUp className="h-3 w-3 mr-1" />History</TabsTrigger>
                </TabsList>

                {/* Personal Tab */}
                <TabsContent value="personal" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoItem label="Full Name" value={emp.full_name} />
                    <InfoItem label="Email" value={emp.email} />
                    <InfoItem label="Phone" value={emp.phone} />
                    <InfoItem label="Gender" value={emp.gender} />
                    <InfoItem label="Date of Birth" value={emp.date_of_birth ? format(new Date(emp.date_of_birth), "dd MMM yyyy") : null} />
                    <InfoItem label="Employee ID" value={emp.employee_id} />
                    <InfoItem label="Address" value={emp.address} />
                    <InfoItem label="City" value={emp.city} />
                    <InfoItem label="State" value={emp.state} />
                    <InfoItem label="Country" value={emp.country} />
                  </div>
                </TabsContent>

                {/* Employment Tab */}
                <TabsContent value="employment" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoItem label="Designation" value={emp.designation} />
                    <InfoItem label="Department" value={getDeptName(emp.department_id)} />
                    <InfoItem label="Employment Type" value={emp.employment_type?.replace("_", " ")} />
                    <InfoItem label="Employment Status" value={emp.employment_status} />
                    <InfoItem label="Lifecycle Stage" value={emp.lifecycle_stage} />
                    <InfoItem label="Onboarding Status" value={emp.onboarding_status?.replace(/_/g, " ")} />
                    <InfoItem label="Joining Date" value={emp.joining_date ? format(new Date(emp.joining_date), "dd MMM yyyy") : null} />
                    <InfoItem label="Reporting Manager" value={getManagerName(emp.reporting_manager_id)} />
                    <InfoItem label="Salary" value={emp.salary_amount ? `₹${Number(emp.salary_amount).toLocaleString("en-IN")}` : null} />
                  </div>

                  {emp.employment_status === "notice_period" && (
                    <Card className="border-yellow-300 bg-yellow-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-semibold">Employee is on Notice Period</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Leaves Tab */}
                <TabsContent value="leaves" className="mt-4 space-y-4">
                  {leaveBalances.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Leave Balances</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {leaveBalances.map(lb => (
                          <Card key={lb.id} className="p-3">
                            <p className="text-xs text-muted-foreground">{getLeaveTypeName(lb.leave_type_id)}</p>
                            <p className="text-lg font-bold">{lb.remaining ?? (lb.total_allocated - lb.used)}<span className="text-xs text-muted-foreground font-normal">/{lb.total_allocated}</span></p>
                            <p className="text-xs text-muted-foreground">Used: {lb.used}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Leave Requests</h4>
                    {leaveRequests.length > 0 ? (
                      <div className="space-y-2">
                        {leaveRequests.map(lr => (
                          <div key={lr.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div>
                              <span className="font-medium">{getLeaveTypeName(lr.leave_type_id)}</span>
                              <span className="text-muted-foreground ml-2">
                                {format(new Date(lr.start_date), "dd MMM")} – {format(new Date(lr.end_date), "dd MMM yyyy")}
                              </span>
                              <span className="text-muted-foreground ml-2">({lr.total_days} day{lr.total_days > 1 ? "s" : ""})</span>
                            </div>
                            <Badge variant={lr.status === "approved" ? "default" : lr.status === "rejected" ? "destructive" : "outline"}>
                              {lr.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">No leave requests found.</p>}
                  </div>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="mt-4 space-y-4">
                  <h4 className="text-sm font-semibold">Last 30 Days Attendance</h4>
                  {attendance.length > 0 ? (
                    <div className="grid grid-cols-7 gap-1">
                      {attendance.slice(0, 30).map(a => (
                        <div key={a.id} className={`p-2 rounded text-center text-xs ${
                          a.status === "present" ? "bg-green-100 text-green-800" :
                          a.status === "absent" ? "bg-red-100 text-red-800" :
                          a.status === "half_day" ? "bg-yellow-100 text-yellow-800" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <div className="font-medium">{format(new Date(a.date), "dd")}</div>
                          <div className="text-[10px]">{a.status}</div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No attendance records found.</p>}
                </TabsContent>

                {/* Lifecycle/History Tab */}
                <TabsContent value="lifecycle" className="mt-4 space-y-4">
                  <h4 className="text-sm font-semibold">Lifecycle & Designation History</h4>
                  {lifecycleEvents.length > 0 ? (
                    <div className="space-y-3">
                      {lifecycleEvents.map(evt => (
                        <div key={evt.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <ChevronRight className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {evt.from_stage && <Badge variant="outline" className="text-xs">{evt.from_stage}</Badge>}
                              {evt.from_stage && <span className="text-muted-foreground">→</span>}
                              <Badge variant="default" className="text-xs">{evt.to_stage}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{format(new Date(evt.event_date), "dd MMM yyyy")}</p>
                            {evt.notes && <p className="text-sm mt-1">{evt.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No lifecycle events recorded.</p>}
                </TabsContent>
              </Tabs>
            </div>

            {/* Designation Change Dialog */}
            <Dialog open={designationDialog} onOpenChange={setDesignationDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {changeType === "promote" ? <ArrowUpCircle className="h-5 w-5 text-green-600" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                    {changeType === "promote" ? "Promote" : "Demote"} {emp.full_name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Current Designation</Label>
                    <Input value={emp.designation || "N/A"} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>New Designation *</Label>
                    <Input value={newDesignation} onChange={e => setNewDesignation(e.target.value)} placeholder="e.g. Senior Manager" />
                  </div>
                  <div>
                    <Label>Effective Date</Label>
                    <Input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>{changeType === "demote" ? "Reasons (Required) *" : "Remarks (Optional)"}</Label>
                    <Textarea
                      value={changeReasons}
                      onChange={e => setChangeReasons(e.target.value)}
                      placeholder={changeType === "demote" ? "Please provide reasons for the demotion..." : "Optional remarks about the promotion..."}
                      rows={3}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    📧 An AI-generated email will be sent to {emp.email} informing them about this {changeType === "promote" ? "promotion" : "demotion"}.
                  </p>
                  <Button onClick={handleDesignationChange} disabled={changeSaving} className="w-full">
                    {changeSaving ? "Processing..." : `Confirm ${changeType === "promote" ? "Promotion" : "Demotion"}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Employee not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "—"}</p>
  </div>
);

export default EmployeeDetailDialog;
