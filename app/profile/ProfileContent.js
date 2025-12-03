'use client';

import { useState } from 'react';
import { 
    Camera,
    Linkedin,
    Github,
    Globe,
    AlertTriangle,
    Download
} from 'lucide-react';

export default function ProfileContent({ user, profile }) {
    const [formData, setFormData] = useState({
        firstName: profile?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: profile?.last_name || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        bio: profile?.bio || '',
        linkedin: profile?.linkedin || '',
        github: profile?.github || '',
        website: profile?.website || '',
        title: profile?.title || 'Frontend Developer'
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        // Show success message
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <header>
                <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Profile Settings</h1>
                <p className="text-gray-400">Manage your personal information and account settings.</p>
            </header>

            {/* Profile Card */}
            <div className="glass-card-static rounded-2xl p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl border-2 border-white/10 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                            {user?.user_metadata?.avatar_url ? (
                                <img 
                                    src={user.user_metadata.avatar_url} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                formData.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer">
                            <Camera className="w-8 h-8" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">
                            {formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-gray-400 mb-4">{formData.title}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                                Pro Plan
                            </span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                                Verified
                            </span>
                        </div>
                    </div>

                    <button className="btn-primary px-6 py-2 rounded-xl text-sm font-medium">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Personal Information */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">First Name</label>
                        <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                        <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input w-full"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                            className="form-input w-full"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Location</label>
                        <input 
                            type="text" 
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="San Francisco, CA"
                            className="form-input w-full"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Bio</label>
                        <textarea 
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="form-input w-full h-24 resize-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button 
                        className="btn-primary px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* Social Links */}
            <div className="glass-card-static rounded-2xl p-8">
                <h3 className="font-bold text-lg mb-6">Social Profiles</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Linkedin className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="linkedin.com/in/username"
                            className="form-input flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Github className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            placeholder="github.com/username"
                            className="form-input flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Globe className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="yourwebsite.com"
                            className="form-input flex-1"
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card-static rounded-2xl p-8 border border-red-500/20">
                <h3 className="font-bold text-lg mb-2 text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-gray-400 mb-6">Irreversible actions that affect your account.</p>
                <div className="flex flex-wrap gap-4">
                    <button className="px-6 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition text-sm font-medium">
                        Delete Account
                    </button>
                    <button className="px-6 py-2 rounded-xl border border-white/20 text-gray-400 hover:bg-white/5 transition text-sm font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>
        </div>
    );
}
