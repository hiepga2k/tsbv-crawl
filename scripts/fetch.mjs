import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const url =
  process.argv[2] ||
  process.env.FEED_URL ||
  'https://buzzsprout.com/1891921.rss';

const outFile = process.env.OUT_FILE || join(projectRoot, 'data', 'feed.json');

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: '__cdata',
});

async function main() {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'tsbv-crawl/1.0 (private podcatcher)' },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';

  const base = {
    fetchedAt: new Date().toISOString(),
    url,
    contentType,
  };

  const trimmed = text.trimStart();
  const looksLikeXml = trimmed.startsWith('<');

  const output = looksLikeXml
    ? { ...base, parsed: xmlParser.parse(text) }
    : { ...base, raw: text };

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Wrote ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
