import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Download, Search, Users, GraduationCap, Award, Building, Handshake, Eye, X, ArrowLeft, CheckCircle, XCircle, FileCheck, Bot, MessageSquare, Loader2 } from "lucide-react";
import { approveApplication } from "@/lib/api";

type RoleFilter = "all" | "volunteer" | "internship" | "campus_ambassador" | "corporate_volunteer" | "partner_organization";

const ROLE_LABELS: Record<string, { label: string; icon: any }> = {
  volunteer: { label: "Volunteer", icon: Users },
  internship: { label: "Intern", icon: GraduationCap },
  campus_ambassador: { label: "Campus Ambassador", icon: Award },
  corporate_volunteer: { label: "Corporate", icon: Building },
  partner_organization: { label: "Partner Org", icon: Handshake },
};

interface SubmissionRow {
  id: string;
  role: string;
  status: string;
  submitted_at: string;
  user_id: string;
  profiles?: { full_name: string; email: string; phone: string | null; city: string | null; state: string | null; country: string | null; age: number | null; gender: string | null; linkedin_url: string | null } | null;
}

interface AiProfile {
  id: string;
  display_name: string | null;
  anonymous_id: string | null;
  user_id: string | null;
  location: string | null;
  age_group: string | null;
  interests: string[] | null;
  concerns: string[] | null;
  ai_summary: string | null;
  last_active_at: string | null;
  created_at: string;
}

