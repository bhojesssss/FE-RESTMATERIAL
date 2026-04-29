import React from 'react';

export default function Co2Badge({ co2Value, className = '' }) {
  if (!co2Value || co2Value <= 0) return null;
  
  return (
    <div className={`co2-badge ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12 12"></path>
      </svg>
      <span>Hemat {co2Value} kg CO₂</span>
    </div>
  );
}
