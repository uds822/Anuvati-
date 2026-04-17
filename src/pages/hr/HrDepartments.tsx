import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HrDepartments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [empCounts, setEmpCounts] = useState<Record<string, number>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const { isHrAdmin } = useHrRole();
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: depts }, { data: emps }] = await Promise.all([
      supabase.from("hr_departments").select("*").order("name"),
      supabase.from("hr_employees").select("department_id").eq("employment_status", "active"),
    ]);
    setDepartments(depts || []);
    const counts: Record<string, number> = {};
    (emps || []).forEach((e) => { if (e.department_id) counts[e.department_id] = (counts[e.department_id] || 0) + 1; });
    setEmpCounts(counts);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { toast({ title: "Error", description: "Name is required.", variant: "destructive" }); return; }

    if (editing) {
      const { error } = await supabase.from("hr_departments").update({ name: form.name, description: form.description || null }).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated" });
    } else {
      const { error } = await supabase.from("hr_departments").insert({ name: form.name, description: form.description || null });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created" });
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: "", description: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">{departments.length} departments</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ name: "", description: "" }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{d.name}</CardTitle>
                {isHrAdmin() && (
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(d); setForm({ name: d.name, description: d.description || "" }); setDialogOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{d.description || "No description"}</p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">{empCounts[d.id] || 0}</span>
                <span className="text-muted-foreground">employees</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HrDepartments;
