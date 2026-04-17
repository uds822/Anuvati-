import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit, Eye, Briefcase, Users, UserCheck, Calendar,
  ClipboardCheck, MapPin, ChevronRight, Star, Send, X, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Types
interface Dept { id: string; name: string; }
interface Employee { id: string; employee_id: string; full_name: string; }

interface JobPosting {
  id: string; title: string; department_id: string | null; location: string;
  employment_type: string; experience_required: string | null; description: string | null;
  requirements: string | null; salary_range: string | null; positions: number;
  status: string; published_at: string | null; closing_date: string | null; created_at: string;
}

interface Candidate {
  id: string; job_posting_id: string; full_name: string; email: string; phone: string | null;
  resume_url: string | null; cover_letter: string | null; current_organization: string | null;
  experience_years: number | null; skills: string[] | null; pipeline_stage: string;
  rating: number | null; notes: string | null; applied_at: string;
}

interface Interview {
  id: string; candidate_id: string; interviewer_id: string | null; interview_type: string;
  scheduled_at: string; duration_minutes: number; location: string | null;
  meeting_link: string | null; status: string; feedback: string | null;
}

interface Evaluation {
  id: string; candidate_id: string; evaluator_id: string | null; interview_id: string | null;
  technical_score: number | null; communication_score: number | null;
  cultural_fit_score: number | null; leadership_score: number | null;
  overall_score: number | null; strengths: string | null; weaknesses: string | null;
  recommendation: string; comments: string | null; created_at: string;
}

const PIPELINE_STAGES = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-yellow-100 text-yellow-800" },
  { value: "interview_scheduled", label: "Interview", color: "bg-purple-100 text-purple-800" },
  { value: "selected", label: "Selected", color: "bg-green-100 text-green-800" },
  { value: "onboarding", label: "Onboarding", color: "bg-emerald-100 text-emerald-800" },
  { value: "hired", label: "Hired", color: "bg-green-200 text-green-900" },
  { value: "rejected", label: "Rejected", color: "bg-destructive/10 text-destructive" },
  { value: "on_hold", label: "On Hold", color: "bg-muted text-muted-foreground" },
];

const JOB_STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-100 text-green-800",
  closed: "bg-destructive/10 text-destructive",
  on_hold: "bg-yellow-100 text-yellow-800",
};

