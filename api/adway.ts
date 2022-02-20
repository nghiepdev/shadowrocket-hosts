import type {VercelRequest, VercelResponse} from '@vercel/node';

import octokit from '../src/octokit';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const adwayResponse = await octokit.rest.repos.getContent({
    owner: 'AdAway',
    repo: 'adaway.github.io',
    mediaType: {
      format: 'raw',
    },
    path: 'hosts.txt',
  });

  const hostsText = adwayResponse.data.toString();

  const hosts = hostsText
    .match(/(?<=127\.0\.0\.1\s)[^\n]+/g)
    ?.filter(host => host.includes('localhost') === false);

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
