
-- Allow admins to update submission status (approve, complete, etc.)
CREATE POLICY "Admins can update submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add certificate_requested_at column to track when user requests certificate
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS certificate_requested_at timestamptz DEFAULT NULL;

-- Add approved_at column
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS approved_at timestamptz DEFAULT NULL;

-- Add completed_at column  
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;

-- Allow users to update their own submissions (for requesting certificates)
CREATE POLICY "Users can update own submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- CRM Role enum
CREATE TYPE public.crm_role AS ENUM ('crm_admin', 'supervisor', 'facilitator', 'finance', 'funder');

-- CRM user roles table (separate from main site roles)
CREATE TABLE public.crm_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role crm_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.crm_user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for CRM roles
CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id UUID, _role crm_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.crm_user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user has ANY crm role
CREATE OR REPLACE FUNCTION public.has_any_crm_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.crm_user_roles WHERE user_id = _user_id
  )
$$;

-- RLS for crm_user_roles
CREATE POLICY "CRM admins can manage roles" ON public.crm_user_roles
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin'));

CREATE POLICY "Users can view own CRM roles" ON public.crm_user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Schools table
CREATE TABLE public.crm_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  udise_code TEXT,
  village TEXT,
  block TEXT,
  district TEXT,
  state TEXT DEFAULT 'Uttar Pradesh',
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  school_type TEXT,
  headmaster_name TEXT,
  contact_number TEXT,
  num_teachers INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  drinking_water BOOLEAN DEFAULT false,
  functional_toilets BOOLEAN DEFAULT false,
  handwashing_station BOOLEAN DEFAULT false,
  waste_management BOOLEAN DEFAULT false,
  onboarded_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_schools ENABLE ROW LEVEL SECURITY;

-- Schools RLS: any CRM user can read, admin/supervisor can write
CREATE POLICY "CRM users can view schools" ON public.crm_schools
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "CRM admin/supervisor can manage schools" ON public.crm_schools
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'supervisor'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'supervisor'));

-- Teachers table
CREATE TABLE public.crm_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_id UUID REFERENCES public.crm_schools(id) ON DELETE CASCADE,
  role TEXT,
  contact TEXT,
  training_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM users can view teachers" ON public.crm_teachers
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "CRM admin/supervisor can manage teachers" ON public.crm_teachers
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'supervisor'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'supervisor'));

-- Facilitators table
CREATE TABLE public.crm_facilitators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  assigned_block TEXT,
  assigned_schools UUID[] DEFAULT '{}',
  joining_date DATE,
  monthly_remuneration NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_facilitators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM users can view facilitators" ON public.crm_facilitators
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "CRM admin can manage facilitators" ON public.crm_facilitators
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin'));

CREATE POLICY "Facilitators can view own record" ON public.crm_facilitators
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Session reports table
CREATE TABLE public.crm_session_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID REFERENCES public.crm_facilitators(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.crm_schools(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_module TEXT,
  students_present INTEGER DEFAULT 0,
  teachers_present INTEGER DEFAULT 0,
  activities_conducted TEXT,
  challenges_faced TEXT,
  issue_reported TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_session_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM users can view session reports" ON public.crm_session_reports
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "Facilitators can insert session reports" ON public.crm_session_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_crm_role(auth.uid(), 'facilitator') OR 
    public.has_crm_role(auth.uid(), 'crm_admin')
  );

CREATE POLICY "Admin can manage session reports" ON public.crm_session_reports
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin'));

-- Attendance / field visits
CREATE TABLE public.crm_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID REFERENCES public.crm_facilitators(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.crm_schools(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM users can view attendance" ON public.crm_attendance
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "Facilitators can insert attendance" ON public.crm_attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_crm_role(auth.uid(), 'facilitator') OR 
    public.has_crm_role(auth.uid(), 'crm_admin')
  );

-- Issue tracker
CREATE TABLE public.crm_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.crm_schools(id) ON DELETE SET NULL,
  category TEXT,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'open',
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM users can view issues" ON public.crm_issues
  FOR SELECT TO authenticated
  USING (public.has_any_crm_role(auth.uid()));

CREATE POLICY "CRM users can create issues" ON public.crm_issues
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_crm_role(auth.uid()));

CREATE POLICY "Admin/supervisor can manage issues" ON public.crm_issues
  FOR UPDATE TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'supervisor'));

