// Cloudflare Worker serving Le Mot as a Discord Activity.
// Static files come from the build. The API exchanges the OAuth code (the client
// secret cannot live in the browser) and stores who played today in each server.

const parisDay = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(date);
const SNOWFLAKE = /^\d{17,20}$/;
const GRID = /^[cpi]{5}(\n[cpi]{5}){0,5}$/;

export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    if (pathname === '/api/token' && request.method === 'POST') return exchangeCode(request, env);

    // Every other route acts for the Discord user who owns the bearer token.
    const user = await discordUser(request);
    if (!user) return new Response(null, { status: 401 });

    if (pathname === '/api/results' && request.method === 'POST') return saveResult(request, env, user);
    if (pathname === '/api/results' && request.method === 'GET') return listResults(searchParams, env);
    return new Response(null, { status: 404 });
  },
};

async function exchangeCode(request, env) {
  const { code } = await request.json().catch(() => ({}));
  if (typeof code !== 'string' || !code) return new Response(null, { status: 400 });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
    }),
  });
  if (!response.ok) return new Response(null, { status: 502 });

  const { access_token } = await response.json();
  return Response.json({ access_token });
}

async function discordUser(request) {
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const response = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: authorization } });
  return response.ok ? response.json() : null;
}

async function saveResult(request, env, user) {
  const { scope, day, attempts, grid } = await request.json().catch(() => ({}));
  const now = new Date();
  // Yesterday is accepted for a game finished just before midnight and sent just after.
  const validDays = [parisDay(now), parisDay(new Date(now - 86400000))];
  const lines = typeof grid === 'string' ? grid.split('\n') : [];
  const valid =
    SNOWFLAKE.test(scope) &&
    validDays.includes(day) &&
    Number.isInteger(attempts) && attempts >= 1 && attempts <= 7 &&
    GRID.test(grid) &&
    lines.length === Math.min(attempts, 6) &&
    (attempts === 7) !== (lines[lines.length - 1] === 'ccccc');
  if (!valid) return new Response(null, { status: 400 });

  await env.DB.prepare(
    `INSERT INTO results (scope, day, user_id, name, avatar, attempts, grid)
     VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`
  ).bind(scope, day, user.id, user.global_name || user.username, user.avatar, attempts, grid).run();
  return new Response(null, { status: 204 });
}

// ponytail: any signed-in Discord user can read the board of a server id they know.
// Check membership (guilds scope) if the names and scores ever need to stay inside the server.
async function listResults(searchParams, env) {
  const scope = searchParams.get('scope');
  const day = searchParams.get('day');
  if (!SNOWFLAKE.test(scope) || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Response(null, { status: 400 });

  const { results } = await env.DB.prepare(
    `SELECT user_id, name, avatar, attempts, grid FROM results
     WHERE scope = ? AND day = ? ORDER BY attempts, created_at LIMIT 100`
  ).bind(scope, day).all();
  return Response.json(results);
}
