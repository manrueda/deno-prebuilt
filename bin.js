#!/usr/bin/env node
const { spawn } = require('child_process');
const { binary } = require('./index.js');

const [, , ...args] = process.argv;

const deno = spawn(binary, args, {
  cwd: process.cwd(),
  shell: false,
  windowsHide: true,
  stdio: ['inherit', 'inherit', 'inherit']
});

deno.on('close', code => {
  process.exit(code);
});
