const { sep } = require('path');
const { execFileSync } = require('child_process');
const tap = require('tap');
const fs = require('fs');
const index = require('./index.js');
const pkg = require('./package.json');

tap.test('module exports', t => {
  t.equal(
    index.binary,
    `${__dirname}${sep}.bin${sep}deno${process.platform === 'win32' ? '.exe' : ''}`
  );
  t.equal(
    index.compressed,
    `${__dirname}${sep}.bin${sep}deno.${process.platform === 'win32' ? 'zip' : 'gz'}`
  );
  t.end();
});

tap.test('check installed binary', t => {
  const stat = fs.statSync(index.binary);
  t.equal(stat.isFile(), true);
  t.end();
});

const versionExtraction = /deno: (\d*\.\d*\.\d*)\r?\nv8: \d*\.\d*\.\d*\r?\ntypescript: \d*\.\d*\.\d*/m;

tap.test('check binary version directly', t => {
  const result = execFileSync(index.binary, ['-v']);

  t.match(result.toString(), versionExtraction);
  t.equal(result.toString().match(versionExtraction)[1], pkg.binVersion);
  t.end();
});

tap.test('check binary version using node', t => {
  const result = execFileSync('node', ['bin.js', '-v']);

  t.match(result.toString(), versionExtraction);
  t.equal(result.toString().match(versionExtraction)[1], pkg.binVersion);
  t.end();
});

tap.test('check deno execution directly', t => {
  const result = execFileSync(index.binary, [
    '--allow-read',
    'https://deno.land/std/examples/cat.ts',
    'README.md'
  ]);

  t.equal(result.toString(), fs.readFileSync('./README.md').toString());
  t.end();
});

tap.test('check deno execution directly', t => {
  const result = execFileSync('node', [
    'bin.js',
    '--allow-read',
    'https://deno.land/std/examples/cat.ts',
    'README.md'
  ]);

  t.equal(result.toString(), fs.readFileSync('./README.md').toString());
  t.end();
});
