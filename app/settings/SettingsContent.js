'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search,
    Zap,
    Bell,
    CheckCircle,
    Palette,
    Shield,
    Eye,
    EyeOff,
    Download,
    Trash2,
    AlertTriangle,
    MapPin,
    Briefcase,
    DollarSign,
    Loader2,
    Info,
    ChevronDown,
    Save
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import LocationSelector from '@/components/LocationSelector';

const themes = [
    { id: 'purple', name: 'Purple Haze', description: 'Default theme', colors: ['#667eea', '#764ba2'] },
    { id: 'ocean', name: 'Ocean Blue', description: 'Cool & calm', colors: ['#0ea5e9', '#22d3ee'] },
    { id: 'emerald', name: 'Emerald', description: 'Fresh & natural', colors: ['#059669', '#34d399'] },
    { id: 'sunset', name: 'Sunset', description: 'Warm & vibrant', colors: ['#f43f5e', '#fb923c'] }
];

const experienceLevelOptions = [
    { id: 'entry', label: 'Entry Level', description: '0-2 years' },
    { id: 'mid', label: 'Mid Level', description: '3-5 years' },
    { id: 'senior', label: 'Senior', description: '5-10 years' },
    { id: 'lead', label: 'Lead/Principal', description: '10+ years' },
];

const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
];

