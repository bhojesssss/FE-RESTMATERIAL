export const features = [
  {
    title: 'Specialized in Construction Materials',
    desc: 'Unlike generic marketplaces, every feature is purpose-built for the construction industry — from listing formats to search filters.',
    badge: 'Industry Focused',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Filter by City & Material Type',
    desc: 'Find exactly what you need with granular location and category filters — covering 340+ cities across Indonesia.',
    badge: 'Smart Search',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    title: 'Automated Carbon Tracking Per Transaction',
    desc: 'Every completed deal automatically calculates the carbon emissions saved by reusing materials instead of producing new ones.',
    badge: 'Eco Impact',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 4-2.5 7.5-6 9.5" />
        <path d="M12 22C6.5 22 2 17.5 2 12" />
        <path d="M8 12l3 3 5-6" />
        <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" />
      </svg>
    ),
  },
  {
    title: 'Free for All Users',
    desc: "Zero listing fees. Zero commissions. Full access to all marketplace features at no cost — always. Sustainability shouldn't have a price tag.",
    badge: 'Always Free',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
      </svg>
    ),
  },
]

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
