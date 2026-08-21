'use strict';
const assert = require('assert');
const { templateTags } = require('../index');
const plugin = require('../main');
const run = (name, ...args) => templateTags.find(tag => tag.name === name).run({}, ...args);

async function main() {
  const exportedCounter = plugin.templateTags.find(tag => tag.name === 'fakerCounter');
  assert(exportedCounter, 'The public plugin entry point must export fakerCounter');
  assert.equal(templateTags.length, 45);
  assert.equal(templateTags.some(tag => tag.description.includes('.')), false);
  assert.match(run('fakerUuid'), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(run('fakerGuid', true), /^\{[0-9a-f-]{36}\}$/i);
  assert.equal(run('fakerRandomId', 32, 'digits').length, 32);
  assert.match(run('fakerEmail'), /^[^@\s]+@(example\.com|example\.org|example\.net)$/);
  assert.match(run('fakerPhoneRu'), /^\+79\d{9}$/);
  assert.match(run('fakerPostalCode'), /^\d{6}$/);
  assert.equal(run('fakerString4096').length, 4096);
  assert.equal(run('fakerCustomString', 100, 'numeric').length, 100);
  const [lat, lon] = run('fakerCoordinates', 6).split(', ').map(Number);
  assert(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180);
  assert(+run('fakerPercentage') >= 0 && +run('fakerPercentage') <= 100);
  assert.doesNotThrow(() => new Date(run('fakerIsoTimestamp')).toISOString());
  for (const name of ['fakerRandomJwt', 'fakerUnsignedJwt', 'fakerSignedJwtHs256']) assert.equal((run(name, 'secret', '{}', 60).match(/\./g) || []).length, 2);
  const counter = templateTags.find(tag => tag.name === 'fakerCounter');
  const store = new Map();
  const pluginStore = {
    getItem: async key => store.has(key) ? store.get(key) : null,
    setItem: async (key, value) => store.set(key, value),
    removeItem: async key => store.delete(key),
  };
  const counterContext = {
    meta: { requestId: 'request-a', workspaceId: 'workspace-a' },
    renderPurpose: 'preview',
    store: pluginStore,
  };
  assert.equal(counter.args.length, 7);
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4), 'push-0009-test');
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4), 'push-0009-test');
  assert.equal(store.has('counter:request:request-a:push_id'), false);
  counterContext.renderPurpose = 'send';
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4), 'push-0009-test');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:push_id')), { value: 9, initial: 8 });
  counterContext.renderPurpose = 'preview';
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4), 'push-0010-test');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:push_id')), { value: 9, initial: 8 });
  counterContext.renderPurpose = 'send';
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4), 'push-0010-test');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:push_id')), { value: 10, initial: 8 });
  counterContext.renderPurpose = 'preview';
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 255, 1, 'push-', '-test', 4), 'push-0256-test');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:push_id')), { value: 10, initial: 8 });
  counterContext.renderPurpose = 'send';
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 255, 1, 'push-', '-test', 4), 'push-0256-test');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:push_id')), { value: 256, initial: 255 });
  store.set('counter:request:request-a:legacy_id', '1');
  assert.equal(await counter.run(counterContext, 'request', 'legacy_id', 255, 1, '', '', 0), '256');
  assert.deepEqual(JSON.parse(store.get('counter:request:request-a:legacy_id')), { value: 256, initial: 255 });
  console.log(`Validated ${templateTags.length} template tags.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
