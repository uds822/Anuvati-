import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock, CheckCircle, AlertCircle, PauseCircle, Search, Eye,
  FileText, Award, User, Mail, Phone, MapPin, Calendar, Send,
  RefreshCw, Paperclip,
} from "lucide-react";
import {
  generateOfferLetterHTML,
  generateCertificateWithDetailsHTML,
  type OfferLetterData,
  type CertificateWithDetailsData,
} from "@/lib/documentGenerator";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  volunteer: "Volunteer",
  internship: "Intern",
  campus_ambassador: "Campus Ambassador",
  corporate_volunteer: "Corporate Volunteer",
  partner_organization: "Partner Organization",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:               { label: "Pending Review",       color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  hold:                  { label: "On Hold",               color: "bg-orange-100 text-orange-800 border-orange-200", icon: PauseCircle },
  approved:              { label: "Accepted",              color: "bg-green-100 text-green-800 border-green-200",  icon: CheckCircle },
  certificate_requested: { label: "Certificate Requested", color: "bg-blue-100 text-blue-800 border-blue-200",     icon: Send },
  completed:             { label: "Completed",             color: "bg-purple-100 text-purple-800 border-purple-200", icon: Award },
  rejected:              { label: "Rejected",              color: "bg-red-100 text-red-800 border-red-200",        icon: AlertCircle },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubmissionRow {
  id: string;
  user_id: string;
  role: string;
  status: string;
  submitted_at: string;
  approved_at: string | null;
  completed_at: string | null;
  certificate_requested_at: string | null;
  held_at: string | null;
  rejected_at: string | null;
  hr_notes: string | null;
  offer_letter_data: any | null;
  offer_letter_generated_at: string | null;
  certificate_data: any | null;
  certificate_generated_at: string | null;
  resume_url: string | null;
}

interface ProfileRow {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
}

interface EnrichedSubmission extends SubmissionRow {
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  roleDetails: Record<string, any> | null;
}

// ─── Initial form states ──────────────────────────────────────────────────────

const emptyOfferForm = {
  startDate: "",
  endDate: "",
  stipend: "Unpaid / Voluntary",
  reportingManager: "",
  department: "",
  responsibilities: "",
  additionalNotes: "",
};

const emptyCertForm = {
  startDate: "",
  endDate: "",
  achievements: "",
  specialRecognition: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRoleTable = (role: string) => {
  const map: Record<string, string> = {
    volunteer: "volunteer_details",
    internship: "internship_details",
    campus_ambassador: "campus_ambassador_details",
    corporate_volunteer: "corporate_volunteer_details",
    partner_organization: "partner_organization_details",
  };
  return map[role] ?? null;
};

const getRoleDetailEntries = (role: string, details: Record<string, any>) => {
  const entries: { label: string; value: string }[] = [];
  if (role === "volunteer") {
    if (details.areas_of_interest?.length) entries.push({ label: "Areas", value: details.areas_of_interest.join(", ") });
    if (details.availability) entries.push({ label: "Availability", value: details.availability });
    if (details.skills) entries.push({ label: "Skills", value: details.skills });
  } else if (role === "internship") {
    if (details.university) entries.push({ label: "University", value: details.university });
    if (details.course) entries.push({ label: "Course", value: details.course });
    if (details.year_of_study) entries.push({ label: "Year", value: details.year_of_study });
    if (details.field_of_interest) entries.push({ label: "Field", value: details.field_of_interest });
  } else if (role === "campus_ambassador") {
    if (details.university_name) entries.push({ label: "University", value: details.university_name });
    if (details.course) entries.push({ label: "Course", value: details.course });
  } else if (role === "corporate_volunteer") {
    if (details.company_name) entries.push({ label: "Company", value: details.company_name });
    if (details.job_role) entries.push({ label: "Job Role", value: details.job_role });
    if (details.department) entries.push({ label: "Dept", value: details.department });
  } else if (role === "partner_organization") {
    if (details.organization_name) entries.push({ label: "Org Name", value: details.organization_name });
    if (details.organization_type) entries.push({ label: "Type", value: details.organization_type });
    if (details.website) entries.push({ label: "Website", value: details.website });
  }
  return entries;
};

// ─── Email helper (calls Supabase Edge Function) ──────────────────────────────

const sendNotificationEmail = async (params: {
  to: string; name: string; role: string;
  action: "hold" | "rejected" | "approved" | "certificate_issued";
  hrNotes?: string;
}) => {
  try {
    await supabase.functions.invoke("send-application-email", { body: params });
  } catch {
    // Edge function may not be deployed yet — workflow still completes
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HrApplications = () => {
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [roleFilter, setRoleFilter] = useState("all");

  // Hold / Reject dialog state
  const [holdTarget, setHoldTarget] = useState<EnrichedSubmission | null>(null);
  const [rejectTarget, setRejectTarget] = useState<EnrichedSubmission | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Offer Letter dialog state
  const [offerTarget, setOfferTarget] = useState<EnrichedSubmission | null>(null);
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [offerPreviewHtml, setOfferPreviewHtml] = useState<string | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);

  // Certificate dialog state
  const [certTarget, setCertTarget] = useState<EnrichedSubmission | null>(null);
  const [certForm, setCertForm] = useState(emptyCertForm);
  const [certPreviewHtml, setCertPreviewHtml] = useState<string | null>(null);
  const [certLoading, setCertLoading] = useState(false);

  // ── View Resume (generates a 1-hour signed URL then opens it) ─────────────

  const viewResume = async (resumePath: string) => {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resumePath, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Could not load resume. Check storage permissions.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch all submissions (HR sees everyone's)
    const { data: subs, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (subError || !subs) {
      toast.error("Failed to load applications");
      setLoading(false);
      return;
    }

    // 2. Collect unique user_ids then fetch their profiles
    const userIds = [...new Set(subs.map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, phone, city, state")
      .in("user_id", userIds);

    const profileMap: Record<string, ProfileRow> = {};
    (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });

    // 3. For each submission fetch role-specific details
    const enriched: EnrichedSubmission[] = [];
    for (const sub of subs) {
      const table = getRoleTable(sub.role);
      let roleDetails: Record<string, any> | null = null;
      if (table) {
        const { data } = await supabase.from(table as any).select("*").eq("submission_id", sub.id).maybeSingle();
        roleDetails = data ?? null;
      }
      const profile = profileMap[sub.user_id];
      enriched.push({
        ...sub,
        full_name: profile?.full_name ?? "Unknown",
        email: profile?.email ?? "",
        phone: profile?.phone ?? null,
        city: profile?.city ?? null,
        state: profile?.state ?? null,
        roleDetails,
      });
    }

    setSubmissions(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = submissions.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    return matchStatus && matchRole && matchSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  // ── Hold Action ────────────────────────────────────────────────────────────

  const confirmHold = async () => {
    if (!holdTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status: "hold", hr_notes: actionNotes || null, held_at: new Date().toISOString() })
      .eq("id", holdTarget.id);

    if (error) { toast.error("Failed to place on hold"); }
    else {
      toast.success(`${holdTarget.full_name}'s application placed on hold`);
      await sendNotificationEmail({ to: holdTarget.email, name: holdTarget.full_name, role: ROLE_LABELS[holdTarget.role], action: "hold", hrNotes: actionNotes });
      setHoldTarget(null);
      setActionNotes("");
      fetchData();
    }
    setActionLoading(false);
  };

  // ── Reject Action ──────────────────────────────────────────────────────────

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status: "rejected", hr_notes: actionNotes || null, rejected_at: new Date().toISOString() })
      .eq("id", rejectTarget.id);

    if (error) { toast.error("Failed to reject application"); }
    else {
      toast.success(`${rejectTarget.full_name}'s application rejected`);
      await sendNotificationEmail({ to: rejectTarget.email, name: rejectTarget.full_name, role: ROLE_LABELS[rejectTarget.role], action: "rejected", hrNotes: actionNotes });
      setRejectTarget(null);
      setActionNotes("");
      fetchData();
    }
    setActionLoading(false);
  };

  // ── Offer Letter: Preview ──────────────────────────────────────────────────

  const previewOfferLetter = () => {
    if (!offerTarget) return;
    const data: OfferLetterData = {
      name: offerTarget.full_name,
      email: offerTarget.email,
      role: ROLE_LABELS[offerTarget.role] || offerTarget.role,
      submissionId: offerTarget.id,
      issuedDate: new Date().toISOString(),
      ...offerForm,
    };
    setOfferPreviewHtml(generateOfferLetterHTML(data));
  };

  // ── Offer Letter: Confirm & Issue ──────────────────────────────────────────

  const confirmOfferLetter = async () => {
    if (!offerTarget) return;
    setOfferLoading(true);
    const now = new Date().toISOString();

    // Persist the offer letter data so the user can re-generate the PDF later
    const offerData: OfferLetterData = {
      name: offerTarget.full_name,
      email: offerTarget.email,
      role: ROLE_LABELS[offerTarget.role] || offerTarget.role,
      submissionId: offerTarget.id,
      issuedDate: now,
      ...offerForm,
    };

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        approved_at: now,
        offer_letter_data: offerData as any,
        offer_letter_generated_at: now,
      })
      .eq("id", offerTarget.id);

    if (error) { toast.error("Failed to issue offer letter"); }
    else {
      toast.success(`Offer letter issued to ${offerTarget.full_name}!`);
      await sendNotificationEmail({ to: offerTarget.email, name: offerTarget.full_name, role: ROLE_LABELS[offerTarget.role], action: "approved" });
      setOfferTarget(null);
      setOfferForm(emptyOfferForm);
      setOfferPreviewHtml(null);
      fetchData();
    }
    setOfferLoading(false);
  };

  // ── Certificate: Preview ───────────────────────────────────────────────────

  const previewCertificate = () => {
    if (!certTarget) return;
    const data: CertificateWithDetailsData = {
      name: certTarget.full_name,
      role: ROLE_LABELS[certTarget.role] || certTarget.role,
      submissionId: certTarget.id,
      issuedDate: new Date().toISOString(),
      ...certForm,
    };
    setCertPreviewHtml(generateCertificateWithDetailsHTML(data));
  };

  // ── Certificate: Confirm & Issue ───────────────────────────────────────────

  const confirmCertificate = async () => {
    if (!certTarget) return;
    setCertLoading(true);
    const now = new Date().toISOString();

    const certData: CertificateWithDetailsData = {
      name: certTarget.full_name,
      role: ROLE_LABELS[certTarget.role] || certTarget.role,
      submissionId: certTarget.id,
      issuedDate: now,
      ...certForm,
    };

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "completed",
        completed_at: now,
        certificate_data: certData as any,
        certificate_generated_at: now,
      })
      .eq("id", certTarget.id);

    if (error) { toast.error("Failed to issue certificate"); }
    else {
      toast.success(`Certificate issued to ${certTarget.full_name}!`);
      await sendNotificationEmail({ to: certTarget.email, name: certTarget.full_name, role: ROLE_LABELS[certTarget.role], action: "certificate_issued" });
      setCertTarget(null);
      setCertForm(emptyCertForm);
      setCertPreviewHtml(null);
      fetchData();
    }
    setCertLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage public applications — volunteer, intern, campus ambassador, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium">
              {pendingCount} pending review
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="hold">On Hold</SelectItem>
            <SelectItem value="approved">Accepted</SelectItem>
            <SelectItem value="certificate_requested">Certificate Requested</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Application list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No applications match the current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => {
            const conf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const StatusIcon = conf.icon;
            const detailEntries = sub.roleDetails ? getRoleDetailEntries(sub.role, sub.roleDetails) : [];

            return (
              <Card key={sub.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {sub.full_name && sub.full_name !== "Unknown"
                            ? sub.full_name
                            : sub.email || "Unknown Applicant"}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ROLE_LABELS[sub.role] || sub.role}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${conf.color} border text-xs font-medium shrink-0`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {conf.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact info row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />{sub.email}
                    </span>
                    {sub.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />{sub.phone}
                      </span>
                    )}
                    {(sub.city || sub.state) && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {[sub.city, sub.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Applied {new Date(sub.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Role-specific details */}
                  {detailEntries.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                      {detailEntries.map((e) => (
                        <div key={e.label}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{e.label}</p>
                          <p className="text-xs text-foreground truncate">{e.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HR notes (shown for hold/rejected) */}
                  {sub.hr_notes && (sub.status === "hold" || sub.status === "rejected") && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-orange-300 pl-3">
                      HR Note: {sub.hr_notes}
                    </p>
                  )}

                  {/* Offer letter / certificate issued info */}
                  {sub.offer_letter_generated_at && (
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Offer letter issued on {new Date(sub.offer_letter_generated_at).toLocaleDateString("en-IN")}
                    </p>
                  )}
                  {sub.certificate_generated_at && (
                    <p className="text-xs text-purple-700 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Certificate issued on {new Date(sub.certificate_generated_at).toLocaleDateString("en-IN")}
                    </p>
                  )}

                  {/* Resume link */}
                  {sub.resume_url && (
                    <button
                      onClick={() => viewResume(sub.resume_url!)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Paperclip className="h-3 w-3" /> View Resume
                    </button>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Actions for pending / hold submissions */}
                    {(sub.status === "pending" || sub.status === "hold") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-700 border-orange-200 hover:bg-orange-50 text-xs"
                          onClick={() => { setHoldTarget(sub); setActionNotes(sub.hr_notes ?? ""); }}
                        >
                          <PauseCircle className="h-3.5 w-3.5 mr-1" />
                          {sub.status === "hold" ? "Update Hold" : "Place on Hold"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
                          onClick={() => { setRejectTarget(sub); setActionNotes(""); }}
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-700 hover:bg-green-800 text-white text-xs"
                          onClick={() => {
                            setOfferTarget(sub);
                            setOfferForm(emptyOfferForm);
                            setOfferPreviewHtml(null);
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept & Issue Offer Letter
                        </Button>
                      </>
                    )}

                    {/* Certificate requested — HR issues certificate */}
                    {sub.status === "certificate_requested" && (
                      <Button
                        size="sm"
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs"
                        onClick={() => {
                          setCertTarget(sub);
                          setCertForm(emptyCertForm);
                          setCertPreviewHtml(null);
                        }}
                      >
                        <Award className="h-3.5 w-3.5 mr-1" /> Issue Certificate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Hold Dialog ─────────────────────────────────────────────────────── */}
      <AlertDialog open={!!holdTarget} onOpenChange={(o) => !o && setHoldTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Place Application On Hold</AlertDialogTitle>
            <AlertDialogDescription>
              {holdTarget?.full_name}'s <strong>{ROLE_LABELS[holdTarget?.role ?? ""]}</strong> application will be
              moved to "On Hold". They will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-sm font-medium">Reason / Note for Applicant (optional)</Label>
            <Textarea
              placeholder="e.g. We need more information before proceeding…"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setHoldTarget(null); setActionNotes(""); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmHold}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? "Saving…" : "Confirm — Place On Hold"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject Dialog ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget?.full_name}'s <strong>{ROLE_LABELS[rejectTarget?.role ?? ""]}</strong> application will be
              rejected. This action can be reviewed by applying again. They will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-sm font-medium">Reason for Rejection (optional)</Label>
            <Textarea
              placeholder="e.g. Applications are full for this cycle…"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setRejectTarget(null); setActionNotes(""); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? "Saving…" : "Confirm Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Offer Letter Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!offerTarget} onOpenChange={(o) => { if (!o) { setOfferTarget(null); setOfferPreviewHtml(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              Issue Offer Letter — {offerTarget?.full_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Fill Details</TabsTrigger>
              <TabsTrigger value="preview" disabled={!offerPreviewHtml}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Preview
              </TabsTrigger>
            </TabsList>

            {/* Form tab */}
            <TabsContent value="form" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Applicant Name</Label>
                  <Input value={offerTarget?.full_name ?? ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Input value={ROLE_LABELS[offerTarget?.role ?? ""] ?? ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Date (leave blank for open-ended)</Label>
                  <Input
                    type="date"
                    value={offerForm.endDate}
                    onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Stipend / Honorarium</Label>
                  <Input
                    placeholder='e.g. "Unpaid / Voluntary" or "₹5,000/month"'
                    value={offerForm.stipend}
                    onChange={(e) => setOfferForm({ ...offerForm, stipend: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Reporting Manager *</Label>
                  <Input
                    placeholder="e.g. Priya Sharma"
                    value={offerForm.reportingManager}
                    onChange={(e) => setOfferForm({ ...offerForm, reportingManager: e.target.value })}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Department / Team *</Label>
                  <Input
                    placeholder="e.g. Education & Community Outreach"
                    value={offerForm.department}
                    onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Key Responsibilities *</Label>
                <Textarea
                  placeholder="Describe the main duties and responsibilities…"
                  rows={4}
                  value={offerForm.responsibilities}
                  onChange={(e) => setOfferForm({ ...offerForm, responsibilities: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Additional Terms / Notes (optional)</Label>
                <Textarea
                  placeholder="Any additional conditions, expectations, or notes…"
                  rows={2}
                  value={offerForm.additionalNotes}
                  onChange={(e) => setOfferForm({ ...offerForm, additionalNotes: e.target.value })}
                />
              </div>
            </TabsContent>

            {/* Preview tab */}
            <TabsContent value="preview" className="pt-4">
              {offerPreviewHtml && (
                <iframe
                  srcDoc={offerPreviewHtml}
                  className="w-full rounded border"
                  style={{ height: "560px" }}
                  title="Offer Letter Preview"
                />
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              onClick={previewOfferLetter}
              disabled={!offerForm.startDate || !offerForm.reportingManager || !offerForm.department || !offerForm.responsibilities}
            >
              <Eye className="h-4 w-4 mr-1" /> Generate Preview
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={confirmOfferLetter}
              disabled={!offerPreviewHtml || offerLoading}
            >
              <Send className="h-4 w-4 mr-1" />
              {offerLoading ? "Issuing…" : "Confirm & Issue Offer Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Certificate Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!certTarget} onOpenChange={(o) => { if (!o) { setCertTarget(null); setCertPreviewHtml(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-700" />
              Issue Certificate — {certTarget?.full_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Fill Details</TabsTrigger>
              <TabsTrigger value="preview" disabled={!certPreviewHtml}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Preview
              </TabsTrigger>
            </TabsList>

            {/* Form tab */}
            <TabsContent value="form" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Applicant Name</Label>
                  <Input value={certTarget?.full_name ?? ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Input value={ROLE_LABELS[certTarget?.role ?? ""] ?? ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label>Service Start Date *</Label>
                  <Input
                    type="date"
                    value={certForm.startDate}
                    onChange={(e) => setCertForm({ ...certForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Service End Date *</Label>
                  <Input
                    type="date"
                    value={certForm.endDate}
                    onChange={(e) => setCertForm({ ...certForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Key Achievements / Contributions *</Label>
                <Textarea
                  placeholder="Describe what the person accomplished during their tenure…"
                  rows={4}
                  value={certForm.achievements}
                  onChange={(e) => setCertForm({ ...certForm, achievements: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Special Recognition (optional)</Label>
                <Input
                  placeholder='e.g. "Outstanding Dedication to Community Service"'
                  value={certForm.specialRecognition}
                  onChange={(e) => setCertForm({ ...certForm, specialRecognition: e.target.value })}
                />
              </div>
            </TabsContent>

            {/* Preview tab */}
            <TabsContent value="preview" className="pt-4">
              {certPreviewHtml && (
                <iframe
                  srcDoc={certPreviewHtml}
                  className="w-full rounded border"
                  style={{ height: "560px" }}
                  title="Certificate Preview"
                />
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              onClick={previewCertificate}
              disabled={!certForm.startDate || !certForm.endDate || !certForm.achievements}
            >
              <Eye className="h-4 w-4 mr-1" /> Generate Preview
            </Button>
            <Button
              className="bg-purple-700 hover:bg-purple-800 text-white"
              onClick={confirmCertificate}
              disabled={!certPreviewHtml || certLoading}
            >
              <Send className="h-4 w-4 mr-1" />
              {certLoading ? "Issuing…" : "Confirm & Issue Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrApplications;
