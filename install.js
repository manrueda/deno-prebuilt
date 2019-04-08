'use strict';
const os = require('os');
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
const childProcess = require('child_process');
const yauzl = require('yauzl');
const { binVersion } = require('./package.json');
const { binary, compressed } = require('./index.js');

if (process.platform !== 'darwin' && process.platform !== 'linux' && process.platform !== 'win32') {
  console.error(
    `Deno's binaries are only provided for Linux, macOS and Windows, ${
      process.platform
    } is not supported.`
  );
  process.exit(1);
}

if (os.arch() !== 'x64') {
  console.error(
    `Deno's binaries are only provided for x64 architecture, ${os.arch()} is not supported.`
  );
  process.exit(1);
}

const standardizedPlatform = () => {
  switch (process.platform) {
    case 'darwin':
      return 'osx';
    case 'win32':
      return 'win';
    case 'linux':
      return 'linux';
  }
};

const url = (platform, version) =>
  `https://github.com/denoland/deno/releases/download/v${version}/deno_${platform}_x64.${
    platform === 'win' ? 'zip' : 'gz'
  }`;

const releaseUrl = url(standardizedPlatform(), binVersion);

const makeReq = url =>
  new Promise((resolve, reject) => {
    const request = https.request(url, resolve);
    request.on('error', reject);
    request.end();
  });

const consume = stream =>
  new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('close', resolve);
  });

const extractZip = () =>
  new Promise((resolve, reject) => {
    yauzl.open(compressed, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        reject(err);
        return;
      }
      zipFile.readEntry();
      zipFile.on('entry', function(entry) {
        if (entry.fileName !== 'deno.exe') {
          zipFile.readEntry();
        } else {
          // file entry
          zipFile.openReadStream(entry, function(err, readStream) {
            if (err) {
              reject(err);
              return;
            }
            resolve(consume(readStream.pipe(fs.createWriteStream(binary))));
          });
        }
      });
    });
  });

console.log(`Downloading deno v${binVersion} (${standardizedPlatform()}) on ${binary}`);

makeReq(releaseUrl)
  .then(res => {
    debugger;
    if (res.statusCode === 302) {
      return makeReq(res.headers.location);
    }
    return res;
  })
  .then(res => {
    const stream = res.pipe(fs.createWriteStream(compressed));
    return consume(stream);
  })
  .then(() => {
    if (process.platform === 'win32') {
      return extractZip();
    } else {
      const stream = fs
        .createReadStream(compressed)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(binary));
      return consume(stream);
    }
  })
  .then(() => {
    if (process.platform !== 'win32') {
      childProcess.execSync(`chmod +x ${binary}`);
    }
    fs.unlinkSync(compressed);
  })
  .catch(error => {
    console.error(error.message || error);
    process.exit(1);
  });
