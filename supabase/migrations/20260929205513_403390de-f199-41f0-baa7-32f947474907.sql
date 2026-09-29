ALTER TABLE public.profiles
  ADD COLUMN age_confirmed_at timestamptz,
  ADD COLUMN terms_accepted_at timestamptz,
  ADD COLUMN privacy_accepted_at timestamptz,
  ADD COLUMN terms_version text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE consent boolean := COALESCE((new.raw_user_meta_data->>'consent_given')::boolean, false);
BEGIN
  INSERT INTO public.profiles (id, display_name, age_confirmed_at, terms_accepted_at, privacy_accepted_at, terms_version)
  VALUES (new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    CASE WHEN consent THEN now() END,
    CASE WHEN consent THEN now() END,
    CASE WHEN consent THEN now() END,
    CASE WHEN consent THEN new.raw_user_meta_data->>'terms_version' END);
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_consent(_terms_version text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles
     SET age_confirmed_at = COALESCE(age_confirmed_at, now()),
         terms_accepted_at = COALESCE(terms_accepted_at, now()),
         privacy_accepted_at = COALESCE(privacy_accepted_at, now()),
         terms_version = COALESCE(terms_version, left(_terms_version, 50))
   WHERE id = auth.uid();
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.record_consent(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_consent(text) TO authenticated;