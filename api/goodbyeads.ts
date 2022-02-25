import type {VercelRequest, VercelResponse} from '@vercel/node';

import octokit from '../src/octokit';
import {GOODBYE_ADS_REPOSITORY} from '../src/config';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const [path1, path2] = GOODBYE_ADS_REPOSITORY.path.split('/');

  const {
    data: {default_branch},
  } = await octokit.rest.repos.get({
    owner: GOODBYE_ADS_REPOSITORY.owner,
    repo: GOODBYE_ADS_REPOSITORY.repo,
  });

  // Level branch
  const {
    data: {tree: level0Tree},
  } = await octokit.rest.git.getTree({
    owner: GOODBYE_ADS_REPOSITORY.owner,
    repo: GOODBYE_ADS_REPOSITORY.repo,
    tree_sha: default_branch,
  });
  const {sha: pathLevel1Sha} = level0Tree.find(({path}) => path === path1)!;

  const {
    data: {tree: level1Tree},
  } = await octokit.rest.git.getTree({
    owner: GOODBYE_ADS_REPOSITORY.owner,
    repo: GOODBYE_ADS_REPOSITORY.repo,
    tree_sha: pathLevel1Sha!,
  });
  const {sha: pathLevel2Sha} = level1Tree.find(({path}) => path === path2)!;

  const adwayResponse = await octokit.rest.git.getBlob({
    owner: GOODBYE_ADS_REPOSITORY.owner,
    repo: GOODBYE_ADS_REPOSITORY.repo,
    mediaType: {
      format: 'raw',
    },
    file_sha: pathLevel2Sha!,
  });

  const hostsText = adwayResponse.data.toString();

  const hosts = hostsText
    .match(/(?<=0\.0\.0\.0\s)[\w-\.]+/g)
    ?.filter(host => host !== '0.0.0.0');

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(hosts?.join('\n'));
}
