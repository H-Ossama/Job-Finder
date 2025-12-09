'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, ChevronDown, Loader2, Navigation, X, Check, Edit3 } from 'lucide-react';
import { countries, searchCountries, getCountryByCode } from '@/utils/location/countries';
import { getCitiesForCountry, searchCities, hasDetailedCities } from '@/utils/location/cities';
import { detectUserCountry } from '@/utils/location';

/**
 * LocationSelector Component
 * 
 * A two-step location selector with:
 * - Country dropdown with search
 * - City dropdown/input with search (lazy loaded)
 * - Auto-detect location option
 * - Remote work option
 */
export default function LocationSelector({
    value = { country: '', city: '', useAutoLocation: false, isRemote: false },
    onChange,
    className = '',
    showRemoteOption = true,
    showAutoDetect = true,
    label = 'Preferred Location',
}) {
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [cities, setCities] = useState([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [showManualSelection, setShowManualSelection] = useState(!value.useAutoLocation);
    
    const countryRef = useRef(null);
    const cityRef = useRef(null);

    // Filter countries based on search
    const filteredCountries = searchCountries(countrySearch);
    
    // Filter cities based on search
    const filteredCities = citySearch 
        ? cities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
        : cities;

    // Load cities when country changes
    useEffect(() => {
        if (value.country) {
            const countryCities = getCitiesForCountry(value.country);
            setCities(countryCities);
        } else {
            setCities([]);
        }
    }, [value.country]);

    // Update showManualSelection when useAutoLocation changes
    useEffect(() => {
        if (!value.useAutoLocation) {
            setShowManualSelection(true);
        }
    }, [value.useAutoLocation]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (countryRef.current && !countryRef.current.contains(event.target)) {
                setIsCountryOpen(false);
            }
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setIsCityOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected country object
    const selectedCountry = countries.find(c => c.code === value.country);

    // Handle auto-detect location
    const handleAutoDetect = useCallback(async () => {
        setIsDetecting(true);
        try {
            const location = await detectUserCountry();
            if (location) {
                setDetectedLocation(location);
                setShowManualSelection(false);
                onChange({
                    ...value,
                    country: location.countryCode,
                    city: location.city || '',
                    useAutoLocation: true,
                });
            }
        } catch (error) {
            console.error('Failed to detect location:', error);
        } finally {
            setIsDetecting(false);
        }
    }, [onChange, value]);

    // Handle switching to manual selection
    const handleEditLocation = () => {
        setShowManualSelection(true);
        onChange({
            ...value,
            useAutoLocation: false,
        });
    };

    // Handle country selection
    const handleCountrySelect = (countryCode) => {
        onChange({
            ...value,
            country: countryCode,
            city: '', // Reset city when country changes
            useAutoLocation: false,
        });
        setIsCountryOpen(false);
        setCountrySearch('');
        setDetectedLocation(null);
    };

    // Handle city selection
    const handleCitySelect = (city) => {
        onChange({
            ...value,
            city,
            useAutoLocation: false,
        });
        setIsCityOpen(false);
        setCitySearch('');
    };

    // Handle remote toggle
    const handleRemoteToggle = () => {
        onChange({
            ...value,
            isRemote: !value.isRemote,
        });
    };

    // Clear location
    const handleClear = () => {
        setDetectedLocation(null);
        setShowManualSelection(true);
        onChange({
            country: '',
            city: '',
            useAutoLocation: false,
            isRemote: value.isRemote,
        });
    };

    // Get display location for detected location
    const getDetectedLocationDisplay = () => {
        if (detectedLocation) {
            const countryInfo = getCountryByCode(detectedLocation.countryCode);
            const parts = [];
            if (detectedLocation.city) parts.push(detectedLocation.city);
            if (detectedLocation.region && detectedLocation.region !== detectedLocation.city) {
                parts.push(detectedLocation.region);
            }
            if (countryInfo) parts.push(countryInfo.name);
            return {
                full: parts.join(', '),
                flag: countryInfo?.flag || '🌍',
                country: countryInfo?.name || detectedLocation.countryName,
                city: detectedLocation.city,
            };
        }
        // Fallback to value if detectedLocation not available
        if (value.country) {
            const countryInfo = getCountryByCode(value.country);
            return {
                full: value.city ? `${value.city}, ${countryInfo?.name || value.country}` : (countryInfo?.name || value.country),
                flag: countryInfo?.flag || '🌍',
                country: countryInfo?.name || value.country,
                city: value.city,
            };
        }
        return null;
    };

    const detectedDisplay = getDetectedLocationDisplay();

    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <label className="block text-sm text-gray-400 mb-2">
                    {label}
                </label>
            )}

            {/* Auto-detect section */}
            {showAutoDetect && (
                <>
                    {/* Show detected location card if using auto-location */}
                    {value.useAutoLocation && detectedDisplay && !showManualSelection ? (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/30 flex items-center justify-center text-xl">
                                        {detectedDisplay.flag}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4 text-indigo-400" />
                                            <span className="text-sm text-indigo-300">Using your location</span>
                                        </div>
                                        <div className="font-medium text-white">
                                            {detectedDisplay.full}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleEditLocation}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Show auto-detect button */
                        <button
                            type="button"
                            onClick={handleAutoDetect}
                            disabled={isDetecting}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition ${
                                isDetecting
                                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                            }`}
                        >
                            {isDetecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Detecting your location...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-4 h-4" />
                                    Use my current location
                                </>
                            )}
                        </button>
                    )}
                </>
            )}

            {/* Manual selection - show if not using auto-location or user clicked edit */}
            {showManualSelection && (
                <>
                    {showAutoDetect && (
                        <div className="text-center text-gray-500 text-sm">or select manually</div>
                    )}

                    {/* Country Selector */}
                    <div ref={countryRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {selectedCountry ? (
                                    <span>
                                        {selectedCountry.flag} {selectedCountry.name}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">Select country...</span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isCountryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCountryOpen && (
                            <div className="absolute z-50 w-full mt-2 py-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl max-h-64 overflow-hidden">
                                {/* Search input */}
                                <div className="px-3 pb-2">
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                        autoFocus
                                    />
                                </div>
                                {/* Country list */}
                                <div className="overflow-y-auto max-h-48">
                                    {filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country.code)}
                                            className={`w-full px-4 py-2 text-left hover:bg-white/10 transition flex items-center gap-2 ${
                                                value.country === country.code ? 'bg-indigo-500/20 text-indigo-300' : ''
                                            }`}
                                        >
                                            <span>{country.flag}</span>
                                            <span>{country.name}</span>
                                        </button>
                                    ))}
                                    {filteredCountries.length === 0 && (
                                        <div className="px-4 py-2 text-gray-400 text-sm">No countries found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* City Selector - only show if country is selected */}
                    {value.country && (
                        <div ref={cityRef} className="relative">
                            {hasDetailedCities(value.country) ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsCityOpen(!isCityOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                                    >
                                        <span className={value.city ? '' : 'text-gray-400'}>
                                            {value.city || 'Select city (optional)...'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isCityOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCityOpen && (
                                        <div className="absolute z-50 w-full mt-2 py-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl max-h-64 overflow-hidden">
                                            <div className="px-3 pb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search cities..."
                                                    value={citySearch}
                                                    onChange={(e) => setCitySearch(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="overflow-y-auto max-h-48">
                                                {/* Option to skip city */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleCitySelect('')}
                                                    className="w-full px-4 py-2 text-left hover:bg-white/10 transition text-gray-400"
                                                >
                                                    Any city in {selectedCountry?.name}
                                                </button>
                                                {filteredCities.map((city) => (
                                                    <button
                                                        key={city}
                                                        type="button"
                                                        onClick={() => handleCitySelect(city)}
                                                        className={`w-full px-4 py-2 text-left hover:bg-white/10 transition ${
                                                            value.city === city ? 'bg-indigo-500/20 text-indigo-300' : ''
                                                        }`}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Text input for cities in countries without detailed data */
                                <input
                                    type="text"
                                    placeholder="Enter city (optional)..."
                                    value={value.city}
                                    onChange={(e) => onChange({ ...value, city: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500 transition"
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Remote work option */}
            {showRemoteOption && (
                <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
                        value.isRemote
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={value.isRemote}
                        onChange={handleRemoteToggle}
                        className="accent-green-500 w-4 h-4"
                    />
                    <span>Include remote jobs worldwide</span>
                </label>
            )}

            {/* Clear button */}
            {(value.country || value.city) && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
                >
                    <X className="w-3 h-3" />
                    Clear location
                </button>
            )}
        </div>
    );
}
