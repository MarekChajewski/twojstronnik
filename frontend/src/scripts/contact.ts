interface ContactPayload {
  name: string;
  email: string;
  message: string;
  website: string;
  consent: boolean;
  source: 'artist' | 'guide';
}

const FAILED_MESSAGE = 'Nie udało się wysłać wiadomości. Spróbuj ponownie później lub napisz na kontakt@twojstronnik.pl.';

function collectPayload(form: HTMLFormElement): ContactPayload {
  const values = new FormData(form);
  return {
    name: String(values.get('name') ?? '').trim(),
    email: String(values.get('email') ?? '').trim(),
    message: String(values.get('message') ?? '').trim(),
    website: String(values.get('website') ?? ''),
    consent: values.get('consent') === 'on',
    source: form.dataset.contactType === 'guide' ? 'guide' : 'artist',
  };
}

function errorMessage(status: number): string {
  if (status === 429) return 'Wysłano zbyt wiele wiadomości. Spróbuj ponownie później.';
  if (status === 400) return 'Sprawdź poprawność danych i spróbuj ponownie.';
  return FAILED_MESSAGE;
}

export function initContactForms(): void {
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    if (!button || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled || !form.reportValidity()) return;

      button.disabled = true;
      button.textContent = 'Wysyłanie…';
      status.hidden = true;
      status.textContent = '';
      status.classList.remove('is-error', 'is-success');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(collectPayload(form)),
        });

        const result: unknown = await response.json().catch(() => null);
        if (!response.ok || !result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) {
          throw new Error(response.ok ? FAILED_MESSAGE : errorMessage(response.status));
        }

        form.reset();
        status.classList.add('is-success');
        status.textContent = 'Dziękujemy! Wiadomość została wysłana. Odpowiemy na podany adres e-mail.';
      } catch (error) {
        status.classList.add('is-error');
        status.textContent = error instanceof Error ? error.message : FAILED_MESSAGE;
      } finally {
        button.disabled = false;
        button.textContent = 'Wyślij wiadomość';
        status.hidden = false;
      }
    });
  });
}
