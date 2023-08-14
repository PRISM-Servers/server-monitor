import 'dotenv/config';

(async () => {
  if (!process.env.DISCORD_WEBHOOK) {
    console.error('Missing webhook url');
    process.exit(1);
  }

  const res = await fetch(process.env.DISCORD_WEBHOOK).catch(e => {
    console.error(e);
    process.exit(1);
  });

  const text = await res.text();
  if (!res.ok || !text.includes('channel_id')) {
    console.error('Invalid response', res.status, text);
    process.exit(1);
  }
})();

let fail = 0;

function send() {
  const body = JSON.stringify({content: '@here Server seems to be down', username: 'Server Monitor'});
  fetch(process.env.DISCORD_WEBHOOK, {method: 'POST', body, headers: {'content-type': 'application/json'}}).catch(console.error);
}

function failed(...statuses) {
  console.error('Failed to ping', ...statuses);
  fail++;

  if (fail == 3) {
    send();
  }
}

setInterval(async () => {
  const r1 = await fetch('https://prismrust.com/').catch(console.error);
  const r2 = await fetch('https://store.prismrust.com/').catch(console.error);

  if (!r1?.ok || !r2?.ok) {
    failed(r1?.status, r2?.status);
  } else {
    fail = 0;
  }
}, 3e5);