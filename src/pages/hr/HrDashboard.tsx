import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Heart, FolderKanban, CalendarOff, UserPlus, Briefcase, Plus, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHrRole } from "@/hooks/useHrRole";
import { toast } from "sonner";

const COLORS = ["hsl(350,65%,42%)", "hsl(28,85%,55%)", "hsl(280,45%,35%)", "hsl(160,50%,40%)", "hsl(210,60%,50%)", "hsl(40,70%,50%)"];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Employees" },
  { value: "field_level", label: "Field Level" },
  { value: "manager_level", label: "Manager Level" },
  { value: "managerial", label: "Managerial" },
  { value: "board_of_directors", label: "Board of Directors" },
];

const audienceColors: Record<string, string> = {
  all: "bg-primary/10 text-primary",
  field_level: "bg-green-100 text-green-800",
  manager_level: "bg-blue-100 text-blue-800",
  managerial: "bg-purple-100 text-purple-800",
  board_of_directors: "bg-yellow-100 text-yellow-800",
};

const HrDashboard = () => {
  const navigate = useNavigate();
  const { isHrAdmin } = useHrRole();
  const [stats, setStats] = useState({
    totalEmployees: 0, totalVolunteers: 0, activeProjects: 0,
    pendingLeave: 0, newJoiners: 0, openPositions: 0,
  });
  const [deptData, setDeptData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", audience: "all" });
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: employees } = await supabase.from("hr_employees").select("id, gender, department_id, employment_type, joining_date, employment_status");
      const { data: departments } = await supabase.from("hr_departments").select("id, name");
      const { data: projects } = await supabase.from("hr_projects").select("id, status");
      const { data: leaves } = await supabase.from("hr_leave_requests").select("id").eq("status", "pending");
      const { data: jobs } = await supabase.from("hr_job_postings").select("id").eq("status", "published");

      const active = (employees || []).filter((e) => e.employment_status === "active");
      const volunteers = (employees || []).filter((e) => e.employment_type === "volunteer");
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newJoiners = active.filter((e) => e.joining_date && new Date(e.joining_date) >= thirtyDaysAgo);
      const activeProjects = (projects || []).filter(p => p.status === "active").length;

      setStats({
        totalEmployees: active.length,
        totalVolunteers: volunteers.length,
        activeProjects,
        pendingLeave: (leaves || []).length,
        newJoiners: newJoiners.length,
        openPositions: (jobs || []).length,
      });

      // Dept distribution
      const deptMap: Record<string, number> = {};
      active.forEach((e) => {
        const dept = departments?.find((d) => d.id === e.department_id);
        deptMap[dept?.name || "Unassigned"] = (deptMap[dept?.name || "Unassigned"] || 0) + 1;
      });
      setDeptData(Object.entries(deptMap).map(([name, value]) => ({ name, value })));

      // Gender
      const genderMap: Record<string, number> = {};
      active.forEach((e) => { const g = e.gender || "Not specified"; genderMap[g] = (genderMap[g] || 0) + 1; });
      setGenderData(Object.entries(genderMap).map(([name, value]) => ({ name, value })));

      // Activity log
      const { data: logs } = await supabase.from("hr_activity_log").select("*").order("created_at", { ascending: false }).limit(10);
      setActivities(logs || []);

      // Attendance summary for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: attData } = await supabase.from("hr_attendance").select("date, status").gte("date", sevenDaysAgo.toISOString().split("T")[0]);
      const attMap: Record<string, { present: number; absent: number; wfh: number }> = {};
      (attData || []).forEach(a => {
        if (!attMap[a.date]) attMap[a.date] = { present: 0, absent: 0, wfh: 0 };
        if (a.status === "present" || a.status === "half_day") attMap[a.date].present++;
        else if (a.status === "absent") attMap[a.date].absent++;
        else if (a.status === "wfh") attMap[a.date].wfh++;
      });
      setAttendanceChartData(Object.entries(attMap).sort().map(([date, v]) => ({ date: date.slice(5), ...v })));

      // Announcements
      const { data: ann } = await supabase.from("hr_notifications").select("*").eq("type", "announcement").order("created_at", { ascending: false }).limit(5);
      setAnnouncements(ann || []);
    };

    fetchData();

    const channel = supabase.channel("hr-activity").on("postgres_changes", { event: "INSERT", schema: "public", table: "hr_activity_log" }, (payload) => {
      setActivities((prev) => [payload.new as any, ...prev.slice(0, 9)]);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const postAnnouncement = async () => {
    const { error } = await supabase.from("hr_notifications").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id || "",
      title: announcementForm.title,
      message: announcementForm.message,
      type: "announcement",
      audience: announcementForm.audience,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Announcement posted");
    setAnnouncementOpen(false);
    setAnnouncementForm({ title: "", message: "", audience: "all" });
    const { data: ann } = await supabase.from("hr_notifications").select("*").eq("type", "announcement").order("created_at", { ascending: false }).limit(5);
    setAnnouncements(ann || []);
  };

  const metricCards = [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "text-primary", path: "/hr/employees" },
    { label: "Volunteers", value: stats.totalVolunteers, icon: Heart, color: "text-secondary", path: "/hr/volunteers" },
    { label: "Active Projects", value: stats.activeProjects, icon: FolderKanban, color: "text-accent-foreground", path: "/hr/projects" },
    { label: "Pending Leave", value: stats.pendingLeave, icon: CalendarOff, color: "text-destructive", path: "/hr/leave" },
    { label: "New Joiners", value: stats.newJoiners, icon: UserPlus, color: "text-primary", path: "/hr/employees" },
    { label: "Open Positions", value: stats.openPositions, icon: Briefcase, color: "text-muted-foreground", path: "/hr/recruitment" },
  ];

  const quickActions = [
    { label: "Add Employee", icon: UserPlus, path: "/hr/employees" },
    { label: "Post Job", icon: Briefcase, path: "/hr/recruitment" },
    { label: "Review Applications", icon: Briefcase, path: "/hr/applications" },
    { label: "Create Project", icon: FolderKanban, path: "/hr/projects" },
    { label: "View Reports", icon: Users, path: "/hr/reports" },
  ];

  const getAudienceLabel = (val: string) => AUDIENCE_OPTIONS.find(a => a.value === val)?.label || val;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground">Overview of your organization's workforce</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        {quickActions.map(a => (
          <Button key={a.label} variant="outline" size="sm" onClick={() => navigate(a.path)} className="gap-2">
            <a.icon className="h-4 w-4" />{a.label}
          </Button>
        ))}
      </div>

      {/* Metric Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => navigate(m.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2"><Icon className={`h-5 w-5 ${m.color}`} /></div>
                <div className="text-2xl font-bold text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Announcements Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" />HR Announcements</CardTitle>
          {isHrAdmin() && (
            <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Post</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Title *</Label>
                    <Input placeholder="Announcement title" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea placeholder="Announcement details..." value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} />
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Select value={announcementForm.audience} onValueChange={v => setAnnouncementForm({ ...announcementForm, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AUDIENCE_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Choose who should see this announcement</p>
                  </div>
                  <Button onClick={postAnnouncement} disabled={!announcementForm.title} className="w-full">Post Announcement</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a: any) => (
                <div key={a.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="font-medium text-sm flex-1">{a.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-[10px] ${audienceColors[a.audience || "all"] || audienceColors.all}`}>
                        {getAudienceLabel(a.audience || "all")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{new Date(a.created_at).toLocaleDateString()}</Badge>
                    </div>
                  </div>
                  {a.message && <p className="text-xs text-muted-foreground">{a.message}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No announcements yet</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Department Distribution</CardTitle></CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(350,65%,42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No employee data yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Gender Diversity</CardTitle></CardHeader>
          <CardContent>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance (7 Days)</CardTitle></CardHeader>
          <CardContent>
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="present" fill="hsl(160,50%,40%)" name="Present" stackId="a" />
                  <Bar dataKey="wfh" fill="hsl(210,60%,50%)" name="WFH" stackId="a" />
                  <Bar dataKey="absent" fill="hsl(350,65%,42%)" name="Absent" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No attendance data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-foreground">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No recent activity</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default HrDashboard;
