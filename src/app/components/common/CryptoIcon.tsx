import { useState } from 'react';

interface CryptoIconProps {
  symbol: string;
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a real crypto logo from a public icon CDN, falling back to the
 * existing color-circle + 3-letter abbreviation if the symbol has no icon
 * there (unknown asset, or "Other"/"ETH→BTC"-style composite labels).
 */
export function CryptoIcon({ symbol, color = '#5A7A9C', size = 36, className, style }: CryptoIconProps) {
  const [failed, setFailed] = useState(false);
  const clean = symbol.trim().replace(/[^A-Za-z]/g, '');

  if (failed || !clean) {
    return (
      <div className={className}
        style={{ width: size, height: size, borderRadius: '50%', background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
        <span style={{ fontSize: size * 0.32, fontWeight: 700, color }}>{symbol.slice(0, 3)}</span>
      </div>
    );
  }

  return (
    <img
      src={`https://assets.coincap.io/assets/icons/${clean.toLowerCase()}@2x.png`}
      alt={symbol}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', background: color + '1A', objectFit: 'contain', padding: size * 0.12, flexShrink: 0, ...style }}
      onError={() => setFailed(true)}
    />
  );
}
