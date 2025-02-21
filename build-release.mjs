import { execSync } from 'child_process';
import { generateKeyPairSync } from 'crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';

const generatePemIfNeeded = () => {
  const pemPath = 'keys/private.pem';

  if (!existsSync('keys')) {
    mkdirSync('keys');
  }

  if (!existsSync(pemPath)) {
    console.log('Generating new private key...');

    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    writeFileSync(pemPath, privateKey);
    console.log('Private key generated and saved to keys/private.pem');
  }

  return readFileSync(pemPath);
};

console.log('Building extension...');
execSync('npm version patch', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });

generatePemIfNeeded();

const releaseDir = join('releases');
if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir);
}

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const crxFileName = `teams-pwa-enhancements-v${packageJson.version}.crx`;
const crxFilePath = join(releaseDir, crxFileName);

console.log('Creating CRX file...');
execSync(`google-chrome --pack-extension=./dist --pack-extension-key=keys/private.pem`, { stdio: 'inherit' });

renameSync('dist.crx', crxFilePath);

console.log(`\nRelease ${packageJson.version} created successfully!`);
console.log(`CRX file: ${crxFilePath}`);
