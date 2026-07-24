import { research } from '@/data/socials.js'

/**
 * "Currently" snapshot for the About page. Kept honest and current — no vanity
 * metrics. Edit here to update what the About "Now" section shows.
 */
export const now = [
  {
    id: 'research',
    label: 'Researching',
    title: 'M.Tech · AI for Sustainability',
    detail: 'Applied ML research at IIT Kanpur.',
    href: research.href,
    external: true,
  },
  {
    id: 'shipping',
    label: 'Shipping',
    title: 'Android apps on Google Play',
    detail: 'Wordigo & 365 — Flutter apps, live in production.',
    href: '/work',
  },
  {
    id: 'building',
    label: 'Building',
    title: 'Full-stack & AI products',
    detail: 'Fast, scalable web apps for clients and side projects.',
  },
  {
    id: 'open',
    label: 'Open to',
    title: 'Select work · 2026',
    detail: 'Collaborations where engineering meets design.',
    href: '/contact',
  },
]
