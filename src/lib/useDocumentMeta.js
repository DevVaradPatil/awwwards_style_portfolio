import { useEffect } from 'react'

const SITE = {
  name: 'Varad Patil',
  url: 'https://varaddev.vercel.app',
  defaultTitle: 'Varad Patil — Developer · Designer · AI Builder',
  defaultDescription:
    'Varad Patil — Full-stack developer & AI enthusiast crafting fast, scalable, immersive web experiences. M.Tech AI for Sustainability, IIT Kanpur.',
  ogImage: '/og-image.png',
}

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * useDocumentMeta — Per-route SEO meta synchronization.
 * Pass { title, description, path } and it patches <title>, OG/Twitter, canonical.
 */
export default function useDocumentMeta({ title, description, path } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE.name}` : SITE.defaultTitle
    const desc = description || SITE.defaultDescription
    const url = path ? `${SITE.url}${path}` : SITE.url

    document.title = fullTitle
    setMeta('description', desc)

    // Open Graph
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('og:url', url, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:image', `${SITE.url}${SITE.ogImage}`, 'property')
    setMeta('og:site_name', SITE.name, 'property')

    // Twitter
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    setMeta('twitter:image', `${SITE.url}${SITE.ogImage}`)

    setCanonical(url)
  }, [title, description, path])
}

export { SITE }
