'use strict';
const assert = require('assert');
const { templateTags } = require('../index');
const run = (name, ...args) => templateTags.find(tag => tag.name === name).run({}, ...args);

async function main() {
  assert.equal(templateTags.length, 45);
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
  const counterContext = {
    request: { getId: () => 'request-a' },
    store: { getItem: async key => store.has(key) ? store.get(key) : null, setItem: async (key, value) => store.set(key, value) },
  };
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4, 'before-send'), 'push-0009-test');
  assert.equal(await counter.run(counterContext, 'request', 'push_id', 8, 1, 'push-', '-test', 4, 'before-send'), 'push-0010-test');
  assert.equal(await counter.run(counterContext, 'request', 'response_id', 8, 1, '', '', 0, 'after-success'), '9');
  await require('../index').responseHooks[0]({ response: { getRequestId: () => 'request-a', getStatusCode: () => 500 }, store: counterContext.store });
  assert.equal(await counter.run(counterContext, 'request', 'response_id', 8, 1, '', '', 0, 'after-success'), '9');
  await require('../index').responseHooks[0]({ response: { getRequestId: () => 'request-a', getStatusCode: () => 201 }, store: counterContext.store });
  assert.equal(store.get('counter:request:request-a:response_id'), '9');
  console.log(`Validated ${templateTags.length} template tags.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
