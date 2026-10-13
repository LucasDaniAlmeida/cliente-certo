import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { clientSchema, updateSchema } from './commercial';

export const getAccess = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId);
  if (error) throw new Error(error.message);
  return { userId: context.userId, roles: (data ?? []).map(r => r.role) };
});

export const listClients = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc('has_app_role', { required_role: 'admin' });
  const { data: operator } = await context.supabase.rpc('has_app_role', { required_role: 'operador' });
  if (roleError || (!allowed && !operator)) throw new Error('Seu acesso ainda não foi liberado.');
  const all = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from('clientes').select('*').order('id').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return all;
});

export const updateClient = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => updateSchema.parse(input)).handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const { data: saved, error } = await context.supabase.from('clientes').update(values).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const importClients = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.array(clientSchema).max(500).parse(input)).handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc('import_clientes', { rows_data: data });
    if (error) throw new Error(error.message);
    return z.object({ imported: z.number(), duplicates: z.number(), errors: z.number() }).parse(result);
  });

export const listUsers = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin, error: denied } = await context.supabase.rpc('has_app_role', { required_role: 'admin' });
  if (denied || !admin) throw new Error('Acesso exclusivo para administradores.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    users.push(...data.users.map(u => ({ id: u.id, email: u.email ?? '', created_at: u.created_at })));
    if (data.users.length < 1000) break;
  }
  const roles: { user_id: string; role: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin.from('user_roles').select('user_id,role').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    roles.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return users.map(u => ({ ...u, roles: roles.filter(r => r.user_id === u.id).map(r => r.role) }));
});

export const assignRole = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ userId: z.string().uuid(), role: z.enum(['admin', 'operador']) }).parse(input)).handler(async ({ data, context }) => {
    const { data: admin, error: denied } = await context.supabase.rpc('has_app_role', { required_role: 'admin' });
    if (denied || !admin) throw new Error('Acesso exclusivo para administradores.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (targetError || !target.user) throw new Error('Usuário não encontrado.');
    const { data: existing, error: existingError } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', data.userId);
    if (existingError) throw new Error(existingError.message);
    if (existing?.some(r => ['admin', 'operador'].includes(r.role))) throw new Error('Este usuário já tem acesso.');
    const { error } = await supabaseAdmin.from('user_roles').insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { success: true };
  });