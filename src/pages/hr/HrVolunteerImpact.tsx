import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Heart, Clock, Users, Globe, Calendar, TrendingUp } from "lucide-react";

interface VolunteerActivity {
  id: string;
  volunteer_name: string;
  volunteer_email: string | null;
  project_name: string | null;
  activity_type: string;
  hours_contributed: number;
  communities_served: number;
  beneficiaries_reached: number;
  events_supported: number;
  activity_date: string;
  description: string | null;
}

const ACTIVITY_TYPES = ["fieldwork", "training", "awareness_campaign", "event_support", "data_collection", "mentoring", "fundraising"];

const HrVolunteerImpact = () => {
  const { isHrAdmin } = useHrRole();
  const [activities, setActivities] = useState<VolunteerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    volunteer_name: "", volunteer_email: "", project_name: "",
    activity_type: "fieldwork", hours_contributed: "0",
    communities_served: "0", beneficiaries_reached: "0",
    events_supported: "0", activity_date: "", description: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("hr_volunteer_activities").select("*").order("activity_date", { ascending: false });
    setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("hr_volunteer_activities").insert({
      volunteer_name: form.volunteer_name,
      volunteer_email: form.volunteer_email || null,
      project_name: form.project_name || null,
      activity_type: form.activity_type,
      hours_contributed: Number(form.hours_contributed) || 0,
      communities_served: Number(form.communities_served) || 0,
      beneficiaries_reached: Number(form.beneficiaries_reached) || 0,
      events_supported: Number(form.events_supported) || 0,
      activity_date: form.activity_date || new Date().toISOString().split("T")[0],
      description: form.description || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Activity recorded");
    setDialogOpen(false);
    setForm({ volunteer_name: "", volunteer_email: "", project_name: "", activity_type: "fieldwork", hours_contributed: "0", communities_served: "0", beneficiaries_reached: "0", events_supported: "0", activity_date: "", description: "" });
    fetchData();
  };

  // Aggregate metrics
  const totalHours = activities.reduce((s, a) => s + Number(a.hours_contributed || 0), 0);
  const totalCommunities = activities.reduce((s, a) => s + Number(a.communities_served || 0), 0);
  const totalBeneficiaries = activities.reduce((s, a) => s + Number(a.beneficiaries_reached || 0), 0);
  const totalEvents = activities.reduce((s, a) => s + Number(a.events_supported || 0), 0);
  const uniqueVolunteers = new Set(activities.map(a => a.volunteer_name)).size;

  // Impact score: simple weighted formula
  const impactScore = Math.min(100, Math.round((totalHours * 0.3 + totalBeneficiaries * 0.4 + totalCommunities * 5 + totalEvents * 2) / Math.max(uniqueVolunteers, 1)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Volunteer Impact Tracking</h1>
          <p className="text-muted-foreground">Measure volunteer contributions and community impact</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Log Activity</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Log Volunteer Activity</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <Input placeholder="Volunteer Name *" value={form.volunteer_name} onChange={e => setForm({ ...form, volunteer_name: e.target.value })} />
                <Input type="email" placeholder="Email" value={form.volunteer_email} onChange={e => setForm({ ...form, volunteer_email: e.target.value })} />
                <Input placeholder="Project Name" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} />
                <Select value={form.activity_type} onValueChange={v => setForm({ ...form, activity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="date" value={form.activity_date} onChange={e => setForm({ ...form, activity_date: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Hours</label><Input type="number" value={form.hours_contributed} onChange={e => setForm({ ...form, hours_contributed: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Communities</label><Input type="number" value={form.communities_served} onChange={e => setForm({ ...form, communities_served: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Beneficiaries</label><Input type="number" value={form.beneficiaries_reached} onChange={e => setForm({ ...form, beneficiaries_reached: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Events</label><Input type="number" value={form.events_supported} onChange={e => setForm({ ...form, events_supported: e.target.value })} /></div>
                </div>
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <Button onClick={handleCreate} disabled={!form.volunteer_name} className="w-full">Log Activity</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Impact Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalHours.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Volunteer Hours</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{uniqueVolunteers}</p><p className="text-xs text-muted-foreground">Active Volunteers</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Globe className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalCommunities}</p><p className="text-xs text-muted-foreground">Communities Served</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Heart className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</p><p className="text-xs text-muted-foreground">Beneficiaries Reached</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Calendar className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalEvents}</p><p className="text-xs text-muted-foreground">Events Supported</p></div></CardContent></Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{impactScore}/100</p><p className="text-xs text-muted-foreground">Impact Score</p></div>
            </div>
            <Progress value={impactScore} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Table */}
      <Card>
        <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Beneficiaries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : activities.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No activities logged</TableCell></TableRow>
              ) : activities.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.volunteer_name}</TableCell>
                  <TableCell>{a.project_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{a.activity_type.replace("_", " ")}</Badge></TableCell>
                  <TableCell>{a.activity_date}</TableCell>
                  <TableCell>{a.hours_contributed}h</TableCell>
                  <TableCell>{a.beneficiaries_reached}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrVolunteerImpact;
