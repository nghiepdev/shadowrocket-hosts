import fs from 'fs';
import path from 'path';
import pupa from 'pupa';
import readPkg from 'read-pkg';
import type {VercelRequest, VercelResponse} from '@vercel/node';

import octokit from '../src/octokit';
import {REPOSITORY_TEMPLATE} from '../src/config';

const shadowrocketTemplate = fs.readFileSync(
  path.resolve('src/shadowrocket.conf.template'),
  'utf-8'
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const isProxyFallback = request.query.fallback === 'proxy';
  const includeAbpvnHosts = request.query.abpvn !== '0';
  const includeIBlockAdsHosts = request.query.iblockads !== '0';
  const includeAdAwayHosts = request.query.adaway !== '0';
  const includeGoodbyeAdsHosts = request.query.goodbyeads !== '0';

  const {homepage} = await readPkg();

  const {
    data: {pushed_at},
  } = await octokit.rest.repos.get({
    owner: REPOSITORY_TEMPLATE.owner,
    repo: REPOSITORY_TEMPLATE.repo,
  });

  const hostsVNResponse = await octokit.rest.repos.getContent({
    owner: REPOSITORY_TEMPLATE.owner,
    repo: REPOSITORY_TEMPLATE.repo,
    mediaType: {
      format: 'raw',
    },
    path: REPOSITORY_TEMPLATE.path,
  });

  const hostsVN = hostsVNResponse.data.toString();

  const [rules] = hostsVN.match(/(?<=\[Rule\]\s).*(?=FINAL)/s) ?? [];
  const [rewrites] =
    hostsVN.match(/(?<=\[URL\sRewrite\]\s).*(?=\[MITM)/s) ?? [];
  const [hostname] = hostsVN.match(/(?<=hostname\s=\s).*/) ?? [];

  response
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(
      pupa(shadowrocketTemplate, {
        updated_at: pushed_at,
        update_url: homepage,
        abpvn: includeAbpvnHosts
          ? `DOMAIN-SET,${homepage}/api/abpvn,REJECT`
          : '',
        iblockads: includeIBlockAdsHosts
          ? `DOMAIN-SET,${homepage}/api/iblockads,REJECT`
          : '',
        adaway: includeAdAwayHosts
          ? `DOMAIN-SET,${homepage}/api/adaway,REJECT`
          : '',
        goodbyeads: includeGoodbyeAdsHosts
          ? `DOMAIN-SET,${homepage}/api/goodbyeads,REJECT`
          : '',
        rules,
        fallback: isProxyFallback ? 'FINAL,PROXY' : 'FINAL,DIRECT',
        rewrites,
        hostname,
      })
    );
}
