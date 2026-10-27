import type { Locale } from "../generated/prisma/client.js";
import { type EmailContent, renderEmail, renderText } from "./layout.js";
import type { Mail } from "./mail.service.js";

// Email de recuperación de contraseña, en el idioma del usuario (User.locale). Los emails los
// arma la API, así que sus textos viven acá y no en los mensajes de la web.
const COPY = {
  es: {
    subject: "Restablecé tu contraseña de Kaname",
    title: "Restablecé tu contraseña",
    greeting: (name: string) => `Hola, ${name}:`,
    body: "Recibimos un pedido para restablecer la contraseña de tu cuenta de Kaname. Para elegir una nueva, usá este botón:",
    button: "Elegir contraseña nueva",
    expires: (minutes: number) =>
      `El link vence en ${minutes} minutos y sirve una sola vez. Al cambiar la contraseña se cierran todas tus sesiones abiertas.`,
    ignore:
      "Si no lo pediste vos, ignorá este email: tu contraseña sigue igual.",
    fallback: "Si el botón no funciona, copiá este link en el navegador:",
    footer: "Kaname · Todos tus negocios en un solo panel",
  },
  en: {
    subject: "Reset your Kaname password",
    title: "Reset your password",
    greeting: (name: string) => `Hi ${name},`,
    body: "We received a request to reset the password for your Kaname account. To choose a new one, use this button:",
    button: "Choose a new password",
    expires: (minutes: number) =>
      `The link expires in ${minutes} minutes and works only once. Changing your password signs you out everywhere.`,
    ignore:
      "If you didn't request this, ignore this email: your password stays the same.",
    fallback: "If the button doesn't work, copy this link into your browser:",
    footer: "Kaname · All your businesses in one panel",
  },
} satisfies Record<Locale, unknown>;

export function passwordResetEmail({
  to,
  name,
  locale,
  url,
  minutes,
}: {
  to: string;
  name: string;
  locale: Locale;
  url: string;
  minutes: number;
}): Mail {
  const copy = COPY[locale];
  const content: EmailContent = {
    lang: locale,
    title: copy.title,
    intro: [copy.greeting(name), copy.body],
    button: { label: copy.button, url },
    outro: [copy.expires(minutes), copy.ignore],
    fallback: copy.fallback,
    footer: copy.footer,
  };
  return {
    to,
    subject: copy.subject,
    html: renderEmail(content),
    text: renderText(content),
  };
}
