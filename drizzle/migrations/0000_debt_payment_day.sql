ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS payment_day smallint CHECK (payment_day BETWEEN 1 AND 31);
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS last_processed_due date;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS principal_part numeric;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS interest_part numeric;

CREATE OR REPLACE FUNCTION public.process_due_payments()
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  d record;
  cursor_date date;
  due date;
  bal numeric;
  interest numeric;
  pay numeric;
  principal numeric;
  processed integer := 0;
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  FOR d IN
    SELECT * FROM public.debts
    WHERE user_id = auth.uid() AND payment_day IS NOT NULL AND NOT is_paid_off AND balance > 0
    FOR UPDATE
  LOOP
    cursor_date := coalesce(d.last_processed_due, d.created_at::date);
    bal := d.balance;
    LOOP
      due := make_date(extract(year FROM cursor_date)::int, extract(month FROM cursor_date)::int, 1);
      due := due + (least(d.payment_day, extract(day FROM (due + interval '1 month' - interval '1 day'))::int) - 1);
      IF due <= cursor_date THEN
        due := make_date(extract(year FROM cursor_date + interval '1 month')::int, extract(month FROM cursor_date + interval '1 month')::int, 1);
        due := due + (least(d.payment_day, extract(day FROM (due + interval '1 month' - interval '1 day'))::int) - 1);
      END IF;
      EXIT WHEN due > today OR bal <= 0;
      interest := round(bal * d.apr / 100 / 12, 2);
      pay := least(d.minimum_payment + d.extra_payment, bal + interest);
      principal := pay - interest;
      bal := greatest(0, bal - principal);
      INSERT INTO public.payments (user_id, debt_id, amount, paid_on, note, principal_part, interest_part)
      VALUES (d.user_id, d.id, pay, due, 'Scheduled payment', principal, least(interest, pay));
      cursor_date := due;
      processed := processed + 1;
    END LOOP;
    UPDATE public.debts
      SET balance = bal, is_paid_off = (bal <= 0), last_processed_due = cursor_date
      WHERE id = d.id;
  END LOOP;
  RETURN processed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_due_payments() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_due_payments() TO authenticated;