import { RegisterIcon, UploadStepIcon, GetDealIcon } from '../assets/icons/StepIcons'

export const steps = [
  {
    num: '01',
    title: 'Register Your Account',
    desc: 'Create a free account in minutes. No hidden fees — just your name, email, and company details.',
    icon: <RegisterIcon />,
  },
  {
    num: '02',
    title: 'Upload Your Material Remains',
    desc: 'List your leftover materials with photos, quantity, location, and preferred price. Done in under 3 minutes.',
    icon: <UploadStepIcon />,
  },
  {
    num: '03',
    title: 'Get a Deal',
    desc: 'Buyers browse and contact you directly. Negotiate, agree, and complete your transaction seamlessly.',
    icon: <GetDealIcon />,
  },
]

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
