import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(root, 'campus.db');
const db = new DatabaseSync(target);
db.exec(readFileSync(path.join(root, 'schema.sql'), 'utf8'));
db.close();
console.log(`Created ${path.basename(target)} from schema.sql`);
