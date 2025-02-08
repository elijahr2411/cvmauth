# Deprecated

This program is deprecated and no longer recommended for use. For banning functionality, you can use the builtin `cvmban` system included with newer versions of CollabVM server. For VPN/proxy detection, you can use [resty-whitelister](https://git.computernewb.com/computernewb/resty-whitelister) (recommended) or [whitelister-eternal](https://git.computernewb.com/computernewb/whitelister-eternal).

cvmauth will not receive any more updates.

# CollabVM Authenticator

A small node program to implement banning and keep bots away from your CollabVM instance.

## Running it

1. Install dependencies: `npm i`
2. Build it: `npm run build`
3. Copy config.example.toml to config.toml and fill it out
4. Run it: `npm run serve` or `node build/index.js`
