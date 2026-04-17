import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Plus, Shield, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const grievanceCategories = ["general", "workplace_harassment", "ethics_violation", "misconduct", "workplace_conflict", "discrimination", "safety_concern"];
const priorities = ["low", "medium", "high", "critical"];

const HrGrievances = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general", priority: "medium", is_anonymous: false });

  const fetchData = async () => {
    const [gRes, empRes] = await Promise.all([
      supabase.from("hr_grievances").select("*, hr_employees(full_name)").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setGrievances(gRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const { error } = await supabase.from("hr_grievances").insert({
      title: form.title,
      description: form.description || null,
      category: form.category,
      priority: form.priority,
      is_anonymous: form.is_anonymous,
      submitted_by: form.is_anonymous ? null : user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Grievance submitted");
    setDialogOpen(false);
    setForm({ title: "", description: "", category: "general", priority: "medium", is_anonymous: false });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "resolved") updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("hr_grievances").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    fetchData();
  };

  const open = grievances.filter(g => g.status === "submitted").length;
  const inProgress = grievances.filter(g => g.status === "investigating").length;
  const resolved = grievances.filter(g => g.status === "resolved").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grievances</h1>
          <p className="text-muted-foreground">Report and track workplace grievances</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Report Grievance</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Grievance</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{grievanceCategories.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_anonymous} onCheckedChange={v => setForm(p => ({ ...p, is_anonymous: v }))} /><Label>Submit Anonymously</Label></div>
              <Button onClick={handleSubmit} disabled={!form.title} className="w-full">Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{grievances.length}</p><p className="text-sm text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Shield className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{open}</p><p className="text-sm text-muted-foreground">Open</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{inProgress}</p><p className="text-sm text-muted-foreground">Investigating</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{resolved}</p><p className="text-sm text-muted-foreground">Resolved</p></div></div></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {isHrAdmin() && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grievances.map(g => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.title}{g.is_anonymous && <Badge variant="outline" className="ml-2 text-xs">Anonymous</Badge>}</TableCell>
                <TableCell>{g.category.replace(/_/g, " ")}</TableCell>
                <TableCell><Badge variant={g.priority === "critical" ? "destructive" : g.priority === "high" ? "destructive" : "outline"}>{g.priority}</Badge></TableCell>
                <TableCell><Badge variant={g.status === "resolved" ? "default" : g.status === "investigating" ? "secondary" : "outline"}>{g.status}</Badge></TableCell>
                <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                {isHrAdmin() && (
                  <TableCell>
                    <div className="flex gap-1">
                      {g.status === "submitted" && <Button size="sm" variant="outline" onClick={() => updateStatus(g.id, "investigating")}>Investigate</Button>}
                      {g.status === "investigating" && <Button size="sm" variant="outline" onClick={() => updateStatus(g.id, "resolved")}>Resolve</Button>}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {grievances.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No grievances reported</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default HrGrievances;
