import type {VercelRequest, VercelResponse} from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const hostsText = await fetch('https://abpvn.com/android/abpvn.txt').then(
    res => res.text()
  );

  const hosts = hostsText.match(/(?<=0\.0\.0\.0\s)[\w-\.]+/g);

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
