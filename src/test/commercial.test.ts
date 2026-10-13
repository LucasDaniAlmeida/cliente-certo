import { describe, expect, it } from 'vitest';
import { clientSchema, updateSchema, statuses } from '@/lib/commercial';

describe('Commercial validation', () => {
  const update = { id: 1, status: 'Contato feito', obs: 'Cliente pediu retorno', data_ultimo_contato: '2026-10-13T11:38', data_agendamento: null };
  it('requires a date for an appointment', () => {
    expect(updateSchema.safeParse({ ...update, status: 'Agendamento' }).success).toBe(false);
    expect(updateSchema.safeParse({ ...update, status: 'Agendamento', data_agendamento: '2026-10-15' }).success).toBe(true);
  });
  it('accepts all seven statuses and rejects unknown ones', () => {
    expect(statuses).toHaveLength(7);
    for (const status of statuses) expect(updateSchema.safeParse({ ...update, status, data_agendamento: '2026-10-15' }).success).toBe(true);
    expect(updateSchema.safeParse({ ...update, status: 'Inexistente' }).success).toBe(false);
  });
  it('preserves formatted documents and telephone arrays', () => {
    const row = { nome:'Ana', nome_fantasia:'', cpf:'001.002.003-04', cnpj:'', telefone:['(63) 99999-1234','(63) 3333-1234'] };
    expect(clientSchema.parse(row)).toEqual(row);
  });
  it('rejects excessively long observations and invalid identifiers', () => {
    expect(updateSchema.safeParse({ ...update, obs:'x'.repeat(10001) }).success).toBe(false);
    expect(updateSchema.safeParse({ ...update, id:-1 }).success).toBe(false);
  });
});