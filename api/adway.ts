import type {VercelRequest, VercelResponse} from '@vercel/node';

import octokit from '../src/octokit';
import {ADWAY_REPOSITORY} from '../src/config';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const adwayResponse = await octokit.rest.repos.getContent({
    owner: ADWAY_REPOSITORY.owner,
    repo: ADWAY_REPOSITORY.repo,
    mediaType: {
      format: 'raw',
    },
    path: ADWAY_REPOSITORY.path,
  });

  const hostsText = adwayResponse.data.toString();

  const hosts = hostsText
    .match(/(?<=127\.0\.0\.1\s)[^\n]+/g)
    ?.filter(host => false === [' localhost'].includes(host));

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
