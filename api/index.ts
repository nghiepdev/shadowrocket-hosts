import fs from 'fs';
import path from 'path';
import got from 'got';
import pupa from 'pupa';
import readPkg from 'read-pkg';
import type {VercelRequest, VercelResponse} from '@vercel/node';

import {Repository} from '../types';

const REPO = 'bigdargon/hostsVN';

const shadowrocketTemplate = fs.readFileSync(
  path.resolve('shadowrocket.conf.template'),
  'utf-8'
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const {homepage} = await readPkg();

  const {pushed_at} = await got
    .get(`https://api.github.com/repos/${REPO}`)
    .json<Repository>();

  const hostsVN = await got
    .get(
      `https://raw.githubusercontent.com/${REPO}/master/option/hostsVN-shadowrocket.conf`
    )
    .text();

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
