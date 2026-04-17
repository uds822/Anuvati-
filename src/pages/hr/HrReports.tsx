import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, Users, Clock, Wallet, FolderKanban, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = "employees" | "attendance" | "leave" | "payroll" | "projects" | "volunteers";

const HrReports = () => {
  const [reportType, setReportType] = useState<ReportType>("employees");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ employees: 0, volunteers: 0, projects: 0, payslips: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [emp, vol, proj, pay] = await Promise.all([
        supabase.from("hr_employees").select("id", { count: "exact", head: true }),
        supabase.from("hr_volunteers").select("id", { count: "exact", head: true }),
        supabase.from("hr_projects").select("id", { count: "exact", head: true }),
        supabase.from("hr_payslips").select("id", { count: "exact", head: true }),
      ]);
      setStats({ employees: emp.count || 0, volunteers: vol.count || 0, projects: proj.count || 0, payslips: pay.count || 0 });
    };
    fetchStats();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    let result;
    switch (reportType) {
      case "employees":
        result = await supabase.from("hr_employees").select("employee_id, full_name, email, designation, employment_type, employment_status, joining_date").order("full_name");
        break;
      case "attendance":
        result = await supabase.from("hr_attendance").select("date, status, work_mode, check_in, check_out, hr_employees(full_name)").order("date", { ascending: false }).limit(200);
        break;
      case "leave":
        result = await supabase.from("hr_leave_requests").select("start_date, end_date, total_days, status, reason, hr_employees!hr_leave_requests_employee_id_fkey(full_name), hr_leave_types(name)").order("created_at", { ascending: false }).limit(200);
        break;
      case "payroll":
        result = await supabase.from("hr_payslips").select("month, year, basic_salary, total_earnings, total_deductions, net_salary, status, hr_employees(full_name)").order("year", { ascending: false }).limit(200);
        break;
      case "projects":
        result = await supabase.from("hr_projects").select("name, status, priority, progress, start_date, end_date, budget").order("created_at", { ascending: false });
        break;
      case "volunteers":
        result = await supabase.from("hr_volunteers").select("full_name, email, status, total_hours, city, state, joined_at").order("created_at", { ascending: false });
        break;
    }
    setData(result?.data || []);
    setLoading(false);
  };

  const exportCSV = () => {
    if (!data.length) return;
    const flatData = data.map(row => {
      const flat: any = {};
      Object.entries(row).forEach(([k, v]) => {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          Object.entries(v as any).forEach(([sk, sv]) => flat[`${k}_${sk}`] = sv);
        } else flat[k] = v;
      });
      return flat;
    });
    const headers = Object.keys(flatData[0]);
    const csv = [headers.join(","), ...flatData.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `hr_${reportType}_report.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportPDF = () => {
    if (!data.length) return;
    const flatData = data.map(row => {
      const flat: any = {};
      Object.entries(row).forEach(([k, v]) => {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          Object.entries(v as any).forEach(([sk, sv]) => flat[`${k}_${sk}`] = sv);
        } else flat[k] = v;
      });
      return flat;
    });
    const headers = Object.keys(flatData[0]);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()} | Anuvati Global Development Initiative`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [headers.map(h => h.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))],
      body: flatData.map(r => headers.map(h => String(r[h] ?? "—"))),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [139, 35, 49] },
    });
    doc.save(`hr_${reportType}_report.pdf`);
    toast.success("PDF exported");
  };

  const columns: Record<ReportType, string[]> = {
    employees: ["employee_id", "full_name", "email", "designation", "employment_type", "employment_status", "joining_date"],
    attendance: ["hr_employees.full_name", "date", "status", "work_mode", "check_in", "check_out"],
    leave: ["hr_employees.full_name", "hr_leave_types.name", "start_date", "end_date", "total_days", "status"],
    payroll: ["hr_employees.full_name", "month", "year", "basic_salary", "total_earnings", "total_deductions", "net_salary", "status"],
    projects: ["name", "status", "priority", "progress", "start_date", "end_date", "budget"],
    volunteers: ["full_name", "email", "status", "total_hours", "city", "state", "joined_at"],
  };

  const getCellValue = (row: any, col: string) => {
    if (col.includes(".")) { const [p, c] = col.split("."); return row[p]?.[c] ?? "—"; }
    return row[col] ?? "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and export HR reports in CSV and PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.employees}</p><p className="text-sm text-muted-foreground">Employees</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.volunteers}</p><p className="text-sm text-muted-foreground">Volunteers</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FolderKanban className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.projects}</p><p className="text-sm text-muted-foreground">Projects</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Wallet className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.payslips}</p><p className="text-sm text-muted-foreground">Payslips</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={reportType} onValueChange={v => { setReportType(v as ReportType); setData([]); }}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employees">Employee Report</SelectItem>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="leave">Leave Report</SelectItem>
                <SelectItem value="payroll">Payroll Report</SelectItem>
                <SelectItem value="projects">Project Report</SelectItem>
                <SelectItem value="volunteers">Volunteer Report</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={loading}><BarChart3 className="h-4 w-4 mr-2" />{loading ? "Generating..." : "Generate"}</Button>
            {data.length > 0 && (
              <>
                <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
                <Button variant="outline" onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
              </>
            )}
          </div>
        </CardHeader>
        {data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {columns[reportType].map(col => <TableHead key={col}>{col.includes(".") ? col.split(".")[1] : col.replace(/_/g, " ")}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {columns[reportType].map(col => <TableCell key={col}>{String(getCellValue(row, col))}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data.length === 0 && !loading && (
          <CardContent><p className="text-muted-foreground text-center py-8">Select a report type and click Generate</p></CardContent>
        )}
      </Card>
    </div>
  );
};

export default HrReports;