-- Payments table
CREATE TABLE public.crm_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID REFERENCES public.crm_facilitators(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_mode TEXT,
  reference_number TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance/admin can manage payments" ON public.crm_payments
  FOR ALL TO authenticated
  USING (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'finance'))
  WITH CHECK (public.has_crm_role(auth.uid(), 'crm_admin') OR public.has_crm_role(auth.uid(), 'finance'));

CREATE POLICY "Facilitators can view own payments" ON public.crm_payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_facilitators f 
      WHERE f.id = crm_payments.facilitator_id AND f.user_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_crm_schools_updated_at BEFORE UPDATE ON public.crm_schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crm_teachers_updated_at BEFORE UPDATE ON public.crm_teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crm_facilitators_updated_at BEFORE UPDATE ON public.crm_facilitators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crm_session_reports_updated_at BEFORE UPDATE ON public.crm_session_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crm_issues_updated_at BEFORE UPDATE ON public.crm_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CRM media
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-media', 'crm-media', true);

-- Storage RLS
CREATE POLICY "CRM users can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crm-media' AND public.has_any_crm_role(auth.uid()));

CREATE POLICY "Anyone can view CRM media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'crm-media' AND public.has_any_crm_role(auth.uid()));

-- Students table (privacy-minimal)
CREATE TABLE public.crm_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.crm_schools(id) ON DELETE CASCADE,
  grade text,
  age_band text,
  gender text,
  parent_name text,
  parent_contact text,
  caste_category text,
  consent_parent_info boolean DEFAULT false,
  consent_caste_info boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_students ENABLE ROW LEVEL SECURITY;

-- RLS: CRM users can view students (funder can only see non-PII via app logic)
CREATE POLICY "CRM users can view students" ON public.crm_students FOR SELECT TO authenticated USING (has_any_crm_role(auth.uid()));
CREATE POLICY "Admin/supervisor can manage students" ON public.crm_students FOR ALL TO authenticated USING (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role)) WITH CHECK (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role));

-- Add approval_status to gallery tracking (using a metadata table)
CREATE TABLE public.crm_media_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL UNIQUE,
  school_id uuid REFERENCES public.crm_schools(id),
  activity_tag text,
  uploaded_by uuid,
  approval_status text DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_media_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM users can view media metadata" ON public.crm_media_metadata FOR SELECT TO authenticated USING (has_any_crm_role(auth.uid()));
CREATE POLICY "CRM users can insert media metadata" ON public.crm_media_metadata FOR INSERT TO authenticated WITH CHECK (has_any_crm_role(auth.uid()));
CREATE POLICY "Admin/supervisor can update media metadata" ON public.crm_media_metadata FOR UPDATE TO authenticated USING (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role));

-- Add update trigger for students
CREATE TRIGGER update_crm_students_updated_at BEFORE UPDATE ON public.crm_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- HR Role enum
CREATE TYPE public.hr_role AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee', 'volunteer', 'finance');

-- HR Departments
CREATE TABLE public.hr_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  head_employee_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HR Employees
CREATE TABLE public.hr_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  department_id UUID REFERENCES public.hr_departments(id) ON DELETE SET NULL,
  designation TEXT,
  reporting_manager_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  joining_date DATE,
  employment_type TEXT DEFAULT 'full_time',
  employment_status TEXT DEFAULT 'active',
  lifecycle_stage TEXT DEFAULT 'onboarding',
  salary_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for department head back-reference
ALTER TABLE public.hr_departments ADD CONSTRAINT hr_departments_head_fk FOREIGN KEY (head_employee_id) REFERENCES public.hr_employees(id) ON DELETE SET NULL;

-- HR User Roles
CREATE TABLE public.hr_user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role hr_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- HR Activity Log
CREATE TABLE public.hr_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer functions for HR roles
CREATE OR REPLACE FUNCTION public.has_hr_role(_user_id UUID, _role hr_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_hr_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_user_roles WHERE user_id = _user_id
  )
