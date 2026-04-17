import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, CreditCard, Award, Clock, CheckCircle, AlertCircle, Plus, Send, User, MapPin, Phone, Mail, Calendar, Linkedin, Heart } from "lucide-react";
import {
  generateIDCard,
  generateAppointmentLetter,
  generateCertificate,
  generateOfferLetter,
  generateCertificateFromData,
  type OfferLetterData,
  type CertificateWithDetailsData,
} from "@/lib/documentGenerator";

const ROLE_LABELS: Record<string, string> = {
  volunteer: "Volunteer",
  internship: "Intern",
  campus_ambassador: "Campus Ambassador",
  corporate_volunteer: "Corporate Volunteer",
  partner_organization: "Partner Organization",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:               { label: "Under Review",          color: "bg-yellow-100 text-yellow-800 border-yellow-200",  icon: Clock },
  hold:                  { label: "On Hold",                color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
  approved:              { label: "Accepted",               color: "bg-green-100 text-green-800 border-green-200",    icon: CheckCircle },
  certificate_requested: { label: "Certificate Requested",  color: "bg-blue-100 text-blue-800 border-blue-200",       icon: Send },
  completed:             { label: "Completed",              color: "bg-purple-100 text-purple-800 border-purple-200", icon: Award },
  rejected:              { label: "Rejected",               color: "bg-red-100 text-red-800 border-red-200",          icon: AlertCircle },
};

interface Submission {
  id: string;
  role: string;
  status: string;
  submitted_at: string;
  approved_at: string | null;
  completed_at: string | null;
  certificate_requested_at: string | null;
  held_at: string | null;
  hr_notes: string | null;
  offer_letter_data: OfferLetterData | null;
  offer_letter_generated_at: string | null;
  certificate_data: CertificateWithDetailsData | null;
  certificate_generated_at: string | null;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  age: number | null;
  gender: string | null;
  linkedin_url: string | null;
}

interface UserDashboardProps {
  onNewApplication: () => void;
}

const UserDashboard = ({ onNewApplication }: UserDashboardProps) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleDetails, setRoleDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchData();

    // Realtime subscription — auto-refreshes the dashboard whenever a submission
    // row changes for this user. This catches the race condition where SignUpForm
    // inserts a submission a moment after UserDashboard first loads, and also
    // picks up HR status changes (hold / approve / reject / certificate issued)
    // without needing a manual page refresh.
    const channel = supabase
      .channel("user-submissions-watch")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [subRes, profRes] = await Promise.all([
      supabase
        .from("submissions")
        .select("id, role, status, submitted_at, approved_at, completed_at, certificate_requested_at, held_at, hr_notes, offer_letter_data, offer_letter_generated_at, certificate_data, certificate_generated_at")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name, email, phone, city, state, country, age, gender, linkedin_url")
        .eq("user_id", user!.id)
        .single(),
    ]);

    if (subRes.data) {
      setSubmissions(subRes.data as Submission[]);
      // Fetch role-specific details for each submission
      const detailsMap: Record<string, any> = {};
      for (const sub of subRes.data) {
        const table = sub.role === "volunteer" ? "volunteer_details"
          : sub.role === "internship" ? "internship_details"
          : sub.role === "campus_ambassador" ? "campus_ambassador_details"
          : sub.role === "corporate_volunteer" ? "corporate_volunteer_details"
          : "partner_organization_details";
        const { data } = await supabase.from(table).select("*").eq("submission_id", sub.id).maybeSingle();
        if (data) detailsMap[sub.id] = data;
      }
      setRoleDetails(detailsMap);
    }
    if (profRes.data) setProfile(profRes.data);
    setLoading(false);
  };

  const requestCertificate = async (submissionId: string) => {
    const { error } = await supabase
      .from("submissions")
      .update({ status: "certificate_requested", certificate_requested_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (error) {
      toast({ title: "Error", description: "Failed to request certificate.", variant: "destructive" });
    } else {
      toast({ title: "Certificate Requested", description: "Your request has been sent to the admin team." });
      fetchData();
    }
  };

  const handleDownloadIDCard = (sub: Submission) => {
    if (!profile) return;
    generateIDCard({
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone || "",
      role: ROLE_LABELS[sub.role] || sub.role,
      submissionId: sub.id,
      approvedDate: sub.approved_at || "",
      location: [profile.city, profile.state].filter(Boolean).join(", "),
    });
  };

  const handleDownloadAppointmentLetter = (sub: Submission) => {
    if (!profile) return;
    generateAppointmentLetter({
      name: profile.full_name,
      email: profile.email,
      role: ROLE_LABELS[sub.role] || sub.role,
      approvedDate: sub.approved_at || sub.submitted_at,
      submissionId: sub.id,
    });
  };

  const handleDownloadCertificate = (sub: Submission) => {
    if (!profile) return;
    generateCertificate({
      name: profile.full_name,
      role: ROLE_LABELS[sub.role] || sub.role,
      completedDate: sub.completed_at || "",
      submissionId: sub.id,
    });
  };

  // Uses the HR-entered offer letter data stored in the DB — produces the
  // exact same document the HR previewed before confirming.
  const handleDownloadOfferLetter = (sub: Submission) => {
    if (!sub.offer_letter_data) return;
    generateOfferLetter(sub.offer_letter_data);
  };

  // Uses the HR-entered certificate data stored in the DB.
  const handleDownloadCertificateFromHrData = (sub: Submission) => {
    if (!sub.certificate_data) return;
    generateCertificateFromData(sub.certificate_data);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const isPartnerOrg = (role: string) => role === "partner_organization";

  const getRoleSpecificInfo = (sub: Submission) => {
    const details = roleDetails[sub.id];
    if (!details) return [];
    const entries: { label: string; value: string }[] = [];
    if (sub.role === "volunteer") {
      if (details.areas_of_interest?.length) entries.push({ label: "Areas of Interest", value: details.areas_of_interest.join(", ") });
      if (details.availability) entries.push({ label: "Availability", value: details.availability });
      if (details.skills) entries.push({ label: "Skills", value: details.skills });
    } else if (sub.role === "internship") {
      if (details.university) entries.push({ label: "University", value: details.university });
      if (details.course) entries.push({ label: "Course", value: details.course });
      if (details.year_of_study) entries.push({ label: "Year of Study", value: details.year_of_study });
      if (details.duration_preference) entries.push({ label: "Duration", value: details.duration_preference });
      if (details.field_of_interest) entries.push({ label: "Field of Interest", value: details.field_of_interest });
    } else if (sub.role === "campus_ambassador") {
      if (details.university_name) entries.push({ label: "University", value: details.university_name });
      if (details.course) entries.push({ label: "Course", value: details.course });
      if (details.year_of_study) entries.push({ label: "Year of Study", value: details.year_of_study });
    } else if (sub.role === "corporate_volunteer") {
      if (details.company_name) entries.push({ label: "Company", value: details.company_name });
      if (details.job_role) entries.push({ label: "Job Role", value: details.job_role });
      if (details.department) entries.push({ label: "Department", value: details.department });
    } else if (sub.role === "partner_organization") {
      if (details.organization_name) entries.push({ label: "Organization", value: details.organization_name });
      if (details.organization_type) entries.push({ label: "Type", value: details.organization_type });
      if (details.website) entries.push({ label: "Website", value: details.website });
    }
    return entries;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Info Card */}
      {profile && (
        <Card className="border-border shadow-sm bg-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={24} />
              </div>
              <div>
                <CardTitle className="font-heading text-lg">{profile.full_name}</CardTitle>
                <CardDescription className="font-body text-sm">{profile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <Phone size={14} className="text-primary shrink-0" />
                  <span className="truncate">{profile.phone}</span>
                </div>
              )}
              {(profile.city || profile.state || profile.country) && (
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="truncate">{[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {profile.age && (
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <Calendar size={14} className="text-primary shrink-0" />
                  <span>Age: {profile.age}{profile.gender ? ` • ${profile.gender}` : ""}</span>
                </div>
              )}
              {profile.linkedin_url && (
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <Linkedin size={14} className="text-primary shrink-0" />
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">LinkedIn</a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appreciation Message */}
      {profile && submissions.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <Heart size={20} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-heading font-semibold text-foreground">
              Thank you, {profile.full_name.split(" ")[0]}! 🙌
            </p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              We truly appreciate you taking the step to get involved with ANUVATI. Your willingness to contribute means the world to us — every changemaker starts with a single step, and you've already taken yours.
            </p>
          </div>
        </div>
      )}

      {/* Header with New Application button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-foreground">My Applications</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {submissions.length === 0 ? "You haven't submitted any applications yet." : `${submissions.length} application(s) submitted`}
          </p>
        </div>
        <Button onClick={onNewApplication} className="font-heading">
          <Plus size={16} /> New Application
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No Applications Yet</h3>
            <p className="font-body text-muted-foreground mb-6">Get started by submitting your first application.</p>
            <Button onClick={onNewApplication} className="font-heading">
              <Plus size={16} /> Submit Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConf.icon;
            const canDownloadDocs = sub.status === "approved" || sub.status === "certificate_requested" || sub.status === "completed";
            const canRequestCert = sub.status === "approved";
            const canDownloadCert = sub.status === "completed";

            return (
              <Card key={sub.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <CardTitle className="font-heading text-lg">{ROLE_LABELS[sub.role] || sub.role}</CardTitle>
                      <Badge className={`${statusConf.color} border font-heading text-xs`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusConf.label}
                      </Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Applied: {new Date(sub.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {sub.approved_at && (
                    <p className="font-body text-xs text-green-600 mt-1">
                      Approved on {new Date(sub.approved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Role-specific details (non-editable) */}
                  {getRoleSpecificInfo(sub).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                      {getRoleSpecificInfo(sub).map((info) => (
                        <div key={info.label}>
                          <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">{info.label}</p>
                          <p className="font-body text-sm text-foreground truncate">{info.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sub.status === "pending" && (
                    <p className="font-body text-sm text-muted-foreground">
                      Your application is being reviewed by our team. You'll receive updates here once it's processed.
                    </p>
                  )}

                  {sub.status === "hold" && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-1">
                      <p className="font-heading font-semibold text-sm text-orange-800">
                        Your application is currently on hold.
                      </p>
                      {sub.hr_notes ? (
                        <p className="font-body text-sm text-orange-700">
                          Reason: {sub.hr_notes}
                        </p>
                      ) : (
                        <p className="font-body text-sm text-orange-700">
                          Our team will follow up with you shortly. No action is needed from your side right now.
                        </p>
                      )}
                    </div>
                  )}

                  {sub.status === "rejected" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
                      <p className="font-heading font-semibold text-sm text-destructive">
                        Unfortunately, your application was not approved at this time.
                      </p>
                      {sub.hr_notes && (
                        <p className="font-body text-sm text-muted-foreground">
                          Feedback from our team: {sub.hr_notes}
                        </p>
                      )}
                      <p className="font-body text-xs text-muted-foreground">
                        You're welcome to submit a new application in the future.
                      </p>
                    </div>
                  )}

                  {canDownloadDocs && !isPartnerOrg(sub.role) && (
                    <div className="space-y-4">
                      <p className="font-body text-sm text-muted-foreground">
                        Your application has been approved! Download your documents below.
                      </p>

                      {(() => {
                        const showIdCard = sub.role !== "internship";
                        return (
                        <Tabs defaultValue={showIdCard ? "id-card" : "appointment"} className="w-full">
                          <TabsList className={`grid w-full font-heading ${showIdCard ? "grid-cols-3" : "grid-cols-2"}`}>
                            {showIdCard && (
                              <TabsTrigger value="id-card" className="text-xs">
                                <CreditCard size={14} className="mr-1" /> ID Card
                              </TabsTrigger>
                            )}
                            <TabsTrigger value="appointment" className="text-xs">
                              <FileText size={14} className="mr-1" /> Appointment
                            </TabsTrigger>
                            <TabsTrigger value="certificate" className="text-xs">
                              <Award size={14} className="mr-1" /> Certificate
                            </TabsTrigger>
                          </TabsList>

                          {showIdCard && (
                          <TabsContent value="id-card" className="mt-4">
                            <Card className="bg-muted/30 border-border/50">
                              <CardContent className="p-4">
                                <h4 className="font-heading font-semibold text-sm mb-2">Identity Card</h4>
                                <p className="font-body text-xs text-muted-foreground mb-3">
                                  Your official ANUVATI {ROLE_LABELS[sub.role]} identity card with your details.
                                </p>
                                <Button size="sm" onClick={() => handleDownloadIDCard(sub)} className="font-heading text-xs">
                                  <Download size={14} /> Download ID Card
                                </Button>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          )}

                        <TabsContent value="appointment" className="mt-4">
                          <Card className="bg-muted/30 border-border/50">
                            <CardContent className="p-4">
                              {sub.offer_letter_data ? (
                                <>
                                  <h4 className="font-heading font-semibold text-sm mb-2 text-green-700">Offer Letter Ready!</h4>
                                  <p className="font-body text-xs text-muted-foreground mb-3">
                                    Your personalised offer letter from ANUVATI is ready. It includes your role details,
                                    start date, responsibilities, and terms as confirmed by HR.
                                  </p>
                                  <Button size="sm" onClick={() => handleDownloadOfferLetter(sub)} className="font-heading text-xs">
                                    <Download size={14} /> Download Offer Letter
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-heading font-semibold text-sm mb-2">Appointment Letter</h4>
                                  <p className="font-body text-xs text-muted-foreground mb-3">
                                    Official letter confirming your appointment as {ROLE_LABELS[sub.role]} at ANUVATI.
                                  </p>
                                  <Button size="sm" onClick={() => handleDownloadAppointmentLetter(sub)} className="font-heading text-xs">
                                    <Download size={14} /> Download Letter
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="certificate" className="mt-4">
                          <Card className="bg-muted/30 border-border/50">
                            <CardContent className="p-4">
                              {canDownloadCert ? (
                                <>
                                  <h4 className="font-heading font-semibold text-sm mb-2 text-green-700">Certificate Ready!</h4>
                                  <p className="font-body text-xs text-muted-foreground mb-3">
                                    Congratulations on completing your {ROLE_LABELS[sub.role].toLowerCase()} tenure! Download your certificate below.
                                  </p>
                                  <Button size="sm" onClick={() => sub.certificate_data ? handleDownloadCertificateFromHrData(sub) : handleDownloadCertificate(sub)} className="font-heading text-xs">
                                    <Download size={14} /> Download Certificate
                                  </Button>
                                </>
                              ) : sub.status === "certificate_requested" ? (
                                <>
                                  <h4 className="font-heading font-semibold text-sm mb-2 text-blue-700">Certificate Requested</h4>
                                  <p className="font-body text-xs text-muted-foreground">
                                    Your certificate request is being processed by HR. You'll be able to download it once issued.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-heading font-semibold text-sm mb-2">Completion Certificate</h4>
                                  <p className="font-body text-xs text-muted-foreground mb-3">
                                    Once your {ROLE_LABELS[sub.role].toLowerCase()} tenure is complete, request your certificate here.
                                  </p>
                                  <Button size="sm" variant="outline" onClick={() => requestCertificate(sub.id)} className="font-heading text-xs">
                                    <Send size={14} /> Request Certificate
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                        </Tabs>
                        );
                      })()}
                    </div>
                  )}

                  {/* Partner Organization — different interface */}
                  {canDownloadDocs && isPartnerOrg(sub.role) && (
                    <div className="space-y-3">
                      <p className="font-body text-sm text-muted-foreground">
                        Your partnership has been approved! Download your partnership documents below.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleDownloadAppointmentLetter(sub)} className="font-heading text-xs">
                          <Download size={14} /> Partnership Agreement Letter
                        </Button>
                        {canDownloadCert && (
                          <Button size="sm" onClick={() => handleDownloadCertificate(sub)} className="font-heading text-xs">
                            <Download size={14} /> Partnership Certificate
                          </Button>
                        )}
                      </div>
                      {canRequestCert && (
                        <Button size="sm" variant="outline" onClick={() => requestCertificate(sub.id)} className="font-heading text-xs mt-2">
                          <Send size={14} /> Request Partnership Completion Certificate
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
