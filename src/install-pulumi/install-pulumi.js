// Imports
const { join, resolve } = require('path');
const unzip = require('./unzip');
const purge = require('./purge');
const setPerms = require('./set-perms');
const safeMkdir = require('./safe-mkdir');
const download = require('./download');
const getPlatformUrl = require('./get-platform-url');

/// File constants
const TOOLS_DIR = resolve(__dirname, '..', '..', 'tools');
const TAR_FILE = join(TOOLS_DIR, 'pulumi.tar.gz');
const EXEC_NAME = process.platform === 'win32' ? 'pulumi.exe' : 'pulumi';
const EXEC_DIR = join(TOOLS_DIR, EXEC_NAME);

/// Primary logic...
try {
  mkZipDir()
    .then(getZipUrl)
    .then(downloadZip)
    .then(unzipDownload)
    .then(() => Promise.all([setBinPerms(), purgeZip()]))
    .then(notifyCompletion);
} catch (err) {
  console.error(`An unknown error occurred: ${err}`);
  process.exit(-1);
}

/// Supporting functions...
// prettier-ignore
async function mkZipDir() { return await safeMkdir(TOOLS_DIR); }
async function getZipUrl() {
  return getPlatformUrl(process.platform, process.arch);
}
// prettier-ignore
async function downloadZip(url) { return await download(url, TAR_FILE); }
// prettier-ignore
async function unzipDownload() { return await unzip(TAR_FILE, TOOLS_DIR); }
// prettier-ignore
async function setBinPerms() { return await setPerms(EXEC_DIR, 0o755) }
async function purgeZip() {
  console.log('Cleaning up temporary artifacts...');
  await purge(TAR_FILE);
  console.log('Removed temporary artifacts.');
  return Promise.resolve();
}
function notifyCompletion() {
  const msg =
    process.platform === 'win32'
      ? 'Installation completed!'
      : 'Installation completed! 🎉';
  console.log('\x1b[1;35m%s\x1b[0m', msg);
}
