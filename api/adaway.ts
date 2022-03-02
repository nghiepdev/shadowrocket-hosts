import type {VercelRequest, VercelResponse} from '@vercel/node';

import octokit from '../src/octokit';
import {ADAWAY_REPOSITORY} from '../src/config';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const adawayResponse = await octokit.rest.repos.getContent({
    owner: ADAWAY_REPOSITORY.owner,
    repo: ADAWAY_REPOSITORY.repo,
    mediaType: {
      format: 'raw',
    },
    path: ADAWAY_REPOSITORY.path,
  });

  const hostsText = adawayResponse.data.toString();

  const hosts = hostsText
    .match(/(?<=127\.0\.0\.1\s)[^\n]+/g)
    ?.filter(host => false === [' localhost'].includes(host));

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
