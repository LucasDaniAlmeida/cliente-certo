import { useEffect, useState, type ReactNode } from 'react';
import { CopilotKit, useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@tanstack/react-router';
import { PanelRightClose, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { clientsOptions } from '@/lib/queries';
import { statuses, statusKey, type Client } from '@/lib/commercial';
import { updateClient } from '@/lib/commercial.functions';

const instructions = `Você é o assistente comercial do Elo Comercial. Responda sempre em português do Brasil, de forma objetiva.
Use os dados de clientes fornecidos no contexto para responder perguntas (nunca invente clientes ou números).
Para alterar situação, observação, data de último contato ou agendamento, use a ação atualizarCliente (exige o id do cliente). Situação "Agendamento" exige data de agendamento (AAAA-MM-DD).
Para abrir a lista de clientes filtrada, use filtrarClientes.
Quando pedirem mensagens de abordagem (WhatsApp ou e-mail), escreva textos curtos, cordiais e personalizados com o nome, situação e observações do cliente.
Data de hoje: ${new Date().toISOString().slice(0, 10)}.`;

function CopilotBrain() {
  const { data = [] } = useQuery(clientsOptions);
  const qc = useQueryClient();
  const update = useServerFn(updateClient);
  const navigate = useNavigate();
  const counts = Object.fromEntries(statuses.map(s => [s, data.filter(c => statuses[statusKey(c.status)] === s).length]));

  useCopilotReadable({ description: 'Resumo do painel: total de clientes e quantidade por situação', value: { total: data.length, porSituacao: counts } });
  useCopilotReadable({
    description: 'Lista de clientes (id, nome, fantasia, documento, telefones, situação, observação, último contato, agendamento)',
    value: data.slice(0, 1500).map(c => ({ id: c.id, n: c.nome, f: c.nome_fantasia, doc: c.cpf || c.cnpj, tel: c.telefone, s: statuses[statusKey(c.status)], obs: c.obs?.slice(0, 300), ult: c.data_ultimo_contato, ag: c.data_agendamento })),
  });

  useCopilotAction({
    name: 'atualizarCliente',
    description: 'Atualiza a situação, observação, data do último contato e/ou data de agendamento de um cliente.',
    parameters: [
      { name: 'id', type: 'number', description: 'id do cliente', required: true },
      { name: 'status', type: 'string', description: `Nova situação: ${statuses.join(', ')}`, required: false },
      { name: 'obs', type: 'string', description: 'Nova observação (substitui a atual)', required: false },
      { name: 'data_ultimo_contato', type: 'string', description: 'AAAA-MM-DDTHH:MM', required: false },
      { name: 'data_agendamento', type: 'string', description: 'AAAA-MM-DD', required: false },
    ],
    handler: async (args: { id: number; status?: string; obs?: string; data_ultimo_contato?: string; data_agendamento?: string }) => {
      const c = (qc.getQueryData<Client[]>(['clients']) ?? data).find(x => x.id === args.id);
      if (!c) return 'Cliente não encontrado.';
      const status = (args.status ?? statuses[statusKey(c.status)]) as typeof statuses[number];
      if (!statuses.includes(status)) return 'Situação inválida.';
      await update({ data: {
        id: c.id, status, obs: args.obs ?? c.obs ?? '',
        data_ultimo_contato: args.data_ultimo_contato ?? c.data_ultimo_contato?.replace(' ', 'T').slice(0, 19) ?? null,
        data_agendamento: args.data_agendamento ?? c.data_agendamento,
      } });
      await qc.invalidateQueries({ queryKey: ['clients'] });
      return `Cliente ${c.nome || c.nome_fantasia || c.id} atualizado.`;
    },
  });

  useCopilotAction({
    name: 'filtrarClientes',
    description: 'Abre a tela de clientes.',
    parameters: [],
    handler: async () => { await navigate({ to: '/clientes' }); return 'Tela de clientes aberta.'; },
  });
  return null;
}

export function CommercialCopilot({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? ''));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setToken(s?.access_token ?? ''));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!token) return <>{children}</>;
  return <CopilotKit runtimeUrl="/api/copilotkit" headers={{ 'x-supabase-token': token }} showDevConsole={false}>
    <CopilotBrain />
    <div className={`copilot-layout ${open ? 'is-open' : ''}`}>
      <div className="copilot-main">{children}</div>
      {open ? <aside className="copilot-panel" aria-label="Assistente comercial">
        <div className="copilot-head"><span className="copilot-badge"><MessagesSquare size={15} /></span><div><strong>Assistente comercial</strong><small>Consulta, ações e mensagens</small></div>
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="Esconder assistente" title="Esconder assistente" onClick={() => setOpen(false)}><PanelRightClose size={17} /></Button></div>
        <CopilotChat className="copilot-chat" instructions={instructions} labels={{ initial: 'Olá! Posso consultar clientes, atualizar situações e agendamentos ou escrever mensagens de abordagem.', placeholder: 'Pergunte ou peça algo...' }} />
      </aside> : <Button className="copilot-open" onClick={() => setOpen(true)} aria-label="Abrir assistente"><MessagesSquare />Assistente</Button>}
    </div>
  </CopilotKit>;
}
