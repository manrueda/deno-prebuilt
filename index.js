const { sep } = require('path');
module.exports = module.exports || {};

module.exports.binary = `${__dirname}${sep}.bin${sep}deno${
  process.platform === 'win32' ? '.exe' : ''
}`;
module.exports.compressed = `${__dirname}${sep}.bin${sep}deno.${
  process.platform === 'win32' ? 'zip' : 'gz'
}`;
