import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Laptop, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const assetTypes = ["Laptop", "Tablet", "Mobile", "Camera", "Vehicle", "ID Card", "Projector", "Other"];
const conditions = ["new", "good", "fair", "poor", "damaged"];
const statuses = ["available", "assigned", "maintenance", "retired"];

const HrAssets = () => {
  const { isHrAdmin } = useHrRole();
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ asset_id: "", asset_type: "Laptop", brand: "", model: "", serial_number: "", purchase_date: "", purchase_cost: "", condition: "new", assigned_to: "", notes: "" });

  const fetchData = async () => {
    const [assetsRes, empRes] = await Promise.all([
      supabase.from("hr_assets").select("*, hr_employees(full_name)").order("created_at", { ascending: false }),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setAssets(assetsRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("hr_assets").insert({
      asset_id: form.asset_id,
      asset_type: form.asset_type,
      brand: form.brand || null,
      model: form.model || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : 0,
      condition: form.condition,
      assigned_to: form.assigned_to || null,
      assigned_date: form.assigned_to ? new Date().toISOString().split("T")[0] : null,
      status: form.assigned_to ? "assigned" : "available",
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Asset added");
    setDialogOpen(false);
    setForm({ asset_id: "", asset_type: "Laptop", brand: "", model: "", serial_number: "", purchase_date: "", purchase_cost: "", condition: "new", assigned_to: "", notes: "" });
    fetchData();
  };

  const returnAsset = async (id: string) => {
    const { error } = await supabase.from("hr_assets").update({ assigned_to: null, return_date: new Date().toISOString().split("T")[0], status: "available" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Asset returned");
    fetchData();
  };

  const available = assets.filter(a => a.status === "available").length;
  const assigned = assets.filter(a => a.status === "assigned").length;
  const maintenance = assets.filter(a => a.status === "maintenance").length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground">Track organizational assets and assignments</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Asset</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Asset ID</Label><Input value={form.asset_id} onChange={e => setForm(p => ({ ...p, asset_id: e.target.value }))} placeholder="AST-001" /></div>
                  <div><Label>Type</Label>
                    <Select value={form.asset_type} onValueChange={v => setForm(p => ({ ...p, asset_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{assetTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} /></div>
                  <div><Label>Model</Label><Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} /></div>
                </div>
                <div><Label>Serial Number</Label><Input value={form.serial_number} onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} /></div>
                  <div><Label>Cost (₹)</Label><Input type="number" value={form.purchase_cost} onChange={e => setForm(p => ({ ...p, purchase_cost: e.target.value }))} /></div>
                </div>
                <div><Label>Condition</Label>
                  <Select value={form.condition} onValueChange={v => setForm(p => ({ ...p, condition: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Assign To (optional)</Label>
                  <Select value={form.assigned_to || "none"} onValueChange={v => setForm(p => ({ ...p, assigned_to: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Unassigned</SelectItem>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={!form.asset_id || !form.asset_type} className="w-full">Add Asset</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{assets.length}</p><p className="text-sm text-muted-foreground">Total Assets</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{available}</p><p className="text-sm text-muted-foreground">Available</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Laptop className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{assigned}</p><p className="text-sm text-muted-foreground">Assigned</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{maintenance}</p><p className="text-sm text-muted-foreground">Maintenance</p></div></div></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Brand/Model</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              {isHrAdmin() && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-mono">{a.asset_id}</TableCell>
                <TableCell>{a.asset_type}</TableCell>
                <TableCell>{[a.brand, a.model].filter(Boolean).join(" ") || "—"}</TableCell>
                <TableCell><Badge variant="outline">{a.condition}</Badge></TableCell>
                <TableCell>{a.hr_employees?.full_name || "—"}</TableCell>
                <TableCell><Badge variant={a.status === "available" ? "default" : a.status === "assigned" ? "secondary" : "destructive"}>{a.status}</Badge></TableCell>
                {isHrAdmin() && (
                  <TableCell>
                    {a.status === "assigned" && <Button size="sm" variant="outline" onClick={() => returnAsset(a.id)}>Return</Button>}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {assets.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No assets registered</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default HrAssets;
