
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
