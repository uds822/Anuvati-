import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, CheckCircle, XCircle, Pencil, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface School {
  id: string;
  school_name: string;
  udise_code: string | null;
  village: string | null;
  block: string | null;
  district: string | null;
  state: string | null;
  school_type: string | null;
  headmaster_name: string | null;
  contact_number: string | null;
  num_teachers: number;
  total_students: number;
  drinking_water: boolean;
  functional_toilets: boolean;
  handwashing_station: boolean;
  waste_management: boolean;
}

interface Facilitator { id: string; name: string; assigned_schools: string[] | null; }

type SortKey = "school_name" | "district" | "total_students";

const emptyForm = {
  school_name: "", udise_code: "", village: "", block: "", district: "",
  state: "Uttar Pradesh", school_type: "", headmaster_name: "", contact_number: "",
  num_teachers: 0, total_students: 0, drinking_water: false,
  functional_toilets: false, handwashing_station: false, waste_management: false,
};

const CrmSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("school_name");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignSchoolId, setAssignSchoolId] = useState("");
  const [assignFacilitatorId, setAssignFacilitatorId] = useState("");
  const { canWrite } = useCrmRole();

  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const [s, f] = await Promise.all([
      supabase.from("crm_schools").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_facilitators").select("id, name, assigned_schools"),
    ]);
    setSchools((s.data as School[]) || []);
    setFacilitators(f.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (school: School) => {
    setEditingSchool(school);
    setForm({
      school_name: school.school_name, udise_code: school.udise_code || "",
      village: school.village || "", block: school.block || "", district: school.district || "",
      state: school.state || "Uttar Pradesh", school_type: school.school_type || "",
      headmaster_name: school.headmaster_name || "", contact_number: school.contact_number || "",
      num_teachers: school.num_teachers || 0, total_students: school.total_students || 0,
      drinking_water: school.drinking_water, functional_toilets: school.functional_toilets,
      handwashing_station: school.handwashing_station, waste_management: school.waste_management,
    });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingSchool(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.school_name.trim()) { toast.error("School name is required"); return; }
    if (editingSchool) {
      const { error } = await supabase.from("crm_schools").update(form).eq("id", editingSchool.id);
      if (error) { toast.error(error.message); return; }
      toast.success("School updated");
    } else {
      const { error } = await supabase.from("crm_schools").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("School added");
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingSchool(null);
    fetchData();
  };

  const handleAssign = async () => {
    if (!assignFacilitatorId || !assignSchoolId) return;
    const fac = facilitators.find(f => f.id === assignFacilitatorId);
    const current = fac?.assigned_schools || [];
    if (current.includes(assignSchoolId)) { toast.info("Already assigned"); return; }
    const { error } = await supabase.from("crm_facilitators")
      .update({ assigned_schools: [...current, assignSchoolId] })
      .eq("id", assignFacilitatorId);
    if (error) { toast.error(error.message); return; }
    toast.success("Facilitator assigned to school");
    setAssignDialogOpen(false);
    fetchData();
  };

  const getAssignedFacilitators = (schoolId: string) =>
    facilitators.filter(f => f.assigned_schools?.includes(schoolId)).map(f => f.name);

  const blocks = [...new Set(schools.map(s => s.block).filter(Boolean))];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = schools
    .filter(s => blockFilter === "all" || s.block === blockFilter)
    .filter(s =>
      s.school_name.toLowerCase().includes(search.toLowerCase()) ||
      s.district?.toLowerCase().includes(search.toLowerCase()) ||
      s.block?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va: any, vb: any;
      if (sortKey === "total_students") { va = a.total_students; vb = b.total_students; }
      else { va = (a[sortKey] || "").toLowerCase(); vb = (b[sortKey] || "").toLowerCase(); }
      if (typeof va === "number") return sortAsc ? va - vb : vb - va;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const BoolIcon = ({ val }: { val: boolean }) =>
    val ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">School Database</h1>
          <p className="text-sm text-muted-foreground">{schools.length} schools registered</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-52" />
          </div>
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Blocks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {blocks.map(b => <SelectItem key={b!} value={b!}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          {canWrite() && (
            <>
              <Button variant="outline" onClick={() => setAssignDialogOpen(true)}>Assign Facilitator</Button>
              <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add School</Button>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingSchool(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingSchool ? "Edit School" : "Register New School"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2"><Label>School Name *</Label><Input value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} /></div>
            <div><Label>UDISE Code</Label><Input value={form.udise_code} onChange={e => setForm({...form, udise_code: e.target.value})} /></div>
            <div><Label>School Type</Label><Input value={form.school_type} onChange={e => setForm({...form, school_type: e.target.value})} placeholder="Primary / Upper Primary / Secondary" /></div>
            <div><Label>Village</Label><Input value={form.village} onChange={e => setForm({...form, village: e.target.value})} /></div>
            <div><Label>Block</Label><Input value={form.block} onChange={e => setForm({...form, block: e.target.value})} /></div>
            <div><Label>District</Label><Input value={form.district} onChange={e => setForm({...form, district: e.target.value})} /></div>
            <div><Label>State</Label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            <div><Label>Headmaster Name</Label><Input value={form.headmaster_name} onChange={e => setForm({...form, headmaster_name: e.target.value})} /></div>
            <div><Label>Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} /></div>
            <div><Label>Teachers</Label><Input type="number" value={form.num_teachers} onChange={e => setForm({...form, num_teachers: +e.target.value})} /></div>
            <div><Label>Total Students</Label><Input type="number" value={form.total_students} onChange={e => setForm({...form, total_students: +e.target.value})} /></div>
            <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-2"><Switch checked={form.drinking_water} onCheckedChange={v => setForm({...form, drinking_water: v})} /><Label>Drinking Water</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.functional_toilets} onCheckedChange={v => setForm({...form, functional_toilets: v})} /><Label>Functional Toilets</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.handwashing_station} onCheckedChange={v => setForm({...form, handwashing_station: v})} /><Label>Handwashing Station</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.waste_management} onCheckedChange={v => setForm({...form, waste_management: v})} /><Label>Waste Management</Label></div>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={handleSubmit}>{editingSchool ? "Save Changes" : "Register School"}</Button>
        </DialogContent>
      </Dialog>

      {/* Assign Facilitator Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Assign Facilitator to School</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>School</Label>
              <Select value={assignSchoolId} onValueChange={setAssignSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Facilitator</Label>
              <Select value={assignFacilitatorId} onValueChange={setAssignFacilitatorId}>
                <SelectTrigger><SelectValue placeholder="Select facilitator" /></SelectTrigger>
                <SelectContent>{facilitators.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={handleAssign}>Assign</Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("school_name")}>
                    School Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead>UDISE</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("district")}>
                    Block / District <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead>Headmaster</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => toggleSort("total_students")}>
                    Students <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="text-center">Water</TableHead>
                  <TableHead className="text-center">Toilets</TableHead>
                  <TableHead className="text-center">Handwash</TableHead>
                  <TableHead className="text-center">Waste</TableHead>
                  <TableHead>Facilitators</TableHead>
                  {canWrite() && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No schools found</TableCell></TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.school_name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{s.udise_code || "—"}</TableCell>
                      <TableCell className="text-sm">{[s.block, s.district].filter(Boolean).join(", ") || "—"}</TableCell>
                      <TableCell className="text-sm">{s.headmaster_name || "—"}</TableCell>
                      <TableCell className="text-center">{s.total_students}</TableCell>
                      <TableCell className="text-center"><BoolIcon val={s.drinking_water} /></TableCell>
                      <TableCell className="text-center"><BoolIcon val={s.functional_toilets} /></TableCell>
                      <TableCell className="text-center"><BoolIcon val={s.handwashing_station} /></TableCell>
                      <TableCell className="text-center"><BoolIcon val={s.waste_management} /></TableCell>
                      <TableCell className="text-xs">{getAssignedFacilitators(s.id).join(", ") || "—"}</TableCell>
                      {canWrite() && (
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      )}
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

export default CrmSchools;
