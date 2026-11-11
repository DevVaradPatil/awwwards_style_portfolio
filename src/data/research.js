import { research as researchSite } from '@/data/socials.js'

/**
 * Research shown on the About page: short, one paragraph each, newest first.
 * The thesis repo is private, so it links to the research site instead.
 */
export const research = [
  {
    id: 'thesis',
    title: 'M.Tech thesis: air quality from CCTV video',
    meta: 'IIT Kanpur · in progress',
    body: 'Can an ordinary surveillance camera work as a cheap PM2.5 / PM10 sensor? Two campus cameras, each paired with its own monitor. Every result is measured against a weather-only baseline, with confidence intervals, and negative findings are reported as findings.',
    href: researchSite.href,
    linkLabel: 'Research site',
  },
  {
    id: 'clean-air-copilot',
    title: 'Clean Air Copilot',
    meta: 'RAG + text-to-SQL · in progress',
    body: 'A bilingual assistant over 47 Indian air-quality policy documents and 258,605 city-days of CPCB data, with clause-level citations and a 150-question evaluation set. Reranking and a current-document filter lift recall@5 from 0.46 to 0.65.',
    href: 'https://github.com/DevVaradPatil/cleanair-copilot',
    linkLabel: 'Code',
  },
  {
    id: 'monsoon',
    title: 'Indian Summer Monsoon phase forecasting',
    meta: 'Deep learning · ERA5 + IMD',
    body: 'Seven-day forecasts of active, break and normal monsoon phases from 55 features derived from ERA5 reanalysis. A TCN + Transformer meta-ensemble reaches a mean macro-F1 of 0.56 across all seven days.',
    href: 'https://github.com/DevVaradPatil/Active-Break-Indian-Summer-Monsoon-Forecasting',
    linkLabel: 'Code',
  },
  {
    id: 'aqi-early-warning',
    title: 'Air quality early-warning system',
    meta: 'Machine learning · CPCB stations',
    body: 'Next-day AQI and severity across Indian monitoring stations. The model removes 37% of the persistence forecast’s error (R² 0.90), and every result is printed beside its baseline.',
    href: 'https://github.com/DevVaradPatil/Air-Quality-Monitoring-System',
    linkLabel: 'Code',
  },
]
