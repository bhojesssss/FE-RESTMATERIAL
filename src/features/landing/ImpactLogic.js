import { LISTINGS } from '../../data/marketplace';
import { CO2_EMISSION_FACTORS } from '../dashboard/CreateListingPage';

export function getImpactStats() {
  // Baseline simulated stats
  const BASELINE = {
    divertedKg: 12450,
    co2Kg: 8200,
    users: 1120,
    activeListings: 2400
  };

  let active = 0;
  let divertedKg = 0;
  let co2Kg = 0;
  let users = 0;

  // Real logic
  // 1. Users
  try {
    const rmUsers = localStorage.getItem('rm_users_v1');
    if (rmUsers) {
      const parsed = JSON.parse(rmUsers);
      if (Array.isArray(parsed)) users = parsed.length;
    }
  } catch {}

  // 2. Data combination (Static + Drafts)
  const draftListingsStr = localStorage.getItem('rm_listings_draft');
  let draftListings = [];
  try {
    if (draftListingsStr) draftListings = JSON.parse(draftListingsStr);
  } catch {}

  const soldIdsStr = localStorage.getItem('rm_sold_ids');
  let soldIds = [];
  try {
    if (soldIdsStr) soldIds = JSON.parse(soldIdsStr);
  } catch {}

  const allItems = [...(Array.isArray(draftListings) ? draftListings : []), ...LISTINGS];

  const categoryCo2Map = {
    'Steel & Iron': 0,
    'Aluminium': 0,
    'Concrete': 0,
    'Wood & Plywood': 0,
    'Bricks & Blocks': 0,
    'Ceramic & Granite': 0,
    'Pipes & Installation': 0,
    'Others': 0
  };

  allItems.forEach(item => {
    const isSold = item.status?.startsWith('Sold') || soldIds.includes(item.id);
    const volume = item.volume?.value || 0;
    const factor = CO2_EMISSION_FACTORS[item.category] || 0.5;
    
    if (isSold) {
      divertedKg += volume;
      const co2 = volume * factor;
      co2Kg += co2;
      
      // Update breakdown
      if (categoryCo2Map[item.category] !== undefined) {
        categoryCo2Map[item.category] += co2;
      } else {
        categoryCo2Map['Others'] += co2;
      }
    } else if (item.status === 'Available') {
      active++;
    }
  });

  // Mixed Baseline values roughly scaled
  categoryCo2Map['Steel & Iron'] += 3400;
  categoryCo2Map['Aluminium'] += 1900;
  categoryCo2Map['Concrete'] += 1200;
  categoryCo2Map['Wood & Plywood'] += 900;
  categoryCo2Map['Bricks & Blocks'] += 500;
  categoryCo2Map['Ceramic & Granite'] += 300;

  const totalCo2 = co2Kg + BASELINE.co2Kg;
  
  const breakdown = Object.entries(categoryCo2Map)
    .map(([category, value]) => ({ category, value, percentage: (value / totalCo2) * 100 }))
    .filter(b => b.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    activeListings: active + BASELINE.activeListings,
    divertedKg: Math.round(divertedKg + BASELINE.divertedKg),
    co2Kg: Math.round(totalCo2),
    users: users + BASELINE.users,
    breakdown
  };
}
