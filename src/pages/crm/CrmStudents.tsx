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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUpDown, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  school_id: string | null;
  grade: string | null;
  age_band: string | null;
  gender: string | null;
  parent_name: string | null;
  parent_contact: string | null;
  caste_category: string | null;
  consent_parent_info: boolean;
  consent_caste_info: boolean;
}

interface School { id: string; school_name: string; }

const CrmStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canWrite, isFunder } = useCrmRole();

  const [form, setForm] = useState({
    school_id: "", grade: "", age_band: "", gender: "",
    parent_name: "", parent_contact: "", caste_category: "",
    consent_parent_info: false, consent_caste_info: false,
  });

  const fetchData = async () => {
    const [s, sc] = await Promise.all([
      supabase.from("crm_students").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_schools").select("id, school_name"),
    ]);
    setStudents((s.data as Student[]) || []);
    setSchools(sc.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.grade) { toast.error("Grade is required"); return; }
    const { error } = await supabase.from("crm_students").insert({
      ...form, school_id: form.school_id || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Student added");
    setDialogOpen(false);
    setForm({ school_id: "", grade: "", age_band: "", gender: "", parent_name: "", parent_contact: "", caste_category: "", consent_parent_info: false, consent_caste_info: false });
    fetchData();
  };

  const getSchoolName = (id: string | null) => schools.find(s => s.id === id)?.school_name || "—";
  const isFunderRole = isFunder();

  const filtered = students
    .filter(s => schoolFilter === "all" || s.school_id === schoolFilter)
    .filter(s => search ? s.grade?.toLowerCase().includes(search.toLowerCase()) || s.gender?.toLowerCase().includes(search.toLowerCase()) : true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Registry</h1>
          <p className="text-sm text-muted-foreground">{students.length} students • Privacy-minimal records</p>
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
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Student</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle className="font-heading">Add Student Record</DialogTitle></DialogHeader>
                <div className="grid gap-4 mt-4">
                  <div>
                    <Label>School</Label>
                    <Select value={form.school_id} onValueChange={v => setForm({...form, school_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                      <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Grade *</Label><Input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="e.g. 5th" /></div>
                    <div><Label>Age Band</Label><Input value={form.age_band} onChange={e => setForm({...form, age_band: e.target.value})} placeholder="e.g. 10-12" /></div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Protected fields — require consent</p>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.consent_parent_info} onCheckedChange={v => setForm({...form, consent_parent_info: v})} />
                      <Label className="text-sm">Parent/Guardian consent obtained</Label>
                    </div>
                    {form.consent_parent_info && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Parent Name</Label><Input value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} /></div>
                        <div><Label>Parent Contact</Label><Input value={form.parent_contact} onChange={e => setForm({...form, parent_contact: e.target.value})} /></div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch checked={form.consent_caste_info} onCheckedChange={v => setForm({...form, consent_caste_info: v})} />
                      <Label className="text-sm">Caste/category consent obtained</Label>
                    </div>
                    {form.consent_caste_info && (
                      <div><Label>Caste Category</Label><Input value={form.caste_category} onChange={e => setForm({...form, caste_category: e.target.value})} placeholder="e.g. SC / ST / OBC / General" /></div>
                    )}
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleSubmit}>Add Student</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isFunderRole && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="p-3 flex items-center gap-2 text-sm text-secondary">
            <ShieldAlert className="h-4 w-4" />
            Funder view: Sensitive student PII (parent info, caste) is hidden for privacy compliance.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Age Band</TableHead>
                  <TableHead>Gender</TableHead>
                  {!isFunderRole && <TableHead>Parent Name</TableHead>}
                  {!isFunderRole && <TableHead>Parent Contact</TableHead>}
                  {!isFunderRole && <TableHead>Caste Category</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={isFunderRole ? 4 : 7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={isFunderRole ? 4 : 7} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{getSchoolName(s.school_id)}</TableCell>
                      <TableCell className="font-medium">{s.grade || "—"}</TableCell>
                      <TableCell>{s.age_band || "—"}</TableCell>
                      <TableCell className="capitalize">{s.gender || "—"}</TableCell>
                      {!isFunderRole && <TableCell>{s.consent_parent_info ? s.parent_name || "—" : <Badge variant="outline" className="text-xs">No consent</Badge>}</TableCell>}
                      {!isFunderRole && <TableCell>{s.consent_parent_info ? s.parent_contact || "—" : "—"}</TableCell>}
                      {!isFunderRole && <TableCell>{s.consent_caste_info ? s.caste_category || "—" : <Badge variant="outline" className="text-xs">No consent</Badge>}</TableCell>}
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

export default CrmStudents;
