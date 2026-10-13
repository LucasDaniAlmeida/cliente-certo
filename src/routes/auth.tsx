import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth-form';
import { head } from '@/lib/commercial';
export const Route = createFileRoute('/auth')({ head: () => head('Entrar', 'Entre ou crie sua conta no Elo Comercial.'), component: AuthForm });