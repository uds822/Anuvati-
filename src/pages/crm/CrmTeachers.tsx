import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  school_id: string | null;
  role: string | null;
  contact: string | null;
  training_status: string | null;
  created_at: string;
}

interface School { id: string; school_name: string; }

type SortKey = "name" | "role" | "training_status";

const trainingColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  pending: "bg-muted text-muted-foreground border-border",
};

const CrmTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canWrite } = useCrmRole();

  const [form, setForm] = useState({
    name: "", school_id: "", role: "", contact: "", training_status: "pending",
  });

  const fetchData = async () => {
    const [t, s] = await Promise.all([
      supabase.from("crm_teachers").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_schools").select("id, school_name"),
    ]);
    setTeachers(t.data || []);
    setSchools(s.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const { error } = await supabase.from("crm_teachers").insert({
      ...form, school_id: form.school_id || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Teacher added");
    setDialogOpen(false);
    setForm({ name: "", school_id: "", role: "", contact: "", training_status: "pending" });
    fetchData();
  };

  const getSchoolName = (id: string | null) => schools.find(s => s.id === id)?.school_name || "—";

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = teachers
    .filter(t => schoolFilter === "all" || t.school_id === schoolFilter)
    .filter(t => search ? t.name.toLowerCase().includes(search.toLowerCase()) || t.contact?.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => {
      const va = (a[sortKey] || "").toLowerCase();
      const vb = (b[sortKey] || "").toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Teacher Registry</h1>
          <p className="text-sm text-muted-foreground">{teachers.length} teachers registered</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          <Select value={schoolFilter} onValueChange={setSchoolFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Schools" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}
            </SelectContent>
          </Select>
          {canWrite() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Teacher</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Add Teacher</DialogTitle></DialogHeader>
                <div className="grid gap-4 mt-4">
                  <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div>
                    <Label>School</Label>
                    <Select value={form.school_id} onValueChange={v => setForm({...form, school_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                      <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Role</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g. WASH Nodal Teacher" /></div>
                    <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /></div>
                  </div>
                  <div>
                    <Label>Training Status</Label>
                    <Select value={form.training_status} onValueChange={v => setForm({...form, training_status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleSubmit}>Add Teacher</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("role")}>
                    Role <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("training_status")}>
                    Training <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No teachers found</TableCell></TableRow>
                ) : (
                  filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{getSchoolName(t.school_id)}</TableCell>
                      <TableCell className="text-sm">{t.role || "—"}</TableCell>
                      <TableCell className="text-sm">{t.contact || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={trainingColors[t.training_status || "pending"] || ""}>
                          {(t.training_status || "pending").replace("_", " ")}
                        </Badge>
                      </TableCell>
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

export default CrmTeachers;
