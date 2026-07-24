import { useId, useRef, useState } from 'react'
import { ArrowUpRight, Mail, MapPin, Sparkles, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { contact, socials } from '@/data/socials.js'
import { sendContactEmail, emailjsConfigured } from '@/lib/emailjs.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  useDocumentMeta(pageMeta.contact)
  return (
    <>
      <Hero />
      <Body />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-12">
      <GradientBlob
        variant="cyan"
        size={620}
        blur={160}
        opacity={0.35}
        className="top-[-180px] right-[-160px]"
      />
      <Container className="relative">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          Contact · Aurora Compute
        </p>
        <h1 className="mt-6 max-w-5xl font-display text-(length:--fs-display) leading-[1.02]">
          <SplitText by="word" trigger="mount">Got a brief? </SplitText>
          <SplitText by="word" trigger="mount" delay={0.18} className="brand-gradient-text">
            Let&apos;s make it real.
          </SplitText>
        </h1>
        <p className="mt-8 max-w-2xl text-(length:--fs-body) text-(--color-ink-60)">
          Open to freelance projects, AI builds, full-stack product work,
          and ambitious collaborations. Replies within 24 hours.
        </p>
      </Container>
    </section>
  )
}

function Body() {
  return (
    <section className="relative py-20 md:py-28">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <InfoCard />
        <ContactForm />
      </Container>
    </section>
  )
}

function InfoCard() {
  return (
    <Reveal className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-8 md:p-10">
      <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30)">
        Direct line
      </p>
      <h2 className="mt-4 font-display text-(length:--fs-h2) text-(--color-ink-100)">
        {contact.name}
      </h2>

      <div className="mt-8 space-y-5 text-(length:--fs-sm) text-(--color-ink-100)">
        <a
          href={`mailto:${contact.email}`}
          className="group flex items-start gap-3 transition-colors hover:text-(--color-cyan)"
        >
          <Mail size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-(--color-ink-60) group-hover:text-(--color-cyan)" />
          <span className="break-all">{contact.email}</span>
        </a>
        <div className="flex items-start gap-3">
          <MapPin size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-(--color-ink-60)" />
          <span>{contact.location}</span>
        </div>
        <div className="flex items-start gap-3">
          <Sparkles size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-(--color-cyan)" />
          <span>{contact.availability}</span>
        </div>
      </div>

      <div className="mt-10 border-t border-(--color-stroke) pt-6">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          Find me on
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between text-(length:--fs-sm) text-(--color-ink-100) transition-colors hover:text-(--color-cyan)"
              >
                <span className="link-underline font-mono uppercase tracking-[0.2em]">{s.label}</span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={2}
                  className="text-(--color-ink-30) transition-colors group-hover:text-(--color-cyan)"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
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
  const formRef = useRef(null)

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
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!validate()) {
      const firstError = formRef.current?.querySelector('[aria-invalid="true"]')
      firstError?.focus()
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
    <Reveal delay={0.05}>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-8 md:p-10"
        aria-describedby={statusId}
        aria-busy={sending}
      >
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30)">
          Send a message
        </p>
        <h2 className="mt-4 font-display text-(length:--fs-h2) text-(--color-ink-100)">
          Tell me about it.
        </h2>
        <p className="mt-3 text-(length:--fs-sm) text-(--color-ink-60)">
          {emailjsConfigured
            ? 'Submits straight to my inbox.'
            : 'Submits via your mail client — no server needed.'}
        </p>

        <div className="mt-10 space-y-7">
          <Field
            id={nameId}
            label="Name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={setField('name')}
            error={errors.name}
            disabled={sending}
            required
          />
          <Field
            id={emailId}
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={setField('email')}
            error={errors.email}
            disabled={sending}
            required
          />
          <Field
            id={messageId}
            label="Message"
            as="textarea"
            rows={5}
            value={values.message}
            onChange={setField('message')}
            error={errors.message}
            disabled={sending}
            required
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <MagneticButton variant="solid" type="submit" disabled={sending}>
            {sending ? (
              <>
                <Spinner />
                Sending…
              </>
            ) : (
              <>
                <Send size={14} strokeWidth={2} />
                Send message
              </>
            )}
          </MagneticButton>

          <StatusLine status={status} errorMsg={errorMsg} id={statusId} />
        </div>
      </form>
    </Reveal>
  )
}

function Field({ id, label, as = 'input', error, disabled, ...rest }) {
  const errId = `${id}-error`
  const baseInput =
    'mt-2 w-full rounded-(--radius-md) border bg-(--color-raise) px-4 py-3 font-mono text-(length:--fs-sm) text-(--color-ink-100) placeholder:text-(--color-ink-30) outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:bg-(--color-elev)'
  const borderClass = error
    ? 'border-(--color-rose) focus:border-(--color-rose)'
    : 'border-(--color-stroke-strong) focus:border-(--color-cyan)'

  const sharedProps = {
    id,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? errId : undefined,
    disabled,
    className: `${baseInput} ${borderClass}`,
    ...rest,
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)"
      >
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea {...sharedProps} className={`${sharedProps.className} resize-y`} />
      ) : (
        <input {...sharedProps} />
      )}
      {error && (
        <p
          id={errId}
          className="mt-2 inline-flex items-center gap-2 font-mono text-(length:--fs-xs) text-(--color-rose)"
        >
          <AlertCircle size={14} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  )
}

function StatusLine({ status, errorMsg, id }) {
  const map = {
    idle: null,
    sending: null,
    success: {
      tone: 'text-(--color-lime)',
      icon: <CheckCircle2 size={14} strokeWidth={2} />,
      msg: 'Message sent — I’ll reply within 24 hours.',
    },
    mailto: {
      tone: 'text-(--color-cyan)',
      icon: <CheckCircle2 size={14} strokeWidth={2} />,
      msg: 'Your mail client should open shortly. Hit send from there.',
    },
    error: {
      tone: 'text-(--color-rose)',
      icon: <AlertCircle size={14} strokeWidth={2} />,
      msg: errorMsg || 'Something went wrong. Please try again.',
    },
  }
  const entry = map[status]
  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className={`min-h-[1.25rem] font-mono text-(length:--fs-xs) ${entry?.tone ?? 'text-(--color-ink-30)'}`}
    >
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
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-(--color-void)/40 border-t-(--color-void)"
    />
  )
}
