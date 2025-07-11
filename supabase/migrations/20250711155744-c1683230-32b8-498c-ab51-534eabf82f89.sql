-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
CREATE POLICY "Users can view their own patients" 
ON public.patients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" 
ON public.patients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" 
ON public.patients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for plans table
CREATE POLICY "Users can view plans for their patients" 
ON public.plans 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = plans.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create plans for their patients" 
ON public.plans 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = plans.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update plans for their patients" 
ON public.plans 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = plans.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete plans for their patients" 
ON public.plans 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = plans.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for interactions table
CREATE POLICY "Users can view interactions for their patients" 
ON public.interactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = interactions.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create interactions for their patients" 
ON public.interactions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = interactions.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update interactions for their patients" 
ON public.interactions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = interactions.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete interactions for their patients" 
ON public.interactions 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = interactions.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for adherence table
CREATE POLICY "Users can view adherence for their patients" 
ON public.adherence 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = adherence.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create adherence for their patients" 
ON public.adherence 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = adherence.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update adherence for their patients" 
ON public.adherence 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = adherence.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete adherence for their patients" 
ON public.adherence 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = adherence.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for uploads table
CREATE POLICY "Users can view uploads for their patients" 
ON public.uploads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = uploads.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create uploads for their patients" 
ON public.uploads 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = uploads.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update uploads for their patients" 
ON public.uploads 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = uploads.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete uploads for their patients" 
ON public.uploads 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = uploads.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for appointments table
CREATE POLICY "Users can view appointments for their patients" 
ON public.appointments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = appointments.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create appointments for their patients" 
ON public.appointments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = appointments.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update appointments for their patients" 
ON public.appointments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = appointments.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete appointments for their patients" 
ON public.appointments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = appointments.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for payments table
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" 
ON public.payments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add updated_at columns and triggers
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();