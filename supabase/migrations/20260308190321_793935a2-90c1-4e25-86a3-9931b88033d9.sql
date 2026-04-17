
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