export default function SettingsContent({ user, preferences, jobPreferences, cvs }) {
    const { theme: activeTheme, setTheme } = useTheme();
    const router = useRouter();
    
    // Job Search Preferences State
    const [jobSearchPrefs, setJobSearchPrefs] = useState({
        jobTitles: jobPreferences?.desired_titles?.join(', ') || '',
        location: {
            country: jobPreferences?.desired_countries?.[0] || '',
            city: '', // Will be parsed from desired_locations
            useAutoLocation: false,
            isRemote: jobPreferences?.job_types?.includes('remote') || false,
        },
        salaryMin: jobPreferences?.salary_min ? `${jobPreferences.salary_min}` : '',
        salaryMax: jobPreferences?.salary_max ? `${jobPreferences.salary_max}` : '',
        salaryCurrency: jobPreferences?.salary_currency || 'USD',
        workType: {
            remote: jobPreferences?.job_types?.includes('remote') ?? true,
            hybrid: jobPreferences?.job_types?.includes('hybrid') ?? false,
            onsite: jobPreferences?.job_types?.includes('onsite') ?? false,
        },
        employmentType: {
            fulltime: jobPreferences?.job_types?.includes('full-time') ?? true,
            contract: jobPreferences?.job_types?.includes('contract') ?? false,
            parttime: jobPreferences?.job_types?.includes('part-time') ?? false,
        },
        experienceLevels: jobPreferences?.experience_levels || [],
        skills: jobPreferences?.skills?.join(', ') || '',
    });

    // Parse city from desired_locations on mount
    useEffect(() => {
        if (jobPreferences?.desired_locations?.[0]) {
            const locationParts = jobPreferences.desired_locations[0].split(', ');
            if (locationParts.length > 1) {
                setJobSearchPrefs(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        city: locationParts[0],
                    }
                }));
            }
        }
    }, [jobPreferences]);

    // General settings state
    const [settings, setSettings] = useState({
        // AI Auto-Apply
        autoApplyEnabled: preferences?.auto_apply_enabled ?? true,
        minMatchScore: preferences?.min_match_score || '85',
        dailyLimit: preferences?.daily_limit || '10',
        generateCoverLetters: preferences?.generate_cover_letters ?? true,
        defaultResumeId: preferences?.default_resume_id || '',
        // Notifications
        notifyNewMatches: preferences?.notify_new_matches ?? true,
        notifyApplicationUpdates: preferences?.notify_application_updates ?? true,
        notifyProfileViews: preferences?.notify_profile_views ?? false,
        notifyWeeklySummary: preferences?.notify_weekly_summary ?? true,
        // Privacy
        profileVisible: preferences?.profile_visible ?? true,
        showSalary: preferences?.show_salary ?? false,
        allowDataCollection: preferences?.allow_data_collection ?? true,
    });

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    const handleThemeChange = (themeId) => {
        setTheme(themeId);
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleWorkTypeToggle = (type) => {
        setJobSearchPrefs(prev => ({
            ...prev,
            workType: {
                ...prev.workType,
                [type]: !prev.workType[type]
            }
        }));
    };

    const handleEmploymentTypeToggle = (type) => {
        setJobSearchPrefs(prev => ({
            ...prev,
            employmentType: {
                ...prev.employmentType,
                [type]: !prev.employmentType[type]
            }
        }));
    };

    const handleExperienceLevelToggle = (levelId) => {
        setJobSearchPrefs(prev => ({
            ...prev,
            experienceLevels: prev.experienceLevels.includes(levelId)
                ? prev.experienceLevels.filter(l => l !== levelId)
                : [...prev.experienceLevels, levelId]
        }));
    };

    const handleChange = (e) => {
        setSettings(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleJobPrefChange = (e) => {
        setJobSearchPrefs(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLocationChange = (newLocation) => {
        setJobSearchPrefs(prev => ({
            ...prev,
            location: newLocation,
            workType: {
                ...prev.workType,
                remote: newLocation.isRemote,
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        
        try {
            // Build job types array
            const jobTypes = [];
            if (jobSearchPrefs.workType.remote) jobTypes.push('remote');
            if (jobSearchPrefs.workType.hybrid) jobTypes.push('hybrid');
            if (jobSearchPrefs.workType.onsite) jobTypes.push('onsite');
            if (jobSearchPrefs.employmentType.fulltime) jobTypes.push('full-time');
            if (jobSearchPrefs.employmentType.contract) jobTypes.push('contract');
            if (jobSearchPrefs.employmentType.parttime) jobTypes.push('part-time');

            // Save job search preferences
            const jobSearchResponse = await fetch('/api/preferences/job-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    desiredTitles: jobSearchPrefs.jobTitles.split(',').map(t => t.trim()).filter(Boolean),
                    preferredCountry: jobSearchPrefs.location.country,
                    preferredCity: jobSearchPrefs.location.city,
                    useAutoLocation: jobSearchPrefs.location.useAutoLocation,
                    salaryMin: jobSearchPrefs.salaryMin,
                    salaryMax: jobSearchPrefs.salaryMax,
                    salaryCurrency: jobSearchPrefs.salaryCurrency,
                    jobTypes,
                    experienceLevels: jobSearchPrefs.experienceLevels,
                    skills: jobSearchPrefs.skills.split(',').map(s => s.trim()).filter(Boolean),
                }),
            });

            const jobSearchData = await jobSearchResponse.json();
            
            if (!jobSearchData.success) {
                throw new Error(jobSearchData.error || 'Failed to save job search preferences');
            }

            // Save general preferences (auto-apply, notifications, privacy)
            const generalResponse = await fetch('/api/preferences/general', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Auto-apply settings
                    autoApplyEnabled: settings.autoApplyEnabled,
                    minMatchScore: settings.minMatchScore,
                    dailyLimit: settings.dailyLimit,
                    generateCoverLetters: settings.generateCoverLetters,
                    defaultResumeId: settings.defaultResumeId || null,
                    // Notification settings
                    notifyNewMatches: settings.notifyNewMatches,
                    notifyApplicationUpdates: settings.notifyApplicationUpdates,
                    notifyProfileViews: settings.notifyProfileViews,
                    notifyWeeklySummary: settings.notifyWeeklySummary,
                    // Privacy settings
                    profileVisible: settings.profileVisible,
                    showSalary: settings.showSalary,
                    allowDataCollection: settings.allowDataCollection,
                }),
            });

            const generalData = await generalResponse.json();

            if (!generalData.success) {
                throw new Error(generalData.error || 'Failed to save general preferences');
            }

            setSaveMessage({ type: 'success', text: 'All preferences saved successfully!' });
            // Refresh the router cache so other pages see the updated preferences
            router.refresh();
        } catch (error) {
            console.error('Save error:', error);
            setSaveMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    // Check if job preferences are complete
    const isJobPrefsComplete = jobSearchPrefs.jobTitles && 
        (jobSearchPrefs.location.country || jobSearchPrefs.location.isRemote);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <header>
                <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Preferences</h1>
                <p className="text-gray-400">Configure your job search preferences and AI settings.</p>
            </header>

            {/* Save Message */}
            {saveMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    saveMessage.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                }`}>
                    {saveMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertTriangle className="w-5 h-5" />
                    )}
                    {saveMessage.text}
                </div>
            )}

            {/* Job Search Preferences - Main Section */}
            <div className="glass-card-static rounded-2xl p-8 border-2 border-indigo-500/30 bg-indigo-500/5">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Search className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                            Job Search Preferences
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            These preferences are used to show you relevant jobs automatically
                        </p>
                    </div>
                    {!isJobPrefsComplete && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
                            <Info className="w-4 h-4" />
                            Please complete
                        </div>
                    )}
                </div>
                
                <div className="space-y-6">
                    {/* Desired Job Titles */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Desired Job Titles *
                        </label>
                        <input 
                            type="text" 
                            name="jobTitles"
                            value={jobSearchPrefs.jobTitles}
                            onChange={handleJobPrefChange}
                            placeholder="e.g., Software Engineer, Full Stack Developer, Frontend Developer"
                            className="form-input w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple titles with commas</p>
                    </div>

                    {/* Location Selector */}
                    <div>
                        <LocationSelector
                            value={jobSearchPrefs.location}
                            onChange={handleLocationChange}
                            label={
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Preferred Location *
                                </span>
                            }
                            showRemoteOption={true}
                            showAutoDetect={true}
                        />
                    </div>
                    
                    {/* Salary Range */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Expected Salary Range
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <select
                                    name="salaryCurrency"
                                    value={jobSearchPrefs.salaryCurrency}
                                    onChange={handleJobPrefChange}
                                    className="form-input w-full"
                                >
                                    {currencies.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.symbol} {c.code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    name="salaryMin"
                                    value={jobSearchPrefs.salaryMin}
                                    onChange={handleJobPrefChange}
                                    placeholder="Min (e.g., 50000)"
                                    className="form-input w-full"
                                />
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    name="salaryMax"
                                    value={jobSearchPrefs.salaryMax}
                                    onChange={handleJobPrefChange}
                                    placeholder="Max (e.g., 150000)"
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Annual salary in your preferred currency</p>
                    </div>

                    {/* Work Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Work Type</label>
                        <div className="flex flex-wrap gap-3">
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.workType.remote 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.workType.remote}
                                    onChange={() => handleWorkTypeToggle('remote')}
                                    className="accent-indigo-500"
                                />
                                <span>🏠 Remote</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.workType.hybrid 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.workType.hybrid}
                                    onChange={() => handleWorkTypeToggle('hybrid')}
                                    className="accent-indigo-500"
                                />
                                <span>🔄 Hybrid</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.workType.onsite 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.workType.onsite}
                                    onChange={() => handleWorkTypeToggle('onsite')}
                                    className="accent-indigo-500"
                                />
                                <span>🏢 On-site</span>
                            </label>
                        </div>
                    </div>

                    {/* Employment Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Employment Type</label>
                        <div className="flex flex-wrap gap-3">
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.employmentType.fulltime 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.employmentType.fulltime}
                                    onChange={() => handleEmploymentTypeToggle('fulltime')}
                                    className="accent-indigo-500"
                                />
                                <span>Full-time</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.employmentType.contract 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.employmentType.contract}
                                    onChange={() => handleEmploymentTypeToggle('contract')}
                                    className="accent-indigo-500"
                                />
                                <span>Contract</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    jobSearchPrefs.employmentType.parttime 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={jobSearchPrefs.employmentType.parttime}
                                    onChange={() => handleEmploymentTypeToggle('parttime')}
                                    className="accent-indigo-500"
                                />
                                <span>Part-time</span>
                            </label>
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Experience Level</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {experienceLevelOptions.map((level) => (
                                <label 
                                    key={level.id}
                                    className={`flex flex-col px-4 py-3 rounded-xl cursor-pointer transition ${
                                        jobSearchPrefs.experienceLevels.includes(level.id)
                                            ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={jobSearchPrefs.experienceLevels.includes(level.id)}
                                            onChange={() => handleExperienceLevelToggle(level.id)}
                                            className="accent-indigo-500"
                                        />
                                        <span className="font-medium">{level.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-6">{level.description}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Your Skills</label>
                        <textarea 
                            name="skills"
                            value={jobSearchPrefs.skills}
                            onChange={handleJobPrefChange}
                            placeholder="e.g., JavaScript, React, Node.js, Python, AWS, Docker"
                            className="form-input w-full min-h-[80px] resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate skills with commas - helps match you with relevant jobs</p>
                    </div>
                </div>
            </div>

            {/* Smart Application Assistant */}
            <div className="glass-card-static rounded-2xl p-8 border border-purple-500/20 bg-purple-500/5">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Smart Application Assistant
                </h3>
                <p className="text-sm text-gray-400 mb-6 -mt-4">
                    AI-powered tools to help you apply faster and smarter
                </p>

                <div className="space-y-6">
                    <ToggleSetting
                        title="Smart Job Alerts"
                        description="Get notified when high-match jobs are found for you"
                        enabled={settings.autoApplyEnabled}
                        onToggle={() => handleToggle('autoApplyEnabled')}
                    />

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <div className="font-medium">Minimum Match Score for Alerts</div>
                            <div className="text-sm text-gray-400">Only notify about jobs above this match percentage</div>
                        </div>
                        <select 
                            name="minMatchScore"
                            value={settings.minMatchScore}
                            onChange={handleChange}
                            className="form-input w-32 text-center"
                        >
                            <option value="90">90%</option>
                            <option value="85">85%</option>
                            <option value="80">80%</option>
                            <option value="75">75%</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <div className="font-medium">Daily Job Recommendations</div>
                            <div className="text-sm text-gray-400">Maximum job suggestions per day</div>
                        </div>
                        <select 
                            name="dailyLimit"
                            value={settings.dailyLimit}
                            onChange={handleChange}
                            className="form-input w-32 text-center"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>

                    <ToggleSetting
                        title="AI Cover Letter Drafts"
                        description="Generate personalized cover letter drafts you can edit before applying"
                        enabled={settings.generateCoverLetters}
                        onToggle={() => handleToggle('generateCoverLetters')}
                    />

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Default Resume for Quick Apply</label>
                        <select 
                            name="defaultResumeId"
                            value={settings.defaultResumeId}
                            onChange={handleChange}
                            className="form-input w-full"
                        >
                            <option value="">Select a resume...</option>
                            {cvs.map((cv) => (
                                <option key={cv.id} value={cv.id}>
                                    {cv.title} ({cv.ats_score || 'N/A'} ATS Score)
                                </option>
                            ))}
                            {cvs.length === 0 && (
                                <>
                                    <option value="1">Senior Frontend Developer (92 ATS Score)</option>
                                    <option value="2">Full Stack Engineer (88 ATS Score)</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                    Notifications
                </h3>

                <div className="space-y-4">
                    <ToggleSetting
                        title="New Job Matches"
                        description="Get notified when new matching jobs are found"
                        enabled={settings.notifyNewMatches}
                        onToggle={() => handleToggle('notifyNewMatches')}
                    />

                    <ToggleSetting
                        title="Application Updates"
                        description="Status changes on your applications"
                        enabled={settings.notifyApplicationUpdates}
                        onToggle={() => handleToggle('notifyApplicationUpdates')}
                    />

                    <ToggleSetting
                        title="Profile Views"
                        description="When recruiters view your profile"
                        enabled={settings.notifyProfileViews}
                        onToggle={() => handleToggle('notifyProfileViews')}
                    />

                    <ToggleSetting
                        title="Weekly Summary"
                        description="Get a weekly report of your job search activity"
                        enabled={settings.notifyWeeklySummary}
                        onToggle={() => handleToggle('notifyWeeklySummary')}
                    />
                </div>
            </div>

            {/* Theme Selector */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                    Color Theme
                </h3>
                <p className="text-sm text-gray-400 mb-6">Choose your preferred color scheme</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                                activeTheme === theme.id 
                                    ? 'border-white/40 bg-white/10 shadow-lg' 
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div 
                                className="w-full h-20 rounded-lg mb-3"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 100%)`
                                }}
                            />
                            <div className="text-sm font-medium mb-0.5">{theme.name}</div>
                            <div className="text-xs text-gray-400">{theme.description}</div>
                            {activeTheme === theme.id && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                    Privacy
                </h3>

                <div className="space-y-4">
                    <ToggleSetting
                        title="Profile Visibility"
                        description="Allow recruiters to discover your profile"
                        enabled={settings.profileVisible}
                        onToggle={() => handleToggle('profileVisible')}
                        icon={settings.profileVisible ? Eye : EyeOff}
                    />

                    <ToggleSetting
                        title="Show Salary Expectations"
                        description="Display your expected salary on your profile"
                        enabled={settings.showSalary}
                        onToggle={() => handleToggle('showSalary')}
                    />

                    <ToggleSetting
                        title="Data Collection"
                        description="Help improve CareerForge with anonymous usage data"
                        enabled={settings.allowDataCollection}
                        onToggle={() => handleToggle('allowDataCollection')}
                    />
                </div>
            </div>

            {/* Account Actions */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Account Actions
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <div className="font-medium">Export Data</div>
                            <div className="text-sm text-gray-400">Download all your data in JSON format</div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div>
                            <div className="font-medium text-red-400">Delete Account</div>
                            <div className="text-sm text-gray-400">Permanently delete your account and all data</div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition flex items-center gap-2 text-sm text-red-400 border border-red-500/30">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Spacer for floating save bar */}
            <div className="h-20"></div>

            {/* Floating Save Bar - Always visible at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 p-4 md:pl-72">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Remember to save your changes</span>
                        <span className="sm:hidden">Save changes</span>
                    </div>
                    <button 
                        className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium flex items-center gap-2 text-sm sm:text-base"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                <span className="hidden sm:inline">Saving...</span>
                                <span className="sm:hidden">...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Save All Preferences</span>
                                <span className="sm:hidden">Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleSetting({ title, description, enabled, onToggle }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
                <div className="font-medium">{title}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            <button
                className={`toggle ${enabled ? 'active' : ''}`}
                onClick={onToggle}
                type="button"
            >
                <span className="toggle-knob"></span>
            </button>
        </div>
    );
}
