import { queryOptions } from '@tanstack/react-query';
import { listClients } from './commercial.functions';
export const clientsOptions = queryOptions({ queryKey: ['clients'], queryFn: () => listClients(), staleTime: 15000 });