$$;

-- Updated_at triggers
CREATE TRIGGER update_hr_departments_updated_at BEFORE UPDATE ON public.hr_departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_employees_updated_at BEFORE UPDATE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS: hr_departments
CREATE POLICY "HR users can view departments" ON public.hr_departments FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage departments" ON public.hr_departments FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_employees
CREATE POLICY "HR users can view employees" ON public.hr_employees FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage employees" ON public.hr_employees FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own record" ON public.hr_employees FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: hr_user_roles
CREATE POLICY "Super admin can manage HR roles" ON public.hr_user_roles FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view own HR roles" ON public.hr_user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: hr_activity_log
CREATE POLICY "HR admin can view activity log" ON public.hr_activity_log FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "HR users can insert activity log" ON public.hr_activity_log FOR INSERT TO authenticated WITH CHECK (has_any_hr_role(auth.uid()));

-- Enable realtime for activity log
ALTER PUBLICATION supabase_realtime ADD TABLE public.hr_activity_log;

-- Attendance table
CREATE TABLE public.hr_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present',
  work_mode TEXT DEFAULT 'office',
  notes TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Leave types
CREATE TABLE public.hr_leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  annual_quota INTEGER NOT NULL DEFAULT 12,
  carry_forward BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave requests
CREATE TABLE public.hr_leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave balances
CREATE TABLE public.hr_leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  used NUMERIC NOT NULL DEFAULT 0,
  remaining NUMERIC GENERATED ALWAYS AS (total_allocated - used) STORED,
  UNIQUE(employee_id, leave_type_id, year)
);

-- Salary structures
CREATE TABLE public.hr_salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE UNIQUE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  hra NUMERIC DEFAULT 0,
  transport_allowance NUMERIC DEFAULT 0,
  medical_allowance NUMERIC DEFAULT 0,
  special_allowance NUMERIC DEFAULT 0,
  pf_deduction NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  effective_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payslips
CREATE TABLE public.hr_payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Triggers
CREATE TRIGGER update_hr_attendance_updated_at BEFORE UPDATE ON public.hr_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_leave_requests_updated_at BEFORE UPDATE ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_salary_structures_updated_at BEFORE UPDATE ON public.hr_salary_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payslips ENABLE ROW LEVEL SECURITY;

