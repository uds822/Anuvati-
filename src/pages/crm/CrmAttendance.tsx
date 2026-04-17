import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, LogIn, LogOut, AlertCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";

interface AttendanceRecord {
  id: string;
  facilitator_id: string;
  school_id: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  visit_date: string;
}

interface School { id: string; school_name: string; }
interface Facilitator { id: string; name: string; user_id: string | null; }

const CrmAttendance = () => {
  const { user } = useAuth();
  const { isAdmin, hasRole, canWrite } = useCrmRole();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarFacilitator, setCalendarFacilitator] = useState("all");

  const fetchData = async () => {
    const [attendanceRes, schoolsRes, facilitatorsRes] = await Promise.all([
      supabase.from("crm_attendance").select("*").order("visit_date", { ascending: false }).limit(200),
      supabase.from("crm_schools").select("id, school_name"),
      supabase.from("crm_facilitators").select("id, name, user_id"),
    ]);
    setRecords(attendanceRes.data || []);
    setSchools(schoolsRes.data || []);
    setFacilitators(facilitatorsRes.data || []);

    const myFacilitator = (facilitatorsRes.data || []).find((f: Facilitator) => f.user_id === user?.id);
    if (myFacilitator) {
      const today = new Date().toISOString().split("T")[0];
      const active = (attendanceRes.data || []).find(
        (r: AttendanceRecord) => r.facilitator_id === myFacilitator.id && r.visit_date === today && r.check_in_time && !r.check_out_time
      );
      setActiveSession(active || null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getGPS = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      setGpsStatus("fetching");
      if (!navigator.geolocation) { setGpsStatus("error"); reject(new Error("Geolocation not supported")); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGpsStatus("success"); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        (err) => { setGpsStatus("error"); reject(err); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!selectedSchool) { toast.error("Please select a school"); return; }
    const myFacilitator = facilitators.find(f => f.user_id === user?.id);
    if (!myFacilitator) { toast.error("You're not registered as a facilitator"); return; }
    setCheckingIn(true);
    try {
      const gps = await getGPS();
      const { data, error } = await supabase.from("crm_attendance").insert({
        facilitator_id: myFacilitator.id, school_id: selectedSchool,
        check_in_time: new Date().toISOString(), gps_lat: gps.lat, gps_lng: gps.lng,
        visit_date: new Date().toISOString().split("T")[0],
      }).select().single();
      if (error) throw error;
      toast.success("Checked in successfully!");
      setActiveSession(data);
      fetchData();
    } catch (err: any) { toast.error(err.message || "Check-in failed"); }
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    if (!activeSession) return;
    setCheckingIn(true);
    try {
      await getGPS().catch(() => null);
      const { error } = await supabase.from("crm_attendance").update({ check_out_time: new Date().toISOString() }).eq("id", activeSession.id);
      if (error) throw error;
      toast.success("Checked out!");
      setActiveSession(null);
      fetchData();
    } catch (err: any) { toast.error(err.message || "Check-out failed"); }
    setCheckingIn(false);
  };

  const getSchoolName = (id: string | null) => schools.find(s => s.id === id)?.school_name || "—";
  const getFacilitatorName = (id: string) => facilitators.find(f => f.id === id)?.name || "—";
  const getDuration = (ci: string | null, co: string | null) => {
    if (!ci || !co) return "—";
    const d = new Date(co).getTime() - new Date(ci).getTime();
    return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
  };

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const visitDates = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (calendarFacilitator === "all" || r.facilitator_id === calendarFacilitator) {
        set.add(r.visit_date);
      }
    });
    return set;
  }, [records, calendarFacilitator]);

  const canCheckIn = hasRole("facilitator") || isAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Attendance & Field Visits</h1>
          <p className="text-sm text-muted-foreground">Track facilitator field visits with GPS verification</p>
        </div>
        <Button variant="outline" onClick={() => setShowCalendar(!showCalendar)} className="gap-2">
          <CalendarDays className="h-4 w-4" /> {showCalendar ? "Table View" : "Calendar View"}
        </Button>
      </div>

      {/* Check-in card */}
      {canCheckIn && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {activeSession ? "Active Visit Session" : "Start Field Visit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <Badge variant="default" className="bg-green-600">Checked In</Badge>
                  <span className="text-muted-foreground">School: {getSchoolName(activeSession.school_id)}</span>
                  <span className="text-muted-foreground">
                    Since: {activeSession.check_in_time ? format(new Date(activeSession.check_in_time), "h:mm a") : "—"}
                  </span>
                </div>
                <Button onClick={handleCheckOut} disabled={checkingIn} variant="destructive" className="gap-2">
                  <LogOut className="h-4 w-4" /> {checkingIn ? "Processing..." : "Check Out"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Select school to visit" /></SelectTrigger>
                  <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleCheckIn} disabled={checkingIn || !selectedSchool} className="gap-2">
                  <LogIn className="h-4 w-4" /> {checkingIn ? "Getting GPS..." : "Check In"}
                </Button>
              </div>
            )}
            {gpsStatus === "error" && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> GPS unavailable. Please enable location services.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {showCalendar ? (
        /* Calendar view */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">Attendance Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={calendarFacilitator} onValueChange={setCalendarFacilitator}>
                  <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All Facilitators" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Facilitators</SelectItem>
                    {facilitators.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">{format(calendarMonth, "MMMM yyyy")}</span>
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {/* Empty cells for first day offset */}
              {Array.from({ length: getDay(startOfMonth(calendarMonth)) }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {calendarDays.map(day => {
                const dateStr = format(day, "yyyy-MM-dd");
                const hasVisit = visitDates.has(dateStr);
                const today = isToday(day);
                return (
                  <div
                    key={dateStr}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-colors ${
                      hasVisit ? "bg-green-100 text-green-800 font-medium" : "text-foreground"
                    } ${today ? "ring-2 ring-primary" : ""}`}
                  >
                    {day.getDate()}
                    {hasVisit && <span className="absolute w-1.5 h-1.5 bg-green-600 rounded-full mt-6" />}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100" /> Visit recorded</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-primary" /> Today</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Table view */
        <Card>
          <CardHeader><CardTitle className="text-base font-heading">Visit History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Facilitator</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>GPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : records.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No attendance records</TableCell></TableRow>
                  ) : (
                    records.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.visit_date}</TableCell>
                        <TableCell>{getFacilitatorName(r.facilitator_id)}</TableCell>
                        <TableCell>{getSchoolName(r.school_id)}</TableCell>
                        <TableCell>{r.check_in_time ? format(new Date(r.check_in_time), "h:mm a") : "—"}</TableCell>
                        <TableCell>{r.check_out_time ? format(new Date(r.check_out_time), "h:mm a") : <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>}</TableCell>
                        <TableCell>{getDuration(r.check_in_time, r.check_out_time)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.gps_lat ? `${r.gps_lat.toFixed(4)}, ${r.gps_lng?.toFixed(4)}` : "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrmAttendance;
