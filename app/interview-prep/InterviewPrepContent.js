'use client';

import { useState } from 'react';
import { 
    Video,
    Mic,
    Clock,
    CheckCircle,
    ChevronDown,
    Users,
    Code,
    Lightbulb,
    Building,
    Target,
    Star,
    MessageSquare,
    Timer,
    Mail
} from 'lucide-react';

// Sample questions data
const sampleQuestions = [
    {
        id: 1,
        question: 'Tell me about yourself',
        category: 'behavioral',
        difficulty: 'easy',
        framework: 'Use the Present-Past-Future formula: Start with your current role, mention relevant past experience, and explain why you\'re excited about this opportunity.',
        tip: 'Keep your answer to 1-2 minutes. Focus on professional experiences relevant to the role you\'re applying for.'
    },
    {
        id: 2,
        question: 'Describe a challenging project you\'ve worked on',
        category: 'behavioral',
        difficulty: 'medium',
        framework: 'Use the STAR method: Situation, Task, Action, Result. Be specific about your contributions and quantify your impact.',
        tip: 'Prepare 3-4 stories that can be adapted to different behavioral questions. Focus on recent experiences (last 2-3 years).'
    },
    {
        id: 3,
        question: 'Design a URL shortening service like bit.ly',
        category: 'technical',
        difficulty: 'hard',
        framework: 'Key points: Requirements gathering, URL encoding/hashing strategy, Database design (SQL vs NoSQL), Caching layer (Redis), Load balancing and scalability.',
        tip: 'Always clarify requirements first. Think out loud and explain your trade-offs. It\'s okay to not know everything – show your problem-solving approach.'
    },
    {
        id: 4,
        question: 'How do you handle disagreements with team members?',
        category: 'situational',
        difficulty: 'medium',
        framework: 'Emphasize your communication skills, ability to listen to different perspectives, and focus on finding solutions that benefit the team and project.',
        tip: 'Use a real example where you navigated a disagreement professionally. Show emotional intelligence and leadership qualities.'
    },
    {
        id: 5,
        question: 'Why do you want to work at our company?',
        category: 'company',
        difficulty: 'easy',
        framework: 'Research the company thoroughly. Connect your skills and career goals to the company\'s mission, products, and culture.',
        tip: 'Be specific about what excites you about the company. Mention recent news, products, or company values that resonate with you.'
    },
    {
        id: 6,
        question: 'Explain the concept of closures in JavaScript',
        category: 'technical',
        difficulty: 'medium',
        framework: 'A closure is a function that has access to variables in its outer scope, even after the outer function has returned. Explain with practical examples.',
        tip: 'Use simple examples first, then show real-world applications like private variables, event handlers, or memoization.'
    }
];

const categories = [
    { id: 'behavioral', name: 'Behavioral', icon: Users, color: 'blue', count: 15 },
    { id: 'technical', name: 'Technical', icon: Code, color: 'green', count: 20 },
    { id: 'situational', name: 'Situational', icon: Lightbulb, color: 'purple', count: 10 },
    { id: 'company', name: 'Company-Specific', icon: Building, color: 'amber', count: 5 }
];

const interviewTips = [
    { emoji: '🎯', title: 'Research the Company', description: 'Understand the company\'s mission, recent news, products, and culture. This shows genuine interest and helps you tailor your answers.' },
    { emoji: '⭐', title: 'Use the STAR Method', description: 'Structure behavioral answers with Situation, Task, Action, and Result. This provides clear, concise, and impactful responses.' },
    { emoji: '🤝', title: 'Ask Thoughtful Questions', description: 'Prepare 3-5 questions about the role, team, and company. Avoid questions easily answered by a quick Google search.' },
    { emoji: '💪', title: 'Practice Out Loud', description: 'Rehearse your answers verbally. Recording yourself can help identify areas for improvement in content and delivery.' },
    { emoji: '⏰', title: 'Arrive Early & Prepared', description: 'For virtual interviews, test your tech 15 minutes early. For in-person, arrive 10 minutes before your scheduled time.' },
    { emoji: '📧', title: 'Follow Up', description: 'Send a thank-you email within 24 hours. Reference specific conversation points to make it memorable.' }
];

const roleQuestions = [
    { role: 'Software Engineer', count: 45 },
    { role: 'Product Manager', count: 32 },
    { role: 'Data Scientist', count: 28 },
    { role: 'UX Designer', count: 25 }
];

const companyQuestions = [
    { company: 'Google', count: 50 },
    { company: 'Amazon', count: 48 },
    { company: 'Meta', count: 42 },
    { company: 'Microsoft', count: 40 }
];

