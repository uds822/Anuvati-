import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Brain, Award, Languages, Wrench, Users } from "lucide-react";

interface Skill {
  id: string;
  employee_id: string;
  skill_name: string;
  skill_category: string;
  proficiency_level: string;
  certified: boolean;
  certification_name: string | null;
  certification_date: string | null;
  hr_employees?: { full_name: string; employee_id: string };
}

const CATEGORIES = ["technical", "language", "certification", "soft_skill", "domain_expertise"];
const LEVELS = ["beginner", "intermediate", "advanced", "expert"];

const HrSkills = () => {
  const { isHrAdmin } = useHrRole();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; employee_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [form, setForm] = useState({
    employee_id: "", skill_name: "", skill_category: "technical",
    proficiency_level: "intermediate", certified: false,
    certification_name: "", certification_date: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [{ data: s }, { data: e }] = await Promise.all([
      supabase.from("hr_employee_skills").select("*, hr_employees(full_name, employee_id)").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name, employee_id").eq("employment_status", "active"),
    ]);
    setSkills((s || []) as any);
    setEmployees(e || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("hr_employee_skills").insert({
      employee_id: form.employee_id,
      skill_name: form.skill_name,
      skill_category: form.skill_category,
      proficiency_level: form.proficiency_level,
      certified: form.certified,
      certification_name: form.certification_name || null,
      certification_date: form.certification_date || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Skill added");
    setDialogOpen(false);
    setForm({ employee_id: "", skill_name: "", skill_category: "technical", proficiency_level: "intermediate", certified: false, certification_name: "", certification_date: "" });
    fetchData();
  };

  const filtered = skills.filter(s => {
    const matchSearch = s.skill_name.toLowerCase().includes(search.toLowerCase()) ||
      (s as any).hr_employees?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || s.skill_category === filterCategory;
    return matchSearch && matchCat;
  });

  const categoryIcon = (c: string) => {
    switch (c) {
      case "technical": return <Wrench className="h-3 w-3" />;
      case "language": return <Languages className="h-3 w-3" />;
      case "certification": return <Award className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  const levelColor = (l: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (l) {
      case "expert": return "default";
      case "advanced": return "secondary";
      case "intermediate": return "outline";
      default: return "outline";
    }
  };

  // Aggregate stats
  const uniqueSkills = new Set(skills.map(s => s.skill_name)).size;
  const certifiedCount = skills.filter(s => s.certified).length;
  const uniqueEmployees = new Set(skills.map(s => s.employee_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills & Competency Mapping</h1>
          <p className="text-muted-foreground">Track employee skills, certifications, and expertise</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Employee Skill</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Skill Name *" value={form.skill_name} onChange={e => setForm({ ...form, skill_name: e.target.value })} />
                <Select value={form.skill_category} onValueChange={v => setForm({ ...form, skill_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.proficiency_level} onValueChange={v => setForm({ ...form, proficiency_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.certified} onCheckedChange={c => setForm({ ...form, certified: !!c })} />
                  <span className="text-sm">Certified</span>
                </div>
                {form.certified && (
                  <>
                    <Input placeholder="Certification Name" value={form.certification_name} onChange={e => setForm({ ...form, certification_name: e.target.value })} />
                    <Input type="date" value={form.certification_date} onChange={e => setForm({ ...form, certification_date: e.target.value })} />
                  </>
                )}
                <Button onClick={handleCreate} disabled={!form.employee_id || !form.skill_name} className="w-full">Add Skill</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Brain className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{uniqueSkills}</p><p className="text-xs text-muted-foreground">Unique Skills</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Award className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{certifiedCount}</p><p className="text-xs text-muted-foreground">Certifications</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{uniqueEmployees}</p><p className="text-xs text-muted-foreground">Skilled Employees</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Wrench className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{skills.length}</p><p className="text-xs text-muted-foreground">Total Records</p></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search skills or employees..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Proficiency</TableHead>
                <TableHead>Certified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No skills recorded</TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{(s as any).hr_employees?.full_name || "—"}</TableCell>
                  <TableCell>{s.skill_name}</TableCell>
                  <TableCell><Badge variant="outline" className="gap-1">{categoryIcon(s.skill_category)}{s.skill_category.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge variant={levelColor(s.proficiency_level)}>{s.proficiency_level}</Badge></TableCell>
                  <TableCell>{s.certified ? <Badge>✓ {s.certification_name || "Yes"}</Badge> : <span className="text-muted-foreground">No</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};


export default HrSkills;
