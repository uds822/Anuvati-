import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, ArrowRight, CheckCircle, Paperclip, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ParticipationRole = Database["public"]["Enums"]["participation_role"];

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

const ROLES: { value: ParticipationRole; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "internship", label: "Internship" },
  { value: "campus_ambassador", label: "Campus Ambassador" },
  { value: "corporate_volunteer", label: "Corporate Volunteer" },
  { value: "partner_organization", label: "Partner Organization" },
];

const VOLUNTEER_AREAS = ["Education", "Health", "Environment", "Digital Literacy", "Community Development", "Other"];
const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Flexible"];
const ORG_TYPES = ["NGO", "CSR Foundation", "University", "Community Organization", "Government Body"];

const SignUpForm = ({ onSwitchToLogin }: SignUpFormProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Basic details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [selectedRole, setSelectedRole] = useState<ParticipationRole | "">("");

  // Volunteer
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");
  const [previousExp, setPreviousExp] = useState("");

  // Internship
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

  // Partner Org
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [partnerInterest, setPartnerInterest] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  // Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const validateStep1 = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in Name, Email, and Password.", variant: "destructive" });
      return false;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return false;
    }
    if (!selectedRole) {
      toast({ title: "Error", description: "Please select how you want to get involved.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError || !authData.user) {
      toast({ title: "Sign Up Failed", description: authError?.message || "Could not create account.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Update profile — full_name must be set explicitly here so HR
    //    can see the applicant's name on the Applications page.
    const { error: profileError } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      country: country.trim() || null,
      age: age ? parseInt(age) : null,
      gender: gender.trim() || null,
      linkedin_url: linkedin.trim() || null,
    }).eq("user_id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // 3. Create submission
    const { data: submissionData, error: subError } = await supabase.from("submissions").insert({
      user_id: userId,
      role: selectedRole as ParticipationRole,
    }).select("id").single();

    if (subError || !submissionData) {
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const submissionId = submissionData.id;

    // 4. Insert role-specific details
    let detailError = null;
    if (selectedRole === "volunteer") {
      const { error } = await supabase.from("volunteer_details").insert({
        submission_id: submissionId,
        areas_of_interest: areasOfInterest,
        availability,
        skills: skills.trim() || null,
        previous_experience: previousExp.trim() || null,
      });
      detailError = error;
    } else if (selectedRole === "internship") {
      const { error } = await supabase.from("internship_details").insert({
        submission_id: submissionId,
        university: university.trim() || null,
        course: course.trim() || null,
        year_of_study: yearOfStudy.trim() || null,
        duration_preference: durationPref.trim() || null,
        field_of_interest: fieldOfInterest.trim() || null,
      });
      detailError = error;
    } else if (selectedRole === "campus_ambassador") {
      const { error } = await supabase.from("campus_ambassador_details").insert({
        submission_id: submissionId,
        university_name: caUniversity.trim() || null,
        course: caCourse.trim() || null,
        year_of_study: caYear.trim() || null,
        student_org_involvement: studentOrg.trim() || null,
        why_represent: whyRepresent.trim() || null,
      });
      detailError = error;
    } else if (selectedRole === "corporate_volunteer") {
      const { error } = await supabase.from("corporate_volunteer_details").insert({
        submission_id: submissionId,
        company_name: companyName.trim() || null,
        job_role: jobRole.trim() || null,
        department: department.trim() || null,
        interest_area: corpInterest.trim() || null,
      });
      detailError = error;
    } else if (selectedRole === "partner_organization") {
      const { error } = await supabase.from("partner_organization_details").insert({
        submission_id: submissionId,
        organization_name: orgName.trim() || null,
        organization_type: orgType || null,
        website: orgWebsite.trim() || null,
        partnership_interest: partnerInterest.trim() || null,
        organization_description: orgDescription.trim() || null,
      });
      detailError = error;
    }

    if (detailError) {
      console.error("Detail insert error:", detailError);
    }

    // 5. Upload resume if provided
    if (resumeFile) {
      const ext = resumeFile.name.split(".").pop();
      const path = `${userId}/${submissionId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, { upsert: true });
      if (!uploadError) {
        await supabase.from("submissions").update({ resume_url: path }).eq("id", submissionId);
      }
    }

    setLoading(false);
    setSubmitted(true);
    toast({ title: "Application Submitted!", description: "Thank you for your interest in ANUVATI." });
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border shadow-lg">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">Application Submitted!</h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto mb-6">
            Thank you for your interest in joining ANUVATI. Our team will review your submission and contact you shortly.
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Please check your email to verify your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-border shadow-lg">
      <CardHeader className="text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="text-primary" size={28} />
        </div>
        <CardTitle className="font-heading text-2xl text-foreground">Join ANUVATI</CardTitle>
        <CardDescription className="font-body text-muted-foreground">
          Step {step} of 2 — {step === 1 ? "Your Details & Role" : "Role-Specific Information"}
        </CardDescription>
        <div className="flex gap-2 justify-center mt-3">
          <div className={`h-1.5 w-20 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-1.5 w-20 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading text-sm">Full Name *</Label>
                <Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Email Address *</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Password *</Label>
                <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Phone Number</Label>
                <Input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">City</Label>
                <Input placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">State</Label>
                <Input placeholder="Maharashtra" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Country</Label>
                <Input placeholder="India" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Age</Label>
                <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} min="13" max="100" />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Gender (optional)</Label>
                <Input placeholder="e.g., Male, Female, Non-binary" value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">LinkedIn Profile (optional)</Label>
                <Input placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="font-heading text-sm font-semibold">How do you want to get involved? *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-3 rounded-lg border text-left text-sm font-heading font-medium transition-all ${
                      selectedRole === r.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && selectedRole === "volunteer" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="font-heading text-sm font-semibold">Areas of Interest</Label>
              <div className="grid grid-cols-2 gap-2">
                {VOLUNTEER_AREAS.map((area) => (
                  <label key={area} className="flex items-center gap-2 text-sm font-body">
                    <Checkbox
                      checked={areasOfInterest.includes(area)}
                      onCheckedChange={(checked) => {
                        setAreasOfInterest(checked ? [...areasOfInterest, area] : areasOfInterest.filter((a) => a !== area));
                      }}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Availability</Label>
              <div className="flex gap-2 flex-wrap">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvailability(opt)}
                    className={`px-4 py-2 rounded-lg border text-sm font-heading transition-all ${
                      availability === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Skills</Label>
              <Textarea placeholder="Describe your skills..." value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Previous Volunteer Experience</Label>
              <Textarea placeholder="Describe any previous experience..." value={previousExp} onChange={(e) => setPreviousExp(e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && selectedRole === "internship" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading text-sm">University / Institution</Label>
                <Input placeholder="e.g., Delhi University" value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Course / Degree</Label>
                <Input placeholder="e.g., B.A. Social Work" value={course} onChange={(e) => setCourse(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Year of Study</Label>
                <Input placeholder="e.g., 3rd Year" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Internship Duration Preference</Label>
                <Input placeholder="e.g., 3 months" value={durationPref} onChange={(e) => setDurationPref(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Field of Interest</Label>
              <Input placeholder="e.g., Public Health, Education Policy" value={fieldOfInterest} onChange={(e) => setFieldOfInterest(e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && selectedRole === "campus_ambassador" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading text-sm">University Name</Label>
                <Input value={caUniversity} onChange={(e) => setCaUniversity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Course</Label>
                <Input value={caCourse} onChange={(e) => setCaCourse(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Year of Study</Label>
                <Input value={caYear} onChange={(e) => setCaYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Student Organization Involvement</Label>
                <Input value={studentOrg} onChange={(e) => setStudentOrg(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Why do you want to represent ANUVATI?</Label>
              <Textarea value={whyRepresent} onChange={(e) => setWhyRepresent(e.target.value)} placeholder="Tell us your motivation..." />
            </div>
          </div>
        )}

        {step === 2 && selectedRole === "corporate_volunteer" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading text-sm">Company Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Job Role</Label>
                <Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Corporate Volunteering Interest Area</Label>
                <Input value={corpInterest} onChange={(e) => setCorpInterest(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Resume upload — shown in step 2 for all roles */}
        {step === 2 && (
          <div className="pt-4 border-t border-border space-y-2">
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

        {step === 2 && selectedRole === "partner_organization" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-heading text-sm">Organization Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Organization Type</Label>
                <div className="flex flex-wrap gap-2">
                  {ORG_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrgType(t)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-heading transition-all ${
                        orgType === t ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Website</Label>
                <Input type="url" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label className="font-heading text-sm">Partnership Interest Area</Label>
                <Input value={partnerInterest} onChange={(e) => setPartnerInterest(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm">Organization Description</Label>
              <Textarea value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} placeholder="Describe your organization..." />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex gap-3 w-full">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 font-heading">
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          {step === 1 && (
            <Button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="flex-1 font-heading font-semibold"
            >
              Next <ArrowRight size={16} />
            </Button>
          )}
          {step === 2 && (
            <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 font-heading font-semibold">
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
        {step === 1 && (
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline font-semibold">
              Login
            </button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
