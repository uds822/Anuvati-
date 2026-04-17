import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, MapPin, Clock, Upload, CheckCircle, ArrowRight, ArrowLeft, Share2, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButtons from "@/components/shared/ShareButtons";

interface JobPosting {
  id: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  experience_required: string | null;
  description: string | null;
  requirements: string | null;
  salary_range: string | null;
  positions: number | null;
  closing_date: string | null;
  published_at: string | null;
  jd_file_url: string | null;
}

const Careers = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail" | "apply">("list");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", current_organization: "",
    experience_years: "", skills: "", cover_letter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("hr_job_postings")
        .select("id, title, location, employment_type, experience_required, description, requirements, salary_range, positions, closing_date, published_at, jd_file_url")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setJobs((data as JobPosting[]) || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job);
    setViewMode("detail");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApply = () => {
    setViewMode("apply");
    setForm({ full_name: "", email: "", phone: "", current_organization: "", experience_years: "", skills: "", cover_letter: "" });
    setResumeFile(null);
  };

  const handleBack = () => {
    if (viewMode === "apply") {
      setViewMode("detail");
    } else {
      setViewMode("list");
      setSelectedJob(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !selectedJob) {
      toast({ title: "Required", description: "Please fill in your name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let resume_url: string | null = null;
      if (resumeFile) {
        const path = `resumes/${Date.now()}_${resumeFile.name}`;
        const { error: upErr } = await supabase.storage.from("candidate-documents").upload(path, resumeFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("candidate-documents").getPublicUrl(path);
        resume_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("hr_candidates").insert({
        job_posting_id: selectedJob.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        current_organization: form.current_organization || null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : null,
        cover_letter: form.cover_letter || null,
        resume_url,
        pipeline_stage: "applied",
      });
      if (error) throw error;
      setSubmitted(true);
      setViewMode("detail");
      toast({ title: "Application Submitted!", description: "We will review your application and get back to you." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = selectedJob ? `${window.location.origin}/careers` : "";

  return (
    <Layout>
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          {viewMode !== "list" && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="font-heading text-xs mb-4 gap-1">
              <ArrowLeft size={14} /> {viewMode === "apply" ? "Back to Job Description" : "Back to All Openings"}
            </Button>
          )}
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Careers</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">
            {viewMode === "list" ? "Current Openings" : selectedJob?.title}
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            {viewMode === "list"
              ? "Join ANUVATI and be part of a team driving sustainable change. Explore our open positions and apply directly."
              : viewMode === "apply"
                ? "Fill in your details below to apply for this position."
                : "Review the job description below and apply if you're a great fit."}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-4xl">

          {/* ===== LIST VIEW ===== */}
          {viewMode === "list" && (
            <>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Briefcase className="mx-auto text-muted-foreground mb-4" size={48} />
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2">No Open Positions Right Now</h3>
                    <p className="font-body text-muted-foreground">Check back soon or follow us for updates on new opportunities.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer" onClick={() => handleViewJob(job)}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Briefcase size={18} className="text-primary shrink-0" />
                              <h3 className="font-heading font-bold text-lg text-foreground">{job.title}</h3>
                              {job.employment_type && (
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                  {job.employment_type.replace("_", " ")}
                                </Badge>
                              )}
                            </div>
                            {job.description && (
                              <p className="font-body text-muted-foreground text-sm mb-3 line-clamp-2">{job.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs font-body text-muted-foreground">
                              {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
                              {job.experience_required && <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience_required}</span>}
                              {job.salary_range && <span>₹ {job.salary_range}</span>}
                              {job.positions && job.positions > 1 && <span>{job.positions} positions</span>}
                              {job.closing_date && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> Apply by {new Date(job.closing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Button className="font-heading font-semibold gap-2" onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}>
                              View & Apply <ArrowRight size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== JOB DETAIL VIEW ===== */}
          {viewMode === "detail" && selectedJob && (
            <div className="space-y-8">
              {submitted && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6 text-center space-y-3">
                    <CheckCircle className="mx-auto text-green-600" size={40} />
                    <h3 className="font-heading font-bold text-lg text-foreground">Application Submitted!</h3>
                    <p className="font-body text-muted-foreground text-sm">
                      Thank you for applying for <strong>{selectedJob.title}</strong>. Our HR team will review your application and contact you if shortlisted.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Job meta */}
              <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
                {selectedJob.location && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"><MapPin size={14} /> {selectedJob.location}</span>}
                {selectedJob.employment_type && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"><Briefcase size={14} /> {selectedJob.employment_type.replace("_", " ")}</span>}
                {selectedJob.experience_required && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">{selectedJob.experience_required}</span>}
                {selectedJob.salary_range && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">₹ {selectedJob.salary_range}</span>}
                {selectedJob.positions && selectedJob.positions > 1 && <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">{selectedJob.positions} positions</span>}
                {selectedJob.closing_date && (
                  <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                    <Clock size={14} /> Apply by {new Date(selectedJob.closing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              {/* JD File download */}
              {selectedJob.jd_file_url && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground">Job Description Document</p>
                        <p className="text-xs text-muted-foreground">Download the detailed JD for this position</p>
                      </div>
                    </div>
                    <a href={selectedJob.jd_file_url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 font-heading text-xs">
                        <ExternalLink size={12} /> Download JD
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {selectedJob.description && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground mb-3">About the Role</h2>
                  <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{selectedJob.description}</div>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground mb-3">Requirements</h2>
                  <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{selectedJob.requirements}</div>
                </div>
              )}

              {/* Action buttons at the bottom */}
              <div className="border-t border-border pt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {!submitted && (
                    <Button onClick={handleApply} size="lg" className="font-heading font-semibold gap-2">
                      Apply for this Position <ArrowRight size={16} />
                    </Button>
                  )}
                  <ShareButtons
                    url={shareUrl}
                    title={`${selectedJob.title} - Career Opportunity at ANUVATI`}
                    description={selectedJob.description || `Check out this opportunity at ANUVATI: ${selectedJob.title}`}
                    variant="buttons"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== APPLY FORM VIEW ===== */}
          {viewMode === "apply" && selectedJob && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="font-heading font-bold text-xl text-foreground mb-6">Apply for {selectedJob.title}</h2>
                <div className="grid gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} placeholder="Your full name" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <Label>Experience (years)</Label>
                      <Input type="number" min="0" max="50" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="e.g. 3" />
                    </div>
                  </div>
                  <div>
                    <Label>Current Organization</Label>
                    <Input value={form.current_organization} onChange={(e) => setForm({ ...form, current_organization: e.target.value })} maxLength={200} placeholder="Current employer (if any)" />
                  </div>
                  <div>
                    <Label>Skills (comma-separated)</Label>
                    <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} maxLength={500} placeholder="e.g. Project Management, WASH, M&E" />
                  </div>
                  <div>
                    <Label>Cover Letter / Why this role?</Label>
                    <Textarea value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} maxLength={2000} rows={4} placeholder="Tell us why you're a great fit..." />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Upload size={14} /> Upload CV / Resume (PDF/DOC)</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="mt-1" />
                    {resumeFile && <p className="text-xs text-muted-foreground mt-1">{resumeFile.name}</p>}
                  </div>
                  <Button onClick={handleSubmit} disabled={submitting} size="lg" className="font-heading font-semibold">
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
