/**
 * Country data for job search location preferences
 * Countries are loaded immediately (small dataset)
 * Cities are loaded lazily per country for performance
 */

export const countries = [
    // North America
    { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America' },
    
    // Europe - Western
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', hasAusbildung: true },
    { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'Europe' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europe', hasAusbildung: true },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', hasAusbildung: true },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', region: 'Europe' },
    
    // Europe - Southern
    { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe' },
    { code: 'GR', name: 'Greece', flag: '🇬🇷', region: 'Europe' },
    { code: 'MT', name: 'Malta', flag: '🇲🇹', region: 'Europe' },
    { code: 'CY', name: 'Cyprus', flag: '🇨🇾', region: 'Europe' },
    
    // Europe - Northern (Scandinavia)
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'Europe' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'Europe' },
    { code: 'IS', name: 'Iceland', flag: '🇮🇸', region: 'Europe' },
    
    // Europe - Eastern
    { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe' },
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', region: 'Europe' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺', region: 'Europe' },
    { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'Europe' },
    { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', region: 'Europe' },
    { code: 'HR', name: 'Croatia', flag: '🇭🇷', region: 'Europe' },
    { code: 'SK', name: 'Slovakia', flag: '🇸🇰', region: 'Europe' },
    { code: 'SI', name: 'Slovenia', flag: '🇸🇮', region: 'Europe' },
    { code: 'RS', name: 'Serbia', flag: '🇷🇸', region: 'Europe' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦', region: 'Europe' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe' },
    { code: 'BY', name: 'Belarus', flag: '🇧🇾', region: 'Europe' },
    { code: 'MD', name: 'Moldova', flag: '🇲🇩', region: 'Europe' },
    { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe' },
    { code: 'ME', name: 'Montenegro', flag: '🇲🇪', region: 'Europe' },
    { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', region: 'Europe' },
    { code: 'AL', name: 'Albania', flag: '🇦🇱', region: 'Europe' },
    { code: 'XK', name: 'Kosovo', flag: '🇽🇰', region: 'Europe' },
    
    // Baltic States
    { code: 'LT', name: 'Lithuania', flag: '🇱🇹', region: 'Europe' },
    { code: 'LV', name: 'Latvia', flag: '🇱🇻', region: 'Europe' },
    { code: 'EE', name: 'Estonia', flag: '🇪🇪', region: 'Europe' },
    
    // Middle East
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
    { code: 'BH', name: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'Middle East' },
    { code: 'JO', name: 'Jordan', flag: '🇯🇴', region: 'Middle East' },
    { code: 'LB', name: 'Lebanon', flag: '🇱🇧', region: 'Middle East' },
    { code: 'PS', name: 'Palestine', flag: '🇵🇸', region: 'Middle East' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Middle East' },
    { code: 'IQ', name: 'Iraq', flag: '🇮🇶', region: 'Middle East' },
    { code: 'IR', name: 'Iran', flag: '🇮🇷', region: 'Middle East' },
    { code: 'SY', name: 'Syria', flag: '🇸🇾', region: 'Middle East' },
    { code: 'YE', name: 'Yemen', flag: '🇾🇪', region: 'Middle East' },
    
    // North Africa
    { code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'North Africa' },
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿', region: 'North Africa' },
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳', region: 'North Africa' },
    { code: 'LY', name: 'Libya', flag: '🇱🇾', region: 'North Africa' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'North Africa' },
    { code: 'SD', name: 'Sudan', flag: '🇸🇩', region: 'North Africa' },
    { code: 'MR', name: 'Mauritania', flag: '🇲🇷', region: 'North Africa' },
    
    // Sub-Saharan Africa
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'Africa' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', region: 'Africa' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', region: 'Africa' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', region: 'Africa' },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳', region: 'Africa' },
    { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', region: 'Africa' },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲', region: 'Africa' },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺', region: 'Africa' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴', region: 'Africa' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', region: 'Africa' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼', region: 'Africa' },
    { code: 'NA', name: 'Namibia', flag: '🇳🇦', region: 'Africa' },
    
    // South Asia
    { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
    { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵', region: 'Asia' },
    { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', region: 'Asia' },
    
    // East Asia
    { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia' },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia' },
    { code: 'MN', name: 'Mongolia', flag: '🇲🇳', region: 'Asia' },
    
    // Southeast Asia
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia' },
    { code: 'MM', name: 'Myanmar', flag: '🇲🇲', region: 'Asia' },
    { code: 'KH', name: 'Cambodia', flag: '🇰🇭', region: 'Asia' },
    { code: 'LA', name: 'Laos', flag: '🇱🇦', region: 'Asia' },
    { code: 'BN', name: 'Brunei', flag: '🇧🇳', region: 'Asia' },
    
    // Central Asia
    { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', region: 'Asia' },
    { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', region: 'Asia' },
    { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', region: 'Asia' },
    { code: 'GE', name: 'Georgia', flag: '🇬🇪', region: 'Asia' },
    { code: 'AM', name: 'Armenia', flag: '🇦🇲', region: 'Asia' },
    
    // Oceania
    { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
    { code: 'FJ', name: 'Fiji', flag: '🇫🇯', region: 'Oceania' },
    
    // South America
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'South America' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'South America' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'South America' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'South America' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', region: 'South America' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨', region: 'South America' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'South America' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'South America' },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴', region: 'South America' },
    { code: 'GY', name: 'Guyana', flag: '🇬🇾', region: 'South America' },
    { code: 'SR', name: 'Suriname', flag: '🇸🇷', region: 'South America' },
    
    // Central America & Caribbean
    { code: 'PA', name: 'Panama', flag: '🇵🇦', region: 'Central America' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', region: 'Central America' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹', region: 'Central America' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳', region: 'Central America' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻', region: 'Central America' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', region: 'Central America' },
    { code: 'BZ', name: 'Belize', flag: '🇧🇿', region: 'Central America' },
    { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', region: 'Caribbean' },
    { code: 'JM', name: 'Jamaica', flag: '🇯🇲', region: 'Caribbean' },
    { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', region: 'Caribbean' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺', region: 'Caribbean' },
    { code: 'HT', name: 'Haiti', flag: '🇭🇹', region: 'Caribbean' },
    { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', region: 'Caribbean' },
    { code: 'BS', name: 'Bahamas', flag: '🇧🇸', region: 'Caribbean' },
    { code: 'BB', name: 'Barbados', flag: '🇧🇧', region: 'Caribbean' },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Get countries by region
 */
export function getCountriesByRegion(region) {
    return countries.filter(c => c.region === region);
}

/**
 * Get all unique regions
 */
export function getRegions() {
    return [...new Set(countries.map(c => c.region))].sort();
}

/**
 * Get country by code
 */
export function getCountryByCode(code) {
    return countries.find(c => c.code === code);
}

/**
 * Get country by name (case-insensitive)
 */
export function getCountryByName(name) {
    const lowerName = name.toLowerCase();
    return countries.find(c => c.name.toLowerCase() === lowerName);
}

/**
 * Search countries by name
 */
export function searchCountries(query) {
    if (!query) return countries;
    const lowerQuery = query.toLowerCase();
    return countries.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.code.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get countries that support Ausbildung (German apprenticeship system)
 */
export function getAusbildungCountries() {
    return countries.filter(c => c.hasAusbildung);
}

/**
 * Check if a country supports Ausbildung
 */
export function supportsAusbildung(code) {
    const country = getCountryByCode(code);
    return country?.hasAusbildung || false;
}
