import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Brand } from './commercial-shell';
import office from '@/assets/office.jpg';

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setMessage('');
    const check = z.object({ email:z.string().trim().email('Informe um email válido').max(255), password:mode === 'forgot' ? z.string() : z.string().min(6,'A senha deve ter pelo menos 6 caracteres').max(128) }).safeParse({ email,password });
    if (!check.success) { setError(check.error.issues[0]?.message ?? 'Confira os dados'); return; }
    setBusy(true);
    try {
      if (mode === 'forgot') { const { error } = await supabase.auth.resetPasswordForEmail(check.data.email, { redirectTo:`${window.location.origin}/reset-password` }); if(error) throw error; setMessage('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.'); }
      else if (mode === 'register') { const { data,error } = await supabase.auth.signUp({ email:check.data.email,password,options:{ emailRedirectTo:window.location.origin } }); if(error) throw error; if(data.session) await router.navigate({ to:'/painel' }); else setMessage('Cadastro recebido. Confira seu email para confirmar a conta; depois, aguarde a liberação do administrador.'); }
      else { const { error } = await supabase.auth.signInWithPassword({ email:check.data.email,password }); if(error) throw error; await router.navigate({ to:'/painel' }); }
    } catch (e) { const msg=e instanceof Error ? e.message : 'Não foi possível continuar.'; setError(msg.includes('Invalid login') ? 'Email ou senha incorretos.' : msg.includes('Email not confirmed') ? 'Confirme seu email antes de entrar.' : msg); } finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-form-area"><Brand/><div className="auth-form"><p className="eyebrow">SEU ESPAÇO DE TRABALHO</p><h1>{mode==='register'?'Crie sua conta':mode==='forgot'?'Recupere sua senha':'Bem-vindo de volta'}</h1><p>{mode==='register'?'Seu acesso será liberado pelo administrador.':mode==='forgot'?'Enviaremos um link para o seu email.':'Entre para acompanhar seus clientes e resultados.'}</p>
  {mode!=='forgot' && <div className="auth-tabs"><Button variant="ghost" className={mode==='login'?'selected':''} onClick={()=>{setMode('login');setMessage('');setError('');}}>Entrar</Button><Button variant="ghost" className={mode==='register'?'selected':''} onClick={()=>{setMode('register');setMessage('');setError('');}}>Criar conta</Button></div>}
  <form onSubmit={submit} className="form-grid"><div><label className="form-label" htmlFor="email">Email</label><input className="field" type="email" id="email" placeholder="seu@email.com" autoComplete="email" required maxLength={255} value={email} onChange={e=>setEmail(e.target.value)}/></div>
  {mode!=='forgot' && <div><label className="form-label" htmlFor="password">Senha</label><div className="relative"><input id="password" className="field pr-11" type={show?'text':'password'} placeholder="Sua senha" autoComplete={mode==='login'?'current-password':'new-password'} required minLength={6} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" aria-label={show?'Ocultar senha':'Mostrar senha'} onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</Button></div></div>}
  {mode==='login' && <Button type="button" variant="link" className="justify-end p-0 h-auto text-xs" onClick={()=>setMode('forgot')}>Esqueci minha senha</Button>}
  {error && <p role="alert" className="error-note">{error}</p>}{message && <p role="status" className="success-note">{message}</p>}
  <Button className="w-full h-11" type="submit" disabled={busy}>{busy?<Loader2 className="animate-spin"/>:null}{mode==='register'?'Criar conta':mode==='forgot'?'Enviar link':'Entrar na conta'}<ArrowRight/></Button>
  {mode==='forgot' && <Button type="button" variant="ghost" onClick={()=>setMode('login')}>Voltar para o login</Button>}</form></div><p className="auth-footer">© {new Date().getFullYear()} Elo Comercial</p></div><div className="auth-photo"><img src={office} width={1024} height={1280} alt="Ambiente de trabalho moderno com luz natural"/><div className="auth-photo-caption"><p className="text-xs mb-3 opacity-70">ELO COMERCIAL</p><h2>Conexões que se tornam<br/>bons negócios.</h2></div></div></div>;
}