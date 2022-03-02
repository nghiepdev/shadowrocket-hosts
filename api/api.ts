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
  const includeAbpvnRules = request.query.abpvn !== '0';
  const includeIBlockadsRules = request.query.iblockads !== '0';
  const includeAdwayRules = request.query.adway !== '0';
  const includeGoodbyeAdsRules = request.query.goodbyeads !== '0';

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

  const [rules] = hostsVN.match(/(?<=\[Rule\]\s).*(?=\[Host)/s) ?? [];
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
        abpvn: includeAbpvnRules
          ? `DOMAIN-SET,${homepage}/api/abpvn,REJECT`
          : '',
        iblockads: includeIBlockadsRules
          ? `DOMAIN-SET,${homepage}/api/iblockads,REJECT`
          : '',
        adway: includeAdwayRules
          ? `DOMAIN-SET,${homepage}/api/adway,REJECT`
          : '',
        goodbyeads: includeGoodbyeAdsRules
          ? `DOMAIN-SET,${homepage}/api/goodbyeads,REJECT`
          : '',
        rules,
        rewrites,
        hostname,
      }).replace('FINAL,DIRECT', '')
    );
}
