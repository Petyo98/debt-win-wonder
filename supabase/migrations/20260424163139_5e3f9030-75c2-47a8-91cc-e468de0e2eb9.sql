
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_strategy TEXT NOT NULL DEFAULT 'snowball' CHECK (preferred_strategy IN ('snowball','avalanche')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Debts
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC(12,2) NOT NULL CHECK (balance >= 0),
  apr NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (apr >= 0 AND apr <= 100),
  minimum_payment NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (minimum_payment >= 0),
  starting_balance NUMERIC(12,2) NOT NULL,
  is_paid_off BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debts_select_own" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "debts_insert_own" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "debts_update_own" ON public.debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "debts_delete_own" ON public.debts FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER debts_updated_at BEFORE UPDATE ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX debts_user_idx ON public.debts(user_id);

-- Payments log
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_on DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payments_delete_own" ON public.payments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX payments_user_idx ON public.payments(user_id);
CREATE INDEX payments_debt_idx ON public.payments(debt_id);

-- Daily check-ins
CREATE TABLE public.checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  action_taken TEXT,
  amount_saved NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_select_own" ON public.checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "checkins_insert_own" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checkins_update_own" ON public.checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "checkins_delete_own" ON public.checkins FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX checkins_user_idx ON public.checkins(user_id);
