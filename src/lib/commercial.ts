import { z } from 'zod';
import type { Tables } from '@/integrations/supabase/types';

export const statuses = ['Entrar em contato', 'Sem resposta', 'Contato feito', 'Recusado', 'Proposta', 'Agendamento', 'Fechado'] as const;
export type Client = Tables<'clientes'>;
export const statusKey = (value: string | null) => Math.max(0, statuses.indexOf(value as typeof statuses[number]));
export const clientSchema = z.object({
  nome: z.string().max(500), nome_fantasia: z.string().max(500), cpf: z.string().max(100), cnpj: z.string().max(100),
  telefone: z.array(z.string().max(100)).max(30),
});
export const updateSchema = z.object({
  id: z.number().int().positive(), status: z.enum(statuses), obs: z.string().max(10000),
  data_ultimo_contato: z.string().nullable().refine(v => !v || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v), 'Data de contato inválida'),
  data_agendamento: z.string().nullable().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Data de agendamento inválida'),
}).refine(v => v.status !== 'Agendamento' || !!v.data_agendamento, { message: 'Preencha a data do agendamento', path: ['data_agendamento'] });
export function head(title: string, description: string) {
  return { meta: [{ title: `${title} · Elo Comercial` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · Elo Comercial` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
export const dateLabel = (value: string | null) => value ? new Date(value.includes('T') ? value : `${value}T12:00:00`).toLocaleDateString('pt-BR') : '—';