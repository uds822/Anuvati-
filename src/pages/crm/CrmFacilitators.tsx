import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Facilitator {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  assigned_block: string | null;
  joining_date: string | null;
  monthly_remuneration: number;
}

const CrmFacilitators = () => {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAdmin } = useCrmRole();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", assigned_block: "",
    joining_date: "", monthly_remuneration: 0,
  });

  const fetchData = async () => {
    const { data } = await supabase.from("crm_facilitators").select("*").order("created_at", { ascending: false });
    setFacilitators((data as Facilitator[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const { error } = await supabase.from("crm_facilitators").insert({
      ...form,
      joining_date: form.joining_date || null,
      monthly_remuneration: form.monthly_remuneration || 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Facilitator added");
    setDialogOpen(false);
    setForm({ name: "", phone: "", email: "", assigned_block: "", joining_date: "", monthly_remuneration: 0 });
    fetchData();
  };

  const filtered = facilitators.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.assigned_block?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Facilitator Management</h1>
          <p className="text-sm text-muted-foreground">{facilitators.length} facilitators registered</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
          </div>
          {isAdmin() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> Add Facilitator</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Facilitator</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  <div><Label>Assigned Block</Label><Input value={form.assigned_block} onChange={e => setForm({...form, assigned_block: e.target.value})} /></div>
                  <div><Label>Joining Date</Label><Input type="date" value={form.joining_date} onChange={e => setForm({...form, joining_date: e.target.value})} /></div>
                  <div className="col-span-2"><Label>Monthly Remuneration (₹)</Label><Input type="number" value={form.monthly_remuneration} onChange={e => setForm({...form, monthly_remuneration: +e.target.value})} /></div>
                </div>
                <Button className="w-full mt-4" onClick={handleSubmit}>Add Facilitator</Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead className="text-right">Remuneration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No facilitators found</TableCell></TableRow>
                ) : (
                  filtered.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{f.email || "—"}</TableCell>
                      <TableCell>{f.assigned_block || "—"}</TableCell>
                      <TableCell>{f.joining_date || "—"}</TableCell>
                      <TableCell className="text-right">₹{f.monthly_remuneration?.toLocaleString()}</TableCell>
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

export default CrmFacilitators;
