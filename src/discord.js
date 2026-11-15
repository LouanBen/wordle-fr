// Le Mot as a Discord Activity.
// Discord loads Activities in an iframe served from <client_id>.discordsays.com
// and adds frame_id to the query string; outside Discord nothing here runs.

export const inDiscord = new URLSearchParams(window.location.search).has('frame_id');

// The client id is the first label of the proxy host, so the same build works for any Discord app.
const clientId = window.location.hostname.split('.')[0];

let sdk = null;
let authenticated = false;

export async function initDiscord() {
  if (!inDiscord) return;
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
}

// Sharing needs an authenticated session. Asked on the first share only,
// so players who never share never see the consent prompt.
async function authenticate() {
  if (authenticated) return;
  const { code } = await sdk.commands.authorize({
    client_id: clientId,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify'],
  });
  // Same origin: Discord's proxy forwards it to the server that hosts the app.
  const response = await fetch('/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error(`token exchange failed: ${response.status}`);
  const { access_token } = await response.json();
  await sdk.commands.authenticate({ access_token });
  authenticated = true;
}

// Opens Discord's share modal; Discord appends the Activity link to the message.
// Returns null when Discord refused, so the caller can fall back to the clipboard.
export async function shareInDiscord(message) {
  try {
    await authenticate();
    const { success } = await sdk.commands.shareLink({ message });
    return success;
  } catch (error) {
    console.error('[discord] share failed', JSON.stringify(error), error);
    return null;
  }
}
