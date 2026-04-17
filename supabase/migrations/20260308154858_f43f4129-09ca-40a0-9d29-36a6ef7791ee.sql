
-- Allow users to update their own submissions (for requesting certificates)
CREATE POLICY "Users can update own submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
