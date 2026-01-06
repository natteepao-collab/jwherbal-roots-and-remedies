-- Create payment settings table
CREATE TABLE public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promptpay_number text NOT NULL DEFAULT '',
  promptpay_name text NOT NULL DEFAULT '',
  bank_name text NOT NULL DEFAULT '',
  bank_account_number text NOT NULL DEFAULT '',
  bank_account_name text NOT NULL DEFAULT '',
  is_promptpay_enabled boolean NOT NULL DEFAULT true,
  is_bank_transfer_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view payment settings
CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings
FOR SELECT
USING (true);

-- Admins can manage payment settings
CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.payment_settings (
  promptpay_number,
  promptpay_name,
  bank_name,
  bank_account_number,
  bank_account_name
) VALUES (
  '0812345678',
  'JWHERBAL Co., Ltd.',
  'ธนาคารกสิกรไทย',
  '123-4-56789-0',
  'บริษัท เจดับบลิว เฮอร์บอล จำกัด'
);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();