interface AiConversation {
  id: string;
  messages: any[];
  topic: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // AI Profiles state
  const [aiProfiles, setAiProfiles] = useState<AiProfile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AiProfile | null>(null);
  const [profileConvos, setProfileConvos] = useState<AiConversation[]>([]);
  const [aiSearch, setAiSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/get-involved");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchSubmissions();
  }, [user, isAdmin]);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("id, role, status, submitted_at, user_id, profiles!inner(full_name, email, phone, city, state, country, age, gender, linkedin_url)")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load submissions.", variant: "destructive" });
    } else {
      setSubmissions((data as any) || []);
    }
    setLoading(false);
  };

  const fetchAiProfiles = async () => {
    setAiLoading(true);
    const { data, error } = await supabase
      .from("ai_chat_profiles")
      .select("*")
      .order("last_active_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load AI profiles.", variant: "destructive" });
    } else {
      setAiProfiles((data as any) || []);
    }
    setAiLoading(false);
  };

  const viewProfileConversations = async (profile: AiProfile) => {
    setSelectedProfile(profile);
    const { data } = await supabase
      .from("ai_chat_conversations")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setProfileConvos((data as any) || []);
  };

  const viewDetails = async (sub: SubmissionRow) => {
    setSelectedSubmission(sub);
    let detailData: any = null;
    
    if (sub.role === "volunteer") {
      const { data } = await supabase.from("volunteer_details").select("*").eq("submission_id", sub.id).maybeSingle();
      detailData = data;
    } else if (sub.role === "internship") {
      const { data } = await supabase.from("internship_details").select("*").eq("submission_id", sub.id).maybeSingle();
      detailData = data;
    } else if (sub.role === "campus_ambassador") {
      const { data } = await supabase.from("campus_ambassador_details").select("*").eq("submission_id", sub.id).maybeSingle();
      detailData = data;
    } else if (sub.role === "corporate_volunteer") {
      const { data } = await supabase.from("corporate_volunteer_details").select("*").eq("submission_id", sub.id).maybeSingle();
      detailData = data;
    } else if (sub.role === "partner_organization") {
      const { data } = await supabase.from("partner_organization_details").select("*").eq("submission_id", sub.id).maybeSingle();
      detailData = data;
    }
    
    setDetails(detailData);
  };

  const updateStatus = async (submissionId: string, newStatus: string) => {
    // Approvals go through FastAPI backend (triggers email)
    if (newStatus === "approved") {
      setApprovingId(submissionId);
      try {
        const result = await approveApplication(submissionId);
        toast({
          title: "Application Approved",
          description: result.email_sent
            ? `Approval email sent to ${result.applicant_email}.`
            : "Approved, but email delivery failed — check EMAIL_PROVIDER config.",
        });
        fetchSubmissions();
        if (selectedSubmission?.id === submissionId) {
          setSelectedSubmission(null);
          setDetails(null);
        }
      } catch (err: any) {
        toast({ title: "Error", description: err.message ?? "Failed to approve application.", variant: "destructive" });
      } finally {
        setApprovingId(null);
      }
      return;
    }

    // All other status changes (reject, complete) go directly via Supabase
    const updateData: any = { status: newStatus };
    if (newStatus === "completed") updateData.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", submissionId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Status changed to ${newStatus}.` });
      fetchSubmissions();
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null);
        setDetails(null);
      }
    }
  };

  const filtered = submissions.filter((s) => {
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const profile = s.profiles;
      if (!profile) return false;
      return (
        profile.full_name?.toLowerCase().includes(q) ||
        profile.email?.toLowerCase().includes(q) ||
        profile.city?.toLowerCase().includes(q) ||
        profile.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredAiProfiles = aiProfiles.filter((p) => {
    if (!aiSearch) return true;
    const q = aiSearch.toLowerCase();
    return (
      p.display_name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.ai_summary?.toLowerCase().includes(q) ||
      p.interests?.some(i => i.toLowerCase().includes(q)) ||
      p.concerns?.some(c => c.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "City", "State", "Country", "Role", "Status", "Submitted At"];
    const rows = filtered.map((s) => {
      const p = s.profiles;
      return [p?.full_name, p?.email, p?.phone || "", p?.city || "", p?.state || "", p?.country || "", ROLE_LABELS[s.role]?.label || s.role, s.status, new Date(s.submitted_at).toLocaleDateString()].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anuvati-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `${filtered.length} submissions exported.` });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <section className="py-20 bg-background">
          <div className="container text-center"><p className="text-muted-foreground font-body">Loading...</p></div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/get-involved")} className="font-heading text-xs">
              <ArrowLeft size={14} /> Back
            </Button>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">Admin Dashboard</h1>
          <p className="font-body text-muted-foreground">{submissions.length} total submissions</p>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container">
          <Tabs defaultValue="submissions" onValueChange={(v) => { if (v === "ai-profiles" && aiProfiles.length === 0) fetchAiProfiles(); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="submissions" className="font-heading text-sm gap-2"><Users size={14} /> Submissions</TabsTrigger>
              <TabsTrigger value="ai-profiles" className="font-heading text-sm gap-2"><Bot size={14} /> AI Profiles</TabsTrigger>
            </TabsList>

            <TabsContent value="submissions">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                  <Input placeholder="Search by name, email, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "volunteer", "internship", "campus_ambassador", "corporate_volunteer", "partner_organization"] as const).map((r) => (
                    <Button key={r} variant={roleFilter === r ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(r)} className="font-heading text-xs">
                      {r === "all" ? "All" : ROLE_LABELS[r]?.label}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV} className="font-heading text-xs">
                  <Download size={14} /> Export CSV
                </Button>
              </div>

              {/* Detail Modal */}
              {selectedSubmission && (
                <Card className="mb-6 border-primary/20 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg">Submission Details</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedSubmission(null); setDetails(null); }}>
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
                      <div><p className="text-muted-foreground">Name</p><p className="font-medium text-foreground">{selectedSubmission.profiles?.full_name}</p></div>
                      <div><p className="text-muted-foreground">Email</p><p className="font-medium text-foreground">{selectedSubmission.profiles?.email}</p></div>
                      <div><p className="text-muted-foreground">Phone</p><p className="font-medium text-foreground">{selectedSubmission.profiles?.phone || "—"}</p></div>
                      <div><p className="text-muted-foreground">Location</p><p className="font-medium text-foreground">{[selectedSubmission.profiles?.city, selectedSubmission.profiles?.state, selectedSubmission.profiles?.country].filter(Boolean).join(", ") || "—"}</p></div>
                      <div><p className="text-muted-foreground">Age / Gender</p><p className="font-medium text-foreground">{[selectedSubmission.profiles?.age, selectedSubmission.profiles?.gender].filter(Boolean).join(" / ") || "—"}</p></div>
                      <div><p className="text-muted-foreground">LinkedIn</p><p className="font-medium text-foreground">{selectedSubmission.profiles?.linkedin_url ? <a href={selectedSubmission.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Profile</a> : "—"}</p></div>
                      <div><p className="text-muted-foreground">Role</p><Badge className="bg-primary/10 text-primary border-primary/20">{ROLE_LABELS[selectedSubmission.role]?.label}</Badge></div>
                      <div><p className="text-muted-foreground">Submitted</p><p className="font-medium text-foreground">{new Date(selectedSubmission.submitted_at).toLocaleString()}</p></div>
                    </div>
                    {details && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="font-heading font-semibold text-sm mb-3 text-foreground">Role-Specific Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-body">
                          {Object.entries(details).filter(([k]) => !["id", "submission_id"].includes(k)).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                              <p className="font-medium text-foreground">{Array.isArray(value) ? (value as string[]).join(", ") : (value as string) || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Table */}
              <Card className="border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-heading">Name</TableHead>
                      <TableHead className="font-heading">Email</TableHead>
                      <TableHead className="font-heading">Role</TableHead>
                      <TableHead className="font-heading">City</TableHead>
                      <TableHead className="font-heading">Date</TableHead>
                      <TableHead className="font-heading">Status</TableHead>
                      <TableHead className="font-heading">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground font-body py-12">No submissions found.</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-body font-medium text-foreground">{s.profiles?.full_name}</TableCell>
                          <TableCell className="font-body text-muted-foreground text-sm">{s.profiles?.email}</TableCell>
                          <TableCell><Badge variant="outline" className="font-heading text-xs">{ROLE_LABELS[s.role]?.label}</Badge></TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">{s.profiles?.city || "—"}</TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell><Badge variant="outline" className="font-heading text-xs">{s.status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => viewDetails(s)} className="font-heading text-xs"><Eye size={14} /> View</Button>
                              {s.status === "pending" && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => updateStatus(s.id, "approved")} disabled={approvingId === s.id} className="font-heading text-xs text-green-600 hover:text-green-700">
                                    {approvingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => updateStatus(s.id, "rejected")} className="font-heading text-xs text-destructive hover:text-destructive"><XCircle size={14} /> Reject</Button>
                                </>
                              )}
                              {s.status === "certificate_requested" && (
                                <Button variant="ghost" size="sm" onClick={() => updateStatus(s.id, "completed")} className="font-heading text-xs text-blue-600 hover:text-blue-700"><FileCheck size={14} /> Issue Certificate</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="ai-profiles">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                  <Input placeholder="Search by name, location, interests..." value={aiSearch} onChange={(e) => setAiSearch(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline" size="sm" onClick={fetchAiProfiles} className="font-heading text-xs">
                  Refresh
                </Button>
              </div>

              {/* Profile detail */}
              {selectedProfile && (
                <Card className="mb-6 border-primary/20 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg flex items-center gap-2">
                      <Bot size={18} /> AI Profile: {selectedProfile.display_name || "Anonymous User"}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedProfile(null); setProfileConvos([]); }}>
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-body mb-4">
                      <div><p className="text-muted-foreground">Name</p><p className="font-medium text-foreground">{selectedProfile.display_name || "Unknown"}</p></div>
                      <div><p className="text-muted-foreground">Location</p><p className="font-medium text-foreground">{selectedProfile.location || "Unknown"}</p></div>
                      <div><p className="text-muted-foreground">Age Group</p><p className="font-medium text-foreground">{selectedProfile.age_group || "Unknown"}</p></div>
                      <div><p className="text-muted-foreground">Type</p><Badge variant="outline">{selectedProfile.user_id ? "Registered User" : "Anonymous"}</Badge></div>
                      <div><p className="text-muted-foreground">Last Active</p><p className="font-medium text-foreground">{selectedProfile.last_active_at ? new Date(selectedProfile.last_active_at).toLocaleString() : "—"}</p></div>
                      <div><p className="text-muted-foreground">First Seen</p><p className="font-medium text-foreground">{new Date(selectedProfile.created_at).toLocaleDateString()}</p></div>
                    </div>
                    {selectedProfile.interests?.length ? (
                      <div className="mb-3">
                        <p className="text-muted-foreground text-sm mb-1">Interests</p>
                        <div className="flex gap-1 flex-wrap">{selectedProfile.interests.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}</div>
                      </div>
                    ) : null}
                    {selectedProfile.concerns?.length ? (
                      <div className="mb-3">
                        <p className="text-muted-foreground text-sm mb-1">Concerns</p>
                        <div className="flex gap-1 flex-wrap">{selectedProfile.concerns.map(c => <Badge key={c} variant="outline" className="text-xs border-destructive/30 text-destructive">{c}</Badge>)}</div>
                      </div>
                    ) : null}
                    {selectedProfile.ai_summary && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1">AI Summary</p>
                        <p className="text-sm text-foreground">{selectedProfile.ai_summary}</p>
                      </div>
                    )}

                    {/* Conversations */}
                    <div className="border-t border-border pt-4">
                      <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2"><MessageSquare size={14} /> Conversations ({profileConvos.length})</h4>
                      {profileConvos.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No conversations found.</p>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {profileConvos.map((convo) => (
                            <Card key={convo.id} className="border-border">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground mb-2">{new Date(convo.created_at).toLocaleString()} {convo.topic && `— ${convo.topic}`}</p>
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                  {(convo.messages as any[]).map((msg: any, i: number) => (
                                    <div key={i} className={`text-xs px-2 py-1 rounded ${msg.role === "user" ? "bg-primary/10 text-foreground" : "bg-muted text-muted-foreground"}`}>
                                      <span className="font-semibold">{msg.role === "user" ? "User" : "AI"}:</span> {msg.content.substring(0, 200)}{msg.content.length > 200 && "..."}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiLoading ? (
                <p className="text-center text-muted-foreground py-12">Loading AI profiles...</p>
              ) : (
                <Card className="border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-heading">Name</TableHead>
                        <TableHead className="font-heading">Location</TableHead>
                        <TableHead className="font-heading">Type</TableHead>
                        <TableHead className="font-heading">Interests</TableHead>
                        <TableHead className="font-heading">Last Active</TableHead>
                        <TableHead className="font-heading">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAiProfiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground font-body py-12">No AI profiles found yet. Profiles are created when users interact with the chatbot.</TableCell>
                        </TableRow>
                      ) : (
                        filteredAiProfiles.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-body font-medium text-foreground">{p.display_name || "Anonymous"}</TableCell>
                            <TableCell className="font-body text-sm text-muted-foreground">{p.location || "—"}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{p.user_id ? "Registered" : "Anonymous"}</Badge></TableCell>
                            <TableCell className="font-body text-sm text-muted-foreground max-w-[200px] truncate">{p.interests?.join(", ") || "—"}</TableCell>
                            <TableCell className="font-body text-sm text-muted-foreground">{p.last_active_at ? new Date(p.last_active_at).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => viewProfileConversations(p)} className="font-heading text-xs"><Eye size={14} /> View</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
