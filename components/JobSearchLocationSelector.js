'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    MapPin, 
    ChevronDown, 
    Globe, 
    X, 
    Search,
    Check
} from 'lucide-react';
import { countries, getCountryByCode, getCountriesByRegion, getRegions } from '@/utils/location/countries';
import { getCitiesForCountry, hasDetailedCities } from '@/utils/location/cities';

/**
 * JobSearchLocationSelector Component
 * 
 * A user-friendly location selector for job search with:
 * - Country dropdown organized by region
 * - City dropdown (only for supported countries)
 * - Option to search entire country (no city)
 * - Remote/Worldwide option
 */
export default function JobSearchLocationSelector({
    selectedCountry = '',
    selectedCity = '',
    onLocationChange,
    className = '',
    showRemoteOption = true,
}) {
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [isRemote, setIsRemote] = useState(false);
    
    const countryRef = useRef(null);
    const cityRef = useRef(null);

    // Get all regions for organized display
    const regions = useMemo(() => getRegions(), []);

    // Get the selected country object
    const countryObj = useMemo(() => {
        return selectedCountry ? getCountryByCode(selectedCountry) : null;
    }, [selectedCountry]);

    // Get cities for selected country
    const cities = useMemo(() => {
        if (!selectedCountry) return [];
        return getCitiesForCountry(selectedCountry);
    }, [selectedCountry]);

    // Check if country has cities
    const hasCities = useMemo(() => {
        return selectedCountry ? hasDetailedCities(selectedCountry) : false;
    }, [selectedCountry]);

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!countrySearch.trim()) return countries;
        const query = countrySearch.toLowerCase();
        return countries.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        );
    }, [countrySearch]);

    // Group filtered countries by region
    const groupedCountries = useMemo(() => {
        const groups = {};
        filteredCountries.forEach(country => {
            if (!groups[country.region]) {
                groups[country.region] = [];
            }
            groups[country.region].push(country);
        });
        return groups;
    }, [filteredCountries]);

    // Filter cities based on search
    const filteredCities = useMemo(() => {
        if (!citySearch.trim()) return cities;
        const query = citySearch.toLowerCase();
        return cities.filter(city => city.toLowerCase().includes(query));
    }, [cities, citySearch]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (countryRef.current && !countryRef.current.contains(event.target)) {
                setIsCountryOpen(false);
                setCountrySearch('');
            }
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setIsCityOpen(false);
                setCitySearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle country selection
    const handleCountrySelect = useCallback((countryCode) => {
        setIsCountryOpen(false);
        setCountrySearch('');
        setIsRemote(false);
        onLocationChange({
            country: countryCode,
            city: '',
            isRemote: false,
            locationString: getCountryByCode(countryCode)?.name || countryCode,
        });
    }, [onLocationChange]);

    // Handle city selection
    const handleCitySelect = useCallback((city) => {
        setIsCityOpen(false);
        setCitySearch('');
        const countryName = countryObj?.name || selectedCountry;
        onLocationChange({
            country: selectedCountry,
            city: city,
            isRemote: false,
            locationString: city ? `${city}, ${countryName}` : countryName,
        });
    }, [selectedCountry, countryObj, onLocationChange]);

    // Handle remote toggle
    const handleRemoteToggle = useCallback(() => {
        const newIsRemote = !isRemote;
        setIsRemote(newIsRemote);
        if (newIsRemote) {
            onLocationChange({
                country: '',
                city: '',
                isRemote: true,
                locationString: 'Remote / Worldwide',
            });
        } else {
            onLocationChange({
                country: selectedCountry,
                city: selectedCity,
                isRemote: false,
                locationString: selectedCity && countryObj 
                    ? `${selectedCity}, ${countryObj.name}` 
                    : countryObj?.name || '',
            });
        }
    }, [isRemote, selectedCountry, selectedCity, countryObj, onLocationChange]);

    // Clear location
    const handleClear = useCallback(() => {
        setIsRemote(false);
        onLocationChange({
            country: '',
            city: '',
            isRemote: false,
            locationString: '',
        });
    }, [onLocationChange]);

    // Get display text for the location button
    const getLocationDisplay = () => {
        if (isRemote) {
            return { text: 'Remote / Worldwide', icon: '🌍' };
        }
        if (!selectedCountry) {
            return { text: 'Select location...', icon: null };
        }
        if (selectedCity && countryObj) {
            return { text: `${selectedCity}, ${countryObj.name}`, icon: countryObj.flag };
        }
        if (countryObj) {
            return { text: `All of ${countryObj.name}`, icon: countryObj.flag };
        }
        return { text: selectedCountry, icon: null };
    };

    const locationDisplay = getLocationDisplay();

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Remote Option Toggle */}
            {showRemoteOption && (
                <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition border ${
                        isRemote
                            ? 'bg-green-500/20 border-green-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={isRemote}
                        onChange={handleRemoteToggle}
                        className="accent-green-500 w-4 h-4"
                    />
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Remote / Worldwide jobs</span>
                </label>
            )}

            {/* Country Selector */}
            {!isRemote && (
                <div ref={countryRef} className="relative">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsCountryOpen(!isCountryOpen); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {locationDisplay.icon ? (
                                <span className="text-xl flex-shrink-0">{locationDisplay.icon}</span>
                            ) : (
                                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`truncate ${!selectedCountry && !isRemote ? 'text-gray-400' : 'text-white'}`}>
                                {locationDisplay.text}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedCountry && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition ${isCountryOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Country Dropdown */}
                    {isCountryOpen && (
                        <div className="absolute z-[100] w-full mt-2 bg-[#111827] border border-white/20 rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
                            {/* Search Input */}
                            <div className="p-3 border-b border-white/10 bg-[#111827]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            {/* Countries List - Grouped by Region */}
                            <div className="max-h-80 overflow-y-auto bg-[#111827]">
                                {Object.keys(groupedCountries).length === 0 ? (
                                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                        No countries found
                                    </div>
                                ) : (
                                    Object.entries(groupedCountries).map(([region, regionCountries]) => (
                                        <div key={region}>
                                            <div className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0">
                                                {region}
                                            </div>
                                            {regionCountries.map(country => (
                                                <button
                                                    key={country.code}
                                                    type="button"
                                                    onClick={() => handleCountrySelect(country.code)}
                                                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-700 transition text-left ${
                                                        selectedCountry === country.code ? 'bg-indigo-500/20' : 'bg-[#111827]'
                                                    }`}
                                                >
                                                    <span className="text-lg">{country.flag}</span>
                                                    <span className="flex-1 text-white text-sm">{country.name}</span>
                                                    {selectedCountry === country.code && (
                                                        <Check className="w-4 h-4 text-indigo-400" />
                                                    )}
                                                    {country.hasAusbildung && (
                                                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                            Ausbildung
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* City Selector - Only show if country is selected and has cities */}
            {!isRemote && selectedCountry && hasCities && (
                <div ref={cityRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsCityOpen(!isCityOpen)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className={`truncate ${!selectedCity ? 'text-gray-400' : 'text-white'}`}>
                                {selectedCity || `All cities in ${countryObj?.name || 'country'}`}
                            </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition flex-shrink-0 ${isCityOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* City Dropdown */}
                    {isCityOpen && (
                        <div className="absolute z-[100] w-full mt-2 bg-[#111827] border border-white/20 rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
                            {/* Search Input */}
                            <div className="p-3 border-b border-white/10 bg-[#111827]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search cities..."
                                        value={citySearch}
                                        onChange={(e) => setCitySearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            {/* Cities List */}
                            <div className="max-h-64 overflow-y-auto bg-[#111827]">
                                {/* All Cities Option */}
                                <button
                                    type="button"
                                    onClick={() => handleCitySelect('')}
                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition text-left border-b border-white/5 ${
                                        !selectedCity ? 'bg-indigo-500/20' : 'bg-[#111827]'
                                    }`}
                                >
                                    <Globe className="w-4 h-4 text-indigo-400" />
                                    <span className="text-white text-sm font-medium">
                                        All cities in {countryObj?.name}
                                    </span>
                                    {!selectedCity && (
                                        <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                                    )}
                                </button>

                                {filteredCities.length === 0 && citySearch ? (
                                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                        No cities found matching "{citySearch}"
                                    </div>
                                ) : (
                                    filteredCities.map(city => (
                                        <button
                                            key={city}
                                            type="button"
                                            onClick={() => handleCitySelect(city)}
                                            className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-700 transition text-left ${
                                                selectedCity === city ? 'bg-indigo-500/20' : 'bg-[#111827]'
                                            }`}
                                        >
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="flex-1 text-white text-sm">{city}</span>
                                            {selectedCity === city && (
                                                <Check className="w-4 h-4 text-indigo-400" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info text for countries without city data */}
            {!isRemote && selectedCountry && !hasCities && (
                <p className="text-xs text-gray-500 px-1">
                    Search will cover all of {countryObj?.name || selectedCountry}
                </p>
            )}
        </div>
    );
}
