import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const CrmSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasRole, isAdmin } = useCrmRole();

  const [form, setForm] = useState({
    session_date: new Date().toISOString().split("T")[0],
    session_module: "", students_present: 0, teachers_present: 0,
    activities_conducted: "", challenges_faced: "", issue_reported: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("crm_session_reports").select("*").order("session_date", { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const { error } = await supabase.from("crm_session_reports").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Session report submitted");
    setDialogOpen(false);
    fetchData();
  };

  const canAdd = hasRole("facilitator") || isAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Session Reports</h1>
          <p className="text-sm text-muted-foreground">{sessions.length} sessions recorded</p>
        </div>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Session</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-heading">Submit Session Report</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} /></div>
                  <div><Label>Module</Label><Input value={form.session_module} onChange={e => setForm({...form, session_module: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Students Present</Label><Input type="number" value={form.students_present} onChange={e => setForm({...form, students_present: +e.target.value})} /></div>
                  <div><Label>Teachers Present</Label><Input type="number" value={form.teachers_present} onChange={e => setForm({...form, teachers_present: +e.target.value})} /></div>
                </div>
                <div><Label>Activities Conducted</Label><Textarea value={form.activities_conducted} onChange={e => setForm({...form, activities_conducted: e.target.value})} /></div>
                <div><Label>Challenges Faced</Label><Textarea value={form.challenges_faced} onChange={e => setForm({...form, challenges_faced: e.target.value})} /></div>
                <div><Label>Issues Reported</Label><Textarea value={form.issue_reported} onChange={e => setForm({...form, issue_reported: e.target.value})} /></div>
              </div>
              <Button className="w-full mt-4" onClick={handleSubmit}>Submit Report</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Teachers</TableHead>
                  <TableHead>Activities</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sessions recorded</TableCell></TableRow>
                ) : (
                  sessions.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.session_date}</TableCell>
                      <TableCell>{s.session_module || "—"}</TableCell>
                      <TableCell className="text-center">{s.students_present}</TableCell>
                      <TableCell className="text-center">{s.teachers_present}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{s.activities_conducted || "—"}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm">{s.issue_reported || "—"}</TableCell>
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

export default CrmSessions;
