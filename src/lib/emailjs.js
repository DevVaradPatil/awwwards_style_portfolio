// EmailJS plumbing — uses the REST API (no SDK weight).
// Falls back to `mailto:` if any of the three env vars is missing.
import { contact } from '@/data/socials.js'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const emailjsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

/**
 * Send a contact message.
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<'sent' | 'mailto'>}
 *   'sent'   — delivered via EmailJS
 *   'mailto' — opened the user's mail client as a fallback
 */
export async function sendContactEmail({ name, email, message }) {
  if (!emailjsConfigured) {
    openMailto({ name, email, message })
    return 'mailto'
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        from_name: name,
        reply_to: email,
        message,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`EmailJS failed (${res.status}): ${text || 'unknown error'}`)
  }
  return 'sent'
}

function openMailto({ name, email, message }) {
  const subject = encodeURIComponent(`Portfolio enquiry — ${name || 'New message'}`)
  const body = encodeURIComponent(
    `Hi Varad,\n\n${message}\n\n— ${name}\n${email}`,
  )
  window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
}