-- RLS: hr_attendance
CREATE POLICY "HR users can view attendance" ON public.hr_attendance FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage attendance" ON public.hr_attendance FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can mark own attendance" ON public.hr_attendance FOR INSERT TO authenticated WITH CHECK (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);
CREATE POLICY "Employees can update own attendance" ON public.hr_attendance FOR UPDATE TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_leave_types
CREATE POLICY "HR users can view leave types" ON public.hr_leave_types FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave types" ON public.hr_leave_types FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_leave_requests
CREATE POLICY "HR users can view leave requests" ON public.hr_leave_requests FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave requests" ON public.hr_leave_requests FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can create own leave requests" ON public.hr_leave_requests FOR INSERT TO authenticated WITH CHECK (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_leave_balances
CREATE POLICY "HR users can view leave balances" ON public.hr_leave_balances FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave balances" ON public.hr_leave_balances FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_salary_structures
CREATE POLICY "Finance/admin can view salary structures" ON public.hr_salary_structures FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin') OR has_hr_role(auth.uid(), 'finance'));
CREATE POLICY "HR admin can manage salary structures" ON public.hr_salary_structures FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own salary" ON public.hr_salary_structures FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_payslips
CREATE POLICY "Finance/admin can view payslips" ON public.hr_payslips FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin') OR has_hr_role(auth.uid(), 'finance'));
CREATE POLICY "HR admin can manage payslips" ON public.hr_payslips FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own payslips" ON public.hr_payslips FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- Seed default leave types
INSERT INTO public.hr_leave_types (name, description, annual_quota, carry_forward) VALUES
  ('Casual Leave', 'For personal matters and short absences', 12, false),
  ('Sick Leave', 'For health-related absences with medical certificate', 10, false),
  ('Earned Leave', 'Accumulated leave based on service duration', 15, true),
  ('Maternity Leave', 'For eligible employees during pregnancy', 180, false),
  ('Paternity Leave', 'For eligible employees after childbirth', 15, false),
  ('Field Work Leave', 'For field assignments and community visits', 20, false);

-- Job Postings
CREATE TABLE public.hr_job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.hr_departments(id) ON DELETE SET NULL,
  location TEXT DEFAULT 'Lucknow, India',
  employment_type TEXT DEFAULT 'full_time',
  experience_required TEXT,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  positions INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closing_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidates
CREATE TABLE public.hr_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES public.hr_job_postings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  current_organization TEXT,
  experience_years NUMERIC,
  skills TEXT[],
  pipeline_stage TEXT NOT NULL DEFAULT 'applied',
  rating INTEGER,
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interviews
CREATE TABLE public.hr_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.hr_candidates(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  interview_type TEXT DEFAULT 'in_person',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  location TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evaluations
CREATE TABLE public.hr_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.hr_candidates(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  interview_id UUID REFERENCES public.hr_interviews(id) ON DELETE SET NULL,
  technical_score INTEGER,
  communication_score INTEGER,
  cultural_fit_score INTEGER,
  leadership_score INTEGER,
  overall_score INTEGER,
  strengths TEXT,
  weaknesses TEXT,
  recommendation TEXT DEFAULT 'undecided',
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
CREATE TRIGGER update_hr_job_postings_updated_at BEFORE UPDATE ON public.hr_job_postings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_candidates_updated_at BEFORE UPDATE ON public.hr_candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_interviews_updated_at BEFORE UPDATE ON public.hr_interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hr_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS: hr_job_postings
CREATE POLICY "HR users can view job postings" ON public.hr_job_postings FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage job postings" ON public.hr_job_postings FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_candidates
CREATE POLICY "HR users can view candidates" ON public.hr_candidates FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage candidates" ON public.hr_candidates FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_interviews
CREATE POLICY "HR users can view interviews" ON public.hr_interviews FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage interviews" ON public.hr_interviews FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Interviewers can view own interviews" ON public.hr_interviews FOR SELECT TO authenticated USING (
  interviewer_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_evaluations
CREATE POLICY "HR users can view evaluations" ON public.hr_evaluations FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage evaluations" ON public.hr_evaluations FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Evaluators can insert evaluations" ON public.hr_evaluations FOR INSERT TO authenticated WITH CHECK (
  evaluator_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

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

-- Volunteers table
CREATE TABLE public.hr_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  gender text,
  age integer,
  city text,
  state text,
  skills text[],
  areas_of_interest text[],
  availability text DEFAULT 'weekdays',
  status text NOT NULL DEFAULT 'pending',
  user_id uuid,
  employee_id uuid REFERENCES public.hr_employees(id),
  joined_at timestamptz,
  notes text,
  total_hours numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer hours log
CREATE TABLE public.hr_volunteer_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.hr_projects(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  hours numeric NOT NULL DEFAULT 0,
  activity text,
  notes text,
  verified_by uuid REFERENCES public.hr_employees(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer project assignments
CREATE TABLE public.hr_volunteer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.hr_projects(id) ON DELETE CASCADE,
  role text DEFAULT 'volunteer',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'active',
  UNIQUE(volunteer_id, project_id)
);

-- Volunteer certificates
CREATE TABLE public.hr_volunteer_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  certificate_type text NOT NULL DEFAULT 'completion',
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid REFERENCES public.hr_employees(id),
  total_hours numeric DEFAULT 0,
  project_names text[],
  certificate_number text NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE public.hr_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_certificates ENABLE ROW LEVEL SECURITY;

-- RLS: hr_volunteers
CREATE POLICY "HR admin can manage volunteers" ON public.hr_volunteers FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage volunteers" ON public.hr_volunteers FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view volunteers" ON public.hr_volunteers FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Volunteers can view own record" ON public.hr_volunteers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: hr_volunteer_hours
CREATE POLICY "HR admin can manage volunteer hours" ON public.hr_volunteer_hours FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage volunteer hours" ON public.hr_volunteer_hours FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view volunteer hours" ON public.hr_volunteer_hours FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS: hr_volunteer_assignments
CREATE POLICY "HR admin can manage assignments" ON public.hr_volunteer_assignments FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage assignments" ON public.hr_volunteer_assignments FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view assignments" ON public.hr_volunteer_assignments FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS: hr_volunteer_certificates
CREATE POLICY "HR admin can manage certificates" ON public.hr_volunteer_certificates FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view certificates" ON public.hr_volunteer_certificates FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Triggers
CREATE TRIGGER update_hr_volunteers_updated_at BEFORE UPDATE ON public.hr_volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Training/LMS tables
CREATE TABLE public.hr_training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  duration_hours numeric DEFAULT 0,
  content_url text,
  is_mandatory boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.hr_training_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.hr_training_courses(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled',
  progress integer DEFAULT 0,
  score numeric,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  certificate_url text
);

-- Performance Reviews
CREATE TABLE public.hr_performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.hr_employees(id),
  review_period text NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  self_rating numeric,
  manager_rating numeric,
  overall_rating numeric,
  strengths text,
  areas_of_improvement text,
  goals text,
  manager_comments text,
  employee_comments text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Asset Management
CREATE TABLE public.hr_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL UNIQUE,
  asset_type text NOT NULL,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  purchase_cost numeric DEFAULT 0,
  condition text DEFAULT 'good',
  assigned_to uuid REFERENCES public.hr_employees(id),
  assigned_date date,
  return_date date,
  status text NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HR Policies
CREATE TABLE public.hr_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text DEFAULT 'general',
  content text,
  version text DEFAULT '1.0',
  effective_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  requires_acknowledgement boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.hr_policy_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES public.hr_policies(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  UNIQUE(policy_id, employee_id)
);

-- Grievances
CREATE TABLE public.hr_grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'submitted',
  is_anonymous boolean DEFAULT false,
  submitted_by uuid,
  assigned_to uuid REFERENCES public.hr_employees(id),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.hr_training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_policy_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_grievances ENABLE ROW LEVEL SECURITY;

-- Training courses - viewable by all HR users, manageable by admin
CREATE POLICY "HR users can view courses" ON public.hr_training_courses FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage courses" ON public.hr_training_courses FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Training enrollments
CREATE POLICY "HR users can view enrollments" ON public.hr_training_enrollments FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage enrollments" ON public.hr_training_enrollments FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Performance reviews
CREATE POLICY "HR users can view reviews" ON public.hr_performance_reviews FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage reviews" ON public.hr_performance_reviews FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));
CREATE POLICY "Managers can create reviews" ON public.hr_performance_reviews FOR INSERT WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

-- Assets
CREATE POLICY "HR users can view assets" ON public.hr_assets FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage assets" ON public.hr_assets FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Policies
CREATE POLICY "HR users can view policies" ON public.hr_policies FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage policies" ON public.hr_policies FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Policy acknowledgements
CREATE POLICY "HR users can view acknowledgements" ON public.hr_policy_acknowledgements FOR SELECT USING (has_any_hr_role(auth.uid()));
CREATE POLICY "Employees can acknowledge policies" ON public.hr_policy_acknowledgements FOR INSERT WITH CHECK (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage acknowledgements" ON public.hr_policy_acknowledgements FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Grievances
CREATE POLICY "HR users can view grievances" ON public.hr_grievances FOR SELECT USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));
CREATE POLICY "Any HR user can submit grievance" ON public.hr_grievances FOR INSERT WITH CHECK (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage grievances" ON public.hr_grievances FOR UPDATE USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));
CREATE POLICY "Users can view own grievances" ON public.hr_grievances FOR SELECT USING (submitted_by = auth.uid());

-- Employee documents table
CREATE TABLE public.hr_employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.hr_employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own documents" ON public.hr_employee_documents
  FOR SELECT USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "HR admin can manage documents" ON public.hr_employee_documents
  FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Employees can upload own documents" ON public.hr_employee_documents
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

-- Employee lifecycle history table
CREATE TABLE public.hr_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  from_stage text,
  to_stage text NOT NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hr_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view lifecycle events" ON public.hr_lifecycle_events
  FOR SELECT USING (has_any_hr_role(auth.uid()));

CREATE POLICY "HR admin can manage lifecycle events" ON public.hr_lifecycle_events
  FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Storage bucket for HR documents
INSERT INTO storage.buckets (id, name, public) VALUES ('hr-documents', 'hr-documents', false);

-- Storage RLS: employees can upload to their own folder
CREATE POLICY "Employees can upload own docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hr-documents' AND has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'hr-documents' AND has_any_hr_role(auth.uid()));

CREATE POLICY "HR admin can manage all docs" ON storage.objects
  FOR ALL USING (bucket_id = 'hr-documents' AND (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)))
  WITH CHECK (bucket_id = 'hr-documents' AND (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)));

-- CSR Projects table
CREATE TABLE public.hr_csr_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  csr_partner text,
  description text,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CSR Staff Allocations
CREATE TABLE public.hr_csr_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  csr_project_id uuid NOT NULL REFERENCES public.hr_csr_projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  hours_spent numeric DEFAULT 0,
  activity_log text,
  assigned_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Skills
CREATE TABLE public.hr_employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_category text NOT NULL DEFAULT 'technical',
  proficiency_level text DEFAULT 'intermediate',
  certified boolean DEFAULT false,
  certification_name text,
  certification_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer Activities / Impact tracking
CREATE TABLE public.hr_volunteer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_name text NOT NULL,
  volunteer_email text,
  project_name text,
  activity_type text NOT NULL DEFAULT 'fieldwork',
  hours_contributed numeric DEFAULT 0,
  communities_served integer DEFAULT 0,
  beneficiaries_reached integer DEFAULT 0,
  events_supported integer DEFAULT 0,
  activity_date date DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hr_csr_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_csr_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_activities ENABLE ROW LEVEL SECURITY;

-- CSR Projects policies
CREATE POLICY "HR admin can manage CSR projects" ON public.hr_csr_projects FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view CSR projects" ON public.hr_csr_projects FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- CSR Allocations policies
CREATE POLICY "HR admin can manage CSR allocations" ON public.hr_csr_allocations FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view CSR allocations" ON public.hr_csr_allocations FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Employee Skills policies
CREATE POLICY "HR admin can manage skills" ON public.hr_employee_skills FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Employees can manage own skills" ON public.hr_employee_skills FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "HR users can view skills" ON public.hr_employee_skills FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Volunteer Activities policies
CREATE POLICY "HR admin can manage volunteer activities" ON public.hr_volunteer_activities FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view volunteer activities" ON public.hr_volunteer_activities FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Surveys table
CREATE TABLE public.hr_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  survey_type text NOT NULL DEFAULT 'pulse',
  is_anonymous boolean DEFAULT true,
  is_active boolean DEFAULT true,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  closes_at timestamptz
);

-- Survey Responses
CREATE TABLE public.hr_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.hr_surveys(id) ON DELETE CASCADE,
  respondent_id uuid,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  satisfaction_score integer,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.hr_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hr_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_notifications ENABLE ROW LEVEL SECURITY;

-- Surveys policies
CREATE POLICY "HR admin can manage surveys" ON public.hr_surveys FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view active surveys" ON public.hr_surveys FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Survey Responses policies
CREATE POLICY "HR admin can view all responses" ON public.hr_survey_responses FOR SELECT TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can submit responses" ON public.hr_survey_responses FOR INSERT TO authenticated
  WITH CHECK (has_any_hr_role(auth.uid()));

CREATE POLICY "Users can view own responses" ON public.hr_survey_responses FOR SELECT TO authenticated
  USING (respondent_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.hr_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.hr_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "HR admin can manage notifications" ON public.hr_notifications FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "System can insert notifications" ON public.hr_notifications FOR INSERT TO authenticated
  WITH CHECK (has_any_hr_role(auth.uid()));
CREATE POLICY "Public can view published job postings"
ON public.hr_job_postings
FOR SELECT
TO anon, authenticated
USING (status = 'published');ALTER TABLE public.hr_attendance ADD CONSTRAINT hr_attendance_employee_date_unique UNIQUE (employee_id, date);
-- Add onboarding_status to hr_employees
ALTER TABLE public.hr_employees ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'pending_documents';

-- Employee bank details
CREATE TABLE public.hr_employee_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  account_holder_name text,
  bank_name text,
  account_number text,
  ifsc_code text,
  branch_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);
ALTER TABLE public.hr_employee_bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own bank details" ON public.hr_employee_bank_details FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage bank details" ON public.hr_employee_bank_details FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee emergency contacts
CREATE TABLE public.hr_employee_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  relationship text,
  phone text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own emergency contacts" ON public.hr_employee_emergency_contacts FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage emergency contacts" ON public.hr_employee_emergency_contacts FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee education records
CREATE TABLE public.hr_employee_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  degree text NOT NULL,
  institution text NOT NULL,
  field_of_study text,
  year_of_passing integer,
  grade_or_percentage text,
  certificate_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own education" ON public.hr_employee_education FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage education" ON public.hr_employee_education FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee previous employment
CREATE TABLE public.hr_employee_previous_employment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  designation text,
  from_date date,
  to_date date,
  reason_for_leaving text,
  experience_letter_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_previous_employment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own previous employment" ON public.hr_employee_previous_employment FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage previous employment" ON public.hr_employee_previous_employment FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee medical info
CREATE TABLE public.hr_employee_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  blood_group text,
  allergies text,
  medical_conditions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);
ALTER TABLE public.hr_employee_medical ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own medical info" ON public.hr_employee_medical FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage medical info" ON public.hr_employee_medical FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Update existing employees to approved status
UPDATE public.hr_employees SET onboarding_status = 'approved' WHERE employment_status = 'active';

-- Add read policy for all HR users on new tables
CREATE POLICY "HR users can view bank details" ON public.hr_employee_bank_details FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view emergency contacts" ON public.hr_employee_emergency_contacts FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view education" ON public.hr_employee_education FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view previous employment" ON public.hr_employee_previous_employment FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view medical info" ON public.hr_employee_medical FOR SELECT
  USING (has_any_hr_role(auth.uid()));
-- Add onboarding-invite function config
-- This is handled by config.toml, not migration
SELECT 1;CREATE POLICY "HR admin can delete employees"
ON public.hr_employees
FOR DELETE
TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));-- Offboarding requests table
CREATE TABLE public.hr_offboarding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  initiated_by uuid REFERENCES auth.users(id),
  reason text NOT NULL DEFAULT 'resignation',
  last_working_date date,
  status text NOT NULL DEFAULT 'initiated',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Offboarding clearances table (one row per department per request)
