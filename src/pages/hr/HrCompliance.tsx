import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const HrCompliance = () => {
  const { isHrAdmin } = useHrRole();
  const [policies, setPolicies] = useState<any[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [polRes, ackRes, empRes] = await Promise.all([
      supabase.from("hr_policies").select("*").eq("requires_acknowledgement", true).eq("is_active", true),
      supabase.from("hr_policy_acknowledgements").select("*, hr_policies(title), hr_employees(full_name)"),
      supabase.from("hr_employees").select("id, full_name").eq("employment_status", "active"),
    ]);
    setPolicies(polRes.data || []);
    setAcknowledgements(ackRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getComplianceRate = (policyId: string) => {
    if (!employees.length) return 0;
    const acked = acknowledgements.filter(a => a.policy_id === policyId).length;
    return Math.round((acked / employees.length) * 100);
  };

  const overallCompliance = policies.length ? Math.round(policies.reduce((sum, p) => sum + getComplianceRate(p.id), 0) / policies.length) : 100;
  const fullyCompliant = policies.filter(p => getComplianceRate(p.id) === 100).length;
  const needsAttention = policies.filter(p => getComplianceRate(p.id) < 80).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Track policy acknowledgements and regulatory compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{overallCompliance}%</p><p className="text-sm text-muted-foreground">Overall Compliance</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileCheck className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{policies.length}</p><p className="text-sm text-muted-foreground">Required Policies</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{fullyCompliant}</p><p className="text-sm text-muted-foreground">Fully Compliant</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{needsAttention}</p><p className="text-sm text-muted-foreground">Needs Attention</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Policy Compliance Status</CardTitle></CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No policies requiring acknowledgement. Add policies in the HR Policies module and mark them as requiring acknowledgement.</p>
          ) : (
            <div className="space-y-4">
              {policies.map(p => {
                const rate = getComplianceRate(p.id);
                const acked = acknowledgements.filter(a => a.policy_id === p.id).length;
                return (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">v{p.version} · {p.category}</p>
                      </div>
                      <Badge variant={rate === 100 ? "default" : rate >= 80 ? "secondary" : "destructive"}>
                        {acked}/{employees.length} acknowledged
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={rate} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Acknowledgements</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {acknowledgements.slice(0, 20).map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.hr_employees?.full_name || "—"}</TableCell>
                <TableCell>{a.hr_policies?.title || "—"}</TableCell>
                <TableCell>{new Date(a.acknowledged_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {acknowledgements.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No acknowledgements yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default HrCompliance;
