import { accessRequired, codeOk } from '@/lib/access';

// GET  -> { required: boolean }   (lets the client decide whether to show the gate)
// POST { code } -> { ok: boolean } (validates a code entered at the gate)
//
// The real enforcement is in /api/chat (which checks the x-access-code header on
// every model call). This route is just for a clean unlock UX.

export async function GET() {
  return Response.json({ required: accessRequired() });
}

export async function POST(req: Request) {
  if (!accessRequired()) return Response.json({ ok: true });
  let code = '';
  try {
    const body = (await req.json()) as { code?: unknown };
    if (typeof body?.code === 'string') code = body.code;
  } catch {
    // fall through with empty code -> not ok
  }
  return Response.json({ ok: codeOk(code) });
}
