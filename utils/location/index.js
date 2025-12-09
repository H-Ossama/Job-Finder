/**
 * Location utilities - main export file
 */

export { countries, getCountryByCode, getCountryByName, searchCountries } from './countries';
export { getCitiesForCountry, searchCities, hasDetailedCities } from './cities';

/**
 * Detect user's country from browser/geolocation
 * Returns country code or null
 */
export async function detectUserCountry() {
    // Try multiple IP geolocation services for reliability
    const geoServices = [
        {
            url: 'https://ipapi.co/json/',
            parse: (data) => ({
                countryCode: data.country_code || data.country,
                countryName: data.country_name,
                city: data.city,
                region: data.region,
            }),
        },
        {
            url: 'https://ipwho.is/',
            parse: (data) => ({
                countryCode: data.country_code,
                countryName: data.country,
                city: data.city,
                region: data.region,
            }),
        },
        {
            url: 'https://freeipapi.com/api/json',
            parse: (data) => ({
                countryCode: data.countryCode,
                countryName: data.countryName,
                city: data.cityName,
                region: data.regionName,
            }),
        },
    ];

    for (const service of geoServices) {
        try {
            const response = await fetch(service.url, {
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                const result = service.parse(data);
                
                // Validate we got a country code
                if (result.countryCode && result.countryCode.length === 2) {
                    console.log('Location detected via', service.url, result);
                    return result;
                }
            }
        } catch (error) {
            console.warn(`Geolocation via ${service.url} failed:`, error.message);
        }
    }

    // Fallback: try browser's Geolocation API with reverse geocoding
    try {
        if ('geolocation' in navigator) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    enableHighAccuracy: false,
                });
            });
            
            const { latitude, longitude } = position.coords;
            
            // Use BigDataCloud free reverse geocoding
            const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                { signal: AbortSignal.timeout(5000) }
            );
            
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                console.log('Location detected via browser geolocation:', geoData);
                return {
                    countryCode: geoData.countryCode,
                    countryName: geoData.countryName,
                    city: geoData.city || geoData.locality,
                    region: geoData.principalSubdivision,
                };
            }
        }
    } catch (error) {
        console.warn('Browser geolocation failed:', error.message);
    }

    // Final fallback: try browser's navigator.language to guess country
    try {
        const lang = navigator.language || navigator.userLanguage;
        if (lang) {
            // Language codes like 'en-US', 'en-GB', 'de-DE'
            const parts = lang.split('-');
            if (parts.length > 1) {
                return {
                    countryCode: parts[1].toUpperCase(),
                    countryName: null,
                    city: null,
                    region: null,
                };
            }
        }
    } catch (error) {
        console.warn('Language detection failed:', error.message);
    }

    return null;
}

/**
 * Format location for display
 */
export function formatLocation(city, country) {
    if (city && country) {
        return `${city}, ${country}`;
    }
    return city || country || 'Remote';
}

/**
 * Parse a location string into components
 */
export function parseLocation(locationString) {
    if (!locationString) return { city: null, country: null };
    
    const parts = locationString.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
        return {
            city: parts[0],
            country: parts[parts.length - 1],
        };
    }
    
    // Single value - could be country or city
    return {
        city: parts[0],
        country: null,
    };
}
