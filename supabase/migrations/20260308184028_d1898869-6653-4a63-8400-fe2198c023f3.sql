
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