export default function InterviewPrepContent({ user, progress }) {
    const [activeTab, setActiveTab] = useState('questions');
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Calculate progress stats
    const questionsCompleted = progress?.questions_completed || 35;
    const totalQuestions = 50;
    const progressPercent = Math.round((questionsCompleted / totalQuestions) * 100);
    const practiceTime = progress?.practice_time || '4h 32m';
    const mockInterviews = progress?.mock_interviews || 5;

    const filteredQuestions = selectedCategory 
        ? sampleQuestions.filter(q => q.category === selectedCategory)
        : sampleQuestions;

    const getDifficultyBadge = (difficulty) => {
        const styles = {
            easy: 'bg-green-500/15 text-green-400',
            medium: 'bg-yellow-500/15 text-yellow-400',
            hard: 'bg-red-500/15 text-red-400'
        };
        return styles[difficulty] || styles.medium;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">
                    <span className="text-gradient">Interview Preparation</span>
                </h1>
                <p className="text-gray-400">Practice with AI and ace your next interview</p>
            </header>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card-static rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90">
                                <circle 
                                    cx="32" cy="32" r="28" 
                                    stroke="rgba(255,255,255,0.1)" 
                                    strokeWidth="4" 
                                    fill="none"
                                />
                                <circle 
                                    cx="32" cy="32" r="28" 
                                    stroke="url(#progressGradient)" 
                                    strokeWidth="4" 
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray="175.93"
                                    strokeDashoffset={175.93 - (175.93 * progressPercent / 100)}
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                {progressPercent}%
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold">Questions Practiced</h3>
                            <p className="text-sm text-gray-400">{questionsCompleted} of {totalQuestions} completed</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card-static rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Practice Time</h3>
                            <p className="text-sm text-gray-400">{practiceTime} this week</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card-static rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Mock Interviews</h3>
                            <p className="text-sm text-gray-400">{mockInterviews} completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Mock Interview Card */}
            <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/30">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Lightbulb className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-3">AI Mock Interview</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                    Practice with our AI interviewer. Get real-time feedback on your answers, 
                    body language tips, and personalized improvement suggestions.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="btn-primary px-8 py-3 rounded-xl font-medium flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Start Video Interview
                    </button>
                    <button className="px-8 py-3 rounded-xl font-medium flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <Mic className="w-5 h-5" />
                        Audio Only
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => setActiveTab('questions')}
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                >
                    Practice Questions
                </button>
                <button 
                    onClick={() => setActiveTab('categories')}
                    className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                >
                    Categories
                </button>
                <button 
                    onClick={() => setActiveTab('tips')}
                    className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
                >
                    Interview Tips
                </button>
            </div>

            {/* Questions Tab */}
            {activeTab === 'questions' && (
                <div>
                    {/* Category Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const colorMap = {
                                blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
                                green: 'from-green-500/20 to-emerald-500/20 text-green-400',
                                purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
                                amber: 'from-amber-500/20 to-orange-500/20 text-amber-400'
                            };
                            return (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                    className={`glass-card rounded-2xl p-6 text-left transition hover:scale-[1.02] ${
                                        selectedCategory === cat.id ? 'border-indigo-500/50' : ''
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[cat.color]} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold mb-1">{cat.name}</h3>
                                    <p className="text-sm text-gray-400">{cat.count} questions</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Questions List */}
                    <h3 className="text-lg font-semibold mb-4">
                        {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Questions` : 'Popular Questions'}
                    </h3>
                    
                    <div className="space-y-4">
                        {filteredQuestions.map((q) => (
                            <div 
                                key={q.id}
                                className={`glass-card-static rounded-2xl overflow-hidden transition ${
                                    expandedQuestion === q.id ? 'border-indigo-500/30' : ''
                                }`}
                            >
                                <button 
                                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    className="w-full p-5 flex items-start justify-between gap-4 text-left"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getDifficultyBadge(q.difficulty)}`}>
                                                {q.difficulty}
                                            </span>
                                            <span className="px-3 py-1 rounded-lg text-xs bg-white/10 capitalize">
                                                {q.category}
                                            </span>
                                        </div>
                                        <h4 className="font-medium">{q.question}</h4>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                                        expandedQuestion === q.id ? 'rotate-180' : ''
                                    }`} />
                                </button>
                                
                                {expandedQuestion === q.id && (
                                    <div className="px-5 pb-5 border-t border-white/10 pt-4">
                                        <h5 className="font-medium text-sm mb-2 text-indigo-400">Sample Answer Framework:</h5>
                                        <p className="text-sm text-gray-400 mb-4">{q.framework}</p>
                                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                            <div className="flex gap-3">
                                                <span className="text-xl">💡</span>
                                                <p className="text-sm text-gray-300">{q.tip}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card-static rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">By Role</h3>
                        <div className="space-y-2">
                            {roleQuestions.map((item) => (
                                <button 
                                    key={item.role}
                                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition"
                                >
                                    <span>{item.role}</span>
                                    <span className="text-sm text-gray-400">{item.count} questions</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card-static rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">By Company</h3>
                        <div className="space-y-2">
                            {companyQuestions.map((item) => (
                                <button 
                                    key={item.company}
                                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition"
                                >
                                    <span>{item.company}</span>
                                    <span className="text-sm text-gray-400">{item.count} questions</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {interviewTips.map((tip, index) => (
                        <div 
                            key={index}
                            className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                        >
                            <div className="flex gap-4">
                                <span className="text-3xl">{tip.emoji}</span>
                                <div>
                                    <h4 className="font-semibold mb-2">{tip.title}</h4>
                                    <p className="text-sm text-gray-400">{tip.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
