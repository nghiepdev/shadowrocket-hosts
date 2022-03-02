import type {VercelRequest, VercelResponse} from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const hostsText = await fetch('https://iblockads.net/iblockads.net.txt').then(
    res => res.text()
  );

  const hosts = hostsText
    .match(/(?<=127\.0\.0\.1\s)[^\n]+/g)
    ?.filter(
      host =>
        false ===
        ['localhost', ' localhost', 'localhost.localdomain', 'local'].includes(
          host
        )
    );

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
