# Shadowrocket Hosts

> A collection of awesome hosts block ads for [Shadowrocket](https://apps.apple.com/vn/app/shadowrocket/id932747118).

## Sources of hosts data

- [bigdargon/hostsVN](https://github.com/bigdargon/hostsVN)
- [abpvn/abpvn](https://github.com/abpvn/abpvn)
- [iBlockAds](https://iblockads.net)
- [AdAway/adaway.github.io](https://github.com/AdAway/adaway.github.io)
- [jerryn70/GoodbyeAds](https://github.com/jerryn70/GoodbyeAds)

## Usage

Import hosts file

<pre>
<a href="https://shadowrocket-hosts.vercel.app">https://shadowrocket-hosts.vercel.app</a>
</pre>

See more step-by-step instructions [here](https://github.com/bigdargon/hostsVN/wiki/Shadowrocket)

By default hosts file includes all sources of hosts, for example to excludes `abpvn`, `iblockads`

<pre>
<a href="https://shadowrocket-hosts.vercel.app?abpvn=0&iblockads=0">https://shadowrocket-hosts.vercel.app?abpvn=0&iblockads=0</a>
</pre>

If you use VPN Proxy or V2Ray such as VMess, VLess,... then change the fallback behavior to proxy value

<pre>
<a href="https://shadowrocket-hosts.vercel.app?fallback=proxy">https://shadowrocket-hosts.vercel.app?fallback=proxy</a>
</pre>

## License

MIT
