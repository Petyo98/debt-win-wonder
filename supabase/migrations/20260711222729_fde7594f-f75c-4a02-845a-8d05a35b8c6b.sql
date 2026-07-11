-- Lock down SECURITY DEFINER trigger functions from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Explicitly deny SELECT on waitlist for API roles (defense in depth)
REVOKE SELECT, UPDATE, DELETE ON public.waitlist FROM anon, authenticated;

-- Add a restrictive SELECT policy so any future permissive SELECT policy cannot expose emails to non-service roles
CREATE POLICY "waitlist_no_select_for_api_roles"
ON public.waitlist
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);