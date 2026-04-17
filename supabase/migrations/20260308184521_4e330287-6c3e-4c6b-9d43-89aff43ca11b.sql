
-- Projects table
CREATE TABLE public.hr_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  priority text DEFAULT 'medium',
  department_id uuid REFERENCES public.hr_departments(id),
  project_lead_id uuid REFERENCES public.hr_employees(id),
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  progress integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Project members junction
CREATE TABLE public.hr_project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.hr_projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id),
  role text DEFAULT 'member',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

-- Tasks table
CREATE TABLE public.hr_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.hr_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES public.hr_employees(id),
  due_date date,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_tasks ENABLE ROW LEVEL SECURITY;

-- RLS for hr_projects
CREATE POLICY "HR admin can manage projects" ON public.hr_projects FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage projects" ON public.hr_projects FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view projects" ON public.hr_projects FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS for hr_project_members
CREATE POLICY "HR admin can manage project members" ON public.hr_project_members FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage project members" ON public.hr_project_members FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view project members" ON public.hr_project_members FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS for hr_tasks
CREATE POLICY "HR admin can manage tasks" ON public.hr_tasks FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage tasks" ON public.hr_tasks FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "Employees can update assigned tasks" ON public.hr_tasks FOR UPDATE TO authenticated
  USING (assigned_to IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "HR users can view tasks" ON public.hr_tasks FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_hr_projects_updated_at BEFORE UPDATE ON public.hr_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_tasks_updated_at BEFORE UPDATE ON public.hr_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
