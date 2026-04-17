import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/get-involved/LoginForm";
import SignUpForm from "@/components/get-involved/SignUpForm";
import ForgotPasswordForm from "@/components/get-involved/ForgotPasswordForm";
import ParticipationForm from "@/components/get-involved/ParticipationForm";
import UserDashboard from "@/components/get-involved/UserDashboard";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Users, GraduationCap, Building2, Handshake, ClipboardCheck, ArrowRight, Briefcase, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AuthView = "login" | "signup" | "forgot";

const opportunities = [
  { icon: Users, title: "Volunteer", description: "ID Card • Appointment Letter • Completion Certificate after tenure." },
  { icon: GraduationCap, title: "Internship", description: "Intern ID • Internship Appointment Letter • Internship Completion Certificate." },
  { icon: ClipboardCheck, title: "Campus Ambassador", description: "Ambassador ID • Appointment Letter • Ambassador Completion Certificate." },
  { icon: Building2, title: "Corporate Volunteer", description: "Corporate Volunteer ID • Appointment Letter • Completion Certificate." },
  { icon: Handshake, title: "Partner Organization", description: "Partnership Agreement Letter • Partnership Completion Certificate." },
];

const steps = [
  { step: "1", title: "Create Your Account", description: "Sign up with your email to get started in under a minute." },
  { step: "2", title: "Choose Your Role", description: "Select from Volunteer, Intern, Campus Ambassador, Corporate Volunteer, or Partner Organization." },
  { step: "3", title: "Submit Your Application", description: "Fill in role-specific details and submit. Our team reviews every application." },
  { step: "4", title: "Get Approved & Download Documents", description: "Once approved, download your official ID Card, Appointment Letter, and start your journey with ANUVATI." },
  { step: "5", title: "Complete & Get Certified", description: "After completing your tenure, request your Completion Certificate directly from your dashboard." },
];

const GetInvolved = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [isHRUser, setIsHRUser] = useState(false);
  const [hrRoleLoading, setHrRoleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("hr_job_postings")
        .select("id, title, location, employment_type, experience_required, closing_date, description, salary_range")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setJobPostings(data || []);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (user) {
      setHrRoleLoading(true);
      supabase.rpc("has_any_hr_role", { _user_id: user.id }).then(({ data }) => {
        setIsHRUser(!!data);
        setHrRoleLoading(false);
      });
    } else {
      setIsHRUser(false);
      setHrRoleLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-72 mx-auto" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Join Us</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Get Involved</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl">
            {user
              ? "Submit a new application to join our programs."
              : "Join a growing community of changemakers. Sign up to apply for volunteer, internship, ambassador, and partnership opportunities with ANUVATI."}
          </p>
          {user && (
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-muted-foreground font-body">
                Signed in as <strong className="text-foreground">{user.email}</strong>
              </span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="font-heading text-xs">
                  <Shield size={14} /> Admin Dashboard
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="font-heading text-xs text-destructive hover:text-destructive">
                <LogOut size={14} /> Sign Out
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container">
          {!user ? (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Why Join + What Happens */}
              <div className="space-y-10">
                {/* Why Sign Up */}
                <div>
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-3">Why Create an Account?</h2>
                  <p className="font-body text-muted-foreground mb-6">
                    Your ANUVATI account is your gateway to meaningful engagement. Once you sign up, you'll be able to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Apply for any of our five participation roles",
                      "Track your application status in real time",
                      "Download your official ID Card & Appointment Letter once approved",
                      "Request and download your Completion Certificate after your tenure",
                      "Access exclusive resources and event invitations",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 font-body text-foreground">
                        <ArrowRight size={16} className="text-primary mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How It Works */}
                <div>
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-5">How It Works</h2>
                  <div className="space-y-4">
                    {steps.map((s) => (
                      <div key={s.step} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm shrink-0">
                          {s.step}
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-foreground">{s.title}</p>
                          <p className="font-body text-sm text-muted-foreground">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Roles Preview */}
                <div>
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-5">What You Get After Approval</h2>
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.title} className="flex gap-4 items-start p-3 rounded-lg border border-border/50 bg-muted/30">
                        <opp.icon size={20} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-heading font-semibold text-sm text-foreground">{opp.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{opp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Auth Form */}
              <div className="lg:sticky lg:top-28">
                {authView === "login" && (
                  <LoginForm onSwitchToSignUp={() => setAuthView("signup")} onForgotPassword={() => setAuthView("forgot")} />
                )}
                {authView === "signup" && <SignUpForm onSwitchToLogin={() => setAuthView("login")} />}
                {authView === "forgot" && <ForgotPasswordForm onBack={() => setAuthView("login")} />}
              </div>
            </div>
          ) : hrRoleLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-pulse space-y-4 w-full max-w-4xl">
                <div className="h-8 bg-muted rounded w-48" />
                <div className="h-40 bg-muted rounded" />
              </div>
            </div>
          ) : isHRUser ? (
            <div className="max-w-lg mx-auto text-center py-16 space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-2">HR Portal Access</h2>
                <p className="font-body text-muted-foreground">
                  Your account has HR staff access. Applications from the public are managed through the HR portal — you cannot submit applications from this page.
                </p>
              </div>
              <Button onClick={() => navigate("/hr")} className="font-heading">
                <ArrowRight size={16} /> Go to HR Dashboard
              </Button>
            </div>
          ) : showNewApplication ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setShowNewApplication(false)} className="font-heading text-xs">
                <ArrowRight size={14} className="rotate-180" /> Back to Dashboard
              </Button>
              <ParticipationForm onSubmitted={() => setShowNewApplication(false)} />
            </div>
          ) : (
            <UserDashboard onNewApplication={() => setShowNewApplication(true)} />
          )}
        </div>
      </section>

      {/* Current Openings from HR Job Postings */}
      {jobPostings.length > 0 && (
        <section className="py-16 bg-section-light">
          <div className="container">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-2">Careers</p>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-2">Current Openings</h2>
            <p className="font-body text-muted-foreground mb-8 max-w-2xl">
              Explore open positions at ANUVATI. Join our team and make a lasting impact.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {jobPostings.slice(0, 4).map((job) => (
                <div key={job.id} className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-primary shrink-0" />
                      <h3 className="font-heading font-semibold text-foreground">{job.title}</h3>
                    </div>
                    {job.employment_type && (
                      <span className="text-[10px] font-heading font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                        {job.employment_type.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="font-body text-muted-foreground text-sm mb-3 line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    )}
                    {job.experience_required && (
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience_required}</span>
                    )}
                    {job.salary_range && (
                      <span className="flex items-center gap-1">₹ {job.salary_range}</span>
                    )}
                    {job.closing_date && (
                      <span className="flex items-center gap-1"><Clock size={12} /> Apply by {new Date(job.closing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate("/careers")} className="font-heading font-semibold gap-2">
                View All Openings & Apply <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default GetInvolved;
