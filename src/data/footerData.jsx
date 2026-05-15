import InstagramIcon from '../assets/icons/InstagramIcon'
import LinkedInIcon from '../assets/icons/LinkedInIcon'
import TwitterXIcon from '../assets/icons/TwitterXIcon'

export const socials = [
  { label: 'Instagram', href: 'https://instagram.com/', icon: <InstagramIcon /> },
  { label: 'LinkedIn', href: 'https://linkedin.com/', icon: <LinkedInIcon /> },
  { label: 'Twitter/X', href: 'https://x.com/', icon: <TwitterXIcon /> },
]

export const footerCols = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Home', to: '/' },
    ],
  },
  {
    heading: 'Marketplace',
    links: [
      { label: 'Browse Listings', to: '/marketplace' },
      { label: 'Sell Material', to: '/create-listing' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'Dashboard', to: '/profile' },
    ],
  },
]
