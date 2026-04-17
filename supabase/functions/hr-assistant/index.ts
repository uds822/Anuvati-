import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user auth
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseUser.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check HR role
    const { data: hrRoles } = await supabaseUser
      .from("hr_user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!hrRoles || hrRoles.length === 0) {
      return new Response(JSON.stringify({ error: "No HR access" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context_type } = await req.json();

    // Gather HR context data
    const [
      { data: employees },
      { data: departments },
      { data: leaveRequests },
      { data: attendance },
      { data: projects },
      { data: tasks },
      { data: leaveTypes },
      { data: jobPostings },
    ] = await Promise.all([
      supabaseUser.from("hr_employees").select("id, full_name, employee_id, email, designation, department_id, employment_type, employment_status, joining_date, gender, salary_amount").limit(200),
      supabaseUser.from("hr_departments").select("id, name, description, head_employee_id"),
      supabaseUser.from("hr_leave_requests").select("id, employee_id, leave_type_id, start_date, end_date, total_days, status, reason, created_at").order("created_at", { ascending: false }).limit(100),
      supabaseUser.from("hr_attendance").select("id, employee_id, date, status, check_in, check_out, work_mode").order("date", { ascending: false }).limit(200),
      supabaseUser.from("hr_projects").select("id, name, status, priority, department_id, start_date, end_date, budget, progress").limit(50),
      supabaseUser.from("hr_tasks").select("id, project_id, title, status, priority, assigned_to, due_date").limit(200),
      supabaseUser.from("hr_leave_types").select("id, name, annual_quota"),
      supabaseUser.from("hr_job_postings").select("id, title, status, department_id, positions, employment_type").limit(50),
    ]);

    // Build context summary
    const activeEmployees = (employees || []).filter(e => e.employment_status === "active");
    const deptMap = Object.fromEntries((departments || []).map(d => [d.id, d.name]));
    const empMap = Object.fromEntries((employees || []).map(e => [e.id, e.full_name]));
    const leaveTypeMap = Object.fromEntries((leaveTypes || []).map(t => [t.id, t.name]));

    const pendingLeaves = (leaveRequests || []).filter(l => l.status === "pending");
    const activeProjects = (projects || []).filter(p => p.status === "active");
    const overdueTasks = (tasks || []).filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done");

    const genderDist: Record<string, number> = {};
    activeEmployees.forEach(e => { genderDist[e.gender || "Unknown"] = (genderDist[e.gender || "Unknown"] || 0) + 1; });

    const deptDist: Record<string, number> = {};
    activeEmployees.forEach(e => { deptDist[deptMap[e.department_id] || "Unassigned"] = (deptDist[deptMap[e.department_id] || "Unassigned"] || 0) + 1; });

    const contextSummary = `
## Current HR Data Context (as of ${new Date().toISOString().split("T")[0]})

### Workforce Overview
- Total Active Employees: ${activeEmployees.length}
- Gender Distribution: ${Object.entries(genderDist).map(([g, c]) => `${g}: ${c}`).join(", ")}
- Department Distribution: ${Object.entries(deptDist).map(([d, c]) => `${d}: ${c}`).join(", ")}
- Employment Types: Full-time: ${activeEmployees.filter(e => e.employment_type === "full_time").length}, Contract: ${activeEmployees.filter(e => e.employment_type === "contract").length}, Volunteer: ${activeEmployees.filter(e => e.employment_type === "volunteer").length}

### Employee Directory
${activeEmployees.map(e => `- ${e.full_name} (${e.employee_id}): ${e.designation || "N/A"}, Dept: ${deptMap[e.department_id] || "N/A"}, Email: ${e.email}`).join("\n")}

### Leave Management
- Leave Types: ${(leaveTypes || []).map(t => `${t.name} (${t.annual_quota} days/year)`).join(", ")}
- Pending Leave Requests: ${pendingLeaves.length}
${pendingLeaves.map(l => `  - ${empMap[l.employee_id] || "Unknown"}: ${leaveTypeMap[l.leave_type_id] || "Unknown"} from ${l.start_date} to ${l.end_date} (${l.total_days} days) - Reason: ${l.reason || "N/A"}`).join("\n")}
- Recent Leave Requests (last 20):
${(leaveRequests || []).slice(0, 20).map(l => `  - ${empMap[l.employee_id] || "Unknown"}: ${leaveTypeMap[l.leave_type_id] || "Unknown"}, ${l.start_date} to ${l.end_date}, Status: ${l.status}`).join("\n")}

### Attendance (Recent)
${(attendance || []).slice(0, 30).map(a => `- ${empMap[a.employee_id] || "Unknown"}: ${a.date} - ${a.status}, Check-in: ${a.check_in || "N/A"}, Mode: ${a.work_mode || "N/A"}`).join("\n")}

### Projects & Tasks
- Active Projects: ${activeProjects.length}
${activeProjects.map(p => `  - ${p.name}: Priority ${p.priority}, Budget ₹${p.budget}, Dept: ${deptMap[p.department_id] || "N/A"}`).join("\n")}
- Total Tasks: ${(tasks || []).length}, Done: ${(tasks || []).filter(t => t.status === "done").length}, Overdue: ${overdueTasks.length}
${overdueTasks.length > 0 ? `- Overdue Tasks:\n${overdueTasks.map(t => `  - "${t.title}" assigned to ${empMap[t.assigned_to] || "Unassigned"}, due ${t.due_date}`).join("\n")}` : ""}

### Recruitment
- Open Job Postings: ${(jobPostings || []).filter(j => j.status === "published").length}
${(jobPostings || []).filter(j => j.status === "published").map(j => `  - ${j.title}: ${j.positions} position(s), ${j.employment_type}`).join("\n")}

### Departments
${(departments || []).map(d => `- ${d.name}: Head - ${empMap[d.head_employee_id] || "Not assigned"}`).join("\n")}
`;

    const systemPrompt = `You are the AI HR Assistant for Anuvati Global Development Initiative. You help HR administrators, managers, and employees with HR-related queries.

You have access to real-time HR data provided below. Use this data to answer questions accurately.

Your capabilities:
1. **Leave Management**: Answer questions about leave balances, pending requests, leave policies
2. **Attendance**: Provide attendance summaries, identify patterns, flag issues
3. **Workforce Analytics**: Generate insights about headcount, gender diversity, department distribution
4. **Project & Task Tracking**: Report on project status, overdue tasks, team workload
5. **Recruitment**: Share info about open positions and hiring pipeline
6. **HR Policies**: Provide guidance on standard NGO HR policies (work hours, code of conduct, anti-harassment, etc.)
7. **Payroll**: Answer salary-related queries for authorized users

Guidelines:
- Be professional, concise, and helpful
- Use bullet points and tables (markdown) for data presentation
- If asked about specific employees, reference them by name
- For policy questions, provide general best-practice guidance aligned with Indian labor law and NGO standards
- If data is insufficient to answer, say so clearly
- Always format currency as ₹ (Indian Rupees)
- When showing dates, use DD MMM YYYY format

${contextSummary}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("hr-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
