import { createServer } from 'node:http';
import { isIP } from 'node:net';
import { createRateLimiter } from './rateLimit.mjs';
import { SOURCE_LABELS, validateContact } from './validation.mjs';

const BODY_LIMIT = 32 * 1024;

function respond(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > BODY_LIMIT) {
      const error = new Error('Zbyt duża wiadomość');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Niepoprawny format danych');
    error.status = 400;
    throw error;
  }
}

function clientIp(req, trustProxy) {
  const peer = req.socket.remoteAddress || 'unknown';
  if (!trustProxy) return peer;

  // Nagłówek jest ustawiany przez nasz Nginx. API nie powinno mieć publicznego portu.
  const forwarded = String(req.headers['x-real-ip'] || '').trim();
  return isIP(forwarded) ? forwarded : peer;
}

export function createContactServer({
  sendMail, allowedOrigins, from, to, trustProxy = false,
  clock = () => Date.now(), logger = console,
}) {
  if (!Array.isArray(allowedOrigins) || !allowedOrigins.length) {
    throw new Error('Brak konfiguracji serwera formularza');
  }

  const allowRequest = createRateLimiter(clock);

  return createServer(async (req, res) => {
    if (req.url === '/healthz' && req.method === 'GET') {
      respond(res, 200, { ok: true, smtpConfigured: typeof sendMail === 'function' });
      return;
    }

    if (req.url !== '/api/contact') {
      respond(res, 404, { error: 'Nie znaleziono' });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      respond(res, 405, { error: 'Metoda niedozwolona' });
      return;
    }

    if (!req.headers.origin || !allowedOrigins.includes(req.headers.origin)) {
      respond(res, 403, { error: 'Niedozwolone źródło' });
      return;
    }

    if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) {
      respond(res, 415, { error: 'Wymagany JSON' });
      return;
    }

    if (Number(req.headers['content-length'] || 0) > BODY_LIMIT) {
      respond(res, 413, { error: 'Zbyt duża wiadomość' });
      return;
    }

    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      if (!res.headersSent && !res.destroyed) {
        respond(res, error.status || 400, { error: error.message || 'Niepoprawne dane' });
      }
      return;
    }

    const contact = validateContact(payload);
    if (contact?.spam) {
      // Bot nie otrzymuje informacji, że został wykryty.
      respond(res, 200, { ok: true });
      return;
    }
    if (!contact) {
      respond(res, 400, { error: 'Sprawdź poprawność pól formularza' });
      return;
    }

    if (typeof sendMail !== 'function') {
      respond(res, 503, { error: 'Wysyłanie wiadomości jest chwilowo niedostępne' });
      return;
    }

    if (!allowRequest(clientIp(req, trustProxy))) {
      respond(res, 429, { error: 'Zbyt wiele zgłoszeń. Spróbuj później.' });
      return;
    }

    try {
      await sendMail({
        from: { name: 'Twój Stronnik', address: from },
        to,
        replyTo: { name: contact.name, address: contact.email },
        subject: `[Twój Stronnik] Zapytanie — ${SOURCE_LABELS[contact.source]}`,
        text: [
          `Źródło: ${SOURCE_LABELS[contact.source]}`,
          `Imię i nazwisko: ${contact.name}`,
          `E-mail: ${contact.email}`,
          '',
          'Wiadomość:',
          contact.message,
          '',
          'Odpowiedz na tę wiadomość, aby napisać bezpośrednio do nadawcy.',
        ].join('\n'),
      });
      respond(res, 200, { ok: true });
    } catch (error) {
      logger.error('Błąd wysyłania formularza:', error?.code || error?.name || 'smtp_error');
      respond(res, 502, { error: 'Nie udało się wysłać wiadomości' });
    }
  });
}
