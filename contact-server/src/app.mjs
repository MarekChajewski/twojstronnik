import { createServer } from 'node:http';
import { isIP } from 'node:net';

const BODY_LIMIT = 16 * 1024;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_TOTAL = 100;
const SOURCE_LABELS = Object.freeze({
  artist: 'Strona dla artystów',
  guide: 'Strona dla przewodników',
});

export function createContactServer({ sendMail, allowedOrigins, from, to, trustProxy = false, clock = () => Date.now(), logger = console }) {
  if (typeof sendMail !== 'function' || !Array.isArray(allowedOrigins) || !allowedOrigins.length) {
    throw new Error('Brak konfiguracji serwera formularza');
  }
  const byIp = new Map();
  let totalTimestamps = [];

  function reply(res, code, payload) {
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(payload));
  }

  return createServer(async (req, res) => {
    if (req.url === '/healthz' && req.method === 'GET') {
      reply(res, 200, { ok: true });
      return;
    }
    if (req.url !== '/api/contact') {
      reply(res, 404, { error: 'Nie znaleziono' });
      return;
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      reply(res, 405, { error: 'Metoda niedozwolona' });
      return;
    }

    // Żądania przeglądarkowe muszą pochodzić z naszej domeny.
    const origin = req.headers.origin;
    if (!origin || !allowedOrigins.includes(origin)) {
      reply(res, 403, { error: 'Niedozwolone źródło' });
      return;
    }
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      reply(res, 415, { error: 'Wymagany JSON' });
      return;
    }
    if (Number(req.headers['content-length'] || 0) > BODY_LIMIT) {
      reply(res, 413, { error: 'Zbyt duża wiadomość' });
      return;
    }

    let bytes = 0;
    const chunks = [];
    try {
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > BODY_LIMIT) {
          reply(res, 413, { error: 'Zbyt duża wiadomość' });
          return;
        }
        chunks.push(chunk);
      }
    } catch {
      if (!res.headersSent) reply(res, 400, { error: 'Niepoprawne dane' });
      return;
    }

    let data;
    try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch {
      reply(res, 400, { error: 'Niepoprawny format danych' });
      return;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      reply(res, 400, { error: 'Niepoprawne dane' });
      return;
    }

    // Pole-pułapka na automaty. Bez wysyłania poczty i bez sygnalizowania botowi błędu.
    if (typeof data.website === 'string' && data.website.trim()) {
      reply(res, 200, { ok: true });
      return;
    }
    const { name, email, message, consent, source } = data;
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    if (cleanName.length < 2 || cleanName.length > 100 || /[\r\n]/.test(cleanName) ||
        cleanEmail.length > 254 || /[\r\n<>,;:\"\\\[\]]/.test(cleanEmail) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(cleanEmail) ||
        cleanMessage.length < 10 || cleanMessage.length > 5000 ||
        consent !== true || !Object.hasOwn(SOURCE_LABELS, source)) {
      reply(res, 400, { error: 'Sprawdź poprawność pól formularza' });
      return;
    }

    // IP użytkownika: tylko z zaufanego Nginx. W Dockerze nagłówek przechodzi
    // z Nginx VPS -> Nginx WWW -> API i jest nadpisywany na pierwszym etapie.
    // TRUST_PROXY włączamy WYŁĄCZNIE wtedy, gdy API nie publikuje portu na hoście.
    const peer = req.socket.remoteAddress || 'unknown';
    const fromLocalProxy = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer);
    const realIp = req.headers['x-real-ip'];
    const ip = (fromLocalProxy || trustProxy) && typeof realIp === 'string' && isIP(realIp)
      ? realIp
      : peer;
    const now = clock();
    const recent = (byIp.get(ip) || []).filter((time) => time > now - WINDOW_MS);
    totalTimestamps = totalTimestamps.filter((time) => time > now - WINDOW_MS);
    if (recent.length >= MAX_PER_IP || totalTimestamps.length >= MAX_TOTAL) {
      reply(res, 429, { error: 'Zbyt wiele zgłoszeń. Spróbuj później.' });
      return;
    }
    recent.push(now);
    totalTimestamps.push(now);
    byIp.set(ip, recent);
    // Usuwa stare rekordy, aby mapa nie rosła w nieskończoność.
    if (byIp.size > 2000) {
      for (const [key, times] of byIp) {
        if (times.every((time) => time <= now - WINDOW_MS)) byIp.delete(key);
      }
    }

    try {
      await sendMail({
        from: { name: 'Twój Stronnik', address: from },
        to,
        replyTo: { name: cleanName, address: cleanEmail },
        subject: `[Twój Stronnik] Zapytanie — ${SOURCE_LABELS[source]}`,
        text: [
          `Źródło: ${SOURCE_LABELS[source]}`,
          `Imię i nazwisko: ${cleanName}`,
          `E-mail: ${cleanEmail}`,
          '',
          'Wiadomość:',
          cleanMessage,
          '',
          'Odpowiedz na tę wiadomość, aby napisać bezpośrednio do nadawcy.',
        ].join('\n'),
      });
      reply(res, 200, { ok: true });
    } catch (error) {
      // Bez ujawniania konfiguracji SMTP czy treści wiadomości w odpowiedzi klientowi.
      logger.error('Błąd wysyłania formularza:', error?.code || error?.name || 'smtp_error');
      reply(res, 502, { error: 'Nie udało się wysłać wiadomości' });
    }
  });
}
