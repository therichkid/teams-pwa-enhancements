import { execSync } from 'child_process';
import ChromeExtension from 'crx';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const releaseDir = 'releases';
const keyPath = join(releaseDir, 'private.pem');

console.log('Building extension...');
execSync('npm version patch && npm run build', { stdio: 'inherit' });

try {
  await access(releaseDir);
} catch {
  await mkdir(releaseDir);
}

const crx = new ChromeExtension();

try {
  await access(keyPath);
  crx.privateKey = await readFile(keyPath);
} catch {
  await writeFile(keyPath, await crx.generateKey());
}

await crx.load('./dist');

const packageJson = JSON.parse(await readFile('./package.json'));
const version = packageJson.version;

const packed = await crx.pack();
await writeFile(join(releaseDir, `teams-pwa-enhancements-v${version}.crx`), packed);

console.log(`Created release v${version}`);
