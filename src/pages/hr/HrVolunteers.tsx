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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Plus, Heart, Clock, FolderKanban, Award, Search, Users, Download, Globe } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", pending: "outline", completed: "secondary", inactive: "destructive",
};

const HrVolunteers = () => {
  const { isHrAdmin, isManager } = useHrRole();
  const canManage = isHrAdmin() || isManager();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [websiteApplicants, setWebsiteApplicants] = useState<any[]>([]);

  // Dialogs
  const [volDialog, setVolDialog] = useState(false);
  const [hoursDialog, setHoursDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedVol, setSelectedVol] = useState<any>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // Forms
  const [volForm, setVolForm] = useState({ full_name: "", email: "", phone: "", gender: "", age: "", city: "", state: "", skills: "", areas_of_interest: "", availability: "weekdays", notes: "" });
  const [hoursForm, setHoursForm] = useState({ volunteer_id: "", project_id: "", date: "", hours: "", activity: "", notes: "" });
  const [assignForm, setAssignForm] = useState({ volunteer_id: "", project_id: "", role: "volunteer" });

  const fetchAll = async () => {
    const [v, h, a, c, p, e] = await Promise.all([
      supabase.from("hr_volunteers").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_volunteer_hours").select("*").order("date", { ascending: false }),
      supabase.from("hr_volunteer_assignments").select("*"),
      supabase.from("hr_volunteer_certificates").select("*").order("issued_at", { ascending: false }),
      supabase.from("hr_projects").select("id, name, status"),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setVolunteers(v.data || []);
    setHours(h.data || []);
    setAssignments(a.data || []);
    setCertificates(c.data || []);
    setProjects(p.data || []);
    setEmployees(e.data || []);

    // Fetch website applicants (from Get Involved portal)
    const { data: subs } = await supabase
      .from("submissions")
      .select("id, role, status, submitted_at, approved_at, user_id, profiles!inner(full_name, email, phone, city, state, gender)")
      .in("role", ["volunteer", "internship", "campus_ambassador", "corporate_volunteer", "partner_organization"])
      .order("submitted_at", { ascending: false });
    setWebsiteApplicants(subs || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddVolunteer = async () => {
    if (!volForm.full_name || !volForm.email) {
      toast({ title: "Name and email required", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("hr_volunteers").insert({
      full_name: volForm.full_name,
      email: volForm.email,
      phone: volForm.phone || null,
      gender: volForm.gender || null,
      age: volForm.age ? Number(volForm.age) : null,
      city: volForm.city || null,
      state: volForm.state || null,
      skills: volForm.skills ? volForm.skills.split(",").map(s => s.trim()) : [],
      areas_of_interest: volForm.areas_of_interest ? volForm.areas_of_interest.split(",").map(s => s.trim()) : [],
      availability: volForm.availability,
      notes: volForm.notes || null,
      status: "pending",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Volunteer registered" });
    setVolDialog(false);
    setVolForm({ full_name: "", email: "", phone: "", gender: "", age: "", city: "", state: "", skills: "", areas_of_interest: "", availability: "weekdays", notes: "" });
    fetchAll();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "active") updates.joined_at = new Date().toISOString();
    await supabase.from("hr_volunteers").update(updates).eq("id", id);
    fetchAll();
  };

  const handleLogHours = async () => {
    if (!hoursForm.volunteer_id || !hoursForm.hours || !hoursForm.date) {
      toast({ title: "Volunteer, date, and hours required", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("hr_volunteer_hours").insert({
      volunteer_id: hoursForm.volunteer_id,
      project_id: hoursForm.project_id || null,
      date: hoursForm.date,
      hours: Number(hoursForm.hours),
      activity: hoursForm.activity || null,
      notes: hoursForm.notes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Update total hours
    const vol = volunteers.find(v => v.id === hoursForm.volunteer_id);
    if (vol) {
      await supabase.from("hr_volunteers").update({ total_hours: (vol.total_hours || 0) + Number(hoursForm.hours) }).eq("id", vol.id);
    }

    toast({ title: "Hours logged" });
    setHoursDialog(false);
    setHoursForm({ volunteer_id: "", project_id: "", date: "", hours: "", activity: "", notes: "" });
    fetchAll();
  };

  const handleAssign = async () => {
    if (!assignForm.volunteer_id || !assignForm.project_id) {
      toast({ title: "Select volunteer and project", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("hr_volunteer_assignments").insert({
      volunteer_id: assignForm.volunteer_id,
      project_id: assignForm.project_id,
      role: assignForm.role,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Assignment created" });
    setAssignDialog(false);
    setAssignForm({ volunteer_id: "", project_id: "", role: "volunteer" });
    fetchAll();
  };

  const generateCertificate = async (vol: any) => {
    const volHours = hours.filter(h => h.volunteer_id === vol.id);
    const totalH = volHours.reduce((s, h) => s + Number(h.hours), 0);
    const volAssign = assignments.filter(a => a.volunteer_id === vol.id);
    const projNames = volAssign.map(a => projects.find(p => p.id === a.project_id)?.name || "").filter(Boolean);
    const certNum = `AGDI-VOL-${Date.now().toString(36).toUpperCase()}`;

    // Save to DB
    await supabase.from("hr_volunteer_certificates").insert({
      volunteer_id: vol.id,
      certificate_type: "completion",
      total_hours: totalH,
      project_names: projNames,
      certificate_number: certNum,
    });

    // Generate PDF
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const pgH = doc.internal.pageSize.getHeight();

    // Border
    doc.setDrawColor(26, 86, 50);
    doc.setLineWidth(2);
    doc.rect(10, 10, w - 20, pgH - 20);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, w - 28, pgH - 28);

    // Corner decorations
    const cornerSize = 8;
    doc.setLineWidth(1.5);
    [[16, 16, 1, 1], [w - 16, 16, -1, 1], [16, pgH - 16, 1, -1], [w - 16, pgH - 16, -1, -1]].forEach(([x, y, dx, dy]) => {
      doc.line(x, y, x + cornerSize * dx, y);
      doc.line(x, y, x, y + cornerSize * dy);
    });

    // Header - ANUVATI logo text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(26, 86, 50);
    doc.text("ANUVATI", w / 2, 38, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("FOUNDATION FOR SUSTAINABLE DEVELOPMENT", w / 2, 46, { align: "center" });

    // Divider
    doc.setDrawColor(26, 86, 50);
    doc.setLineWidth(0.8);
    doc.line(w / 2 - 40, 50, w / 2 + 40, 50);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text("CERTIFICATE OF APPRECIATION", w / 2, 62, { align: "center" });

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("This is to certify that", w / 2, 78, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(26, 86, 50);
    doc.text(vol.full_name, w / 2, 92, { align: "center" });

    // Underline for name
    const nameWidth = doc.getTextWidth(vol.full_name);
    doc.setDrawColor(26, 86, 50);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - nameWidth / 2, 94, w / 2 + nameWidth / 2, 94);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`has successfully contributed ${totalH} hours of volunteer service`, w / 2, 106, { align: "center" });

    if (projNames.length > 0) {
      doc.text(`across the following projects: ${projNames.join(", ")}`, w / 2, 114, { align: "center" });
    }

    doc.text("demonstrating exceptional commitment to community development and social impact.", w / 2, 124, { align: "center" });

    // Date and cert number
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Date of Issue: ${format(new Date(), "dd MMMM yyyy")}`, 40, pgH - 50);
    doc.text(`Certificate No: ${certNum}`, w - 40, pgH - 50, { align: "right" });

    // Three signature blocks with dummy signatures
    const sigY = pgH - 38;
    const sigPositions = [
      { x: 55, label: "Volunteer Coordinator", name: "Priya Sharma" },
      { x: w / 2, label: "HR Administrator", name: "Rajesh Verma" },
      { x: w - 55, label: "Director", name: "Dr. Anjali Gupta" },
    ];

    sigPositions.forEach(({ x, label, name }) => {
      // Dummy signature (stylized cursive-like text)
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(name, x, sigY - 4, { align: "center" });
      
      // Signature line
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(x - 30, sigY, x + 30, sigY);
      
      // Title
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x, sigY + 4, { align: "center" });
      doc.text("ANUVATI Foundation", x, sigY + 8, { align: "center" });
    });

    doc.save(`Certificate_${vol.full_name.replace(/\s/g, "_")}.pdf`);
    toast({ title: "Certificate generated and downloaded" });
    fetchAll();
  };

  const filtered = volunteers.filter(v =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const projName = (id: string) => projects.find(p => p.id === id)?.name || "—";
  const volName = (id: string) => volunteers.find(v => v.id === id)?.full_name || "—";

  const activeVols = volunteers.filter(v => v.status === "active").length;
  const pendingVols = volunteers.filter(v => v.status === "pending").length;
  const totalHoursAll = volunteers.reduce((s, v) => s + Number(v.total_hours || 0), 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="volunteers">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Volunteer Management</h1>
            <p className="text-muted-foreground text-sm">Register, track, assign, and certify volunteers</p>
          </div>
          <TabsList className="flex-wrap">
            <TabsTrigger value="volunteers"><Heart className="h-4 w-4 mr-1" />Volunteers</TabsTrigger>
            <TabsTrigger value="applicants"><Globe className="h-4 w-4 mr-1" />Website Applicants</TabsTrigger>
            <TabsTrigger value="hours"><Clock className="h-4 w-4 mr-1" />Hours</TabsTrigger>
            <TabsTrigger value="assignments"><FolderKanban className="h-4 w-4 mr-1" />Assignments</TabsTrigger>
            <TabsTrigger value="certificates"><Award className="h-4 w-4 mr-1" />Certificates</TabsTrigger>
          </TabsList>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{volunteers.length}</div><p className="text-muted-foreground text-sm">Total Volunteers</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-primary">{activeVols}</div><p className="text-muted-foreground text-sm">Active</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{pendingVols}</div><p className="text-muted-foreground text-sm">Pending Approval</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalHoursAll}</div><p className="text-muted-foreground text-sm">Total Hours Logged</p></CardContent></Card>
        </div>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search volunteers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {canManage && (
              <Dialog open={volDialog} onOpenChange={setVolDialog}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Register Volunteer</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Register New Volunteer</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Full Name *</Label><Input value={volForm.full_name} onChange={e => setVolForm({ ...volForm, full_name: e.target.value })} /></div>
                      <div><Label>Email *</Label><Input type="email" value={volForm.email} onChange={e => setVolForm({ ...volForm, email: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Phone</Label><Input value={volForm.phone} onChange={e => setVolForm({ ...volForm, phone: e.target.value })} /></div>
                      <div><Label>Gender</Label>
                        <Select value={volForm.gender} onValueChange={v => setVolForm({ ...volForm, gender: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Age</Label><Input type="number" value={volForm.age} onChange={e => setVolForm({ ...volForm, age: e.target.value })} /></div>
                      <div><Label>City</Label><Input value={volForm.city} onChange={e => setVolForm({ ...volForm, city: e.target.value })} /></div>
                      <div><Label>State</Label><Input value={volForm.state} onChange={e => setVolForm({ ...volForm, state: e.target.value })} /></div>
                    </div>
                    <div><Label>Skills (comma-separated)</Label><Input value={volForm.skills} onChange={e => setVolForm({ ...volForm, skills: e.target.value })} placeholder="Teaching, Communication, Data Entry" /></div>
                    <div><Label>Areas of Interest (comma-separated)</Label><Input value={volForm.areas_of_interest} onChange={e => setVolForm({ ...volForm, areas_of_interest: e.target.value })} placeholder="Education, Health, Environment" /></div>
                    <div><Label>Availability</Label>
                      <Select value={volForm.availability} onValueChange={v => setVolForm({ ...volForm, availability: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekdays">Weekdays</SelectItem>
                          <SelectItem value="weekends">Weekends</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                          <SelectItem value="remote_only">Remote Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Notes</Label><Textarea value={volForm.notes} onChange={e => setVolForm({ ...volForm, notes: e.target.value })} rows={2} /></div>
                    <Button onClick={handleAddVolunteer} className="w-full">Register Volunteer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id} className="cursor-pointer" onClick={() => { setSelectedVol(v); setDetailDialog(true); }}>
                  <TableCell className="font-medium">{v.full_name}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.city || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{v.availability}</Badge></TableCell>
                  <TableCell>{v.total_hours || 0}h</TableCell>
                  <TableCell><Badge variant={STATUS_COLORS[v.status] || "outline"}>{v.status}</Badge></TableCell>
                  {canManage && (
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {v.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(v.id, "active")}>Approve</Button>
                        )}
                        {v.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => generateCertificate(v)}>
                            <Award className="h-3 w-3 mr-1" />Certificate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!filtered.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No volunteers found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Website Applicants Tab */}
        <TabsContent value="applicants" className="space-y-4 mt-4">
          <div>
            <h2 className="text-lg font-semibold">Website Applicants</h2>
            <p className="text-xs text-muted-foreground">People who applied through the Get Involved portal on the website</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{websiteApplicants.length}</div><p className="text-muted-foreground text-sm">Total Applicants</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-primary">{websiteApplicants.filter(a => a.role === "volunteer").length}</div><p className="text-muted-foreground text-sm">Volunteers</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{websiteApplicants.filter(a => a.role === "internship").length}</div><p className="text-muted-foreground text-sm">Interns</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{websiteApplicants.filter(a => a.status === "pending").length}</div><p className="text-muted-foreground text-sm">Pending Review</p></CardContent></Card>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role Applied</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websiteApplicants.map((app: any) => {
                const profile = app.profiles as any;
                const roleLabel: Record<string, string> = {
                  volunteer: "Volunteer",
                  internship: "Intern",
                  campus_ambassador: "Campus Ambassador",
                  corporate_volunteer: "Corporate Volunteer",
                  partner_organization: "Partner Organization",
                };
                const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
                  pending: "outline",
                  approved: "default",
                  completed: "secondary",
                  rejected: "destructive",
                  certificate_requested: "secondary",
                };
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{profile?.full_name || "—"}</TableCell>
                    <TableCell>{profile?.email || "—"}</TableCell>
                    <TableCell>{profile?.phone || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{roleLabel[app.role] || app.role}</Badge></TableCell>
                    <TableCell>{[profile?.city, profile?.state].filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell>{format(new Date(app.submitted_at), "dd MMM yyyy")}</TableCell>
                    <TableCell><Badge variant={statusColor[app.status] || "outline"}>{app.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
              {!websiteApplicants.length && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No website applicants found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4 mt-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Hours Log</h2>
            {canManage && (
              <Dialog open={hoursDialog} onOpenChange={setHoursDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Log Hours</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log Volunteer Hours</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Volunteer *</Label>
                      <Select value={hoursForm.volunteer_id} onValueChange={v => setHoursForm({ ...hoursForm, volunteer_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{volunteers.filter(v => v.status === "active").map(v => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Project</Label>
                      <Select value={hoursForm.project_id} onValueChange={v => setHoursForm({ ...hoursForm, project_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Date *</Label><Input type="date" value={hoursForm.date} onChange={e => setHoursForm({ ...hoursForm, date: e.target.value })} /></div>
                      <div><Label>Hours *</Label><Input type="number" step="0.5" value={hoursForm.hours} onChange={e => setHoursForm({ ...hoursForm, hours: e.target.value })} /></div>
                    </div>
                    <div><Label>Activity</Label><Input value={hoursForm.activity} onChange={e => setHoursForm({ ...hoursForm, activity: e.target.value })} placeholder="e.g. Field survey, Data entry" /></div>
                    <div><Label>Notes</Label><Textarea value={hoursForm.notes} onChange={e => setHoursForm({ ...hoursForm, notes: e.target.value })} rows={2} /></div>
                    <Button onClick={handleLogHours} className="w-full">Log Hours</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.slice(0, 50).map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{volName(h.volunteer_id)}</TableCell>
                  <TableCell>{format(new Date(h.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{h.hours}h</TableCell>
                  <TableCell>{h.project_id ? projName(h.project_id) : "—"}</TableCell>
                  <TableCell>{h.activity || "—"}</TableCell>
                </TableRow>
              ))}
              {!hours.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No hours logged</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4 mt-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Project Assignments</h2>
            {canManage && (
              <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Assign</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Assign to Project</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Volunteer</Label>
                      <Select value={assignForm.volunteer_id} onValueChange={v => setAssignForm({ ...assignForm, volunteer_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{volunteers.filter(v => v.status === "active").map(v => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Project</Label>
                      <Select value={assignForm.project_id} onValueChange={v => setAssignForm({ ...assignForm, project_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{projects.filter(p => p.status === "active" || p.status === "planning").map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Role</Label>
                      <Select value={assignForm.role} onValueChange={v => setAssignForm({ ...assignForm, role: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssign} className="w-full">Assign</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map(a => (
              <Card key={a.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{volName(a.volunteer_id)}</p>
                      <p className="text-xs text-muted-foreground">{projName(a.project_id)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{a.role}</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Assigned: {format(new Date(a.assigned_at), "dd MMM yyyy")}</span>
                    <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!assignments.length && <p className="text-muted-foreground col-span-full text-center py-10">No assignments yet</p>}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Issued Certificates</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate #</TableHead>
                <TableHead>Volunteer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.certificate_number}</TableCell>
                  <TableCell className="font-medium">{volName(c.volunteer_id)}</TableCell>
                  <TableCell><Badge variant="outline">{c.certificate_type}</Badge></TableCell>
                  <TableCell>{c.total_hours}h</TableCell>
                  <TableCell className="text-xs">{(c.project_names || []).join(", ") || "—"}</TableCell>
                  <TableCell>{format(new Date(c.issued_at), "dd MMM yyyy")}</TableCell>
                </TableRow>
              ))}
              {!certificates.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No certificates issued yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Volunteer Detail Dialog */}
      {selectedVol && detailDialog && (
        <Dialog open={detailDialog} onOpenChange={o => { if (!o) { setSelectedVol(null); setDetailDialog(false); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVol.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Email:</span> {selectedVol.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedVol.phone || "—"}</div>
                <div><span className="text-muted-foreground">Gender:</span> {selectedVol.gender || "—"}</div>
                <div><span className="text-muted-foreground">Age:</span> {selectedVol.age || "—"}</div>
                <div><span className="text-muted-foreground">Location:</span> {[selectedVol.city, selectedVol.state].filter(Boolean).join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Availability:</span> {selectedVol.availability}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={STATUS_COLORS[selectedVol.status] || "outline"}>{selectedVol.status}</Badge></div>
                <div><span className="text-muted-foreground">Total Hours:</span> {selectedVol.total_hours || 0}h</div>
              </div>
              {selectedVol.skills?.length > 0 && (
                <div><span className="text-muted-foreground">Skills:</span> <div className="flex flex-wrap gap-1 mt-1">{selectedVol.skills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
              )}
              {selectedVol.areas_of_interest?.length > 0 && (
                <div><span className="text-muted-foreground">Interests:</span> <div className="flex flex-wrap gap-1 mt-1">{selectedVol.areas_of_interest.map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></div>
              )}
              {selectedVol.joined_at && <div><span className="text-muted-foreground">Joined:</span> {format(new Date(selectedVol.joined_at), "dd MMM yyyy")}</div>}
              {selectedVol.notes && <div><span className="text-muted-foreground">Notes:</span> {selectedVol.notes}</div>}

              <div>
                <h4 className="font-semibold mb-2">Assigned Projects</h4>
                {assignments.filter(a => a.volunteer_id === selectedVol.id).length > 0 ? (
                  assignments.filter(a => a.volunteer_id === selectedVol.id).map(a => (
                    <div key={a.id} className="flex justify-between items-center py-1 border-b last:border-0">
                      <span>{projName(a.project_id)}</span>
                      <Badge variant="outline" className="text-xs">{a.role}</Badge>
                    </div>
                  ))
                ) : <p className="text-muted-foreground">No assignments</p>}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recent Hours</h4>
                {hours.filter(h => h.volunteer_id === selectedVol.id).slice(0, 5).length > 0 ? (
                  hours.filter(h => h.volunteer_id === selectedVol.id).slice(0, 5).map(h => (
                    <div key={h.id} className="flex justify-between items-center py-1 border-b last:border-0 text-xs">
                      <span>{format(new Date(h.date), "dd MMM yyyy")}</span>
                      <span>{h.activity || "—"}</span>
                      <span className="font-medium">{h.hours}h</span>
                    </div>
                  ))
                ) : <p className="text-muted-foreground">No hours logged</p>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HrVolunteers;
