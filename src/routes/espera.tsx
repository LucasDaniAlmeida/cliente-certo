import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Clock3, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/commercial-shell';
import { supabase } from '@/integrations/supabase/client';
import { head } from '@/lib/commercial';
export const Route = createFileRoute('/espera')({ head: () => head('Aguardando liberação', 'Acompanhe a liberação do seu acesso ao Elo Comercial.'), component: Waiting });
function Waiting() { const router=useRouter(); const [busy,setBusy]=useState(false); return <div className="p-8"><Brand/><div className="waiting"><Clock3 size={48}/><h1>Aguardando liberação</h1><p>Sua conta foi criada. Um administrador precisa atribuir a permissão de admin ou operador para liberar seu acesso.</p><Button disabled={busy} onClick={async()=>{setBusy(true);await router.navigate({to:'/painel'});setBusy(false);}}><RefreshCw/>Verificar meu acesso</Button><Button variant="ghost" className="mt-4" onClick={async()=>{await router.options.context.queryClient.cancelQueries();router.options.context.queryClient.clear();await supabase.auth.signOut();await router.navigate({to:'/auth',replace:true});}}><LogOut/>Sair da conta</Button></div></div>; }