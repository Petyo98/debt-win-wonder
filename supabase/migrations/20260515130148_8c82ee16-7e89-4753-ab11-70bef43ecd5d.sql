ALTER TABLE public.debts ADD COLUMN remaining_months numeric DEFAULT NULL;

CREATE POLICY "debts_update_own_remaining" ON public.debts FOR UPDATE USING (auth.uid() = user_id);