const HrRecruitment = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Dept[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  // Dialogs
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [evalDialogOpen, setEvalDialogOpen] = useState(false);
  const [pipelineJobId, setPipelineJobId] = useState<string | null>(null);
  const [viewCandidateId, setViewCandidateId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectCandidateId, setRejectCandidateId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [applicantJobFilter, setApplicantJobFilter] = useState<string>("all");

  // Forms
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "", department_id: "", location: "Lucknow, India", employment_type: "full_time",
    experience_required: "", description: "", requirements: "", salary_range: "", positions: "1",
    closing_date: "",
  });
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [candidateForm, setCandidateForm] = useState({
    job_posting_id: "", full_name: "", email: "", phone: "", current_organization: "",
    experience_years: "", skills: "", cover_letter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    candidate_id: "", interviewer_id: "", interview_type: "in_person",
    scheduled_at: "", duration_minutes: "45", location: "", meeting_link: "",
  });
  const [evalForm, setEvalForm] = useState({
    candidate_id: "", interview_id: "", technical_score: "", communication_score: "",
    cultural_fit_score: "", leadership_score: "", overall_score: "",
    strengths: "", weaknesses: "", recommendation: "undecided", comments: "",
  });
  const [candidateDocs, setCandidateDocs] = useState<any[]>([]);
  const [docReviewCandidateId, setDocReviewCandidateId] = useState<string | null>(null);
  const [convertingToEmployee, setConvertingToEmployee] = useState(false);

  const fetchAll = useCallback(async () => {
    const [{ data: d }, { data: e }, { data: j }, { data: c }, { data: i }, { data: ev }] = await Promise.all([
      supabase.from("hr_departments").select("id, name").order("name"),
      supabase.from("hr_employees").select("id, employee_id, full_name").eq("employment_status", "active").order("full_name"),
      supabase.from("hr_job_postings").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_candidates").select("*").order("applied_at", { ascending: false }),
      supabase.from("hr_interviews").select("*").order("scheduled_at", { ascending: false }),
      supabase.from("hr_evaluations").select("*").order("created_at", { ascending: false }),
    ]);
    setDepartments(d || []);
    setEmployees(e || []);
    setJobs(j || []);
    setCandidates(c || []);
    setInterviews(i || []);
    setEvaluations(ev || []);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Helpers
  const getDeptName = (id: string | null) => departments.find((d) => d.id === id)?.name || "—";
  const getEmpName = (id: string | null) => employees.find((e) => e.id === id)?.full_name || "—";
  const getJobTitle = (id: string) => jobs.find((j) => j.id === id)?.title || "—";
  const getCandidateName = (id: string) => candidates.find((c) => c.id === id)?.full_name || "—";
  const getStageInfo = (stage: string) => PIPELINE_STAGES.find((s) => s.value === stage) || PIPELINE_STAGES[0];

  // ---- Job Posting CRUD ----
  const resetJobForm = () => {
    setJobForm({ title: "", department_id: "", location: "Lucknow, India", employment_type: "full_time", experience_required: "", description: "", requirements: "", salary_range: "", positions: "1", closing_date: "" });
    setEditingJob(null);
    setJdFile(null);
  };
  const openEditJob = (j: JobPosting) => {
    setEditingJob(j);
    setJobForm({
      title: j.title, department_id: j.department_id || "", location: j.location || "",
      employment_type: j.employment_type, experience_required: j.experience_required || "",
      description: j.description || "", requirements: j.requirements || "",
      salary_range: j.salary_range || "", positions: String(j.positions),
      closing_date: j.closing_date || "",
    });
    setJobDialogOpen(true);
  };
  const handleSaveJob = async () => {
    if (!jobForm.title) { toast({ title: "Error", description: "Title required.", variant: "destructive" }); return; }
    
    let jd_file_url: string | null = editingJob ? (editingJob as any).jd_file_url || null : null;
    if (jdFile) {
      const path = `jd/${Date.now()}_${jdFile.name}`;
      const { error: upErr } = await supabase.storage.from("hr-documents").upload(path, jdFile);
      if (upErr) { toast({ title: "Upload Error", description: upErr.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("hr-documents").getPublicUrl(path);
      jd_file_url = urlData.publicUrl;
    }
    
    const payload = {
      title: jobForm.title,
      department_id: jobForm.department_id || null,
      location: jobForm.location || null,
      employment_type: jobForm.employment_type,
      experience_required: jobForm.experience_required || null,
      description: jobForm.description || null,
      requirements: jobForm.requirements || null,
      salary_range: jobForm.salary_range || null,
      positions: Number(jobForm.positions) || 1,
      closing_date: jobForm.closing_date || null,
      jd_file_url,
    };
    if (editingJob) {
      const { error } = await supabase.from("hr_job_postings").update(payload).eq("id", editingJob.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("hr_job_postings").insert({ ...payload, created_by: user?.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editingJob ? "Updated" : "Created" });
    setJobDialogOpen(false);
    resetJobForm();
    fetchAll();
  };
  const publishJob = async (id: string) => {
    await supabase.from("hr_job_postings").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Published" });
    fetchAll();
  };
  const closeJob = async (id: string) => {
    await supabase.from("hr_job_postings").update({ status: "closed" }).eq("id", id);
    toast({ title: "Closed" });
    fetchAll();
  };

  // ---- Candidate CRUD ----
  const resetCandidateForm = () => { setCandidateForm({ job_posting_id: "", full_name: "", email: "", phone: "", current_organization: "", experience_years: "", skills: "", cover_letter: "" }); setResumeFile(null); };
  const handleAddCandidate = async () => {
    if (!candidateForm.full_name || !candidateForm.email || !candidateForm.job_posting_id) {
      toast({ title: "Error", description: "Name, email, and job required.", variant: "destructive" }); return;
    }
    let resume_url: string | null = null;
    if (resumeFile) {
      const path = `resumes/${Date.now()}_${resumeFile.name}`;
      const { error: upErr } = await supabase.storage.from("hr-documents").upload(path, resumeFile);
      if (upErr) { toast({ title: "Upload Error", description: upErr.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("hr-documents").getPublicUrl(path);
      resume_url = urlData.publicUrl;
    }
    const { error } = await supabase.from("hr_candidates").insert({
      job_posting_id: candidateForm.job_posting_id,
      full_name: candidateForm.full_name,
      email: candidateForm.email,
      phone: candidateForm.phone || null,
      current_organization: candidateForm.current_organization || null,
      experience_years: candidateForm.experience_years ? Number(candidateForm.experience_years) : null,
      skills: candidateForm.skills ? candidateForm.skills.split(",").map((s) => s.trim()) : null,
      cover_letter: candidateForm.cover_letter || null,
      resume_url,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Candidate Added" });
    setCandidateDialogOpen(false);
    resetCandidateForm();
    fetchAll();
  };
  const updateStage = async (candidateId: string, stage: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    
    // If rejecting, trigger rejection email
    if (stage === "rejected" && candidate) {
      try {
        const { data, error } = await supabase.functions.invoke("candidate-rejection-email", {
          body: {
            candidateName: candidate.full_name,
            candidateEmail: candidate.email,
            jobTitle: getJobTitle(candidate.job_posting_id),
            reason: "",
          },
        });
        if (!error && data?.emailBody) {
          toast({ title: "Rejection Email Sent", description: `Email generated for ${candidate.full_name}` });
        }
      } catch (e) {
        console.error("Rejection email error:", e);
      }
    }

    // If selecting for onboarding, generate link
    if (stage === "onboarding" && candidate) {
      await supabase.from("hr_candidates").update({ 
        pipeline_stage: stage, 
        onboarding_status: "link_sent" 
      }).eq("id", candidateId);
      
      // Get the token
      const { data: updated } = await supabase
        .from("hr_candidates")
        .select("onboarding_token")
        .eq("id", candidateId)
        .single();
      
      if (updated?.onboarding_token) {
        const link = `${window.location.origin}/onboarding?token=${updated.onboarding_token}`;
        await navigator.clipboard.writeText(link);
        toast({ title: "Onboarding Link Copied!", description: `Share this link with ${candidate.full_name} to upload documents.` });
      }
      fetchAll();
      return;
    }

    await supabase.from("hr_candidates").update({ pipeline_stage: stage }).eq("id", candidateId);
    toast({ title: "Stage Updated" });
    fetchAll();
  };

  const handleRejectWithReason = async () => {
    if (!rejectCandidateId) return;
    const candidate = candidates.find((c) => c.id === rejectCandidateId);
    if (!candidate) return;
    
    setRejecting(true);
    try {
      const { data } = await supabase.functions.invoke("candidate-rejection-email", {
        body: {
          candidateName: candidate.full_name,
          candidateEmail: candidate.email,
          jobTitle: getJobTitle(candidate.job_posting_id),
          reason: rejectReason,
        },
      });
      
      await supabase.from("hr_candidates").update({ pipeline_stage: "rejected", notes: rejectReason || candidate.notes }).eq("id", rejectCandidateId);
      toast({ title: "Candidate Rejected", description: `Rejection email sent to ${candidate.full_name}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setRejecting(false);
      setRejectDialogOpen(false);
      setRejectCandidateId(null);
      setRejectReason("");
      fetchAll();
    }
  };

  const filteredApplicants = applicantJobFilter === "all" 
    ? candidates 
    : candidates.filter((c) => c.job_posting_id === applicantJobFilter);

  // Document review functions
  const fetchCandidateDocs = async (candidateId: string) => {
    const { data } = await supabase
      .from("candidate_documents")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("uploaded_at");
    setCandidateDocs(data || []);
    setDocReviewCandidateId(candidateId);
  };

  const handleDocReview = async (docId: string, status: "approved" | "rejected") => {
    await supabase.from("candidate_documents").update({
      review_status: status,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", docId);
    toast({ title: `Document ${status}` });
    if (docReviewCandidateId) fetchCandidateDocs(docReviewCandidateId);
  };

  const handleFinalApproval = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;
    setConvertingToEmployee(true);
    try {
      // Generate employee ID
      const empCount = employees.length + 1;
      const employeeId = `ANUV-${String(empCount).padStart(4, "0")}`;
      
      // Create employee record
      const { error } = await supabase.from("hr_employees").insert({
        employee_id: employeeId,
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone || null,
        onboarding_status: "pending_documents",
        lifecycle_stage: "onboarding",
        employment_status: "active",
      });
      if (error) throw error;

      // Update candidate status
      await supabase.from("hr_candidates").update({
        pipeline_stage: "hired",
        onboarding_status: "completed",
      }).eq("id", candidateId);

      toast({ title: "Employee Created!", description: `${candidate.full_name} has been added to the HRMS as ${employeeId}.` });
      setDocReviewCandidateId(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setConvertingToEmployee(false);
    }
  };

  // ---- Interview Scheduling ----
  const resetInterviewForm = () => setInterviewForm({ candidate_id: "", interviewer_id: "", interview_type: "in_person", scheduled_at: "", duration_minutes: "45", location: "", meeting_link: "" });
  const handleScheduleInterview = async () => {
    if (!interviewForm.candidate_id || !interviewForm.scheduled_at) {
      toast({ title: "Error", description: "Candidate and date required.", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("hr_interviews").insert({
      candidate_id: interviewForm.candidate_id,
      interviewer_id: interviewForm.interviewer_id || null,
      interview_type: interviewForm.interview_type,
      scheduled_at: interviewForm.scheduled_at,
      duration_minutes: Number(interviewForm.duration_minutes) || 45,
      location: interviewForm.location || null,
      meeting_link: interviewForm.meeting_link || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    // Auto-advance stage
    await supabase.from("hr_candidates").update({ pipeline_stage: "interview_scheduled" }).eq("id", interviewForm.candidate_id);
    toast({ title: "Interview Scheduled" });
    setInterviewDialogOpen(false);
    resetInterviewForm();
    fetchAll();
  };

  // ---- Evaluation ----
  const resetEvalForm = () => setEvalForm({ candidate_id: "", interview_id: "", technical_score: "", communication_score: "", cultural_fit_score: "", leadership_score: "", overall_score: "", strengths: "", weaknesses: "", recommendation: "undecided", comments: "" });
  const handleSubmitEval = async () => {
    if (!evalForm.candidate_id) { toast({ title: "Error", description: "Candidate required.", variant: "destructive" }); return; }
    const myEmp = employees.find((e) => e.full_name); // fallback
    const { error } = await supabase.from("hr_evaluations").insert({
      candidate_id: evalForm.candidate_id,
      interview_id: evalForm.interview_id || null,
      technical_score: evalForm.technical_score ? Number(evalForm.technical_score) : null,
      communication_score: evalForm.communication_score ? Number(evalForm.communication_score) : null,
      cultural_fit_score: evalForm.cultural_fit_score ? Number(evalForm.cultural_fit_score) : null,
      leadership_score: evalForm.leadership_score ? Number(evalForm.leadership_score) : null,
      overall_score: evalForm.overall_score ? Number(evalForm.overall_score) : null,
      strengths: evalForm.strengths || null,
      weaknesses: evalForm.weaknesses || null,
      recommendation: evalForm.recommendation,
      comments: evalForm.comments || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Evaluation Submitted" });
    setEvalDialogOpen(false);
    resetEvalForm();
    fetchAll();
  };

  // Stats
  const publishedJobs = jobs.filter((j) => j.status === "published").length;
  const totalCandidates = candidates.length;
  const upcomingInterviews = interviews.filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) >= new Date()).length;
  const selectedCandidates = candidates.filter((c) => c.pipeline_stage === "selected").length;

  // Pipeline view for a specific job
  const pipelineJob = pipelineJobId ? jobs.find((j) => j.id === pipelineJobId) : null;
  const pipelineCandidates = pipelineJobId ? candidates.filter((c) => c.job_posting_id === pipelineJobId) : [];

  // Candidate detail view
  const viewCandidate = viewCandidateId ? candidates.find((c) => c.id === viewCandidateId) : null;
  const viewInterviews = viewCandidateId ? interviews.filter((i) => i.candidate_id === viewCandidateId) : [];
  const viewEvals = viewCandidateId ? evaluations.filter((e) => e.candidate_id === viewCandidateId) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruitment</h1>
          <p className="text-muted-foreground">Manage job postings, candidates, and hiring pipeline</p>
        </div>
        {isHrAdmin() && (
          <div className="flex gap-2 flex-wrap">
            <Dialog open={jobDialogOpen} onOpenChange={(o) => { setJobDialogOpen(o); if (!o) resetJobForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />New Job</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingJob ? "Edit Job Posting" : "Create Job Posting"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>Title *</Label><Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Program Coordinator" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Department</Label>
                      <Select value={jobForm.department_id} onValueChange={(v) => setJobForm({ ...jobForm, department_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={jobForm.employment_type} onValueChange={(v) => setJobForm({ ...jobForm, employment_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="intern">Internship</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Location</Label><Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} /></div>
                    <div><Label>Positions</Label><Input type="number" value={jobForm.positions} onChange={(e) => setJobForm({ ...jobForm, positions: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Experience</Label><Input value={jobForm.experience_required} onChange={(e) => setJobForm({ ...jobForm, experience_required: e.target.value })} placeholder="e.g. 2-5 years" /></div>
                    <div><Label>Salary Range</Label><Input value={jobForm.salary_range} onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} placeholder="e.g. ₹4-6 LPA" /></div>
                  </div>
                  <div><Label>Closing Date</Label><Input type="date" value={jobForm.closing_date} onChange={(e) => setJobForm({ ...jobForm, closing_date: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea rows={3} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></div>
                  <div><Label>Requirements</Label><Textarea rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="One requirement per line" /></div>
                  <div>
                    <Label>Upload JD (PDF/DOC)</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
                    {jdFile && <p className="text-xs text-muted-foreground mt-1">{jdFile.name}</p>}
                    {editingJob && (editingJob as any).jd_file_url && !jdFile && (
                      <p className="text-xs text-muted-foreground mt-1">✓ JD already uploaded</p>
                    )}
                  </div>
                  <Button onClick={handleSaveJob}>{editingJob ? "Update" : "Create Job Posting"}</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={candidateDialogOpen} onOpenChange={(o) => { setCandidateDialogOpen(o); if (!o) resetCandidateForm(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><UserCheck className="h-4 w-4" />Add Candidate</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Job Position *</Label>
                    <Select value={candidateForm.job_posting_id} onValueChange={(v) => setCandidateForm({ ...candidateForm, job_posting_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                      <SelectContent>{jobs.filter((j) => j.status === "published").map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Full Name *</Label><Input value={candidateForm.full_name} onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })} /></div>
                    <div><Label>Email *</Label><Input type="email" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Phone</Label><Input value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })} /></div>
                    <div><Label>Experience (years)</Label><Input type="number" value={candidateForm.experience_years} onChange={(e) => setCandidateForm({ ...candidateForm, experience_years: e.target.value })} /></div>
                  </div>
                  <div><Label>Current Organization</Label><Input value={candidateForm.current_organization} onChange={(e) => setCandidateForm({ ...candidateForm, current_organization: e.target.value })} /></div>
                  <div><Label>Skills (comma-separated)</Label><Input value={candidateForm.skills} onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })} placeholder="e.g. Project management, WASH, M&E" /></div>
                  <div><Label>Cover Letter / Notes</Label><Textarea value={candidateForm.cover_letter} onChange={(e) => setCandidateForm({ ...candidateForm, cover_letter: e.target.value })} /></div>
                  <div><Label>Resume (PDF/DOC)</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />{resumeFile && <p className="text-xs text-muted-foreground mt-1">{resumeFile.name}</p>}</div>
                  <Button onClick={handleAddCandidate}>Add Candidate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{publishedJobs}</div><div className="text-xs text-muted-foreground">Open Positions</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{totalCandidates}</div><div className="text-xs text-muted-foreground">Total Applicants</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{upcomingInterviews}</div><div className="text-xs text-muted-foreground">Upcoming Interviews</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{selectedCandidates}</div><div className="text-xs text-muted-foreground">Selected</div></CardContent></Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="flex-wrap">
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="all_applicants">All Applicants</TabsTrigger>
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="onboarding_review">Onboarding Review</TabsTrigger>
        </TabsList>

        {/* ===== JOB POSTINGS ===== */}
        <TabsContent value="jobs">
          <div className="grid gap-4">
            {jobs.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No job postings yet. Create your first one.</CardContent></Card>
            ) : (
              jobs.map((j) => {
                const applicants = candidates.filter((c) => c.job_posting_id === j.id).length;
                return (
                  <Card key={j.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{j.title}</h3>
                            <Badge className={JOB_STATUS_COLORS[j.status]}>{j.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{getDeptName(j.department_id)}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{applicants} applicants</span>
                            <span className="capitalize">{j.employment_type.replace("_", " ")}</span>
                            {j.positions > 1 && <span>{j.positions} positions</span>}
                          </div>
                          {j.salary_range && <p className="text-sm text-muted-foreground mt-1">{j.salary_range}</p>}
                        </div>
                        <div className="flex gap-2 items-start">
                          {j.status === "draft" && isHrAdmin() && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => publishJob(j.id)}>
                              <Send className="h-3 w-3" />Publish
                            </Button>
                          )}
                          {j.status === "published" && isHrAdmin() && (
                            <Button size="sm" variant="ghost" className="gap-1" onClick={() => closeJob(j.id)}>
                              <X className="h-3 w-3" />Close
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { setPipelineJobId(j.id); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isHrAdmin() && (
                            <Button size="sm" variant="ghost" onClick={() => openEditJob(j)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ===== ALL APPLICANTS ===== */}
        <TabsContent value="all_applicants">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={applicantJobFilter} onValueChange={setApplicantJobFilter}>
                <SelectTrigger className="w-72"><SelectValue placeholder="Filter by job" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{filteredApplicants.length} applicants</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job Applied</TableHead>
                      <TableHead className="hidden md:table-cell">Experience</TableHead>
                      <TableHead className="hidden md:table-cell">Applied On</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No applicants found</TableCell></TableRow>
                    ) : (
                      filteredApplicants.map((c) => (
                        <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewCandidateId(c.id)}>
                          <TableCell className="font-medium">{c.full_name}</TableCell>
                          <TableCell className="text-sm">{c.email}</TableCell>
                          <TableCell className="text-sm">{getJobTitle(c.job_posting_id)}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{c.experience_years ? `${Number(c.experience_years)}y` : "—"}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{format(new Date(c.applied_at), "dd MMM yyyy")}</TableCell>
                          <TableCell><Badge className={getStageInfo(c.pipeline_stage).color}>{getStageInfo(c.pipeline_stage).label}</Badge></TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              {isHrAdmin() && c.pipeline_stage !== "rejected" && (
                                <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => {
                                  setRejectCandidateId(c.id);
                                  setRejectDialogOpen(true);
                                }}>
                                  Reject
                                </Button>
                              )}
                              {isHrAdmin() && c.pipeline_stage === "selected" && (
                                <Button size="sm" variant="ghost" className="text-primary h-7 text-xs" onClick={() => updateStage(c.id, "onboarding")}>
                                  Onboard
                                </Button>
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
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="space-y-4">
            {/* Job filter */}
            <Select value={pipelineJobId || ""} onValueChange={(v) => setPipelineJobId(v)}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Select a job to view pipeline" /></SelectTrigger>
              <SelectContent>{jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
            </Select>

            {pipelineJobId ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {PIPELINE_STAGES.filter((s) => s.value !== "on_hold").map((stage) => {
                  const stageCandidates = pipelineCandidates.filter((c) => c.pipeline_stage === stage.value);
                  return (
                    <Card key={stage.value}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{stage.label}</CardTitle>
                          <Badge variant="secondary" className="text-xs">{stageCandidates.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {stageCandidates.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No candidates</p>
                        ) : (
                          stageCandidates.map((c) => (
                            <Card key={c.id} className="cursor-pointer hover:shadow-sm" onClick={() => setViewCandidateId(c.id)}>
                              <CardContent className="p-3">
                                <p className="font-medium text-sm">{c.full_name}</p>
                                <p className="text-xs text-muted-foreground">{c.email}</p>
                                {c.experience_years && <p className="text-xs text-muted-foreground">{Number(c.experience_years)}y exp</p>}
                                {isHrAdmin() && (
                                  <Select value={c.pipeline_stage} onValueChange={(v) => { updateStage(c.id, v); }}>
                                    <SelectTrigger className="mt-2 h-7 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                  </Select>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Select a job posting to view its candidate pipeline</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ===== INTERVIEWS ===== */}
        <TabsContent value="interviews">
          <div className="space-y-4">
            {isHrAdmin() && (
              <Dialog open={interviewDialogOpen} onOpenChange={(o) => { setInterviewDialogOpen(o); if (!o) resetInterviewForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Calendar className="h-4 w-4" />Schedule Interview</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Candidate *</Label>
                      <Select value={interviewForm.candidate_id} onValueChange={(v) => setInterviewForm({ ...interviewForm, candidate_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                        <SelectContent>{candidates.filter((c) => c.pipeline_stage !== "rejected" && c.pipeline_stage !== "selected").map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} — {getJobTitle(c.job_posting_id)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Interviewer</Label>
                      <Select value={interviewForm.interviewer_id} onValueChange={(v) => setInterviewForm({ ...interviewForm, interviewer_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                        <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Date & Time *</Label><Input type="datetime-local" value={interviewForm.scheduled_at} onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} /></div>
                      <div><Label>Duration (min)</Label><Input type="number" value={interviewForm.duration_minutes} onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select value={interviewForm.interview_type} onValueChange={(v) => setInterviewForm({ ...interviewForm, interview_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_person">In Person</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="video">Video Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Location / Link</Label><Input value={interviewForm.interview_type === "video" ? interviewForm.meeting_link : interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, [interviewForm.interview_type === "video" ? "meeting_link" : "location"]: e.target.value })} /></div>
                    </div>
                    <Button onClick={handleScheduleInterview}>Schedule</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead className="hidden md:table-cell">Interviewer</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No interviews scheduled</TableCell></TableRow>
                    ) : (
                      interviews.map((i) => {
                        const cand = candidates.find((c) => c.id === i.candidate_id);
                        return (
                          <TableRow key={i.id}>
                            <TableCell className="font-medium">{getCandidateName(i.candidate_id)}</TableCell>
                            <TableCell className="text-sm">{cand ? getJobTitle(cand.job_posting_id) : "—"}</TableCell>
                            <TableCell className="text-sm">{format(new Date(i.scheduled_at), "dd MMM yyyy, hh:mm a")}</TableCell>
                            <TableCell className="hidden md:table-cell">{getEmpName(i.interviewer_id)}</TableCell>
                            <TableCell className="hidden md:table-cell capitalize">{i.interview_type.replace("_", " ")}</TableCell>
                            <TableCell><Badge variant="secondary">{i.status}</Badge></TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== EVALUATIONS ===== */}
        <TabsContent value="evaluations">
          <div className="space-y-4">
            {isHrAdmin() && (
              <Dialog open={evalDialogOpen} onOpenChange={(o) => { setEvalDialogOpen(o); if (!o) resetEvalForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><ClipboardCheck className="h-4 w-4" />Submit Evaluation</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Candidate Evaluation</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Candidate *</Label>
                      <Select value={evalForm.candidate_id} onValueChange={(v) => setEvalForm({ ...evalForm, candidate_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                        <SelectContent>{candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Linked Interview (optional)</Label>
                      <Select value={evalForm.interview_id} onValueChange={(v) => setEvalForm({ ...evalForm, interview_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select interview" /></SelectTrigger>
                        <SelectContent>{interviews.filter((i) => i.candidate_id === evalForm.candidate_id).map((i) => <SelectItem key={i.id} value={i.id}>{format(new Date(i.scheduled_at), "dd MMM yyyy")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm font-medium text-foreground">Scores (1-10)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Technical</Label><Input type="number" min="1" max="10" value={evalForm.technical_score} onChange={(e) => setEvalForm({ ...evalForm, technical_score: e.target.value })} /></div>
                      <div><Label>Communication</Label><Input type="number" min="1" max="10" value={evalForm.communication_score} onChange={(e) => setEvalForm({ ...evalForm, communication_score: e.target.value })} /></div>
                      <div><Label>Cultural Fit</Label><Input type="number" min="1" max="10" value={evalForm.cultural_fit_score} onChange={(e) => setEvalForm({ ...evalForm, cultural_fit_score: e.target.value })} /></div>
                      <div><Label>Leadership</Label><Input type="number" min="1" max="10" value={evalForm.leadership_score} onChange={(e) => setEvalForm({ ...evalForm, leadership_score: e.target.value })} /></div>
                    </div>
                    <div><Label>Overall Score</Label><Input type="number" min="1" max="10" value={evalForm.overall_score} onChange={(e) => setEvalForm({ ...evalForm, overall_score: e.target.value })} /></div>
                    <div><Label>Strengths</Label><Textarea value={evalForm.strengths} onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })} /></div>
                    <div><Label>Areas for Improvement</Label><Textarea value={evalForm.weaknesses} onChange={(e) => setEvalForm({ ...evalForm, weaknesses: e.target.value })} /></div>
                    <div>
                      <Label>Recommendation</Label>
                      <Select value={evalForm.recommendation} onValueChange={(v) => setEvalForm({ ...evalForm, recommendation: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strong_hire">Strong Hire</SelectItem>
                          <SelectItem value="hire">Hire</SelectItem>
                          <SelectItem value="undecided">Undecided</SelectItem>
                          <SelectItem value="no_hire">No Hire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Additional Comments</Label><Textarea value={evalForm.comments} onChange={(e) => setEvalForm({ ...evalForm, comments: e.target.value })} /></div>
                    <Button onClick={handleSubmitEval}>Submit Evaluation</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Technical</TableHead>
                      <TableHead>Comm.</TableHead>
                      <TableHead className="hidden md:table-cell">Cultural</TableHead>
                      <TableHead className="hidden md:table-cell">Leadership</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No evaluations yet</TableCell></TableRow>
                    ) : (
                      evaluations.map((ev) => (
                        <TableRow key={ev.id}>
                          <TableCell className="font-medium">{getCandidateName(ev.candidate_id)}</TableCell>
                          <TableCell>{ev.technical_score || "—"}</TableCell>
                          <TableCell>{ev.communication_score || "—"}</TableCell>
                          <TableCell className="hidden md:table-cell">{ev.cultural_fit_score || "—"}</TableCell>
                          <TableCell className="hidden md:table-cell">{ev.leadership_score || "—"}</TableCell>
                          <TableCell className="font-bold">{ev.overall_score || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={
                              ev.recommendation === "strong_hire" ? "bg-green-100 text-green-800" :
                              ev.recommendation === "hire" ? "bg-blue-100 text-blue-800" :
                              ev.recommendation === "no_hire" ? "bg-destructive/10 text-destructive" :
                              "bg-muted text-muted-foreground"
                            }>
                              {ev.recommendation.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* ===== ONBOARDING REVIEW ===== */}
        <TabsContent value="onboarding_review">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review uploaded documents from onboarding candidates and give final approval to convert them into employees.</p>
            {candidates.filter((c) => c.pipeline_stage === "onboarding").length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No candidates in onboarding stage.</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {candidates.filter((c) => c.pipeline_stage === "onboarding").map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{c.full_name}</p>
                        <p className="text-sm text-muted-foreground">{c.email} · {getJobTitle(c.job_posting_id)}</p>
                        <Badge className="mt-1" variant="secondary">
                          {(c as any).onboarding_status === "documents_submitted" ? "Documents Submitted" : "Awaiting Documents"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button size="sm" variant="outline" onClick={() => fetchCandidateDocs(c.id)}>
                          <Eye className="h-4 w-4 mr-1" /> Review Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Review Dialog */}
      <Dialog open={!!docReviewCandidateId} onOpenChange={(o) => { if (!o) setDocReviewCandidateId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {docReviewCandidateId && (() => {
            const candidate = candidates.find((c) => c.id === docReviewCandidateId);
            const allApproved = candidateDocs.length > 0 && candidateDocs.every((d) => d.review_status === "approved");
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Document Review — {candidate?.full_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {candidateDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                  ) : (
                    candidateDocs.map((doc) => (
                      <Card key={doc.id} className={doc.review_status === "approved" ? "border-green-200" : doc.review_status === "rejected" ? "border-destructive/30" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-foreground">{doc.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                              <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View Document ↗</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={
                                doc.review_status === "approved" ? "bg-green-100 text-green-800" :
                                doc.review_status === "rejected" ? "bg-destructive/10 text-destructive" :
                                "bg-yellow-100 text-yellow-800"
                              }>
                                {doc.review_status}
                              </Badge>
                              {isHrAdmin() && doc.review_status === "pending" && (
                                <>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-green-700" onClick={() => handleDocReview(doc.id, "approved")}>Approve</Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleDocReview(doc.id, "rejected")}>Reject</Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {/* Final Approval */}
                  {isHrAdmin() && allApproved && (
                    <div className="border-t border-border pt-4 text-center space-y-2">
                      <p className="text-sm font-semibold text-green-700">✅ All documents approved!</p>
                      <Button onClick={() => handleFinalApproval(docReviewCandidateId)} disabled={convertingToEmployee} className="gap-2">
                        {convertingToEmployee ? "Converting..." : "Final Approve — Add as Employee"}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCandidateId} onOpenChange={(o) => { if (!o) setViewCandidateId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {viewCandidate.full_name}
                  <Badge className={getStageInfo(viewCandidate.pipeline_stage).color}>{getStageInfo(viewCandidate.pipeline_stage).label}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {viewCandidate.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {viewCandidate.phone || "—"}</div>
                  <div><span className="text-muted-foreground">Organization:</span> {viewCandidate.current_organization || "—"}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {viewCandidate.experience_years ? `${Number(viewCandidate.experience_years)} years` : "—"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Applied for:</span> {getJobTitle(viewCandidate.job_posting_id)}</div>
                  {viewCandidate.skills && viewCandidate.skills.length > 0 && (
                    <div className="col-span-2 flex gap-1 flex-wrap">
                      <span className="text-muted-foreground">Skills:</span>
                      {viewCandidate.skills.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  )}
                </div>
                {viewCandidate.cover_letter && (
                  <div><Label>Cover Letter</Label><p className="text-sm text-muted-foreground mt-1">{viewCandidate.cover_letter}</p></div>
                )}

                {viewInterviews.length > 0 && (
                  <div>
                    <Label>Interviews ({viewInterviews.length})</Label>
                    <div className="space-y-2 mt-1">
                      {viewInterviews.map((i) => (
                        <div key={i.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                          <span>{format(new Date(i.scheduled_at), "dd MMM yyyy, hh:mm a")}</span>
                          <span className="text-muted-foreground">{getEmpName(i.interviewer_id)}</span>
                          <Badge variant="secondary">{i.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewEvals.length > 0 && (
                  <div>
                    <Label>Evaluations ({viewEvals.length})</Label>
                    <div className="space-y-2 mt-1">
                      {viewEvals.map((ev) => (
                        <Card key={ev.id}>
                          <CardContent className="p-3 text-sm">
                            <div className="flex gap-4 flex-wrap">
                              <span>Tech: <strong>{ev.technical_score || "—"}</strong></span>
                              <span>Comm: <strong>{ev.communication_score || "—"}</strong></span>
                              <span>Culture: <strong>{ev.cultural_fit_score || "—"}</strong></span>
                              <span>Overall: <strong>{ev.overall_score || "—"}</strong></span>
                              <Badge variant="secondary">{ev.recommendation.replace("_", " ")}</Badge>
                            </div>
                            {ev.strengths && <p className="mt-2 text-muted-foreground"><strong>Strengths:</strong> {ev.strengths}</p>}
                            {ev.weaknesses && <p className="text-muted-foreground"><strong>Improve:</strong> {ev.weaknesses}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {isHrAdmin() && (
                  <div className="space-y-3">
                    <div>
                      <Label>Move to Stage</Label>
                      <Select value={viewCandidate.pipeline_stage} onValueChange={(v) => { updateStage(viewCandidate.id, v); setViewCandidateId(null); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      {viewCandidate.pipeline_stage !== "rejected" && (
                        <Button variant="destructive" size="sm" onClick={() => {
                          setRejectCandidateId(viewCandidate.id);
                          setRejectDialogOpen(true);
                          setViewCandidateId(null);
                        }}>
                          Reject with Email
                        </Button>
                      )}
                      {viewCandidate.pipeline_stage === "selected" && (
                        <Button size="sm" onClick={() => { updateStage(viewCandidate.id, "onboarding"); setViewCandidateId(null); }}>
                          Send Onboarding Link
                        </Button>
                      )}
                    </div>
                    {viewCandidate.resume_url && (
                      <a href={viewCandidate.resume_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline block">
                        📄 View Resume
                      </a>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(o) => { if (!o) { setRejectDialogOpen(false); setRejectCandidateId(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              An AI-generated rejection email will be sent to <strong>{rejectCandidateId ? candidates.find((c) => c.id === rejectCandidateId)?.full_name : ""}</strong>.
            </p>
            <div>
              <Label>Reason (optional — helps craft a better email)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Not enough experience in WASH programs, or position filled by another candidate"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRejectWithReason} disabled={rejecting}>
                {rejecting ? "Sending..." : "Reject & Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrRecruitment;
