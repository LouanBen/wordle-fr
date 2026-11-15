// Le Mot as a Discord Activity.
// Discord loads Activities in an iframe served from <client_id>.discordsays.com
// and adds frame_id to the query string; outside Discord nothing here runs.

export const inDiscord = new URLSearchParams(window.location.search).has('frame_id');

// The client id is the first label of the proxy host, so the same build works for any Discord app.
const clientId = window.location.hostname.split('.')[0];

let sdk = null;

// Resolves to the access token, or null when the player refused or sign-in failed:
// the game still works, without sharing nor the players' board.
let session = Promise.resolve(null);

export function initDiscord() {
  if (!inDiscord) return;
  session = start().catch((error) => {
    console.error('[discord] sign-in failed', JSON.stringify(error), error);
    return null;
  });
}

async function start() {
  const { DiscordSDK } = await import('@discord/embedded-app-sdk');
  sdk = new DiscordSDK(clientId);
  await sdk.ready();

  // The Activity iframe cannot open new tabs: Discord opens external links itself, after a confirmation.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[target="_blank"]');
    if (!link) return;
    event.preventDefault();
    sdk.commands.openExternalLink({ url: link.href });
  });

  const { code } = await sdk.commands.authorize({
    client_id: clientId,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify'],
  });
  // Same origin: Discord's proxy forwards /api to the server that hosts the app.
  const response = await fetch('/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error(`token exchange failed: ${response.status}`);
  const { access_token } = await response.json();
  await sdk.commands.authenticate({ access_token });
  return access_token;
}

// The board is per server; outside a server (DMs, group DMs) it is per channel.
const boardScope = () => sdk.guildId || sdk.channelId;

async function api(path, token, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.status === 204 ? null : response.json();
}

// Opens Discord's share modal; Discord appends the Activity link to the message.
// Returns null when Discord refused, so the caller can fall back to the clipboard.
export async function shareInDiscord(message) {
  try {
    if (!(await session)) return null;
    const { success } = await sdk.commands.shareLink({ message });
    return success;
  } catch (error) {
    console.error('[discord] share failed', JSON.stringify(error), error);
    return null;
  }
}

// attempts: 1 to 6, or 7 for a lost game. grid: one line per attempt of c/p/i.
export async function postResult(day, attempts, grid) {
  const token = await session;
  if (!token) return;
  await api('/api/results', token, {
    method: 'POST',
    body: JSON.stringify({ scope: boardScope(), day, attempts, grid }),
  }).catch((error) => console.error('[discord] result not saved', error));
}

export async function fetchPlayers(day) {
  const token = await session;
  if (!token) return [];
  const query = new URLSearchParams({ scope: boardScope(), day });
  return api(`/api/results?${query}`, token);
}
