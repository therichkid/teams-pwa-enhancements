import { execSync } from 'child_process';
import ChromeExtension from 'crx';
import { generateKeyPairSync } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('Building extension...');
execSync('npm version patch && npm run build', { stdio: 'inherit' });

const releaseDir = 'releases';
const keyPath = join(releaseDir, 'private.pem');
!existsSync(releaseDir) && mkdirSync(releaseDir);

if (!existsSync(keyPath)) {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(keyPath, privateKey);
}

const crx = new ChromeExtension({
  privateKey: readFileSync(keyPath),
});

await crx.load('./dist');
const packageJson = JSON.parse(readFileSync('./package.json'));
const version = packageJson.version;
createWriteStream(join(releaseDir, `teams-pwa-enhancements-v${version}.crx`)).end(await crx.pack());

console.log(`Created release v${version}`);
