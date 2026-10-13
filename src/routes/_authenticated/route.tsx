import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { getAccess } from '@/lib/commercial.functions';
import { CommercialShell } from '@/components/commercial-shell';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: '/auth' });
    const access = await getAccess();
    if (!access.roles.some(r => ['admin', 'operador'].includes(r))) throw redirect({ to: '/espera' });
    return { access };
  },
  component: () => <CommercialShell><Outlet/></CommercialShell>,
});