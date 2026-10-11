// Production catalogue releases use the same Python validation/pricing as the API.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const app = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const frontend = resolve(app, 'frontend');
const production = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: frontend, stdio: 'inherit', ...options });
  if (result.error || result.status !== 0) throw new Error(`Release step failed: ${command} ${args[0]}`);
}
run(process.execPath, ['--test', 'src/lib/cart.test.js', 'src/lib/mithaiBox.test.js', 'src/lib/favourites.test.js', 'src/lib/productOrder.test.js']);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build']);
if (!production) {
  // Preview builds must never write to production, even if credentials were shared.
  console.log('Preview/local build: catalogue database writes disabled.');
  run(process.execPath, ['scripts/prerender.mjs'], { env: { ...process.env, PRERENDER_CATALOG_SNAPSHOT: '1' } });
  run(process.execPath, ['--test', 'src/lib/seo.test.js']);
} else {
  if (process.env.VERCEL_GIT_COMMIT_REF !== 'main') throw new Error('Production releases must come from main.');
  if (!process.env.MONGO_URL || !process.env.DB_NAME) throw new Error('Missing production database configuration.');
  const temp = mkdtempSync(join(tmpdir(), 'pahwajee-release-'));
  try {
    const python = process.platform === 'win32' ? 'python' : 'python3';
    const deps = join(temp, 'dependencies');
    run(python, ['-m', 'pip', 'install', '--quiet', '--disable-pip-version-check', '--target', deps, '-r', resolve(app, 'requirements.txt')]);
    const env = { ...process.env, PYTHONPATH: deps, RELEASE_DATA_FILE: join(temp, 'public-data.json') };
    const script = resolve(app, 'backend/release_catalogue.py');
    run(python, ['-m', 'unittest', 'discover', '-s', resolve(app, 'backend/tests'), '-p', 'test_catalogue_release.py'], { env });
    run(python, [script, 'prepare'], { env });
    run(process.execPath, ['scripts/prerender.mjs'], { env });
    run(process.execPath, ['--test', 'src/lib/seo.test.js']);
    // No catalogue writes until tests, compilation and every public page have built.
    run(python, [script, 'apply'], { env });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
