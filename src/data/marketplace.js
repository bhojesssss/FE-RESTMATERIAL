export const CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar']

export const MATERIAL_CATEGORIES = [
  'Bricks & Blocks',
  'Wood & Plywood',
  'Steel & Iron',
  'Ceramic & Granite',
  'Frames & Doors',
  'Pipes & Installation',
]

export const CONDITIONS = ['New/Surplus', 'Pre-loved/Good Condition', 'Needs Repair']

export const LISTINGS = [
  {
    id: 'bricks-500-surabaya',
    category: 'Bricks & Blocks',
    name: '500 pcs used red bricks from demolition',
    city: 'Surabaya',
    volume: { value: 500, unit: 'pcs' },
    condition: 'Pre-loved/Good Condition',
    status: 'Available',
    priceIdr: 1250000,
    uploadedAt: '2026-04-11',
    description:
      'Used red bricks from a demolition project. Kept dry and sorted. Some minor chips, still suitable for secondary walls and landscaping.',
    seller: {
      id: 's1',
      name: 'Surya Build Co.',
      city: 'Surabaya',
      memberSince: '2023-08-01',
      rating: 4.7,
    },
    images: [],
  },
  {
    id: 'teak-frames-20-bandung',
    category: 'Wood & Plywood',
    name: '20 units of reclaimed teak wood frames',
    city: 'Bandung',
    volume: { value: 20, unit: 'units' },
    condition: 'Pre-loved/Good Condition',
    status: 'Available',
    priceIdr: 3900000,
    uploadedAt: '2026-04-09',
    description:
      'Reclaimed teak frames, cleaned and sanded. Great for interior reuse. Minor scratches; structurally solid.',
    seller: {
      id: 's2',
      name: 'Bandung Timber Hub',
      city: 'Bandung',
      memberSince: '2022-02-14',
      rating: 4.5,
    },
    images: [],
  },
  {
    id: 'rebar-100kg-jakarta',
    category: 'Steel & Iron',
    name: '100 kg surplus construction rebar',
    city: 'Jakarta',
    volume: { value: 100, unit: 'kg' },
    condition: 'New/Surplus',
    status: 'Available',
    priceIdr: 2100000,
    uploadedAt: '2026-04-15',
    description:
      'Surplus rebar from an over-order. Stored indoors. Ready for immediate pickup.',
    seller: {
      id: 's3',
      name: 'Jakarta Rebar Supply',
      city: 'Jakarta',
      memberSince: '2021-09-30',
      rating: 4.8,
    },
    images: [],
  },
  {
    id: 'tiles-50box-medan',
    category: 'Ceramic & Granite',
    name: '50 boxes of 40x40 renovation surplus tiles',
    city: 'Medan',
    volume: { value: 50, unit: 'boxes' },
    condition: 'New/Surplus',
    status: 'Sold Out',
    priceIdr: 8500000,
    uploadedAt: '2026-03-30',
    description:
      'Renovation surplus tiles (40x40). Unopened boxes. Color and pattern consistent.',
    seller: {
      id: 's4',
      name: 'Medan Tile Depot',
      city: 'Medan',
      memberSince: '2020-06-20',
      rating: 4.3,
    },
    images: [],
  },
  {
    id: 'teak-doors-3-jakarta',
    category: 'Frames & Doors',
    name: '3 units of pre-loved solid teak doors',
    city: 'Jakarta',
    volume: { value: 3, unit: 'units' },
    condition: 'Needs Repair',
    status: 'Available',
    priceIdr: 1750000,
    uploadedAt: '2026-04-03',
    description:
      'Solid teak doors. Minor warping; recommended to refinish and re-hinge. Great material quality.',
    seller: {
      id: 's3',
      name: 'Jakarta Rebar Supply',
      city: 'Jakarta',
      memberSince: '2021-09-30',
      rating: 4.8,
    },
    images: [],
  },
  {
    id: 'pvc-4inch-30-makassar',
    category: 'Pipes & Installation',
    name: '30 units of 4-inch PVC surplus pipes',
    city: 'Makassar',
    volume: { value: 30, unit: 'units' },
    condition: 'New/Surplus',
    status: 'Available',
    priceIdr: 2400000,
    uploadedAt: '2026-04-02',
    description:
      '4-inch PVC pipes, surplus stock. Suitable for installations. Stored covered and clean.',
    seller: {
      id: 's5',
      name: 'Makassar Install Mart',
      city: 'Makassar',
      memberSince: '2024-01-05',
      rating: 4.6,
    },
    images: [],
  },
]

