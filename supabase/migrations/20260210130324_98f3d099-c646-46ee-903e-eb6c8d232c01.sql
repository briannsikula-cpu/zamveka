-- Allow approved users to insert their own artist profile
CREATE POLICY "Approved users can create their artist profile"
ON public.artists
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND is_user_approved(auth.uid())
);

-- Allow artists to update their own profile
CREATE POLICY "Artists can update their own profile"
ON public.artists
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
