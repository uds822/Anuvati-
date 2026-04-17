import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Send, Paperclip, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ParticipationRole = Database["public"]["Enums"]["participation_role"];

const ROLES: { value: ParticipationRole; label: string; description: string }[] = [
  { value: "volunteer", label: "Volunteer", description: "Join our field programs and make a direct impact." },
  { value: "internship", label: "Internship", description: "Gain hands-on experience in development work." },
  { value: "campus_ambassador", label: "Campus Ambassador", description: "Represent ANUVATI at your college." },
  { value: "corporate_volunteer", label: "Corporate Volunteer", description: "Engage your team in CSR activities." },
  { value: "partner_organization", label: "Partner Organization", description: "Collaborate as a partner in our programs." },
];

const VOLUNTEER_AREAS = ["Education", "Health", "Environment", "Digital Literacy", "Community Development", "Other"];
const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Flexible"];
const ORG_TYPES = ["NGO", "CSR Foundation", "University", "Community Organization", "Government Body"];

interface ParticipationFormProps {
  onSubmitted?: () => void;
}

const ParticipationForm = ({ onSubmitted }: ParticipationFormProps) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<ParticipationRole | "">("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Volunteer fields
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");
  const [previousExp, setPreviousExp] = useState("");

  // Internship fields
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [durationPref, setDurationPref] = useState("");
  const [fieldOfInterest, setFieldOfInterest] = useState("");

  // Campus Ambassador
  const [caUniversity, setCaUniversity] = useState("");
  const [caCourse, setCaCourse] = useState("");
  const [caYear, setCaYear] = useState("");
  const [studentOrg, setStudentOrg] = useState("");
  const [whyRepresent, setWhyRepresent] = useState("");

  // Corporate
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [department, setDepartment] = useState("");
  const [corpInterest, setCorpInterest] = useState("");

  // Partner
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [partnerInterest, setPartnerInterest] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  const handleSubmit = async () => {
    if (!selectedRole || !user) {
      toast({ title: "Error", description: "Please select a role.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: submissionData, error: subError } = await supabase.from("submissions").insert({
      user_id: user.id,
      role: selectedRole as ParticipationRole,
    }).select("id").single();

    if (subError || !submissionData) {
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const sid = submissionData.id;
    let detailError = null;

    if (selectedRole === "volunteer") {
      const { error } = await supabase.from("volunteer_details").insert({ submission_id: sid, areas_of_interest: areasOfInterest, availability, skills: skills || null, previous_experience: previousExp || null });
      detailError = error;
    } else if (selectedRole === "internship") {
      const { error } = await supabase.from("internship_details").insert({ submission_id: sid, university: university || null, course: course || null, year_of_study: yearOfStudy || null, duration_preference: durationPref || null, field_of_interest: fieldOfInterest || null });
      detailError = error;
    } else if (selectedRole === "campus_ambassador") {
      const { error } = await supabase.from("campus_ambassador_details").insert({ submission_id: sid, university_name: caUniversity || null, course: caCourse || null, year_of_study: caYear || null, student_org_involvement: studentOrg || null, why_represent: whyRepresent || null });
      detailError = error;
    } else if (selectedRole === "corporate_volunteer") {
      const { error } = await supabase.from("corporate_volunteer_details").insert({ submission_id: sid, company_name: companyName || null, job_role: jobRole || null, department: department || null, interest_area: corpInterest || null });
      detailError = error;
    } else if (selectedRole === "partner_organization") {
      const { error } = await supabase.from("partner_organization_details").insert({ submission_id: sid, organization_name: orgName || null, organization_type: orgType || null, website: orgWebsite || null, partnership_interest: partnerInterest || null, organization_description: orgDescription || null });
      detailError = error;
    }

    if (detailError) console.error("Detail error:", detailError);

    // Upload resume if provided
    if (resumeFile && user) {
      const ext = resumeFile.name.split(".").pop();
      const path = `${user.id}/${sid}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, { upsert: true });
      if (!uploadError) {
        await supabase.from("submissions").update({ resume_url: path }).eq("id", sid);
      }
    }

    setLoading(false);
    setSubmitted(true);
    toast({ title: "Application Submitted!", description: "Thank you for your interest in ANUVATI." });
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-border shadow-lg">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">Application Submitted!</h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">Our team will review your submission and contact you shortly.</p>
          <Button className="mt-6 font-heading" onClick={() => { setSubmitted(false); setSelectedRole(""); }}>Submit Another Application</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-foreground">New Application</CardTitle>
          <CardDescription className="font-body text-muted-foreground">Select a role and fill in the details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="font-heading text-sm font-semibold">How do you want to get involved?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedRole === r.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
                  <p className={`font-heading font-medium text-sm ${selectedRole === r.value ? "text-primary" : "text-foreground"}`}>{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {selectedRole === "volunteer" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-3">
                <Label className="font-heading text-sm font-semibold">Areas of Interest</Label>
                <div className="grid grid-cols-2 gap-2">
                  {VOLUNTEER_AREAS.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm font-body">
                      <Checkbox checked={areasOfInterest.includes(a)} onCheckedChange={(c) => setAreasOfInterest(c ? [...areasOfInterest, a] : areasOfInterest.filter((x) => x !== a))} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Availability</Label>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <button key={o} type="button" onClick={() => setAvailability(o)}
                      className={`px-4 py-2 rounded-lg border text-sm font-heading transition-all ${availability === o ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label className="font-heading text-sm">Skills</Label><Textarea value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-heading text-sm">Previous Volunteer Experience</Label><Textarea value={previousExp} onChange={(e) => setPreviousExp(e.target.value)} /></div>
            </div>
          )}

          {selectedRole === "internship" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-heading text-sm">University / Institution</Label><Input value={university} onChange={(e) => setUniversity(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Course / Degree</Label><Input value={course} onChange={(e) => setCourse(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Year of Study</Label><Input value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Duration Preference</Label><Input value={durationPref} onChange={(e) => setDurationPref(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label className="font-heading text-sm">Field of Interest</Label><Input value={fieldOfInterest} onChange={(e) => setFieldOfInterest(e.target.value)} /></div>
            </div>
          )}

          {selectedRole === "campus_ambassador" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-heading text-sm">University Name</Label><Input value={caUniversity} onChange={(e) => setCaUniversity(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Course</Label><Input value={caCourse} onChange={(e) => setCaCourse(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Year of Study</Label><Input value={caYear} onChange={(e) => setCaYear(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Student Org Involvement</Label><Input value={studentOrg} onChange={(e) => setStudentOrg(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label className="font-heading text-sm">Why do you want to represent ANUVATI?</Label><Textarea value={whyRepresent} onChange={(e) => setWhyRepresent(e.target.value)} /></div>
            </div>
          )}

          {selectedRole === "corporate_volunteer" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-heading text-sm">Company Name</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Job Role</Label><Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Interest Area</Label><Input value={corpInterest} onChange={(e) => setCorpInterest(e.target.value)} /></div>
              </div>
            </div>
          )}

          {selectedRole === "partner_organization" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-heading text-sm">Organization Name</Label><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label className="font-heading text-sm">Organization Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {ORG_TYPES.map((t) => (
                      <button key={t} type="button" onClick={() => setOrgType(t)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-heading transition-all ${orgType === t ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><Label className="font-heading text-sm">Website</Label><Input type="url" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-heading text-sm">Partnership Interest Area</Label><Input value={partnerInterest} onChange={(e) => setPartnerInterest(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label className="font-heading text-sm">Organization Description</Label><Textarea value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} /></div>
            </div>
          )}
        </CardContent>
        {/* Resume upload — common for all roles */}
        {selectedRole && (
          <div className="px-6 pb-4 space-y-2">
            <Label className="font-heading text-sm font-semibold">
              Resume / CV <span className="text-muted-foreground font-normal">(optional — PDF, DOC, DOCX, max 5 MB)</span>
            </Label>
            {resumeFile ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <Paperclip size={16} className="text-primary shrink-0" />
                <span className="text-sm font-body text-foreground flex-1 truncate">{resumeFile.name}</span>
                <button type="button" onClick={() => { setResumeFile(null); if (resumeInputRef.current) resumeInputRef.current.value = ""; }}>
                  <X size={16} className="text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => resumeInputRef.current?.click()}
              >
                <Paperclip size={16} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-body text-muted-foreground">Click to attach your resume</span>
              </div>
            )}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 5 * 1024 * 1024) {
                  toast({ title: "File too large", description: "Please upload a file under 5 MB.", variant: "destructive" });
                  return;
                }
                setResumeFile(f ?? null);
              }}
            />
          </div>
        )}

        {selectedRole && (
          <CardFooter>
            <Button onClick={handleSubmit} disabled={loading} className="w-full font-heading font-semibold">
              <Send size={16} /> {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ParticipationForm;
