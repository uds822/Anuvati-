import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Plus, BookOpen, Users, Award, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_hours: number;
  content_url: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  employee_id: string | null;
  volunteer_id: string | null;
  status: string;
  progress: number;
  score: number | null;
  enrolled_at: string;
  completed_at: string | null;
  hr_training_courses?: { title: string; category: string };
  hr_employees?: { full_name: string } | null;
  hr_volunteers?: { full_name: string } | null;
}

const categories = ["general", "compliance", "technical", "leadership", "field_safety", "child_protection", "gender", "wash"];

const HrTraining = () => {
  const { isHrAdmin } = useHrRole();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general", duration_hours: "1", content_url: "", is_mandatory: false });
  const [enrollForm, setEnrollForm] = useState({ course_id: "", employee_id: "" });

  const fetchData = async () => {
    const [coursesRes, enrollRes, empRes] = await Promise.all([
      supabase.from("hr_training_courses").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_training_enrollments").select("*, hr_training_courses(title, category), hr_employees(full_name), hr_volunteers(full_name)").order("enrolled_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setCourses((coursesRes.data as Course[]) || []);
    setEnrollments((enrollRes.data as any[]) || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCourse = async () => {
    const { error } = await supabase.from("hr_training_courses").insert({
      title: form.title,
      description: form.description || null,
      category: form.category,
      duration_hours: parseFloat(form.duration_hours) || 1,
      content_url: form.content_url || null,
      is_mandatory: form.is_mandatory,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Course created");
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "general", duration_hours: "1", content_url: "", is_mandatory: false });
    fetchData();
  };

  const handleEnroll = async () => {
    const { error } = await supabase.from("hr_training_enrollments").insert({
      course_id: enrollForm.course_id,
      employee_id: enrollForm.employee_id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Employee enrolled");
    setEnrollDialogOpen(false);
    setEnrollForm({ course_id: "", employee_id: "" });
    fetchData();
  };

  const updateEnrollment = async (id: string, updates: any) => {
    const { error } = await supabase.from("hr_training_enrollments").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    fetchData();
  };

  const generateTrainingCertificate = (enrollment: Enrollment) => {
    const personName = enrollment.hr_employees?.full_name || enrollment.hr_volunteers?.full_name || "Participant";
    const courseName = enrollment.hr_training_courses?.title || "Course";
    const certNum = `AGDI-TRN-${Date.now().toString(36).toUpperCase()}`;
    
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    doc.setDrawColor(139, 35, 65);
    doc.setLineWidth(2);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, w - 28, h - 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(139, 30, 30);
    doc.text("CERTIFICATE OF COMPLETION", w / 2, 40, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("Anuvati Global Development Initiative", w / 2, 52, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("This is to certify that", w / 2, 72, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(personName, w / 2, 85, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`has successfully completed the training course`, w / 2, 98, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`"${courseName}"`, w / 2, 110, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    if (enrollment.score != null) {
      doc.text(`Score Achieved: ${enrollment.score}%`, w / 2, 122, { align: "center" });
    }
    doc.text(`Completed on: ${enrollment.completed_at ? format(new Date(enrollment.completed_at), "dd MMMM yyyy") : format(new Date(), "dd MMMM yyyy")}`, w / 2, 132, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificate No: ${certNum}`, w / 2, h - 35, { align: "center" });

    doc.setDrawColor(100, 100, 100);
    doc.line(40, h - 30, 100, h - 30);
    doc.line(w - 100, h - 30, w - 40, h - 30);
    doc.setFontSize(9);
    doc.text("Program Director", 70, h - 25, { align: "center" });
    doc.text("HR Administrator", w - 70, h - 25, { align: "center" });

    doc.save(`Training_Certificate_${personName.replace(/\s/g, "_")}.pdf`);
    toast.success("Training certificate downloaded");
  };

  const activeCourses = courses.filter(c => c.is_active).length;
  const totalEnrolled = enrollments.length;
  const completed = enrollments.filter(e => e.status === "completed").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training & LMS</h1>
          <p className="text-muted-foreground">Manage courses, enrollments, and track learning progress</p>
        </div>
        {isHrAdmin() && (
          <div className="flex gap-2">
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogTrigger asChild><Button variant="outline"><Users className="h-4 w-4 mr-2" />Enroll Employee</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Enroll Employee</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Course</Label>
                    <Select value={enrollForm.course_id} onValueChange={v => setEnrollForm(p => ({ ...p, course_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>{courses.filter(c => c.is_active).map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Employee</Label>
                    <Select value={enrollForm.employee_id} onValueChange={v => setEnrollForm(p => ({ ...p, employee_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEnroll} disabled={!enrollForm.course_id || !enrollForm.employee_id} className="w-full">Enroll</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Training Course</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Category</Label>
                      <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Duration (hours)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm(p => ({ ...p, duration_hours: e.target.value }))} /></div>
                  </div>
                  <div><Label>Content URL</Label><Input value={form.content_url} onChange={e => setForm(p => ({ ...p, content_url: e.target.value }))} placeholder="https://..." /></div>
                  <div className="flex items-center gap-2"><Switch checked={form.is_mandatory} onCheckedChange={v => setForm(p => ({ ...p, is_mandatory: v }))} /><Label>Mandatory Course</Label></div>
                  <Button onClick={handleCreateCourse} disabled={!form.title} className="w-full">Create Course</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{activeCourses}</p><p className="text-sm text-muted-foreground">Active Courses</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{totalEnrolled}</p><p className="text-sm text-muted-foreground">Enrollments</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Award className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{courses.reduce((a, c) => a + (c.duration_hours || 0), 0)}h</p><p className="text-sm text-muted-foreground">Total Content</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList><TabsTrigger value="courses">Courses</TabsTrigger><TabsTrigger value="enrollments">Enrollments</TabsTrigger></TabsList>
        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex gap-1">
                      {course.is_mandatory && <Badge variant="destructive">Mandatory</Badge>}
                      <Badge variant={course.is_active ? "default" : "secondary"}>{course.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{course.description || "No description"}</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{course.category.replace(/_/g, " ")}</Badge>
                    <span className="text-muted-foreground">{course.duration_hours}h</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{enrollments.filter(e => e.course_id === course.id).length} enrolled</p>
                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No courses yet. Create your first training course.</p>}
          </div>
        </TabsContent>
        <TabsContent value="enrollments">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  {isHrAdmin() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.hr_employees?.full_name || e.hr_volunteers?.full_name || "—"}</TableCell>
                    <TableCell>{e.hr_training_courses?.title || "—"}</TableCell>
                    <TableCell><div className="flex items-center gap-2 w-32"><Progress value={e.progress} className="h-2" /><span className="text-xs">{e.progress}%</span></div></TableCell>
                    <TableCell><Badge variant={e.status === "completed" ? "default" : e.status === "in_progress" ? "secondary" : "outline"}>{e.status}</Badge></TableCell>
                    <TableCell>{e.score != null ? `${e.score}%` : "—"}</TableCell>
                    {isHrAdmin() && (
                      <TableCell>
                        <div className="flex gap-1">
                          {e.status !== "completed" && (
                            <Button size="sm" variant="outline" onClick={() => updateEnrollment(e.id, { status: "completed", progress: 100, completed_at: new Date().toISOString() })}>Complete</Button>
                          )}
                          {e.status === "completed" && (
                            <Button size="sm" variant="outline" onClick={() => generateTrainingCertificate(e)}>
                              <Download className="h-3 w-3 mr-1" />Certificate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {enrollments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No enrollments yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrTraining;
