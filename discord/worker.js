// Cloudflare Worker serving Le Mot as a Discord Activity.
// Static files come from the build; the only route is the OAuth code exchange,
// which needs the client secret and so cannot run in the browser.

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/api/token') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response(null, { status: 405 });

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
  },
};
