-- Create types
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled');
CREATE TYPE public.delivery_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Groups Table
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    whatsapp_group_id TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Campaigns Table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    schedule_at TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_interval TEXT, -- e.g., '1 day'
    status public.campaign_status DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
    FOR ALL TO authenticated USING (auth.uid() = created_by);

-- Campaign Recipients (Many-to-Many)
CREATE TABLE public.campaign_recipients (
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, group_id)
);

GRANT SELECT, INSERT, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;

ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage campaign recipients" ON public.campaign_recipients
    FOR ALL TO authenticated USING (true);

-- Campaign Results / History
CREATE TABLE public.campaign_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id),
    status public.delivery_status DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.campaign_history TO authenticated;
GRANT ALL ON public.campaign_history TO service_role;

ALTER TABLE public.campaign_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of their campaigns" ON public.campaign_history
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_history.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    );

-- WhatsApp Settings (System level)
CREATE TABLE public.whatsapp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    waba_id TEXT, -- WhatsApp Business Account ID
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.whatsapp_settings TO authenticated;
GRANT ALL ON public.whatsapp_settings TO service_role;

ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- User Roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer Function for Roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Apply remaining policies that depend on has_role
CREATE POLICY "Allow authenticated users to read groups" ON public.groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage groups" ON public.groups
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage settings" ON public.whatsapp_settings
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_whatsapp_settings_updated_at BEFORE UPDATE ON public.whatsapp_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