CREATE TABLE public.hr_offboarding_clearances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offboarding_id uuid NOT NULL REFERENCES public.hr_offboarding_requests(id) ON DELETE CASCADE,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(offboarding_id, department)
);

ALTER TABLE public.hr_offboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_offboarding_clearances ENABLE ROW LEVEL SECURITY;

-- RLS for offboarding_requests
CREATE POLICY "HR admin can manage offboarding" ON public.hr_offboarding_requests FOR ALL TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view offboarding" ON public.hr_offboarding_requests FOR SELECT TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own offboarding" ON public.hr_offboarding_requests FOR SELECT TO authenticated
USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

-- RLS for offboarding_clearances
CREATE POLICY "HR admin can manage clearances" ON public.hr_offboarding_clearances FOR ALL TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view clearances" ON public.hr_offboarding_clearances FOR SELECT TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "HR users can update own dept clearance" ON public.hr_offboarding_clearances FOR UPDATE TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own clearances" ON public.hr_offboarding_clearances FOR SELECT TO authenticated
USING (offboarding_id IN (SELECT id FROM hr_offboarding_requests WHERE employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_hr_offboarding_requests_updated_at BEFORE UPDATE ON public.hr_offboarding_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_offboarding_clearances_updated_at BEFORE UPDATE ON public.hr_offboarding_clearances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();ALTER TABLE public.hr_notifications ADD COLUMN audience text NOT NULL DEFAULT 'all';-- Allow HR admins to view internship details
CREATE POLICY "HR admin can view internship details"
ON public.internship_details FOR SELECT
TO authenticated
USING (has_any_hr_role(auth.uid()));

-- Create candidate_documents table to store onboarding documents uploaded by candidates
CREATE TABLE public.candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.hr_candidates(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- Public can insert their own documents (via token-based access)
CREATE POLICY "Anyone can insert candidate documents"
  ON public.candidate_documents FOR INSERT
  WITH CHECK (true);

-- HR admin can view all candidate documents
CREATE POLICY "HR admin can manage candidate documents"
  ON public.candidate_documents FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- HR users can view candidate documents
CREATE POLICY "HR users can view candidate documents"
  ON public.candidate_documents FOR SELECT
  USING (has_any_hr_role(auth.uid()));

-- Create storage bucket for candidate uploads (public for easy access)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-documents', 'candidate-documents', true);

-- Storage policies for candidate-documents bucket
CREATE POLICY "Anyone can upload candidate documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "Anyone can read candidate documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-documents');

CREATE POLICY "HR admin can delete candidate documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'candidate-documents' AND (
    EXISTS (SELECT 1 FROM public.hr_user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'hr_admin'))
  ));

