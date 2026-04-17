import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = "schools" | "sessions" | "attendance" | "payments" | "issues" | "facilitators";

const reportOptions: { value: ReportType; label: string; description: string }[] = [
  { value: "schools", label: "School Registry", description: "All onboarded schools with infrastructure details" },
  { value: "facilitators", label: "Facilitator List", description: "All facilitators with assignments and remuneration" },
  { value: "sessions", label: "Session Reports", description: "All session reports with attendance counts" },
  { value: "attendance", label: "Field Visit Log", description: "Facilitator check-in/check-out records" },
  { value: "payments", label: "Payment Ledger", description: "All payment transactions" },
  { value: "issues", label: "Issue Tracker", description: "All reported issues with status" },
];

const CrmReports = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>("schools");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const [s, f, sr, a, p, i] = await Promise.all([
        supabase.from("crm_schools").select("id", { count: "exact", head: true }),
        supabase.from("crm_facilitators").select("id", { count: "exact", head: true }),
        supabase.from("crm_session_reports").select("id", { count: "exact", head: true }),
        supabase.from("crm_attendance").select("id", { count: "exact", head: true }),
        supabase.from("crm_payments").select("id", { count: "exact", head: true }),
        supabase.from("crm_issues").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        schools: s.count || 0, facilitators: f.count || 0, sessions: sr.count || 0,
        attendance: a.count || 0, payments: p.count || 0, issues: i.count || 0,
      });
    };
    fetchCounts();
  }, []);

  const fetchReportData = async (type: ReportType) => {
    setLoading(true);
    let result;
    switch (type) {
      case "schools":
        result = await supabase.from("crm_schools").select("school_name, udise_code, village, block, district, state, school_type, headmaster_name, contact_number, num_teachers, total_students, drinking_water, functional_toilets, handwashing_station, waste_management").order("school_name");
        break;
      case "facilitators":
        result = await supabase.from("crm_facilitators").select("name, phone, email, assigned_block, joining_date, monthly_remuneration").order("name");
        break;
      case "sessions":
        result = await supabase.from("crm_session_reports").select("session_date, session_module, students_present, teachers_present, activities_conducted, challenges_faced, issue_reported").order("session_date", { ascending: false });
        break;
      case "attendance":
        result = await supabase.from("crm_attendance").select("visit_date, check_in_time, check_out_time, gps_lat, gps_lng").order("visit_date", { ascending: false });
        break;
      case "payments":
        result = await supabase.from("crm_payments").select("month, amount, payment_date, payment_mode, reference_number").order("created_at", { ascending: false });
        break;
      case "issues":
        result = await supabase.from("crm_issues").select("category, description, priority, status, created_at, updated_at").order("created_at", { ascending: false });
        break;
    }
    setData(result?.data || []);
    setLoading(false);
    return result?.data || [];
  };

  const exportExcel = async () => {
    const rows = await fetchReportData(selectedReport);
    if (!rows.length) { toast.error("No data to export"); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedReport);
    XLSX.writeFile(wb, `WASH_CRM_${selectedReport}_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel file downloaded");
  };

  const exportCSV = async () => {
    const rows = await fetchReportData(selectedReport);
    if (!rows.length) { toast.error("No data to export"); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WASH_CRM_${selectedReport}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded");
  };

  const exportPDF = async () => {
    const rows = await fetchReportData(selectedReport);
    if (!rows.length) { toast.error("No data to export"); return; }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(`WASH Program - ${reportOptions.find(r => r.value === selectedReport)?.label}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const headers = Object.keys(rows[0]);
    const body = rows.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === "boolean") return val ? "Yes" : "No";
      return val?.toString() || "—";
    }));

    autoTable(doc, {
      head: [headers.map(h => h.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))],
      body,
      startY: 34,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [140, 30, 60] },
    });

    doc.save(`WASH_CRM_${selectedReport}_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF file downloaded");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reports & Data Export</h1>
        <p className="text-sm text-muted-foreground">Generate and download program reports</p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {reportOptions.map(r => (
          <Card
            key={r.value}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedReport === r.value ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedReport(r.value)}
          >
            <CardContent className="p-4">
              <p className="font-heading font-semibold text-sm text-foreground">{r.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
              <p className="text-lg font-bold text-primary mt-2">{counts[r.value] ?? "—"} records</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading">
            Export: {reportOptions.find(r => r.value === selectedReport)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportExcel} disabled={loading} className="gap-2" variant="outline">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              {loading ? "Generating..." : "Export Excel (.xlsx)"}
            </Button>
            <Button onClick={exportCSV} disabled={loading} className="gap-2" variant="outline">
              <File className="h-4 w-4 text-blue-600" />
              {loading ? "Generating..." : "Export CSV"}
            </Button>
            <Button onClick={exportPDF} disabled={loading} className="gap-2" variant="outline">
              <FileText className="h-4 w-4 text-destructive" />
              {loading ? "Generating..." : "Export PDF"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Reports include all records visible to your role. Data is generated in real-time from the database.
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Preview ({data.length} rows)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {Object.keys(data[0]).map(k => (
                      <th key={k} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                        {k.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                          {typeof val === "boolean" ? (val ? "Yes" : "No") : val?.toString() || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 20 && (
                <p className="text-xs text-muted-foreground text-center py-3">Showing 20 of {data.length} rows. Export for full data.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrmReports;
