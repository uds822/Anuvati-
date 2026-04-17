import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarOff, Plus, Check, X, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInCalendarDays, eachDayOfInterval, startOfMonth, endOfMonth, getDay, addDays } from "date-fns";

interface LeaveType {
  id: string;
  name: string;
  annual_quota: number;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

interface LeaveBalance {
  id: string;
  leave_type_id: string;
  total_allocated: number;
  used: number;
  remaining: number;
}

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  user_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const HrLeave = () => {
  const { user } = useAuth();
  const { isHrAdmin, isManager } = useHrRole();
  const { toast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [myEmployee, setMyEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const fetchData = async () => {
    const [{ data: types }, { data: emps }] = await Promise.all([
      supabase.from("hr_leave_types").select("*").eq("is_active", true).order("name"),
      supabase.from("hr_employees").select("id, employee_id, full_name, user_id").eq("employment_status", "active").order("full_name"),
    ]);
    setLeaveTypes(types || []);
    setEmployees(emps || []);

    const me = (emps || []).find((e) => e.user_id === user?.id);
    setMyEmployee(me || null);

    // Fetch leave requests
    const { data: reqs } = await supabase.from("hr_leave_requests").select("*").order("created_at", { ascending: false });
    setRequests(reqs || []);

    // Fetch balances for current user's employee
    if (me) {
      const { data: bals } = await supabase
        .from("hr_leave_balances")
        .select("*")
        .eq("employee_id", me.id)
        .eq("year", new Date().getFullYear());
      setBalances(bals || []);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const totalDays = form.start_date && form.end_date
    ? Math.max(1, differenceInCalendarDays(new Date(form.end_date), new Date(form.start_date)) + 1)
    : 0;

  const handleApply = async () => {
    if (!myEmployee) {
      toast({ title: "Error", description: "No employee record linked to your account.", variant: "destructive" });
      return;
    }
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      toast({ title: "Error", description: "All fields required.", variant: "destructive" });
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast({ title: "Error", description: "End date must be after start date.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("hr_leave_requests").insert({
      employee_id: myEmployee.id,
      leave_type_id: form.leave_type_id,
      start_date: form.start_date,
      end_date: form.end_date,
      total_days: totalDays,
      reason: form.reason || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Leave Applied", description: `${totalDays} day(s) leave request submitted.` });
    setDialogOpen(false);
    setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    fetchData();
  };

  const handleApprove = async (id: string) => {
    if (!myEmployee) return;
    const { error } = await supabase
      .from("hr_leave_requests")
      .update({ status: "approved", approved_by: myEmployee.id, approved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Approved" });
    fetchData();
  };

  const handleReject = async () => {
    if (!rejectingId || !myEmployee) return;
    const { error } = await supabase
      .from("hr_leave_requests")
      .update({ status: "rejected", approved_by: myEmployee.id, approved_at: new Date().toISOString(), rejection_reason: rejectReason || null })
      .eq("id", rejectingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Rejected" });
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectReason("");
    fetchData();
  };

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.full_name || "Unknown";
  const getLeaveTypeName = (id: string) => leaveTypes.find((t) => t.id === id)?.name || "Unknown";

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const myRequests = myEmployee ? requests.filter((r) => r.employee_id === myEmployee.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground">Apply for leave and manage approvals</p>
        </div>
        {myEmployee && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Apply for Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Leave Type *</Label>
                  <Select value={form.leave_type_id} onValueChange={(v) => setForm({ ...form, leave_type_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.annual_quota} days/yr)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                {totalDays > 0 && (
                  <p className="text-sm text-muted-foreground">Total: <strong>{totalDays}</strong> day(s)</p>
                )}
                <div>
                  <Label>Reason</Label>
                  <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Optional reason for leave" />
                </div>
                <Button onClick={handleApply}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Leave Balance Cards */}
      {balances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {balances.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{Number(b.remaining)}</div>
                <div className="text-xs text-muted-foreground">{getLeaveTypeName(b.leave_type_id)}</div>
                <div className="text-xs text-muted-foreground mt-1">Used: {Number(b.used)} / {Number(b.total_allocated)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue={isManager() ? "pending" : "my"}>
        <TabsList>
          {myEmployee && <TabsTrigger value="my">My Requests</TabsTrigger>}
          {isManager() && (
            <TabsTrigger value="pending" className="gap-2">
              Pending Approvals
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          )}
          {isHrAdmin() && <TabsTrigger value="all">All Requests</TabsTrigger>}
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* My Requests */}
        {myEmployee && (
          <TabsContent value="my">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No leave requests yet</TableCell></TableRow>
                    ) : (
                      myRequests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{getLeaveTypeName(r.leave_type_id)}</TableCell>
                          <TableCell>{format(new Date(r.start_date), "dd MMM")}</TableCell>
                          <TableCell>{format(new Date(r.end_date), "dd MMM")}</TableCell>
                          <TableCell>{Number(r.total_days)}</TableCell>
                          <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pending Approvals */}
        {isManager() && (
          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead className="hidden md:table-cell">Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No pending requests</TableCell></TableRow>
                    ) : (
                      pendingRequests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{getEmployeeName(r.employee_id)}</TableCell>
                          <TableCell>{getLeaveTypeName(r.leave_type_id)}</TableCell>
                          <TableCell>{format(new Date(r.start_date), "dd MMM")}</TableCell>
                          <TableCell>{format(new Date(r.end_date), "dd MMM")}</TableCell>
                          <TableCell>{Number(r.total_days)}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm max-w-32 truncate">{r.reason || "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleApprove(r.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setRejectingId(r.id); setRejectDialogOpen(true); }}>
                                <X className="h-4 w-4" />
                              </Button>
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
        )}

        {/* All Requests */}
        {isHrAdmin() && (
          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No leave requests</TableCell></TableRow>
                    ) : (
                      requests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{getEmployeeName(r.employee_id)}</TableCell>
                          <TableCell>{getLeaveTypeName(r.leave_type_id)}</TableCell>
                          <TableCell className="text-sm">{format(new Date(r.start_date), "dd MMM")} – {format(new Date(r.end_date), "dd MMM")}</TableCell>
                          <TableCell>{Number(r.total_days)}</TableCell>
                          <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {/* Leave Calendar */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4">
              {(() => {
                const now = new Date();
                const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
                const firstDayOffset = getDay(days[0]);
                const leaveStatusColor: Record<string, string> = {
                  approved: "bg-green-200", pending: "bg-yellow-200", rejected: "bg-red-100",
                };

                // Build map of date -> leaves
                const dateLeaveMap: Record<string, { status: string; name: string }[]> = {};
                requests.forEach(r => {
                  const start = new Date(r.start_date);
                  const end = new Date(r.end_date);
                  const leaveDays = eachDayOfInterval({ start, end });
                  leaveDays.forEach(d => {
                    const key = format(d, "yyyy-MM-dd");
                    if (!dateLeaveMap[key]) dateLeaveMap[key] = [];
                    dateLeaveMap[key].push({ status: r.status, name: getEmployeeName(r.employee_id) });
                  });
                });

                return (
                  <div>
                    <h3 className="font-medium mb-3">{format(now, "MMMM yyyy")} — Leave Calendar</h3>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
                      {days.map(day => {
                        const key = format(day, "yyyy-MM-dd");
                        const leaves = dateLeaveMap[key] || [];
                        const hasApproved = leaves.some(l => l.status === "approved");
                        const hasPending = leaves.some(l => l.status === "pending");
                        const bgClass = hasApproved ? "bg-green-50 border-green-200" : hasPending ? "bg-yellow-50 border-yellow-200" : "";
                        return (
                          <div key={key} className={`border rounded-md p-1 min-h-[48px] text-center ${bgClass}`} title={leaves.map(l => `${l.name} (${l.status})`).join(", ")}>
                            <span className="text-xs">{format(day, "d")}</span>
                            {leaves.length > 0 && (
                              <div className="text-[8px] text-muted-foreground mt-0.5">{leaves.length} leave{leaves.length > 1 ? "s" : ""}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs"><div className="h-2.5 w-2.5 rounded-full bg-green-400" /><span>Approved</span></div>
                      <div className="flex items-center gap-1.5 text-xs"><div className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span>Pending</span></div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Leave Request</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Optional reason" />
            </div>
            <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrLeave;
