import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { statuses, statusKey, updateSchema, type Client } from '@/lib/commercial';
import { updateClient } from '@/lib/commercial.functions';

export function ClientEditor({ client, close }: { client: Client; close: () => void }) {
  const [status,setStatus]=useState(statuses[statusKey(client.status)]); const [obs,setObs]=useState(client.obs??'');
  const [contact,setContact]=useState(client.data_ultimo_contato?.slice(0,16)??''); const [date,setDate]=useState<Date|undefined>(client.data_agendamento?new Date(`${client.data_agendamento}T12:00:00`):undefined);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const save=useServerFn(updateClient); const qc=useQueryClient();
  async function submit(e:React.FormEvent) { e.preventDefault();const parsed=updateSchema.safeParse({id:client.id,status,obs,data_ultimo_contato:contact||null,data_agendamento:date?format(date,'yyyy-MM-dd'):null});if(!parsed.success){setError(parsed.error.issues[0]?.message??'Confira os dados');return;}setBusy(true);try{await save({data:parsed.data});await qc.invalidateQueries({queryKey:['clients']});toast.success('Acompanhamento salvo');close();}catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar');}finally{setBusy(false);} }
  return <Dialog open onOpenChange={v=>{if(!v)close();}}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogTitle>{client.nome||client.nome_fantasia||'Cliente'}</DialogTitle><DialogDescription>{client.nome_fantasia||'Acompanhamento comercial'}</DialogDescription><div className="form-row text-xs text-muted-foreground"><p>CPF: {client.cpf||'—'}<br/>CNPJ: {client.cnpj||'—'}</p><p>{client.telefone?.join(' · ')||'Sem telefone'}</p></div><form className="form-grid" onSubmit={submit}><div><label className="form-label">Situação</label><select className="field w-full" value={status} onChange={e=>setStatus(e.target.value as typeof status)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><div><label className="form-label" htmlFor="obs">Observação</label><textarea className="field h-28 resize-y" id="obs" maxLength={10000} value={obs} onChange={e=>setObs(e.target.value)} placeholder="Registre os detalhes do atendimento..."/></div><div><label className="form-label" htmlFor="contact">Data do último contato</label><input id="contact" className="field" type="datetime-local" value={contact} onChange={e=>setContact(e.target.value)}/></div><div><label className="form-label">Data do agendamento {status==='Agendamento'?'*':''}</label><Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="w-full justify-start"><CalendarIcon/>{date?format(date,'dd/MM/yyyy'):'Selecionar data'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 pointer-events-auto"><Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} className="pointer-events-auto"/></PopoverContent></Popover></div>{error&&<p role="alert" className="error-note">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancelar</Button><Button disabled={busy} type="submit"><Save/>{busy?'Salvando...':'Salvar alterações'}</Button></div></form></DialogContent></Dialog>;
}