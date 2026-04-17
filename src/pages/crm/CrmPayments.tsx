import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, CreditCard, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  facilitator_id: string;
  month: string;
  amount: number;
  payment_date: string | null;
  payment_mode: string | null;
  reference_number: string | null;
  created_at: string;
}

interface Facilitator {
  id: string;
  name: string;
  monthly_remuneration: number;
}

const CrmPayments = () => {
  const { user } = useAuth();
  const { isAdmin, hasRole } = useCrmRole();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const canManage = isAdmin() || hasRole("finance");

  const [form, setForm] = useState({
    facilitator_id: "", month: "", amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "bank_transfer", reference_number: "",
  });

  const fetchData = async () => {
    const [paymentsRes, facilitatorsRes] = await Promise.all([
      supabase.from("crm_payments").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_facilitators").select("id, name, monthly_remuneration"),
    ]);
    setPayments(paymentsRes.data || []);
    setFacilitators(facilitatorsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.facilitator_id || !form.month) { toast.error("Facilitator and month are required"); return; }
    const { error } = await supabase.from("crm_payments").insert({
      ...form,
      payment_date: form.payment_date || null,
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Payment recorded");
    setDialogOpen(false);
    setForm({ facilitator_id: "", month: "", amount: 0, payment_date: new Date().toISOString().split("T")[0], payment_mode: "bank_transfer", reference_number: "" });
    fetchData();
  };

  const getFacilitatorName = (id: string) => facilitators.find(f => f.id === id)?.name || "—";

  const filtered = payments.filter(p =>
    search ? getFacilitatorName(p.facilitator_id).toLowerCase().includes(search.toLowerCase()) || p.month.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i);
    return { value: `${d.toLocaleString("default", { month: "long" })} 2026`, label: `${d.toLocaleString("default", { month: "long" })} 2026` };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Payments & HR</h1>
          <p className="text-sm text-muted-foreground">Facilitator remuneration management</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          {canManage && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1"><Plus className="h-4 w-4" /> Record Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Record Payment</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Facilitator *</Label>
                    <Select value={form.facilitator_id} onValueChange={v => {
                      const fac = facilitators.find(f => f.id === v);
                      setForm({...form, facilitator_id: v, amount: fac?.monthly_remuneration || 0 });
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select facilitator" /></SelectTrigger>
                      <SelectContent>
                        {facilitators.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Month *</Label>
                      <Select value={form.month} onValueChange={v => setForm({...form, month: v})}>
                        <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                        <SelectContent>
                          {monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Payment Date</Label>
                      <Input type="date" value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} />
                    </div>
                    <div>
                      <Label>Payment Mode</Label>
                      <Select value={form.payment_mode} onValueChange={v => setForm({...form, payment_mode: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Reference Number</Label>
                    <Input value={form.reference_number} onChange={e => setForm({...form, reference_number: e.target.value})} placeholder="Transaction ID / Cheque No." />
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleSubmit}>Record Payment</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><IndianRupee className="h-4 w-4 text-primary" /></div>
            <p className="text-2xl font-heading font-bold text-foreground">₹{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><CreditCard className="h-4 w-4 text-secondary" /></div>
            <p className="text-2xl font-heading font-bold text-foreground">{payments.length}</p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><IndianRupee className="h-4 w-4 text-primary" /></div>
            <p className="text-2xl font-heading font-bold text-foreground">{facilitators.length}</p>
            <p className="text-xs text-muted-foreground">Facilitators on Payroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facilitator</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payment records</TableCell></TableRow>
                ) : (
                  filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{getFacilitatorName(p.facilitator_id)}</TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell className="text-right font-mono">₹{p.amount.toLocaleString()}</TableCell>
                      <TableCell>{p.payment_date || "—"}</TableCell>
                      <TableCell className="capitalize">{p.payment_mode?.replace("_", " ") || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.reference_number || "—"}</TableCell>
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

export default CrmPayments;
