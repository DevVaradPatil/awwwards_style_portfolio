import { useId, useState } from 'react'
import { AlertCircle, ArrowUpRight, CheckCircle2, Send } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { contact, socials } from '@/data/socials.js'
import { sendContactEmail, emailjsConfigured } from '@/lib/emailjs.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const wrap = 'mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14'

export default function Contact() {
  useDocumentMeta(pageMeta.contact)
  return (
    <section className="room-bone relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32">
      <div className={wrap}>
        <h1 className="font-normal">
          <span className="sr-only">Contact Varad Patil</span>
          <ElasticText
            text="SAY HELLO"
            label=""
            aria-hidden="true"
            reach={1.2}
            width={[66, 150]}
            weight={[350, 900]}
            className="text-[clamp(3.75rem,14vw,14rem)] text-(--color-type)"
          />
        </h1>
        <p className="mt-6 max-w-2xl text-(length:--fs-h4) leading-relaxed text-(--color-type-muted)">
          Freelance projects, AI builds, full-stack product work, research collaborations. Tell me
          what you have in mind; I reply within a day.
        </p>

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-[1fr_1.35fr] lg:gap-24">
          <Info />
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

function Info() {
  return (
    <div className="grid content-start gap-10">
      <div className="grid gap-2">
        <p className="text-(length:--fs-sm) font-semibold text-(--color-type-muted)">Email</p>
        <a
          href={`mailto:${contact.email}`}
          className="link-underline justify-self-start break-all font-display text-(length:--fs-h3) font-extrabold [font-stretch:112%] text-(--color-type)"
        >
          {contact.email}
        </a>
      </div>
      <div className="grid gap-2">
        <p className="text-(length:--fs-sm) font-semibold text-(--color-type-muted)">Based in</p>
        <p className="font-display text-(length:--fs-h4) font-bold [font-stretch:112%] text-(--color-type)">
          {contact.location}
        </p>
      </div>
      <div className="grid gap-2">
        <p className="text-(length:--fs-sm) font-semibold text-(--color-type-muted)">Elsewhere</p>
        <ul className="border-b border-(--color-line)">
          {socials.map((s) => (
            <li key={s.id} className="border-t border-(--color-line)">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between py-3 font-display text-(length:--fs-h4) font-bold [font-stretch:112%] text-(--color-type) transition-colors hover:text-(--color-blue)"
              >
                {s.label}
                <ArrowUpRight size={18} strokeWidth={2.2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ContactForm() {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const statusId = useId()

  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | mailto | error
  const [errorMsg, setErrorMsg] = useState('')

  const setField = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'That email doesn’t look right.'
    if (!values.message.trim()) next.message = 'Please share a few words about the project.'
    else if (values.message.trim().length < 10) next.message = 'A little more detail helps — at least 10 characters.'
    setErrors(next)
    return next
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const found = validate()
    const firstBad = ['name', 'email', 'message'].find((k) => found[k])
    if (firstBad) {
      // Focus by id from the fresh result: the aria-invalid markers haven't
      // rendered yet at this point, so querying for them finds nothing.
      const ids = { name: nameId, email: emailId, message: messageId }
      document.getElementById(ids[firstBad])?.focus()
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const result = await sendContactEmail({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      })
      setStatus(result === 'sent' ? 'success' : 'mailto')
      if (result === 'sent') setValues({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || 'Something went wrong. Please try again.')
    }
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={statusId} aria-busy={sending} className="grid content-start gap-9">
      <div>
        <h2 className="text-(length:--fs-h2) text-(--color-type)">Tell me about it</h2>
        <p className="mt-2 text-(length:--fs-sm) text-(--color-type-muted)">
          {emailjsConfigured ? 'Goes straight to my inbox.' : 'Opens your mail client with the message filled in.'}
        </p>
      </div>

      <Field id={nameId} label="Name" type="text" autoComplete="name" value={values.name} onChange={setField('name')} error={errors.name} disabled={sending} required />
      <Field id={emailId} label="Email" type="email" autoComplete="email" value={values.email} onChange={setField('email')} error={errors.email} disabled={sending} required />
      <Field id={messageId} label="Message" as="textarea" rows={5} value={values.message} onChange={setField('message')} error={errors.message} disabled={sending} required />

      <div className="flex flex-wrap items-center gap-6">
        <MagneticButton variant="ink" type="submit" disabled={sending}>
          {sending ? (
            <>
              <Spinner />
              Sending…
            </>
          ) : (
            <>
              <Send size={15} strokeWidth={2.2} />
              Send message
            </>
          )}
        </MagneticButton>
        <StatusLine status={status} errorMsg={errorMsg} id={statusId} />
      </div>
    </form>
  )
}

function Field({ id, label, as = 'input', error, disabled, ...rest }) {
  const errId = `${id}-error`
  const cls = `mt-2 w-full border-0 border-b-2 bg-transparent px-0 py-3 font-display text-(length:--fs-h4) font-semibold [font-stretch:108%] text-(--color-type) placeholder:text-(--color-type-muted) outline-none transition-colors focus:border-(--color-blue) disabled:cursor-not-allowed disabled:opacity-60 ${
    error ? 'border-(--color-error)' : 'border-(--color-line-strong)'
  }`
  const shared = {
    id,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? errId : undefined,
    disabled,
    className: cls,
    ...rest,
  }
  return (
    <div>
      <label htmlFor={id} className="text-(length:--fs-sm) font-semibold text-(--color-type-muted)">
        {label}
      </label>
      {as === 'textarea' ? <textarea {...shared} className={`${cls} resize-y`} /> : <input {...shared} />}
      {error && (
        <p id={errId} className="mt-2 inline-flex items-center gap-2 text-(length:--fs-sm) font-medium text-(--color-error)">
          <AlertCircle size={15} strokeWidth={2.2} />
          {error}
        </p>
      )}
    </div>
  )
}

function StatusLine({ status, errorMsg, id }) {
  const map = {
    success: { tone: 'text-(--color-blue)', icon: <CheckCircle2 size={16} strokeWidth={2.2} />, msg: 'Message sent. I’ll reply within a day.' },
    mailto: { tone: 'text-(--color-blue)', icon: <CheckCircle2 size={16} strokeWidth={2.2} />, msg: 'Your mail client should open now. Hit send from there.' },
    error: { tone: 'text-(--color-error)', icon: <AlertCircle size={16} strokeWidth={2.2} />, msg: errorMsg || 'Something went wrong. Please try again.' },
  }
  const entry = map[status]
  return (
    <p id={id} role="status" aria-live="polite" className={`min-h-[1.5rem] text-(length:--fs-sm) font-medium ${entry?.tone ?? ''}`}>
      {entry ? (
        <span className="inline-flex items-center gap-2">
          {entry.icon}
          {entry.msg}
        </span>
      ) : (
        ''
      )}
    </p>
  )
}

function Spinner() {
  return (
    <span aria-hidden="true" className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  )
}
