import nodemailer from 'nodemailer';
import { createContactServer } from './app.mjs';

const port = Number(process.env.PORT || 3107);
const host = process.env.BIND_HOST || '127.0.0.1';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Nieprawidłowy PORT serwera formularza');
}
if (!['127.0.0.1', '::1', '0.0.0.0'].includes(host)) {
  throw new Error('BIND_HOST musi wskazywać localhost lub interfejs kontenera (0.0.0.0)');
}
if (!allowedOrigins.length) {
  throw new Error('Ustaw ALLOWED_ORIGINS — listę adresów strony, z których przyjmujemy formularze');
}

const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_TO'];
const missingSmtp = smtpKeys.filter((key) => {
  const value = process.env[key];
  return !value || value.startsWith('TU_WPISZ');
});
const smtpConfigured = missingSmtp.length === 0;

if (!smtpConfigured && process.env.SMTP_REQUIRED === 'true') {
  throw new Error(`Brak wymaganej konfiguracji SMTP: ${missingSmtp.join(', ')}`);
}

let sendMail;
if (smtpConfigured) {
  const smtpPort = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error('Nieprawidłowy SMTP_PORT');
  }
  const secure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure,
    requireTLS: !secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 12000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  sendMail = (mail) => transporter.sendMail(mail);
} else {
  console.warn('SMTP nie jest skonfigurowane: strona działa, ale formularz zwróci błąd 503.');
}

const app = createContactServer({
  sendMail,
  allowedOrigins,
  from: process.env.SMTP_FROM || 'kontakt@twojstronnik.pl',
  to: process.env.SMTP_TO || 'kontakt@twojstronnik.pl',
  trustProxy: process.env.TRUST_PROXY === 'true',
});

app.listen(port, host, () => {
  console.log(`API formularza działa na ${host}:${port}; SMTP: ${smtpConfigured ? 'skonfigurowane' : 'brak konfiguracji'}`);
});
