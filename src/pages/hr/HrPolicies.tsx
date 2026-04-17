import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Eye, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";

const policyCategories = ["general", "leave", "conduct", "safety", "anti-harassment", "data-privacy", "travel", "finance", "it-security"];

const HrPolicies = () => {
  const { isHrAdmin } = useHrRole();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<any[]>([]);
  const [myEmployee, setMyEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPolicy, setViewPolicy] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "general", content: "", version: "1.0", requires_acknowledgement: false });

  const fetchData = async () => {
    const [pRes, aRes, empRes] = await Promise.all([
      supabase.from("hr_policies").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_policy_acknowledgements").select("*"),
      user ? supabase.from("hr_employees").select("id").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setPolicies(pRes.data || []);
    setAcknowledgements(aRes.data || []);
    setMyEmployee(empRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async () => {
    const { error } = await supabase.from("hr_policies").insert({
      title: form.title,
      category: form.category,
      content: form.content || null,
      version: form.version,
      requires_acknowledgement: form.requires_acknowledgement,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Policy created");
    setDialogOpen(false);
    setForm({ title: "", category: "general", content: "", version: "1.0", requires_acknowledgement: false });
    fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("hr_policies").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchData();
  };

  const acknowledgePolicy = async (policyId: string) => {
    if (!myEmployee) { toast.error("No employee record found"); return; }
    const { error } = await supabase.from("hr_policy_acknowledgements").insert({
      policy_id: policyId,
      employee_id: myEmployee.id,
    });
    if (error) {
      if (error.code === "23505") toast.info("Already acknowledged");
      else toast.error(error.message);
      return;
    }
    toast.success("Policy acknowledged");
    fetchData();
  };

  const hasAcknowledged = (policyId: string) => {
    return myEmployee && acknowledgements.some(a => a.policy_id === policyId && a.employee_id === myEmployee.id);
  };

  const ackCount = (policyId: string) => acknowledgements.filter(a => a.policy_id === policyId).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Policies</h1>
          <p className="text-muted-foreground">Manage organizational policies and documentation</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Policy</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create HR Policy</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{policyCategories.map(c => <SelectItem key={c} value={c}>{c.replace(/-/g, " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Version</Label><Input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))} /></div>
                </div>
                <div><Label>Content</Label><Textarea rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Policy content..." /></div>
                <div className="flex items-center gap-2"><Switch checked={form.requires_acknowledgement} onCheckedChange={v => setForm(p => ({ ...p, requires_acknowledgement: v }))} /><Label>Requires Employee Acknowledgement</Label></div>
                <Button onClick={handleCreate} disabled={!form.title} className="w-full">Create Policy</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map(p => (
          <Card key={p.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{p.title}</CardTitle>
                <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline">{p.category.replace(/-/g, " ")}</Badge>
                <span className="text-xs text-muted-foreground">v{p.version}</span>
                {p.requires_acknowledgement && <Badge variant="destructive" className="text-xs">Requires Ack</Badge>}
                {p.requires_acknowledgement && (
                  <span className="text-xs text-muted-foreground">{ackCount(p.id)} acknowledged</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.content || "No content"}</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setViewPolicy(p)}><Eye className="h-3 w-3 mr-1" />View</Button>
                {isHrAdmin() && <Button size="sm" variant="ghost" onClick={() => toggleActive(p.id, p.is_active)}>{p.is_active ? "Deactivate" : "Activate"}</Button>}
                {p.requires_acknowledgement && myEmployee && !hasAcknowledged(p.id) && (
                  <Button size="sm" variant="default" onClick={() => acknowledgePolicy(p.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />Acknowledge
                  </Button>
                )}
                {hasAcknowledged(p.id) && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />Acknowledged
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {policies.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No policies created yet</p>}
      </div>

      <Dialog open={!!viewPolicy} onOpenChange={() => setViewPolicy(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewPolicy?.title}</DialogTitle></DialogHeader>
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{viewPolicy?.category}</Badge>
            <Badge>v{viewPolicy?.version}</Badge>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{viewPolicy?.content || "No content available"}</div>
          {viewPolicy?.requires_acknowledgement && myEmployee && !hasAcknowledged(viewPolicy?.id) && (
            <div className="border-t pt-4 mt-4">
              <Button onClick={() => { acknowledgePolicy(viewPolicy.id); setViewPolicy(null); }} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />I have read and acknowledge this policy
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrPolicies;