import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth-form';
import { head } from '@/lib/commercial';
export const Route = createFileRoute('/')({ head: () => head('Gestão de clientes', 'Acesse o Elo Comercial para gerenciar clientes e acompanhar resultados.'), component: AuthForm });
