# deno-prebuilt

npm package to install [deno](https://deno.land) pre-built binary.

> This is only a channel to distribute [deno](https://deno.land) as a npm package, its not related to the deno development team.

## Usage

```bash
npm i deno-prebuilt
```

This command will install the `deno-prebuilt` and download the correct binaries for your system. To access the bin path import the package.

```javascript
const { binary } = require('deno-prebuilt')
console.log(binary)
```

## Usage as CLI

This package provides a helper node cli that pipes into deno cli


```bash
npm i -g deno-prebuilt

deno-prebuilt --allow-read https://deno.land/std/examples/cat.ts /etc/passwd
```