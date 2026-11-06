import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactServer } from '../src/app.mjs';

const sample = { name: 'Anna Kowalska', email: 'anna@example.com', message: 'Dzień dobry, interesuje mnie galeria.', consent: true, source: 'artist', website: '' };

async function fixture(fn = async () => undefined, trustProxy = false) {
  const sent = [];
  let now = 1_000_000;
  const app = createContactServer({
    sendMail: async (mail) => { sent.push(mail); await fn(mail); },
    allowedOrigins: ['https://twojstronnik.pl'], from: 'kontakt@twojstronnik.pl', to: 'kontakt@twojstronnik.pl',
    clock: () => now,
    logger: { error() {} },
    trustProxy,
  });
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${app.address().port}/api/contact`;
  return {
    sent,
    url,
    advance(ms) { now += ms; },
    async close() { await new Promise((resolve) => app.close(resolve)); },
    async post(data = sample, options = {}) {
      return fetch(url, {
        method: 'POST', headers: { Origin: options.origin || 'https://twojstronnik.pl', 'Content-Type': options.contentType || 'application/json', ...options.headers },
        body: options.raw ?? JSON.stringify(data),
      });
    },
  };
}

test('Poprawny formularz: wysyłka na kontakt@, replyTo klienta', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  const res = await f.post();
  assert.equal(res.status, 200);
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].to, 'kontakt@twojstronnik.pl');
  assert.equal(f.sent[0].replyTo.address, sample.email);
  assert.match(f.sent[0].subject, /Strona dla artystów/);
  assert.match(f.sent[0].text, /interesuje mnie galeria/);
});

test('Oba rodzaje ofert: przewodnicy', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  assert.equal((await f.post({ ...sample, source: 'guide' })).status, 200);
  assert.match(f.sent[0].subject, /Strona dla przewodników/);
});

test('Wymagane pola i zgoda są weryfikowane na serwerze', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  for (const change of [{ consent: false }, { email: 'nieadres' }, { message: 'krótko' }, { source: 'admin' }, { name: 'X' }]) {
    assert.equal((await f.post({ ...sample, ...change })).status, 400);
  }
  assert.equal(f.sent.length, 0);
});

test('Zabezpieczenie przed zapytaniami z obcych domen', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  assert.equal((await f.post(sample, { origin: 'https://evil.example' })).status, 403);
  assert.equal(f.sent.length, 0);
});

test('Honeypot potwierdza bez wysyłania wiadomości', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  assert.equal((await f.post({ ...sample, website: 'spam link' })).status, 200);
  assert.equal(f.sent.length, 0);
});

test('Limit: 5 wysyłek na 15 minut dla jednego adresu', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  for (let i=0; i<5; i++) assert.equal((await f.post()).status, 200);
  assert.equal((await f.post()).status, 429);
  f.advance(15 * 60 * 1000 + 1);
  assert.equal((await f.post()).status, 200);
  assert.equal(f.sent.length, 6);
});

test('Błąd SMTP: brak fałszywego potwierdzenia wysyłki', async (t) => {
  const f = await fixture(async () => { throw new Error('SMTP error'); }); t.after(() => f.close());
  assert.equal((await f.post()).status, 502);
});

test('Nieprzesyłanie niepoprawnego JSON i nadmiernych danych', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  assert.equal((await f.post(sample, { raw: '{' })).status, 400);
  assert.equal((await f.post(sample, { raw: 'a'.repeat(18000) })).status, 413);
  assert.equal(f.sent.length, 0);
});


test('Docker proxy: limit jest liczony osobno dla adresów klientów', async (t) => {
  const f = await fixture(async () => undefined, true); t.after(() => f.close());
  for (let i = 0; i < 5; i++) {
    assert.equal((await f.post(sample, { headers: { 'X-Real-IP': '203.0.113.1' } })).status, 200);
  }
  assert.equal((await f.post(sample, { headers: { 'X-Real-IP': '203.0.113.1' } })).status, 429);
  assert.equal((await f.post(sample, { headers: { 'X-Real-IP': '203.0.113.2' } })).status, 200);
  assert.equal(f.sent.length, 6);
});

test('Nieprawidłowy X-Real-IP nie tworzy odrębnej tożsamości limitera', async (t) => {
  const f = await fixture(); t.after(() => f.close());
  for (let i = 0; i < 5; i++) {
    assert.equal((await f.post(sample, { headers: { 'X-Real-IP': 'ip-niepoprawne-' + i } })).status, 200);
  }
  assert.equal((await f.post(sample, { headers: { 'X-Real-IP': 'inna-wartosc' } })).status, 429);
});
