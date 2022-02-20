import fs from 'fs';
import path from 'path';
import pupa from 'pupa';
import readPkg from 'read-pkg';
import {Octokit} from 'octokit';
import type {VercelRequest, VercelResponse} from '@vercel/node';

const octokit = new Octokit();

const shadowrocketTemplate = fs.readFileSync(
  path.resolve('src/shadowrocket.conf.template'),
  'utf-8'
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const {homepage} = await readPkg();

  const {
    data: {pushed_at},
  } = await octokit.rest.repos.get({
    owner: 'bigdargon',
    repo: 'hostsVN',
  });

  const hostsVNResponse = await octokit.rest.repos.getContent({
    owner: 'bigdargon',
    repo: 'hostsVN',
    mediaType: {
      format: 'raw',
    },
    path: 'option/hostsVN-shadowrocket.conf',
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
        rules,
        rewrites,
        hostname,
      }).replace('FINAL,DIRECT', 'FINAL,PROXY')
    );
}
