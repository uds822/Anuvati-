import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, LogIn, LogOut, Calendar, MapPin, Plus, Grid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  user_id: string | null;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  work_mode: string;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-destructive/10 text-destructive",
  wfh: "bg-blue-100 text-blue-800",
  field_visit: "bg-yellow-100 text-yellow-800",
  half_day: "bg-orange-100 text-orange-800",
};

const HrAttendance = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [myEmployee, setMyEmployee] = useState<Employee | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    employee_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "present",
    work_mode: "office",
    notes: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from("hr_employees").select("id, employee_id, full_name, user_id").eq("employment_status", "active").order("full_name");
      setEmployees(data || []);
      const me = (data || []).find((e) => e.user_id === user?.id);
      if (me) setMyEmployee(me);
    };
    fetchEmployees();
  }, [user]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = format(startOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
      const end = format(endOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");

      let query = supabase
        .from("hr_attendance")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      if (selectedEmployee !== "all") {
        query = query.eq("employee_id", selectedEmployee);
      }

      const { data } = await query;
      setAttendance(data || []);

      // Check today's record for my employee
      if (myEmployee) {
        const today = format(new Date(), "yyyy-MM-dd");
        const todayRec = (data || []).find(
          (a) => a.employee_id === myEmployee.id && a.date === today
        );
        setTodayRecord(todayRec || null);
      }
    };
    fetchAttendance();
  }, [selectedMonth, selectedEmployee, myEmployee]);

  const handleCheckIn = async () => {
    if (!myEmployee) {
      toast({ title: "Error", description: "No employee record linked to your account.", variant: "destructive" });
      return;
    }
    const today = format(new Date(), "yyyy-MM-dd");
    
    // Capture GPS location
    let gps_lat: number | null = null;
    let gps_lng: number | null = null;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => 
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        gps_lat = pos.coords.latitude;
        gps_lng = pos.coords.longitude;
      } catch { /* GPS optional, continue without it */ }
    }

    const now = new Date();
    const checkInHour = now.getHours();
    const isLate = checkInHour >= 10; // Late if after 10 AM
    
    const { data, error } = await supabase.from("hr_attendance").insert({
      employee_id: myEmployee.id,
      date: today,
      check_in: now.toISOString(),
      status: isLate ? "half_day" : "present",
      work_mode: "office",
      notes: isLate ? "Late arrival (after 10:00 AM)" : null,
      gps_lat,
      gps_lng,
    }).select().single();

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already checked in", description: "You have already checked in today.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }
    setTodayRecord(data);
    toast({ title: isLate ? "Checked In (Late)" : "Checked In", description: `Check-in recorded at ${format(now, "hh:mm a")}${gps_lat ? " with GPS" : ""}` });
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    const { data, error } = await supabase
      .from("hr_attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", todayRecord.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setTodayRecord(data);
    toast({ title: "Checked Out", description: `Check-out recorded at ${format(new Date(), "hh:mm a")}` });
  };

  const handleAdminMark = async () => {
    if (!markForm.employee_id || !markForm.date) {
      toast({ title: "Error", description: "Employee and date required.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("hr_attendance").upsert({
      employee_id: markForm.employee_id,
      date: markForm.date,
      status: markForm.status,
      work_mode: markForm.work_mode,
      notes: markForm.notes || null,
      check_in: markForm.status === "present" ? new Date().toISOString() : null,
    }, { onConflict: "employee_id,date" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Attendance Marked" });
    setDialogOpen(false);
    setMarkForm({ employee_id: "", date: format(new Date(), "yyyy-MM-dd"), status: "present", work_mode: "office", notes: "" });
    // Refresh
    setSelectedMonth(selectedMonth);
  };

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.full_name || "Unknown";

  // Monthly summary stats
  const monthDays = (() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1)),
    }).length;
  })();

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const wfhCount = attendance.filter((a) => a.status === "wfh").length;

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track daily attendance and work hours</p>
        </div>
        <div className="flex gap-2">
          {myEmployee && !todayRecord && (
            <Button onClick={handleCheckIn} className="gap-2">
              <LogIn className="h-4 w-4" />Check In
            </Button>
          )}
          {todayRecord && !todayRecord.check_out && (
            <Button onClick={handleCheckOut} variant="secondary" className="gap-2">
              <LogOut className="h-4 w-4" />Check Out
            </Button>
          )}
          {isHrAdmin() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Mark Attendance</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Employee *</Label>
                    <Select value={markForm.employee_id} onValueChange={(v) => setMarkForm({ ...markForm, employee_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date *</Label>
                    <Input type="date" value={markForm.date} onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={markForm.status} onValueChange={(v) => setMarkForm({ ...markForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="wfh">Work from Home</SelectItem>
                          <SelectItem value="field_visit">Field Visit</SelectItem>
                          <SelectItem value="half_day">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Work Mode</Label>
                      <Select value={markForm.work_mode} onValueChange={(v) => setMarkForm({ ...markForm, work_mode: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="field">Field</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={markForm.notes} onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })} />
                  </div>
                  <Button onClick={handleAdminMark}>Save Attendance</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Today's status card */}
      {myEmployee && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Today's Status:</span>
              {todayRecord ? (
                <>
                  <Badge className={statusColors[todayRecord.status]}>{todayRecord.status}</Badge>
                  {todayRecord.check_in && (
                    <span className="text-sm text-muted-foreground">
                      In: {format(new Date(todayRecord.check_in), "hh:mm a")}
                    </span>
                  )}
                  {todayRecord.check_out && (
                    <span className="text-sm text-muted-foreground">
                      Out: {format(new Date(todayRecord.check_out), "hh:mm a")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not checked in yet</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{monthDays}</div>
            <div className="text-xs text-muted-foreground">Working Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-muted-foreground">Present</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{absentCount}</div>
            <div className="text-xs text-muted-foreground">Absent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{wfhCount}</div>
            <div className="text-xs text-muted-foreground">WFH</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {isHrAdmin() && (
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Attendance Views */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Check In</TableHead>
                    <TableHead className="hidden md:table-cell">Check Out</TableHead>
                    <TableHead className="hidden sm:table-cell">Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No attendance records for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-sm">{format(new Date(a.date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-medium">{getEmployeeName(a.employee_id)}</TableCell>
                        <TableCell><Badge className={statusColors[a.status] || ""}>{a.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{a.check_in ? format(new Date(a.check_in), "hh:mm a") : "—"}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{a.check_out ? format(new Date(a.check_out), "hh:mm a") : "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell capitalize text-sm">{a.work_mode}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4">
              {(() => {
                const [year, month] = selectedMonth.split("-").map(Number);
                const days = eachDayOfInterval({
                  start: startOfMonth(new Date(year, month - 1)),
                  end: endOfMonth(new Date(year, month - 1)),
                });
                const firstDayOffset = getDay(days[0]);
                const calStatusColor: Record<string, string> = {
                  present: "bg-green-500", absent: "bg-destructive", wfh: "bg-blue-500",
                  field_visit: "bg-yellow-500", half_day: "bg-orange-500",
                };

                return (
                  <div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                      {days.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayRecords = attendance.filter(a => a.date === dateStr);
                        const mainStatus = dayRecords.length > 0 ? dayRecords[0].status : null;
                        return (
                          <div
                            key={dateStr}
                            className="relative border rounded-md p-1 min-h-[48px] text-center hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-xs">{format(day, "d")}</span>
                            {mainStatus && (
                              <div className={`mx-auto mt-0.5 h-2 w-2 rounded-full ${calStatusColor[mainStatus] || "bg-muted"}`} title={mainStatus} />
                            )}
                            {dayRecords.length > 1 && (
                              <span className="absolute top-0.5 right-0.5 text-[8px] text-muted-foreground">{dayRecords.length}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-4 flex-wrap">
                      {Object.entries(calStatusColor).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5 text-xs">
                          <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                          <span className="capitalize">{status.replace("_", " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrAttendance;
