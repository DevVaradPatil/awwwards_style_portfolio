import { useEffect } from 'react'
import { SITE } from '@/data/siteMeta.js'

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

const JSONLD_ID = 'page-jsonld'

/**
 * useDocumentMeta — Per-route SEO meta synchronization.
 * Pass { title, description, path } and it patches <title>, OG/Twitter, canonical.
 * Optionally pass { jsonLd } (a schema.org object) to inject a page-scoped
 * JSON-LD <script>; it is removed on unmount so it can't leak to the next route.
 */
export default function useDocumentMeta({ title, description, path, jsonLd } = {}) {
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

  // Page-scoped JSON-LD. Keyed on the serialized value so it only re-runs when
  // the content actually changes, not on every render.
  const serialized = jsonLd ? JSON.stringify(jsonLd) : null
  useEffect(() => {
    const existing = document.getElementById(JSONLD_ID)
    if (!serialized) {
      if (existing) existing.remove()
      return
    }
    let el = existing
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = JSONLD_ID
      document.head.appendChild(el)
    }
    el.textContent = serialized
    return () => {
      document.getElementById(JSONLD_ID)?.remove()
    }
  }, [serialized])
}

export { SITE }
