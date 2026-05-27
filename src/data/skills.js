// Skills grouped per portfolio_content.md
export const skillGroups = [
  {
    id: 'languages',
    label: 'Languages',
    items: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Java / Kotlin', 'Python'],
  },
  {
    id: 'frameworks',
    label: 'Frameworks & Libraries',
    items: [
      'React.js',
      'Next.js',
      'Redux Toolkit',
      'Tailwind CSS',
      'Node.js / Express',
      'Three.js / R3F / Drei',
      'Framer Motion',
      'Flutter',
      'React Native',
      'Prisma',
      'Shadcn UI',
      'EmailJS',
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Platforms',
    items: [
      'MongoDB',
      'Firebase',
      'Supabase',
      'Stripe',
      'Razorpay',
      'Spline',
      'Vite',
      'Git & GitHub',
      'Figma',
      'Docker',
      'Android Studio',
    ],
  },
  {
    id: 'ai-cloud',
    label: 'AI & Cloud',
    items: [
      'Gemini API',
      'LLM / NLP integration',
      'Vector embeddings',
      'PWA / service workers',
    ],
  },
  {
    id: 'craft',
    label: 'Craft',
    items: [
      'UI / UX design sense',
      'Responsive & accessible design',
      'SEO, OG, JSON-LD',
      'Performance optimization',
      'Freelance delivery',
    ],
  },
]

export const skillCloud = skillGroups.flatMap((g) =>
  g.items.map((item) => ({ label: item, group: g.id })),
)
