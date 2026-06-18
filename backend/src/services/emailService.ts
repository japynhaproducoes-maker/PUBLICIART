/**
 * Email service — SMTP via nodemailer (lazy).
 *
 * Em dev, se SMTP não estiver configurado, o link é apenas logado no console
 * — o fluxo de reset continua funcionando para teste local.
 */
import { config, isSmtpConfigured } from "../config.js";

type Mail = { to: string; subject: string; text: string; html?: string };

let transporterPromise: Promise<any> | null = null;

async function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!transporterPromise) {
    transporterPromise = import("nodemailer").then((nm) =>
      nm.default.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      }),
    );
  }
  return transporterPromise;
}

export const emailService = {
  async send({ to, subject, text, html }: Mail): Promise<void> {
    const t = await getTransporter();
    if (!t) {
      // eslint-disable-next-line no-console
      console.warn(
        `[email] SMTP não configurado. Mensagem para ${to}: ${subject}\n${text}`,
      );
      return;
    }
    await t.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject,
      text,
      html: html ?? `<pre>${text}</pre>`,
    });
  },

  async sendPasswordReset(to: string, link: string): Promise<void> {
    const subject = "Redefinir sua senha — Publiciart Builder";
    const text = `Recebemos um pedido para redefinir a senha da sua conta.\n\nAcesse o link abaixo (válido por 1 hora):\n${link}\n\nSe você não solicitou, ignore este e-mail.`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 12px">Redefinir sua senha</h2>
        <p>Recebemos um pedido para redefinir a senha da sua conta no <strong>Publiciart Builder</strong>.</p>
        <p><a href="${link}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Redefinir senha</a></p>
        <p style="color:#666;font-size:13px">O link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
      </div>`;
    await this.send({ to, subject, text, html });
  },
};
