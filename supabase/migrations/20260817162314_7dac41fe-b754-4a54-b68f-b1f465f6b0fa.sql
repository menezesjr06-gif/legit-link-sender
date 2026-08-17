-- Fix function search path (security definer best practice)
ALTER FUNCTION public.has_role(_user_id UUID, _role public.app_role) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Revoke default public execute permissions for security definer functions
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id UUID, _role public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id UUID, _role public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;

-- Add RLS policy for user_roles
CREATE POLICY "Users can read their own roles" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
