
-- Create app_role enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create participation_role enum
CREATE TYPE public.participation_role AS ENUM ('volunteer', 'internship', 'campus_ambassador', 'corporate_volunteer', 'partner_organization');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  age INTEGER,
  gender TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role participation_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Volunteer details
CREATE TABLE public.volunteer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  areas_of_interest TEXT[] DEFAULT '{}',
  availability TEXT,
  skills TEXT,
  previous_experience TEXT
);
ALTER TABLE public.volunteer_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own volunteer details" ON public.volunteer_details FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own volunteer details" ON public.volunteer_details FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all volunteer details" ON public.volunteer_details FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Internship details
CREATE TABLE public.internship_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  university TEXT,
  course TEXT,
  year_of_study TEXT,
  duration_preference TEXT,
  field_of_interest TEXT
);
ALTER TABLE public.internship_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own internship details" ON public.internship_details FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own internship details" ON public.internship_details FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all internship details" ON public.internship_details FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Campus ambassador details
CREATE TABLE public.campus_ambassador_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  university_name TEXT,
  course TEXT,
  year_of_study TEXT,
  student_org_involvement TEXT,
  why_represent TEXT
);
ALTER TABLE public.campus_ambassador_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campus ambassador details" ON public.campus_ambassador_details FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own campus ambassador details" ON public.campus_ambassador_details FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all campus ambassador details" ON public.campus_ambassador_details FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Corporate volunteer details
CREATE TABLE public.corporate_volunteer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  job_role TEXT,
  department TEXT,
  interest_area TEXT
);
ALTER TABLE public.corporate_volunteer_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own corporate volunteer details" ON public.corporate_volunteer_details FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own corporate volunteer details" ON public.corporate_volunteer_details FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all corporate volunteer details" ON public.corporate_volunteer_details FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Partner organization details
CREATE TABLE public.partner_organization_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT,
  organization_type TEXT,
  website TEXT,
  partnership_interest TEXT,
  organization_description TEXT
);
ALTER TABLE public.partner_organization_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner org details" ON public.partner_organization_details FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own partner org details" ON public.partner_organization_details FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all partner org details" ON public.partner_organization_details FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
