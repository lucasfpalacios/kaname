import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.js";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

// Envía emails con la API REST de Resend (sin SDK: es un solo POST). Sin RESEND_API_KEY (solo
// fuera de producción, lo valida env.ts) el email no sale: el log muestra destinatario y asunto,
// y el contenido (con el link de recuperación) solo con DEV_LOG_RESET_LINKS=true, para poder
// seguir el flujo en desarrollo.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async send(mail: Mail): Promise<void> {
    const apiKey = this.config.get("RESEND_API_KEY", { infer: true });
    if (!apiKey) {
      const body = this.config.get("DEV_LOG_RESET_LINKS", { infer: true })
        ? `\n\n${mail.text}`
        : "\n(contenido oculto: DEV_LOG_RESET_LINKS=true para verlo)";
      this.logger.log(
        `Email sin enviar (falta RESEND_API_KEY)\nPara: ${mail.to}\nAsunto: ${mail.subject}${body}`,
      );
      return;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.get("MAIL_FROM", { infer: true }),
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Resend respondió ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
    }
  }
}
