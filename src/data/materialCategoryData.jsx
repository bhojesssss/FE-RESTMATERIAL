import { BrickIcon, WoodLumberIcon, SteelRebarIcon, DrywallIcon, ConcreteBlockIcon, PavingStoneIcon } from '../assets/icons/MaterialIcons'

export const categories = [
  {
    label: 'Brick',
    icon: <BrickIcon />,
  },
  {
    label: 'Wood Lumber',
    icon: <WoodLumberIcon />,
  },
  {
    label: 'Steel Rebar',
    icon: <SteelRebarIcon />,
  },
  {
    label: 'Drywall',
    icon: <DrywallIcon />,
  },
  {
    label: 'Concrete Block',
    icon: <ConcreteBlockIcon />,
  },
  {
    label: 'Paving Stone',
    icon: <PavingStoneIcon />,
  },
]

export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