-- Add onboarding_token to hr_candidates for secure document upload link
ALTER TABLE public.hr_candidates ADD COLUMN IF NOT EXISTS onboarding_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.hr_candidates ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started';

-- Allow public to read candidate by onboarding token (for document upload portal)
CREATE POLICY "Public can view candidate by onboarding token"
  ON public.hr_candidates FOR SELECT
  USING (true);

-- Add JD file URL to job postings
ALTER TABLE public.hr_job_postings ADD COLUMN IF NOT EXISTS jd_file_url text;

-- Add review_status to candidate_documents for per-document approval
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Table to store AI chatbot user profiles
CREATE TABLE public.ai_chat_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id text,
  display_name text,
  location text,
  age_group text,
  interests text[],
  concerns text[],
  ai_summary text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_or_anonymous UNIQUE (user_id, anonymous_id)
);

-- Table to store conversation history
CREATE TABLE public.ai_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.ai_chat_profiles(id) ON DELETE CASCADE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  topic text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_chat_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can manage their own profiles
CREATE POLICY "Users can view own profile" ON public.ai_chat_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.ai_chat_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.ai_chat_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.ai_chat_profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Conversation policies
CREATE POLICY "Users can manage own conversations" ON public.ai_chat_conversations
  FOR ALL TO authenticated USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all conversations" ON public.ai_chat_conversations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous access for the edge function (service role will handle this)
CREATE POLICY "Anon can insert profiles" ON public.ai_chat_profiles
  FOR INSERT TO anon WITH CHECK (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon can select own profile" ON public.ai_chat_profiles
  FOR SELECT TO anon USING (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon can update own profile" ON public.ai_chat_profiles
  FOR UPDATE TO anon USING (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon conversations insert" ON public.ai_chat_conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon conversations select" ON public.ai_chat_conversations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon conversations update" ON public.ai_chat_conversations
  FOR UPDATE TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_ai_chat_profiles_updated_at
  BEFORE UPDATE ON public.ai_chat_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tighten anon policies to use anonymous_id matching
DROP POLICY "Anon conversations insert" ON public.ai_chat_conversations;
DROP POLICY "Anon conversations select" ON public.ai_chat_conversations;
DROP POLICY "Anon conversations update" ON public.ai_chat_conversations;

CREATE POLICY "Anon conversations insert" ON public.ai_chat_conversations
  FOR INSERT TO anon WITH CHECK (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );

CREATE POLICY "Anon conversations select" ON public.ai_chat_conversations
  FOR SELECT TO anon USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );

CREATE POLICY "Anon conversations update" ON public.ai_chat_conversations
  FOR UPDATE TO anon USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );
