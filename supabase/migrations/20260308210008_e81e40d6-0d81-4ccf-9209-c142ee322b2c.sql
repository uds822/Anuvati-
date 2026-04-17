-- Allow HR admins to view internship details
CREATE POLICY "HR admin can view internship details"
ON public.internship_details FOR SELECT
TO authenticated
USING (has_any_hr_role(auth.uid()));
