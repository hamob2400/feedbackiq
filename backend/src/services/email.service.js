import nodemailer from 'nodemailer'
import { config } from '../config.js'

let transporter

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  }
  return transporter
}

export async function sendAlertEmail({ to, subject, html }) {
  if (!config.smtp.user) {
    console.warn('SMTP not configured, skipping email:', subject)
    return
  }
  await getTransporter().sendMail({
    from: `"Feedback Manager" <${config.smtp.user}>`,
    to,
    subject,
    html,
  })
}

export function buildNegativeFeedbackEmail(feedback) {
  return {
    subject: `⚠️ Negative Feedback Alert — ${feedback.item_title || feedback.item_id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#dc2626">Negative Feedback Received</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold">Item</td><td>${feedback.item_title || feedback.item_id}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Comment</td><td>${feedback.comment_text}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Date</td><td>${feedback.feedback_date}</td></tr>
        </table>
        <p style="margin-top:16px">Log in to <a href="${config.frontendUrl}">Feedback Manager</a> to respond.</p>
      </div>
    `
  }
}
