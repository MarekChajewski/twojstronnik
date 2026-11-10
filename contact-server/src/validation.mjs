export const SOURCE_LABELS = Object.freeze({
  artist: 'Strona dla artystów',
  guide: 'Strona dla przewodników',
});

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const INVALID_EMAIL_CHARACTERS = /[\r\n<>,;:"\\\[\]]/;

/** Sprawdza dane niezależnie od walidacji HTML w przeglądarce. */
export function validateContact(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  // Formularze automatyczne często wypełniają to ukryte pole.
  if (typeof data.website === 'string' && data.website.trim()) return { spam: true };

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';

  const validName = name.length >= 2 && name.length <= 100 && !/[\r\n]/.test(name);
  const validEmail = email.length <= 254 && !INVALID_EMAIL_CHARACTERS.test(email) && EMAIL_PATTERN.test(email);
  const validMessage = message.length >= 10 && message.length <= 5000;
  const validSource = Object.hasOwn(SOURCE_LABELS, data.source);

  if (!validName || !validEmail || !validMessage || !validSource || data.consent !== true) {
    return null;
  }

  return { name, email, message, source: data.source };
}
