import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { GitBranch, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const lifecycleStages = [
  "candidate", "offer_extended", "pre_boarding", "onboarding", "probation",
  "confirmed", "promotion", "transfer", "exit", "alumni"
];

const stageColors: Record<string, string> = {
  candidate: "bg-gray-200 text-gray-800",
  offer_extended: "bg-blue-100 text-blue-800",
  pre_boarding: "bg-indigo-100 text-indigo-800",
  onboarding: "bg-purple-100 text-purple-800",
  probation: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  promotion: "bg-emerald-100 text-emerald-800",
  transfer: "bg-orange-100 text-orange-800",
  exit: "bg-red-100 text-red-800",
  alumni: "bg-slate-100 text-slate-800",
};

const HrLifecycle = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const [employees, setEmployees] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [form, setForm] = useState({ employee_id: "", to_stage: "", notes: "" });
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const [empRes, eventsRes] = await Promise.all([
      supabase.from("hr_employees").select("id, full_name, employee_id, lifecycle_stage, designation, employment_status").order("full_name"),
      supabase.from("hr_lifecycle_events").select("*, hr_employees!hr_lifecycle_events_employee_id_fkey(full_name)").order("created_at", { ascending: false }).limit(50),
    ]);
    setEmployees(empRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleTransition = async () => {
    const emp = employees.find(e => e.id === form.employee_id);
    if (!emp) return;

    // Insert lifecycle event
    const { error: eventError } = await supabase.from("hr_lifecycle_events").insert({
      employee_id: form.employee_id,
      from_stage: emp.lifecycle_stage,
      to_stage: form.to_stage,
      notes: form.notes || null,
      performed_by: user?.id,
    });
    if (eventError) { toast.error(eventError.message); return; }

    // Update employee stage
    const { error: updateError } = await supabase.from("hr_employees")
      .update({ lifecycle_stage: form.to_stage })
      .eq("id", form.employee_id);
    if (updateError) { toast.error(updateError.message); return; }

    toast.success(`Transitioned to ${form.to_stage.replace(/_/g, " ")}`);
    setDialogOpen(false);
    setForm({ employee_id: "", to_stage: "", notes: "" });
    fetchData();
  };

  const openTransition = (emp: any) => {
    setForm({ employee_id: emp.id, to_stage: "", notes: "" });
    setSelectedEmployee(emp);
    setDialogOpen(true);
  };

  const stageCount = (stage: string) => employees.filter(e => e.lifecycle_stage === stage).length;
  const filtered = employees.filter(e => e.full_name.toLowerCase().includes(search.toLowerCase()) || e.employee_id.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employee Lifecycle</h1>
        <p className="text-muted-foreground">Track employee journeys from candidate to alumni</p>
      </div>

      {/* Stage Pipeline */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {lifecycleStages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              <div className={`rounded-lg px-4 py-3 text-center min-w-[120px] ${stageColors[stage]}`}>
                <p className="text-lg font-bold">{stageCount(stage)}</p>
                <p className="text-xs font-medium">{stage.replace(/_/g, " ")}</p>
              </div>
              {i < lifecycleStages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Employee List with Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employees</CardTitle>
            <Input className="w-64" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Status</TableHead>
              {isHrAdmin() && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(emp => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.full_name}</TableCell>
                <TableCell className="font-mono text-sm">{emp.employee_id}</TableCell>
                <TableCell>{emp.designation || "—"}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${stageColors[emp.lifecycle_stage] || "bg-muted"}`}>{(emp.lifecycle_stage || "onboarding").replace(/_/g, " ")}</span></TableCell>
                <TableCell><Badge variant={emp.employment_status === "active" ? "default" : "secondary"}>{emp.employment_status}</Badge></TableCell>
                {isHrAdmin() && (
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openTransition(emp)}>
                      <GitBranch className="h-3 w-3 mr-1" />Transition
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No employees found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Transitions */}
      <Card>
        <CardHeader><CardTitle>Recent Lifecycle Events</CardTitle></CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
          <TableBody>
            {events.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.hr_employees?.full_name || "—"}</TableCell>
                <TableCell>{e.from_stage ? <span className={`px-2 py-0.5 rounded text-xs ${stageColors[e.from_stage] || "bg-muted"}`}>{e.from_stage.replace(/_/g, " ")}</span> : "—"}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded text-xs ${stageColors[e.to_stage] || "bg-muted"}`}>{e.to_stage.replace(/_/g, " ")}</span></TableCell>
                <TableCell>{e.event_date}</TableCell>
                <TableCell className="max-w-xs truncate">{e.notes || "—"}</TableCell>
              </TableRow>
            ))}
            {events.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No lifecycle events recorded</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Transition Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lifecycle Transition</DialogTitle></DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <p className="text-sm"><strong>{selectedEmployee.full_name}</strong> — Current stage: <Badge variant="outline">{(selectedEmployee.lifecycle_stage || "onboarding").replace(/_/g, " ")}</Badge></p>
              <div><Label>New Stage</Label>
                <Select value={form.to_stage} onValueChange={v => setForm(p => ({ ...p, to_stage: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select new stage" /></SelectTrigger>
                  <SelectContent>{lifecycleStages.filter(s => s !== selectedEmployee.lifecycle_stage).map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Reason for transition..." /></div>
              <Button onClick={handleTransition} disabled={!form.to_stage} className="w-full">Confirm Transition</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrLifecycle;
