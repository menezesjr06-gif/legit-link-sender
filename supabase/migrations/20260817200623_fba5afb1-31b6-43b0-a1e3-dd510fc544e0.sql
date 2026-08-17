
-- groups
DROP POLICY IF EXISTS "Owners and admins can read groups" ON public.groups;
DROP POLICY IF EXISTS "Owners and admins can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Owners and admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Owners and admins can delete groups" ON public.groups;

CREATE POLICY "Owners and admins can read groups" ON public.groups
FOR SELECT TO authenticated
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Owners and admins can insert groups" ON public.groups
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Owners and admins can update groups" ON public.groups
FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "Owners and admins can delete groups" ON public.groups
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- user_roles admin management
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- whatsapp_settings admin only
DROP POLICY IF EXISTS "Admins can manage settings" ON public.whatsapp_settings;
CREATE POLICY "Admins can manage settings" ON public.whatsapp_settings
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
