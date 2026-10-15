import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

async function isStaff(request: Request) {
  const token = request.headers.get('x-supabase-token') ?? '';
  if (!token) return false;
  const url = process.env['SUPABASE_URL']!;
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const sb = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: user } = await sb.auth.getUser(token);
  if (!user.user) return false;
  const [a, o] = await Promise.all([
    sb.rpc('has_app_role', { required_role: 'admin' }),
    sb.rpc('has_app_role', { required_role: 'operador' }),
  ]);
  return !!a.data || !!o.data;
}

async function handle(request: Request) {
  if (!(await isStaff(request))) return new Response('Não autorizado', { status: 401 });
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) return new Response('Assistente não configurado', { status: 500 });
  const [{ CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint }, { BuiltInAgent }, { createGoogleGenerativeAI }] = await Promise.all([
    import('@copilotkit/runtime'),
    import('@copilotkit/runtime/v2'),
    import('@ai-sdk/google'),
  ]);
  // Native Gemini provider (the OpenAI adapter uses /responses, which Gemini doesn't support)
  const model = createGoogleGenerativeAI({ apiKey })('gemini-3.8-flash');
  const runtime = new CopilotRuntime({ agents: { default: new BuiltInAgent({ model }) } as never });
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({ runtime, serviceAdapter: new ExperimentalEmptyAdapter(), endpoint: '/api/copilotkit' });
  return handleRequest(request as never);
}

export const Route = createFileRoute('/api/copilotkit')({
  server: { handlers: { POST: ({ request }) => handle(request), GET: ({ request }) => handle(request) } },
});
