import { execSync } from 'child_process';
import ChromeExtension from 'crx';
import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'crypto';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const releaseDir = 'releases';
const keyPath = join(releaseDir, 'private.pem');
const manifestPath = './dist/manifest.json';

const generatePrivateKey = () => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return privateKey;
};

const getPublicKeyForManifest = (privateKeyPem) => {
  const privateKey = createPrivateKey(privateKeyPem);
  const publicKey = createPublicKey(privateKey).export({ format: 'der', type: 'spki' });
  return publicKey.toString('base64');
};

console.log('Building extension...');

execSync('pnpm version patch && pnpm run build', { stdio: 'inherit' });

try {
  await access(releaseDir);
} catch {
  await mkdir(releaseDir);
}

const crx = new ChromeExtension();

let privateKeyPem;
try {
  await access(keyPath);
  privateKeyPem = await readFile(keyPath, 'utf8');
} catch {
  privateKeyPem = generatePrivateKey();
  await writeFile(keyPath, privateKeyPem);
}

crx.privateKey = Buffer.from(privateKeyPem);

const packageJson = JSON.parse(await readFile('./package.json'));
const version = packageJson.version;

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.version = version;
manifest.key = getPublicKeyForManifest(privateKeyPem);
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

await crx.load('./dist');

const packed = await crx.pack();
await writeFile(join(releaseDir, `teams-pwa-enhancements-v${version}.crx`), packed);

console.log(`Created release v${version}`);
