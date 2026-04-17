CREATE POLICY "HR admin can delete employees"
ON public.hr_employees
FOR DELETE
TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));