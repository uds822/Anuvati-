import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Plus, TrendingUp, Users, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

const periods = ["Q1", "Q2", "Q3", "Q4", "Annual"];

const HrPerformance = () => {
  const { isHrAdmin, isManager } = useHrRole();
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", review_period: "Q1", year: new Date().getFullYear().toString(), self_rating: "", manager_rating: "", strengths: "", areas_of_improvement: "", goals: "", manager_comments: "" });

  const fetchData = async () => {
    const [reviewsRes, empRes] = await Promise.all([
      supabase.from("hr_performance_reviews").select("*, hr_employees!hr_performance_reviews_employee_id_fkey(full_name, designation, department_id)").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setReviews(reviewsRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("hr_performance_reviews").insert({
      employee_id: form.employee_id,
      review_period: form.review_period,
      year: parseInt(form.year),
      self_rating: form.self_rating ? parseFloat(form.self_rating) : null,
      manager_rating: form.manager_rating ? parseFloat(form.manager_rating) : null,
      overall_rating: form.manager_rating ? parseFloat(form.manager_rating) : null,
      strengths: form.strengths || null,
      areas_of_improvement: form.areas_of_improvement || null,
      goals: form.goals || null,
      manager_comments: form.manager_comments || null,
      status: "completed",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Review created");
    setDialogOpen(false);
    setForm({ employee_id: "", review_period: "Q1", year: new Date().getFullYear().toString(), self_rating: "", manager_rating: "", strengths: "", areas_of_improvement: "", goals: "", manager_comments: "" });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("hr_performance_reviews").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    fetchData();
  };

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.overall_rating || 0), 0) / reviews.filter(r => r.overall_rating).length).toFixed(1) : "—";
  const pending = reviews.filter(r => r.status === "pending").length;
  const completed = reviews.filter(r => r.status === "completed").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Reviews</h1>
          <p className="text-muted-foreground">Track employee performance and growth</p>
        </div>
        {(isHrAdmin() || isManager()) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Review</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Performance Review</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div><Label>Employee</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Period</Label>
                    <Select value={form.review_period} onValueChange={v => setForm(p => ({ ...p, review_period: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Self Rating (1-5)</Label><Input type="number" min="1" max="5" step="0.5" value={form.self_rating} onChange={e => setForm(p => ({ ...p, self_rating: e.target.value }))} /></div>
                  <div><Label>Manager Rating (1-5)</Label><Input type="number" min="1" max="5" step="0.5" value={form.manager_rating} onChange={e => setForm(p => ({ ...p, manager_rating: e.target.value }))} /></div>
                </div>
                <div><Label>Strengths</Label><Textarea value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} /></div>
                <div><Label>Areas of Improvement</Label><Textarea value={form.areas_of_improvement} onChange={e => setForm(p => ({ ...p, areas_of_improvement: e.target.value }))} /></div>
                <div><Label>Goals</Label><Textarea value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} /></div>
                <div><Label>Manager Comments</Label><Textarea value={form.manager_comments} onChange={e => setForm(p => ({ ...p, manager_comments: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={!form.employee_id} className="w-full">Submit Review</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ClipboardCheck className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{reviews.length}</p><p className="text-sm text-muted-foreground">Total Reviews</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Star className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">{avgRating}</p><p className="text-sm text-muted-foreground">Avg Rating</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{pending}</p><p className="text-sm text-muted-foreground">Pending</p></div></div></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Self Rating</TableHead>
              <TableHead>Manager Rating</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Status</TableHead>
              {isHrAdmin() && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.hr_employees?.full_name || "—"}</TableCell>
                <TableCell>{r.review_period} {r.year}</TableCell>
                <TableCell>{r.self_rating ? `${r.self_rating}/5` : "—"}</TableCell>
                <TableCell>{r.manager_rating ? `${r.manager_rating}/5` : "—"}</TableCell>
                <TableCell>{r.overall_rating ? <span className="font-bold">{r.overall_rating}/5</span> : "—"}</TableCell>
                <TableCell><Badge variant={r.status === "completed" ? "default" : r.status === "in_progress" ? "secondary" : "outline"}>{r.status}</Badge></TableCell>
                {isHrAdmin() && (
                  <TableCell>
                    {r.status === "pending" && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "completed")}>Complete</Button>}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {reviews.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No performance reviews yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default HrPerformance;
