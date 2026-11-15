// Le Mot as a Discord Activity.
// Discord loads Activities in an iframe served from <client_id>.discordsays.com
// and adds frame_id to the query string; outside Discord nothing here runs.

export const inDiscord = new URLSearchParams(window.location.search).has('frame_id');

let sdk = null;

export async function initDiscord() {
  if (!inDiscord) return;
  const { DiscordSDK } = await import('@discord/embedded-app-sdk');
  // The client id is the first label of the proxy host, so the same build works for any Discord app.
  sdk = new DiscordSDK(window.location.hostname.split('.')[0]);
  await sdk.ready();

  // The Activity iframe cannot open new tabs: Discord opens external links itself, after a confirmation.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[target="_blank"]');
    if (!link) return;
    event.preventDefault();
    sdk.commands.openExternalLink({ url: link.href });
  });
}

// Opens Discord's share modal; Discord appends the Activity link to the message.
// Returns null when Discord refused the command, so the caller can fall back to the clipboard.
export async function shareInDiscord(message) {
  try {
    console.info('[discord] shareLink sent');
    const { success } = await sdk.commands.shareLink({ message });
    return success;
  } catch (error) {
    console.error('[discord] shareLink failed', error);
    return null;
  }
}
