'use client';

import { useState, useEffect } from 'react';
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
    AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const themes = [
    { id: 'purple', name: 'Purple Haze', description: 'Default theme', colors: ['#667eea', '#764ba2'] },
    { id: 'ocean', name: 'Ocean Blue', description: 'Cool & calm', colors: ['#0ea5e9', '#22d3ee'] },
    { id: 'emerald', name: 'Emerald', description: 'Fresh & natural', colors: ['#059669', '#34d399'] },
    { id: 'sunset', name: 'Sunset', description: 'Warm & vibrant', colors: ['#f43f5e', '#fb923c'] }
];

export default function SettingsContent({ user, preferences, cvs }) {
    const { theme: activeTheme, setTheme } = useTheme();
    const [settings, setSettings] = useState({
        // Job Search
        jobTitles: preferences?.job_titles || 'Senior Frontend Engineer, Full Stack Developer, Staff Engineer',
        minSalary: preferences?.min_salary || '$150,000',
        maxSalary: preferences?.max_salary || '$300,000',
        locations: preferences?.locations || 'San Francisco, CA; New York, NY; Remote',
        workType: {
            remote: preferences?.work_type?.includes('remote') ?? true,
            hybrid: preferences?.work_type?.includes('hybrid') ?? true,
            onsite: preferences?.work_type?.includes('onsite') ?? false,
        },
        employmentType: {
            fulltime: preferences?.employment_type?.includes('fulltime') ?? true,
            contract: preferences?.employment_type?.includes('contract') ?? false,
            parttime: preferences?.employment_type?.includes('parttime') ?? false,
        },
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
        setSettings(prev => ({
            ...prev,
            workType: {
                ...prev.workType,
                [type]: !prev.workType[type]
            }
        }));
    };

    const handleEmploymentTypeToggle = (type) => {
        setSettings(prev => ({
            ...prev,
            employmentType: {
                ...prev.employmentType,
                [type]: !prev.employmentType[type]
            }
        }));
    };

    const handleChange = (e) => {
        setSettings(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <header>
                <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Preferences</h1>
                <p className="text-gray-400">Configure your job search preferences and AI settings.</p>
            </header>

            {/* Job Search Preferences */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                    Job Search Preferences
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Desired Job Titles</label>
                        <input 
                            type="text" 
                            name="jobTitles"
                            value={settings.jobTitles}
                            onChange={handleChange}
                            className="form-input w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple titles with commas</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Minimum Salary</label>
                            <input 
                                type="text" 
                                name="minSalary"
                                value={settings.minSalary}
                                onChange={handleChange}
                                className="form-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Maximum Salary</label>
                            <input 
                                type="text" 
                                name="maxSalary"
                                value={settings.maxSalary}
                                onChange={handleChange}
                                className="form-input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Preferred Locations</label>
                        <input 
                            type="text" 
                            name="locations"
                            value={settings.locations}
                            onChange={handleChange}
                            className="form-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Work Type</label>
                        <div className="flex flex-wrap gap-3">
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.workType.remote 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.workType.remote}
                                    onChange={() => handleWorkTypeToggle('remote')}
                                    className="accent-indigo-500"
                                />
                                <span>Remote</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.workType.hybrid 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.workType.hybrid}
                                    onChange={() => handleWorkTypeToggle('hybrid')}
                                    className="accent-indigo-500"
                                />
                                <span>Hybrid</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.workType.onsite 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.workType.onsite}
                                    onChange={() => handleWorkTypeToggle('onsite')}
                                    className="accent-indigo-500"
                                />
                                <span>On-site</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Employment Type</label>
                        <div className="flex flex-wrap gap-3">
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.employmentType.fulltime 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.employmentType.fulltime}
                                    onChange={() => handleEmploymentTypeToggle('fulltime')}
                                    className="accent-indigo-500"
                                />
                                <span>Full-time</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.employmentType.contract 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.employmentType.contract}
                                    onChange={() => handleEmploymentTypeToggle('contract')}
                                    className="accent-indigo-500"
                                />
                                <span>Contract</span>
                            </label>
                            <label 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
                                    settings.employmentType.parttime 
                                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={settings.employmentType.parttime}
                                    onChange={() => handleEmploymentTypeToggle('parttime')}
                                    className="accent-indigo-500"
                                />
                                <span>Part-time</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Auto-Apply Settings */}
            <div className="glass-card-static rounded-2xl p-8 border border-purple-500/20 bg-purple-500/5">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    AI Auto-Apply Settings
                </h3>

                <div className="space-y-6">
                    <ToggleSetting
                        title="Enable Auto-Apply"
                        description="Let AI automatically apply to high-match jobs"
                        enabled={settings.autoApplyEnabled}
                        onToggle={() => handleToggle('autoApplyEnabled')}
                    />

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <div className="font-medium">Minimum Match Score</div>
                            <div className="text-sm text-gray-400">Only auto-apply to jobs above this match percentage</div>
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
                            <div className="font-medium">Daily Application Limit</div>
                            <div className="text-sm text-gray-400">Maximum auto-applications per day</div>
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
                        title="Generate Cover Letters"
                        description="AI writes personalized cover letters for each application"
                        enabled={settings.generateCoverLetters}
                        onToggle={() => handleToggle('generateCoverLetters')}
                    />

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Default Resume for Auto-Apply</label>
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

            {/* Save Button */}
            <div className="flex justify-end">
                <button 
                    className="btn-primary px-8 py-3 rounded-xl font-medium flex items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Save All Preferences
                        </>
                    )}
                </button>
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
