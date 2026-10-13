import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowUpRight, LayoutDashboard, Users, FileUp, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getAccess } from '@/lib/commercial.functions';
import type { ReactNode } from 'react';

export function Brand() { return <div className="brand"><span className="brand-mark"><ArrowUpRight size={23}/></span><span>elo<span className="text-primary">.</span><small>GESTÃO COMERCIAL</small></span></div>; }
export function CommercialShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { queryClient } = router.options.context;
  const pathname = useRouterState({ select: s => s.location.pathname });
  const accessFn = useServerFn(getAccess);
  const access = useQuery({ queryKey: ['access'], queryFn: () => accessFn() });
  const label = pathname === '/clientes' ? 'Clientes' : pathname === '/importacao' ? 'Importação' : pathname === '/usuarios' ? 'Usuários' : 'Painel';
  async function logout() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await router.navigate({ to: '/auth', replace: true }); }
  return <div className="app-shell"><aside className="sidebar"><Brand/><p className="nav-label">Workspace</p><nav>
    <Link className={`nav-item ${pathname === '/painel' ? 'active' : ''}`} to="/painel"><LayoutDashboard size={18}/>Painel</Link>
    <Link className={`nav-item ${pathname === '/clientes' ? 'active' : ''}`} to="/clientes"><Users size={18}/>Clientes</Link>
    <Link className={`nav-item ${pathname === '/importacao' ? 'active' : ''}`} to="/importacao"><FileUp size={18}/>Importação</Link>
    {access.data?.roles.includes('admin') && <Link className={`nav-item ${pathname === '/usuarios' ? 'active' : ''}`} to="/usuarios"><ShieldCheck size={18}/>Usuários</Link>}
  </nav><div className="sidebar-bottom"><p className="flex items-center gap-2"><span className="dot text-primary"/> {access.data?.roles.includes('admin') ? 'Administrador' : 'Operador'}</p><Button variant="ghost" onClick={logout} className="w-full justify-start"><LogOut/>Sair da conta</Button></div></aside>
  <div className="workspace"><header className="topbar"><span className="flex items-center gap-2">Workspace <ChevronRight size={13}/><span className="text-foreground">{label}</span></span><div className="topbar-right"><span className="hidden sm:inline">{new Date().toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' })}</span><Button variant="ghost" size="icon" title="Sair da conta" aria-label="Sair da conta" onClick={logout}><LogOut size={17}/></Button><span className="user-avatar">{access.data?.roles.includes('admin') ? 'AD' : 'OP'}</span></div></header><main className="page-content">{children}</main></div></div>;
}