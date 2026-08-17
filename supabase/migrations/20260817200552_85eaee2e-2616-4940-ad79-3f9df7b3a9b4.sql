
-- 1. Groups ownership
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

DROP POLICY IF EXISTS "Allow authenticated users to read groups" ON public.groups;
DROP POLICY IF EXISTS "Allow admins to manage groups" ON public.groups;

CREATE POLICY "Owners and admins can read groups" ON public.groups
FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins can insert groups" ON public.groups
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins can update groups" ON public.groups
FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins can delete groups" ON public.groups
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2. campaign_recipients scoped to campaign owner
DROP POLICY IF EXISTS "Authenticated users can manage campaign recipients" ON public.campaign_recipients;

CREATE POLICY "Campaign owners can read recipients" ON public.campaign_recipients
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_recipients.campaign_id AND c.created_by = auth.uid()));

CREATE POLICY "Campaign owners can insert recipients" ON public.campaign_recipients
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_recipients.campaign_id AND c.created_by = auth.uid()));

CREATE POLICY "Campaign owners can update recipients" ON public.campaign_recipients
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_recipients.campaign_id AND c.created_by = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_recipients.campaign_id AND c.created_by = auth.uid()));

CREATE POLICY "Campaign owners can delete recipients" ON public.campaign_recipients
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_recipients.campaign_id AND c.created_by = auth.uid()));

-- 3. user_roles: no write paths for regular clients
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. has_role must not be directly callable from the API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
