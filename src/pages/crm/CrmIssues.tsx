import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Issue {
  id: string;
  school_id: string | null;
  category: string | null;
  description: string | null;
  priority: string;
  assigned_to: string | null;
  status: string;
  reported_by: string | null;
  created_at: string;
  updated_at: string;
}

interface School { id: string; school_name: string; }

const priorityColors: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-secondary text-secondary-foreground",
  low: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/30",
  in_progress: "bg-secondary/10 text-secondary border-secondary/30",
  resolved: "bg-green-100 text-green-800 border-green-300",
};

const CrmIssues = () => {
  const { user } = useAuth();
  const { isAdmin, hasRole, canWrite } = useCrmRole();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    school_id: "", category: "", description: "", priority: "medium",
  });

  const fetchData = async () => {
    const [issuesRes, schoolsRes] = await Promise.all([
      supabase.from("crm_issues").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_schools").select("id, school_name"),
    ]);
    setIssues(issuesRes.data || []);
    setSchools(schoolsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.description?.trim()) { toast.error("Description is required"); return; }
    const { error } = await supabase.from("crm_issues").insert({
      ...form,
      school_id: form.school_id || null,
      reported_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Issue reported");
    setDialogOpen(false);
    setForm({ school_id: "", category: "", description: "", priority: "medium" });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("crm_issues").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Issue marked as ${status}`);
    fetchData();
  };

  const getSchoolName = (id: string | null) => schools.find(s => s.id === id)?.school_name || "—";

  const filtered = issues
    .filter(i => statusFilter === "all" || i.status === statusFilter)
    .filter(i => search ? (i.description?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase())) : true);

  const stats = {
    open: issues.filter(i => i.status === "open").length,
    inProgress: issues.filter(i => i.status === "in_progress").length,
    resolved: issues.filter(i => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Issue Tracker</h1>
          <p className="text-sm text-muted-foreground">{issues.length} issues tracked</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1"><Plus className="h-4 w-4" /> Report Issue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Report an Issue</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>School</Label>
                  <Select value={form.school_id} onValueChange={v => setForm({...form, school_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                    <SelectContent>
                      {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="water_supply">Water Supply</SelectItem>
                        <SelectItem value="sanitation">Sanitation</SelectItem>
                        <SelectItem value="hygiene">Hygiene</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the issue..." rows={4} />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleSubmit}>Submit Issue</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter("open")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-destructive">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter("in_progress")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-secondary">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter("resolved")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "open", "in_progress", "resolved"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Issues table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {canWrite() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No issues found</TableCell></TableRow>
                ) : (
                  filtered.map(issue => (
                    <TableRow key={issue.id}>
                      <TableCell className="text-sm">{format(new Date(issue.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getSchoolName(issue.school_id)}</TableCell>
                      <TableCell className="capitalize">{issue.category?.replace("_", " ") || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{issue.description || "—"}</TableCell>
                      <TableCell>
                        <Badge className={priorityColors[issue.priority] || ""} variant="secondary">{issue.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[issue.status] || ""}>{issue.status.replace("_", " ")}</Badge>
                      </TableCell>
                      {canWrite() && (
                        <TableCell>
                          <Select value={issue.status} onValueChange={v => updateStatus(issue.id, v)}>
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmIssues;
