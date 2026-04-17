import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, FileDown, Plus, Edit, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  designation: string | null;
  department_id: string | null;
  user_id: string | null;
}

interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  pf_deduction: number;
  tax_deduction: number;
  other_deductions: number;
}

interface Payslip {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  breakdown: any;
  status: string;
  generated_at: string;
}

interface Dept { id: string; name: string; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const HrPayroll = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    employee_id: "",
    basic_salary: "",
    hra: "",
    transport_allowance: "",
    medical_allowance: "",
    special_allowance: "",
    pf_deduction: "",
    tax_deduction: "",
    other_deductions: "",
  });
  const [genMonth, setGenMonth] = useState(MONTHS[new Date().getMonth()]);
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());

  const fetchData = async () => {
    const [{ data: emps }, { data: depts }, { data: structs }, { data: slips }] = await Promise.all([
      supabase.from("hr_employees").select("id, employee_id, full_name, email, designation, department_id, user_id").eq("employment_status", "active").order("full_name"),
      supabase.from("hr_departments").select("id, name"),
      supabase.from("hr_salary_structures").select("*"),
      supabase.from("hr_payslips").select("*").order("year", { ascending: false }).order("month", { ascending: false }),
    ]);
    setEmployees(emps || []);
    setDepartments(depts || []);
    setStructures(structs || []);
    setPayslips(slips || []);
  };

  useEffect(() => { fetchData(); }, []);

  const getEmpName = (id: string) => employees.find((e) => e.id === id)?.full_name || "Unknown";
  const getEmpCode = (id: string) => employees.find((e) => e.id === id)?.employee_id || "";
  const getDeptName = (id: string | null) => departments.find((d) => d.id === id)?.name || "—";

  const resetSalaryForm = () => {
    setSalaryForm({ employee_id: "", basic_salary: "", hra: "", transport_allowance: "", medical_allowance: "", special_allowance: "", pf_deduction: "", tax_deduction: "", other_deductions: "" });
    setEditingStructure(null);
  };

  const openEditSalary = (s: SalaryStructure) => {
    setEditingStructure(s);
    setSalaryForm({
      employee_id: s.employee_id,
      basic_salary: String(s.basic_salary),
      hra: String(s.hra),
      transport_allowance: String(s.transport_allowance),
      medical_allowance: String(s.medical_allowance),
      special_allowance: String(s.special_allowance),
      pf_deduction: String(s.pf_deduction),
      tax_deduction: String(s.tax_deduction),
      other_deductions: String(s.other_deductions),
    });
    setSalaryDialogOpen(true);
  };

  const handleSaveSalary = async () => {
    if (!salaryForm.employee_id || !salaryForm.basic_salary) {
      toast({ title: "Error", description: "Employee and basic salary required.", variant: "destructive" });
      return;
    }
    const payload = {
      employee_id: salaryForm.employee_id,
      basic_salary: Number(salaryForm.basic_salary) || 0,
      hra: Number(salaryForm.hra) || 0,
      transport_allowance: Number(salaryForm.transport_allowance) || 0,
      medical_allowance: Number(salaryForm.medical_allowance) || 0,
      special_allowance: Number(salaryForm.special_allowance) || 0,
      pf_deduction: Number(salaryForm.pf_deduction) || 0,
      tax_deduction: Number(salaryForm.tax_deduction) || 0,
      other_deductions: Number(salaryForm.other_deductions) || 0,
    };

    if (editingStructure) {
      const { error } = await supabase.from("hr_salary_structures").update(payload).eq("id", editingStructure.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("hr_salary_structures").insert(payload);
      if (error) {
        if (error.code === "23505") toast({ title: "Error", description: "Salary structure already exists for this employee.", variant: "destructive" });
        else toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: editingStructure ? "Updated" : "Created" });
    setSalaryDialogOpen(false);
    resetSalaryForm();
    fetchData();
  };

  const handleGeneratePayslips = async () => {
    const year = Number(genYear);
    if (!year) return;

    let generated = 0;
    for (const s of structures) {
      const earnings = Number(s.basic_salary) + Number(s.hra) + Number(s.transport_allowance) + Number(s.medical_allowance) + Number(s.special_allowance);
      const deductions = Number(s.pf_deduction) + Number(s.tax_deduction) + Number(s.other_deductions);
      const net = earnings - deductions;

      const { error } = await supabase.from("hr_payslips").upsert({
        employee_id: s.employee_id,
        month: genMonth,
        year,
        basic_salary: Number(s.basic_salary),
        total_earnings: earnings,
        total_deductions: deductions,
        net_salary: net,
        status: "generated",
        generated_by: user?.id,
        breakdown: {
          basic: Number(s.basic_salary),
          hra: Number(s.hra),
          transport: Number(s.transport_allowance),
          medical: Number(s.medical_allowance),
          special: Number(s.special_allowance),
          pf: Number(s.pf_deduction),
          tax: Number(s.tax_deduction),
          other_ded: Number(s.other_deductions),
        },
      }, { onConflict: "employee_id,month,year" });

      if (!error) generated++;
    }
    toast({ title: "Payslips Generated", description: `${generated} payslips generated for ${genMonth} ${year}` });
    setGenDialogOpen(false);
    fetchData();
  };

  const downloadPayslipPDF = (slip: Payslip) => {
    const emp = employees.find((e) => e.id === slip.employee_id);
    const doc = new jsPDF();
    const bd = slip.breakdown || {};

    // Header
    doc.setFontSize(18);
    doc.setTextColor(139, 35, 65); // primary color
    doc.text("ANUVATI GLOBAL DEVELOPMENT INITIATIVE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Payslip", 105, 28, { align: "center" });

    doc.setDrawColor(139, 35, 65);
    doc.line(15, 32, 195, 32);

    // Employee Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Employee: ${emp?.full_name || "N/A"}`, 15, 42);
    doc.text(`Employee ID: ${emp?.employee_id || "N/A"}`, 15, 48);
    doc.text(`Designation: ${emp?.designation || "N/A"}`, 15, 54);
    doc.text(`Department: ${getDeptName(emp?.department_id || null)}`, 15, 60);
    doc.text(`Month: ${slip.month} ${slip.year}`, 140, 42);
    doc.text(`Generated: ${format(new Date(slip.generated_at), "dd MMM yyyy")}`, 140, 48);

    // Earnings table
    autoTable(doc, {
      startY: 70,
      head: [["Earnings", "Amount (₹)"]],
      body: [
        ["Basic Salary", `₹${Number(bd.basic || 0).toLocaleString("en-IN")}`],
        ["HRA", `₹${Number(bd.hra || 0).toLocaleString("en-IN")}`],
        ["Transport Allowance", `₹${Number(bd.transport || 0).toLocaleString("en-IN")}`],
        ["Medical Allowance", `₹${Number(bd.medical || 0).toLocaleString("en-IN")}`],
        ["Special Allowance", `₹${Number(bd.special || 0).toLocaleString("en-IN")}`],
        [{ content: "Total Earnings", styles: { fontStyle: "bold" } }, { content: `₹${Number(slip.total_earnings).toLocaleString("en-IN")}`, styles: { fontStyle: "bold" } }],
      ],
      theme: "grid",
      headStyles: { fillColor: [139, 35, 65] },
    });

    // Deductions table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: finalY,
      head: [["Deductions", "Amount (₹)"]],
      body: [
        ["PF Deduction", `₹${Number(bd.pf || 0).toLocaleString("en-IN")}`],
        ["Tax Deduction", `₹${Number(bd.tax || 0).toLocaleString("en-IN")}`],
        ["Other Deductions", `₹${Number(bd.other_ded || 0).toLocaleString("en-IN")}`],
        [{ content: "Total Deductions", styles: { fontStyle: "bold" } }, { content: `₹${Number(slip.total_deductions).toLocaleString("en-IN")}`, styles: { fontStyle: "bold" } }],
      ],
      theme: "grid",
      headStyles: { fillColor: [200, 80, 50] },
    });

    // Net salary
    const finalY2 = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(139, 35, 65);
    doc.text(`Net Salary: ₹${Number(slip.net_salary).toLocaleString("en-IN")}`, 105, finalY2, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a system-generated document.", 105, 285, { align: "center" });

    doc.save(`Payslip_${emp?.employee_id || "EMP"}_${slip.month}_${slip.year}.pdf`);
  };

  const fmtCurrency = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground">Manage salary structures and generate payslips</p>
        </div>
        {isHrAdmin() && (
          <div className="flex gap-2">
            <Dialog open={salaryDialogOpen} onOpenChange={(open) => { setSalaryDialogOpen(open); if (!open) resetSalaryForm(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Salary Structure</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingStructure ? "Edit Salary Structure" : "New Salary Structure"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Employee *</Label>
                    <Select value={salaryForm.employee_id} onValueChange={(v) => setSalaryForm({ ...salaryForm, employee_id: v })} disabled={!!editingStructure}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm font-medium text-foreground">Earnings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Basic Salary *</Label><Input type="number" value={salaryForm.basic_salary} onChange={(e) => setSalaryForm({ ...salaryForm, basic_salary: e.target.value })} /></div>
                    <div><Label>HRA</Label><Input type="number" value={salaryForm.hra} onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })} /></div>
                    <div><Label>Transport</Label><Input type="number" value={salaryForm.transport_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, transport_allowance: e.target.value })} /></div>
                    <div><Label>Medical</Label><Input type="number" value={salaryForm.medical_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, medical_allowance: e.target.value })} /></div>
                    <div><Label>Special</Label><Input type="number" value={salaryForm.special_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, special_allowance: e.target.value })} /></div>
                  </div>
                  <p className="text-sm font-medium text-foreground">Deductions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>PF</Label><Input type="number" value={salaryForm.pf_deduction} onChange={(e) => setSalaryForm({ ...salaryForm, pf_deduction: e.target.value })} /></div>
                    <div><Label>Tax</Label><Input type="number" value={salaryForm.tax_deduction} onChange={(e) => setSalaryForm({ ...salaryForm, tax_deduction: e.target.value })} /></div>
                    <div><Label>Other</Label><Input type="number" value={salaryForm.other_deductions} onChange={(e) => setSalaryForm({ ...salaryForm, other_deductions: e.target.value })} /></div>
                  </div>
                  <Button onClick={handleSaveSalary}>{editingStructure ? "Update" : "Save"}</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Zap className="h-4 w-4" />Generate Payslips</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Generate Payslips</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-sm text-muted-foreground">This will generate payslips for all employees with salary structures.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Month</Label>
                      <Select value={genMonth} onValueChange={setGenMonth}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{structures.length} salary structures found</p>
                  <Button onClick={handleGeneratePayslips} disabled={structures.length === 0}>Generate {structures.length} Payslips</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{structures.length}</div>
            <div className="text-xs text-muted-foreground">Salary Structures</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{payslips.length}</div>
            <div className="text-xs text-muted-foreground">Total Payslips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {fmtCurrency(structures.reduce((s, st) => s + Number(st.basic_salary) + Number(st.hra) + Number(st.transport_allowance) + Number(st.medical_allowance) + Number(st.special_allowance) - Number(st.pf_deduction) - Number(st.tax_deduction) - Number(st.other_deductions), 0))}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Payroll</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{employees.length - structures.length}</div>
            <div className="text-xs text-muted-foreground">Without Salary</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value="structures">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead className="hidden md:table-cell">HRA</TableHead>
                    <TableHead className="hidden lg:table-cell">Allowances</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead className="hidden md:table-cell">Deductions</TableHead>
                    <TableHead>Net</TableHead>
                    {isHrAdmin() && <TableHead>Edit</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structures.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No salary structures yet</TableCell></TableRow>
                  ) : (
                    structures.map((s) => {
                      const earnings = Number(s.basic_salary) + Number(s.hra) + Number(s.transport_allowance) + Number(s.medical_allowance) + Number(s.special_allowance);
                      const deductions = Number(s.pf_deduction) + Number(s.tax_deduction) + Number(s.other_deductions);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-medium">{getEmpName(s.employee_id)}</div>
                            <div className="text-xs text-muted-foreground">{getEmpCode(s.employee_id)}</div>
                          </TableCell>
                          <TableCell>{fmtCurrency(Number(s.basic_salary))}</TableCell>
                          <TableCell className="hidden md:table-cell">{fmtCurrency(Number(s.hra))}</TableCell>
                          <TableCell className="hidden lg:table-cell">{fmtCurrency(Number(s.transport_allowance) + Number(s.medical_allowance) + Number(s.special_allowance))}</TableCell>
                          <TableCell className="font-medium text-green-700">{fmtCurrency(earnings)}</TableCell>
                          <TableCell className="hidden md:table-cell text-destructive">{fmtCurrency(deductions)}</TableCell>
                          <TableCell className="font-bold">{fmtCurrency(earnings - deductions)}</TableCell>
                          {isHrAdmin() && (
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => openEditSalary(s)}><Edit className="h-4 w-4" /></Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead className="hidden md:table-cell">Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payslips generated yet</TableCell></TableRow>
                  ) : (
                    payslips.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{getEmpName(p.employee_id)}</div>
                          <div className="text-xs text-muted-foreground">{getEmpCode(p.employee_id)}</div>
                        </TableCell>
                        <TableCell>{p.month} {p.year}</TableCell>
                        <TableCell className="text-green-700">{fmtCurrency(Number(p.total_earnings))}</TableCell>
                        <TableCell className="hidden md:table-cell text-destructive">{fmtCurrency(Number(p.total_deductions))}</TableCell>
                        <TableCell className="font-bold">{fmtCurrency(Number(p.net_salary))}</TableCell>
                        <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => downloadPayslipPDF(p)}>
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrPayroll;
