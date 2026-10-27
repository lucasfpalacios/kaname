import type { Mail } from "../../src/mail/mail.service.js";

// Reemplaza a MailService en los tests: guarda los emails en vez de mandarlos.
export class MailRecorder {
  readonly sent: Mail[] = [];
  private waiters: { to: string; resolve: (mail: Mail) => void }[] = [];

  async send(mail: Mail): Promise<void> {
    this.sent.push(mail);
    for (const waiter of this.waiters.filter((w) => w.to === mail.to)) {
      waiter.resolve(mail);
    }
    this.waiters = this.waiters.filter((w) => w.to !== mail.to);
  }

  /** El próximo email para `to` (forgot-password lo manda en segundo plano). */
  next(to: string, timeoutMs = 3000): Promise<Mail> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`No llegó ningún email para ${to}`)),
        timeoutMs,
      );
      this.waiters.push({
        to,
        resolve: (mail) => {
          clearTimeout(timer);
          resolve(mail);
        },
      });
    });
  }
}

/** El token del link de recuperación de un email. */
export function resetTokenOf(mail: Mail): string {
  const match = /reset-password\?token=([^\s"&<]+)/.exec(mail.text);
  if (!match) throw new Error("El email no tiene link de recuperación");
  return decodeURIComponent(match[1]);
}
