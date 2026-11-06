import nodemailer from 'nodemailer';
import { createContactServer } from './app.mjs';

const required = ['ALLOWED_ORIGINS', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_TO'];
const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith('TU_WPISZ'));
if (missing.length) {
  console.error(`Brak konfiguracji: ${missing.join(', ')}`);
  process.exit(1);
}
const port = Number(process.env.PORT || 3107);
const host = process.env.BIND_HOST || '127.0.0.1';
const smtpPort = Number(process.env.SMTP_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  console.error('Nieprawidłowy numer portu');
  process.exit(1);
}
// Poza Dockerem formularz jest dostępny tylko na localhost.
// W Dockerze nasłuchuje na interfejsie kontenera, lecz NIE PUBLIKUJEMY jego portu na hoście.
const dockerInternalBind = process.env.CONTAINER_MODE === 'true' && host === '0.0.0.0';
if (host !== '127.0.0.1' && host !== '::1' && !dockerInternalBind) {
  console.error('Niedozwolony adres nasłuchu API (0.0.0.0 jest dozwolone tylko w kontenerze)');
  process.exit(1);
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
const app = createContactServer({
  sendMail: (mail) => transporter.sendMail(mail),
  allowedOrigins: process.env.ALLOWED_ORIGINS.split(',').map((v) => v.trim()).filter(Boolean),
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_TO,
  trustProxy: process.env.TRUST_PROXY === 'true' && process.env.CONTAINER_MODE === 'true',
});
app.listen(port, host, () => console.log(`Formularz: http://${host}:${port}`));
