
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
