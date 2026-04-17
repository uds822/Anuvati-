import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, FileText, GraduationCap, Image, AlertTriangle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const CrmFunder = () => {
  const [stats, setStats] = useState({ schools: 0, facilitators: 0, sessions: 0, students: 0, teachers: 0, issues: 0 });
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [s, f, sr, i] = await Promise.all([
        supabase.from("crm_schools").select("id", { count: "exact", head: true }),
        supabase.from("crm_facilitators").select("id", { count: "exact", head: true }),
        supabase.from("crm_session_reports").select("students_present, teachers_present, session_date"),
        supabase.from("crm_issues").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      const sessData = sr.data || [];
      setSessions(sessData);
      setStats({
        schools: s.count || 0,
        facilitators: f.count || 0,
        sessions: sessData.length,
        students: sessData.reduce((sum, r) => sum + (r.students_present || 0), 0),
        teachers: sessData.reduce((sum, r) => sum + (r.teachers_present || 0), 0),
        issues: i.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const monthlyData = sessions.reduce((acc: any[], s) => {
    const month = s.session_date?.substring(0, 7);
    if (!month) return acc;
    const existing = acc.find(a => a.month === month);
    if (existing) { existing.sessions++; existing.students += s.students_present || 0; }
    else acc.push({ month, sessions: 1, students: s.students_present || 0 });
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  const chartConfig = { sessions: { label: "Sessions", color: "hsl(var(--primary))" }, students: { label: "Students", color: "hsl(var(--secondary))" } };

  const cards = [
    { label: "Schools", value: stats.schools, icon: School, color: "text-primary" },
    { label: "Facilitators", value: stats.facilitators, icon: Users, color: "text-secondary" },
    { label: "Sessions", value: stats.sessions, icon: FileText, color: "text-primary" },
    { label: "Students Reached", value: stats.students, icon: GraduationCap, color: "text-secondary" },
    { label: "Teachers Engaged", value: stats.teachers, icon: Users, color: "text-primary" },
    { label: "Open Issues", value: stats.issues, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Funder Portal</h1>
        <p className="text-sm text-muted-foreground">Read-only overview of WASH program progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <c.icon className={`h-5 w-5 ${c.color} mb-2`} />
              <p className="text-2xl font-heading font-bold text-foreground">{loading ? "—" : c.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-heading">Monthly Progress</CardTitle></CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="students" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No session data available yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            This portal provides read-only access to program data. Personal student information is not accessible through this view.
            For detailed reports, please use the Reports section or contact the program administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmFunder;
