const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'config.js');

function parseEnvFile(contents) {
  const values = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

if (!fs.existsSync(envPath)) {
  throw new Error('.env file not found in project root.');
}

const env = parseEnvFile(fs.readFileSync(envPath, 'utf8'));
const requiredKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
];

const missingKeys = requiredKeys.filter((key) => !env[key]);
if (missingKeys.length > 0) {
  throw new Error(`Missing required .env keys: ${missingKeys.join(', ')}`);
}

const config = {
  SUPABASE_URL: env.SUPABASE_URL,
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  GEMINI_API_KEY: env.GEMINI_API_KEY,
  GEMINI_MODEL: env.GEMINI_MODEL,
};

const fileContents = 'window.APP_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n';

fs.writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Generated ${path.basename(outputPath)} from .env`);
