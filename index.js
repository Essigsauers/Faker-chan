'use strict';

// Insomnia template tags. No external dependencies are used so the plugin can
// be installed directly from a folder or from npm.
const crypto = require('crypto');

const FIRST_NAMES = ['Александр', 'Алексей', 'Андрей', 'Анна', 'Виктория', 'Дмитрий', 'Екатерина', 'Елена', 'Иван', 'Мария', 'Михаил', 'Наталья', 'Ольга', 'Павел', 'Сергей', 'Татьяна'];
const LAST_NAMES = ['Александров', 'Васильев', 'Иванов', 'Кузнецов', 'Морозов', 'Петров', 'Смирнов', 'Соколов', 'Фёдоров', 'Попова', 'Волкова', 'Козлова', 'Новикова', 'Орлова'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Краснодар'];
const STREETS = ['Тверская', 'Ленина', 'Пушкина', 'Мира', 'Советская', 'Гагарина', 'Центральная', 'Лесная'];
const COUNTRIES = ['Россия'];
const USER_AGENTS = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0 Safari/537.36'];
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA_UPPER = ALPHA_LOWER.toUpperCase();
const NUMERIC = '0123456789';
const memoryCounters = new Map();
const pendingCounters = new Map();

const pick = values => values[randomInt(0, values.length - 1)];
const randomInt = (min, max) => {
  min = Math.ceil(Number(min)); max = Math.floor(Number(max));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (min > max) [min, max] = [max, min];
  return crypto.randomInt(min, max + 1);
};
const boundedInt = (value, fallback, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback));
const randomString = (length, charset) => Array.from({ length: boundedInt(length, 16, 0, 100000) }, () => charset[randomInt(0, charset.length - 1)]).join('');
const slug = value => value.toLowerCase().replace(/ё/g, 'e').replace(/[^a-zа-я]/g, '').replace(/[а-я]/g, char => ({ а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'ts', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya' }[char]));
const formatDate = (date, format) => {
  const pad = n => String(n).padStart(2, '0');
  const map = { YYYY: date.getUTCFullYear(), MM: pad(date.getUTCMonth() + 1), DD: pad(date.getUTCDate()) };
  return String(format || 'YYYY-MM-DD').replace(/YYYY|MM|DD/g, token => map[token]);
};
const dateOffset = (direction, range, format) => {
  const days = boundedInt(range, 30, 1, 36500);
  const offset = randomInt(1, days) * 86400000 * direction;
  return formatDate(new Date(Date.now() + offset), format);
};
const base64url = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
const tag = (name, category, description, args, run, extra) => ({ name, displayName: `FakeC - ${category.replace(/ · /g, ' ')}`, description, args: args || [], run, ...(extra || {}) });
const numberArgs = (min, max, precision) => [
  { displayName: 'Min', type: 'number', defaultValue: min },
  { displayName: 'Max', type: 'number', defaultValue: max },
  ...(precision === undefined ? [] : [{ displayName: 'Precision', type: 'number', defaultValue: precision }]),
];

const requestId = context => {
  try { return context.request && typeof context.request.getId === 'function' ? context.request.getId() : 'unknown-request'; } catch (_) { return 'unknown-request'; }
};
const readCounter = async (context, key) => {
  try { const value = await context.store.getItem(key); return value === null ? undefined : Number(value); } catch (_) { return memoryCounters.get(key); }
};
const writeCounter = async (context, key, value) => {
  memoryCounters.set(key, value);
  try { await context.store.setItem(key, String(value)); } catch (_) {}
};
const counterScopeId = async (context, scope) => {
  if (scope === 'global') return 'global';
  const id = requestId(context);
  if (scope === 'request') return `request:${id}`;
  // The public Template Tag API only documents a request id. When data export
  // is available, use its resource tree to obtain the actual folder/workspace.
  try {
    const raw = await context.data.export.insomnia({ includePrivate: false, format: 'json' });
    const resources = JSON.parse(raw).resources || [];
    const byId = new Map(resources.map(resource => [resource._id, resource]));
    let node = byId.get(id);
    let folder;
    while (node && node.parentId) {
      node = byId.get(node.parentId);
      if (!node) break;
      if (!folder && (node._type === 'request_group' || node._type === 'folder')) folder = node._id;
      if (node._type === 'workspace') return scope === 'folder' ? `folder:${folder || `root:${node._id}`}` : `workspace:${node._id}`;
    }
  } catch (_) {}
  // Fallbacks deliberately isolate unknown contexts instead of mixing counters.
  return scope === 'folder' ? `folder:request:${id}` : `workspace:request:${id}`;
};
const formattedCounter = (value, prefix, suffix, padding) => `${String(prefix || '')}${String(value).padStart(boundedInt(padding, 0, 0, 100), '0')}${String(suffix || '')}`;
const counterArgs = [
  { displayName: 'Scope', type: 'enum', defaultValue: 'folder', options: [{ displayName: 'Request', value: 'request' }, { displayName: 'Folder', value: 'folder' }, { displayName: 'Workspace', value: 'workspace' }, { displayName: 'Global', value: 'global' }] },
  { displayName: 'Counter Name', type: 'string', defaultValue: 'id' },
  { displayName: 'Initial Value', type: 'number', defaultValue: 0 },
  { displayName: 'Step', type: 'number', defaultValue: 1 },
  { displayName: 'Prefix', type: 'string', defaultValue: '' },
  { displayName: 'Suffix', type: 'string', defaultValue: '' },
  { displayName: 'Padding', type: 'number', defaultValue: 0 },
  { displayName: 'Increment Mode', type: 'enum', defaultValue: 'before-send', options: [{ displayName: 'Before Send', value: 'before-send' }, { displayName: 'After Successful Response', value: 'after-success' }] },
];

const templateTags = [
  tag('fakerUuid', 'Identifier · UUID', 'UUID v4.', [], () => crypto.randomUUID()),
  tag('fakerGuid', 'Identifier · GUID', 'UUID v4, optionally wrapped in braces.', [{ displayName: 'Braces', type: 'boolean', defaultValue: false }], (_ctx, braces) => { const id = crypto.randomUUID(); return braces ? `{${id}}` : id; }),
  tag('fakerRandomId', 'Identifier · Random ID', 'Random identifier.', [{ displayName: 'Length', type: 'number', defaultValue: 10 }, { displayName: 'Character Set', type: 'enum', defaultValue: 'alphanumeric', options: [{ displayName: 'Digits', value: 'digits' }, { displayName: 'Letters', value: 'letters' }, { displayName: 'Letters + digits', value: 'alphanumeric' }, { displayName: 'Lowercase', value: 'lowercase' }, { displayName: 'Uppercase', value: 'uppercase' }] }], (_ctx, length, set) => randomString(length, ({ digits: NUMERIC, letters: ALPHA_LOWER + ALPHA_UPPER, lowercase: ALPHA_LOWER, uppercase: ALPHA_UPPER, alphanumeric: ALPHA_LOWER + ALPHA_UPPER + NUMERIC }[set] || ALPHA_LOWER + ALPHA_UPPER + NUMERIC))),
  tag('fakerCounter', 'Identifier - Counter', 'Persistent sequential identifier with scope and formatting.', counterArgs, async (context, scope, name, initial, step, prefix, suffix, padding, mode) => {
    const scopeId = await counterScopeId(context, scope || 'folder');
    const key = `counter:${scopeId}:${String(name || 'id')}`;
    const initialValue = Number.isFinite(Number(initial)) ? Number(initial) : 0;
    const increment = Number.isFinite(Number(step)) ? Number(step) : 1;
    const pendingKey = `${requestId(context)}:${key}`;
    let current = await readCounter(context, key);
    if (!Number.isFinite(current)) current = initialValue;
    const pending = pendingCounters.get(pendingKey);
    if (pending) current = pending.value;
    const value = current + increment;
    if (mode === 'after-success') pendingCounters.set(pendingKey, { key, value });
    else await writeCounter(context, key, value);
    return formattedCounter(value, prefix, suffix, padding);
  }, { disablePreview: () => true }),
  tag('fakerFirstName', 'Person · First Name', 'Synthetic Russian first name.', [], () => pick(FIRST_NAMES)),
  tag('fakerLastName', 'Person · Last Name', 'Synthetic Russian last name.', [], () => pick(LAST_NAMES)),
  tag('fakerUsername', 'Person · Username', 'ASCII username safe for URLs and JSON.', [{ displayName: 'Strategy', type: 'enum', defaultValue: 'name-dot-last', options: [{ displayName: 'Random', value: 'random' }, { displayName: 'Name.last', value: 'name-dot-last' }, { displayName: 'last_number', value: 'last-number' }, { displayName: 'user + number', value: 'user-number' }] }], (_ctx, strategy) => { const first = slug(pick(FIRST_NAMES)); const last = slug(pick(LAST_NAMES)); const n = randomInt(100, 99999); return ({ random: randomString(10, ALPHA_LOWER + NUMERIC), 'name-dot-last': `${first}.${last}`, 'last-number': `${last}_${n}`, 'user-number': `user${n}` }[strategy] || `${first}.${last}`); }),
  tag('fakerEmail', 'Contact · Email', 'Synthetic email using reserved test domains.', [], () => `${slug(pick(FIRST_NAMES))}.${slug(pick(LAST_NAMES))}${randomInt(1, 999)}@${pick(['example.com', 'example.org', 'example.net'])}`),
  tag('fakerPhoneRu', 'Contact · Phone Number', 'Russian mobile phone in +79XXXXXXXXX format.', [], () => `+79${randomString(9, NUMERIC)}`),
  tag('fakerCountry', 'Location · Country', 'Country name.', [], () => pick(COUNTRIES)),
  tag('fakerCity', 'Location · City', 'Russian city.', [], () => pick(CITIES)),
  tag('fakerStreet', 'Location · Street', 'Street name.', [], () => pick(STREETS)),
  tag('fakerPostalCode', 'Location · Postal Code', 'Six-digit Russian postal code.', [], () => randomString(6, NUMERIC)),
  tag('fakerFullAddress', 'Location · Full Address', 'City, street, house number.', [], () => `${pick(CITIES)}, ${pick(STREETS)}, ${randomInt(1, 999)}`),
  tag('fakerLatitude', 'Location · Latitude', 'Latitude from -90 to 90.', [{ displayName: 'Precision', type: 'number', defaultValue: 6 }], (_ctx, precision) => (Math.random() * 180 - 90).toFixed(boundedInt(precision, 6, 0, 12))),
  tag('fakerLongitude', 'Location · Longitude', 'Longitude from -180 to 180.', [{ displayName: 'Precision', type: 'number', defaultValue: 6 }], (_ctx, precision) => (Math.random() * 360 - 180).toFixed(boundedInt(precision, 6, 0, 12))),
  tag('fakerCoordinates', 'Location · Coordinates', 'Latitude, longitude.', [{ displayName: 'Precision', type: 'number', defaultValue: 6 }], (_ctx, precision) => { const p = boundedInt(precision, 6, 0, 12); return `${(Math.random() * 180 - 90).toFixed(p)}, ${(Math.random() * 360 - 180).toFixed(p)}`; }),
  tag('fakerCurrentDate', 'Date & Time · Current Date', 'Current UTC date.', [{ displayName: 'Format', type: 'string', defaultValue: 'YYYY-MM-DD' }], (_ctx, format) => formatDate(new Date(), format)),
  tag('fakerPastDate', 'Date & Time · Past Date', 'Random date before today.', [{ displayName: 'Range (days)', type: 'number', defaultValue: 30 }, { displayName: 'Format', type: 'string', defaultValue: 'YYYY-MM-DD' }], (_ctx, range, format) => dateOffset(-1, range, format)),
  tag('fakerFutureDate', 'Date & Time · Future Date', 'Random date after today.', [{ displayName: 'Range (days)', type: 'number', defaultValue: 30 }, { displayName: 'Format', type: 'string', defaultValue: 'YYYY-MM-DD' }], (_ctx, range, format) => dateOffset(1, range, format)),
  tag('fakerUnixTimestamp', 'Date & Time · Unix Timestamp', 'Current Unix timestamp.', [{ displayName: 'Unit', type: 'enum', defaultValue: 'seconds', options: [{ displayName: 'Seconds', value: 'seconds' }, { displayName: 'Milliseconds', value: 'milliseconds' }] }], (_ctx, unit) => String(unit === 'milliseconds' ? Date.now() : Math.floor(Date.now() / 1000))),
  tag('fakerIsoTimestamp', 'Date & Time · ISO Timestamp', 'Current ISO 8601 timestamp.', [], () => new Date().toISOString()),
  tag('fakerPositiveInteger', 'Number · Positive Integer', 'Positive integer in a range.', numberArgs(1, 1000), (_ctx, min, max) => String(randomInt(Math.max(1, min), Math.max(1, max)))),
  tag('fakerNegativeInteger', 'Number · Negative Integer', 'Negative integer in a range.', numberArgs(-1000, -1), (_ctx, min, max) => String(randomInt(Math.min(-1, min), Math.min(-1, max)))),
  tag('fakerDecimal', 'Number · Decimal', 'Decimal number in a range.', numberArgs(0, 1000, 2), (_ctx, min, max, precision) => (Math.random() * (Math.max(min, max) - Math.min(min, max)) + Math.min(min, max)).toFixed(boundedInt(precision, 2, 0, 12))),
  tag('fakerPercentage', 'Number · Percentage', 'Integer or decimal from 0 to 100.', [{ displayName: 'Mode', type: 'enum', defaultValue: 'integer', options: [{ displayName: 'Integer', value: 'integer' }, { displayName: 'Decimal', value: 'decimal' }] }, { displayName: 'Precision', type: 'number', defaultValue: 2 }], (_ctx, mode, precision) => mode === 'decimal' ? (Math.random() * 100).toFixed(boundedInt(precision, 2, 0, 12)) : String(randomInt(0, 100))),
  tag('fakerNumberRange', 'Number · Number in Range', 'Random integer or decimal.', [...numberArgs(0, 100), { displayName: 'Mode', type: 'enum', defaultValue: 'integer', options: [{ displayName: 'Integer', value: 'integer' }, { displayName: 'Decimal', value: 'decimal' }] }], (_ctx, min, max, mode) => mode === 'decimal' ? String(Math.random() * (Math.max(min, max) - Math.min(min, max)) + Math.min(min, max)) : String(randomInt(min, max))),
  ...[0, 1, 255, 256, 1025, 4096].map(length => tag(`fakerString${length}`, `String · Length ${length}`, `Random alphanumeric string of exactly ${length} characters.`, [], () => randomString(length, ALPHA_LOWER + ALPHA_UPPER + NUMERIC))),
  tag('fakerCustomString', 'String · Custom Length', 'Random string with a chosen length and character set.', [{ displayName: 'Length', type: 'number', defaultValue: 16 }, { displayName: 'Character Set', type: 'enum', defaultValue: 'alphanumeric', options: [{ displayName: 'Latin', value: 'latin' }, { displayName: 'Numeric', value: 'numeric' }, { displayName: 'Alphanumeric', value: 'alphanumeric' }] }], (_ctx, length, set) => randomString(length, ({ latin: ALPHA_LOWER + ALPHA_UPPER, numeric: NUMERIC, alphanumeric: ALPHA_LOWER + ALPHA_UPPER + NUMERIC }[set] || ALPHA_LOWER + ALPHA_UPPER + NUMERIC))),
  tag('fakerRandomJwt', 'Security · Random JWT', 'JWT-shaped synthetic value for negative testing.', [], () => `${base64url({ alg: pick(['HS256', 'none']), typ: 'JWT' })}.${base64url({ sub: String(randomInt(1, 999999)), iat: Math.floor(Date.now() / 1000) })}.${randomString(43, ALPHA_LOWER + ALPHA_UPPER + NUMERIC + '-_')}`),
  tag('fakerUnsignedJwt', 'Security · Unsigned JWT', 'Unsigned JWT with alg:none, for authorised test use only.', [], () => `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ sub: String(randomInt(1, 999999)), iat: Math.floor(Date.now() / 1000) })}.`),
  tag('fakerSignedJwtHs256', 'Security · Signed JWT (HS256)', 'HS256 test JWT. Secret is only used in memory for this evaluation.', [{ displayName: 'Secret', type: 'string', defaultValue: 'test-secret' }, { displayName: 'Payload JSON', type: 'string', defaultValue: '{"sub":"1234567890"}' }, { displayName: 'Expiration (seconds)', type: 'number', defaultValue: 3600 }], (_ctx, secret, payload, expiration) => { let body; try { body = JSON.parse(payload); } catch (_) { body = { sub: '1234567890' }; } const now = Math.floor(Date.now() / 1000); body.iat = now; body.exp = now + boundedInt(expiration, 3600, 1, 31536000); const header = base64url({ alg: 'HS256', typ: 'JWT' }); const encoded = base64url(body); const signature = crypto.createHmac('sha256', String(secret || '')).update(`${header}.${encoded}`).digest('base64url'); return `${header}.${encoded}.${signature}`; }),
  tag('fakerUserAgent', 'HTTP · User-Agent', 'Common browser User-Agent value.', [], () => pick(USER_AGENTS)),
  tag('fakerContentType', 'HTTP · Content-Type', 'Common Content-Type value.', [], () => pick(['application/json', 'application/xml', 'text/plain', 'multipart/form-data', 'application/x-www-form-urlencoded'])),
  tag('fakerAccept', 'HTTP · Accept', 'Common Accept value.', [], () => pick(['application/json', 'application/xml', 'text/plain', '*/*'])),
  tag('fakerAcceptLanguage', 'HTTP · Accept-Language', 'Common Accept-Language value.', [], () => pick(['ru-RU', 'en-US', 'de-DE'])),
  tag('fakerAuthorization', 'HTTP · Authorization', 'Synthetic Bearer or Basic authorization value.', [{ displayName: 'Scheme', type: 'enum', defaultValue: 'bearer', options: [{ displayName: 'Bearer', value: 'bearer' }, { displayName: 'Basic', value: 'basic' }] }], (_ctx, scheme) => scheme === 'basic' ? `Basic ${base64url(`user${randomInt(1, 999)}:password${randomInt(1, 9999)}`)}` : `Bearer ${templateTags.find(t => t.name === 'fakerRandomJwt').run()}`),
  tag('fakerXRequestId', 'HTTP · X-Request-ID', 'UUID v4 header value.', [], () => crypto.randomUUID()),
  tag('fakerXCorrelationId', 'HTTP · X-Correlation-ID', 'UUID v4 header value.', [], () => crypto.randomUUID()),
  tag('fakerXForwardedFor', 'HTTP · X-Forwarded-For', 'Documentation-range IPv4 address.', [], () => `192.0.2.${randomInt(1, 254)}`),
];

const responseHooks = [async context => {
  const id = context.response && typeof context.response.getRequestId === 'function' ? context.response.getRequestId() : undefined;
  if (!id) return;
  const successful = context.response.getStatusCode() >= 200 && context.response.getStatusCode() <= 299;
  for (const [pendingKey, pending] of [...pendingCounters.entries()]) {
    if (!pendingKey.startsWith(`${id}:`)) continue;
    pendingCounters.delete(pendingKey);
    if (successful) await writeCounter(context, pending.key, pending.value);
  }
}];

module.exports = { templateTags, responseHooks };
