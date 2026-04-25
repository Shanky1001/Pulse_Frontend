const COUNTRY_TO_ISO: Record<string, string> = {
  'United States': 'US',
  'United Kingdom': 'GB',
  India: 'IN',
  Germany: 'DE',
  Brazil: 'BR',
  France: 'FR',
  Japan: 'JP',
  Canada: 'CA',
  Australia: 'AU',
  Mexico: 'MX',
  Spain: 'ES',
  Italy: 'IT',
  Netherlands: 'NL',
  Sweden: 'SE',
  Singapore: 'SG',
  China: 'CN',
  'South Korea': 'KR',
  Russia: 'RU',
  Argentina: 'AR',
  Indonesia: 'ID',
  Turkey: 'TR',
  Ireland: 'IE',
  Switzerland: 'CH',
  Norway: 'NO',
  Denmark: 'DK',
  Finland: 'FI',
  Poland: 'PL',
  Portugal: 'PT',
  'New Zealand': 'NZ',
  'South Africa': 'ZA',
};

export function isoForCountry(name: string): string | null {
  return COUNTRY_TO_ISO[name] ?? null;
}

export function flagEmoji(name: string): string {
  const iso = isoForCountry(name);
  if (!iso || iso.length !== 2) return '🌐';
  const a = iso.toUpperCase().charCodeAt(0) - 65 + 0x1f1e6;
  const b = iso.toUpperCase().charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(a, b);
}
