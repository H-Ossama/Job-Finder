'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
    Check,
    X,
    Crown,
    Sparkles,
    Building2,
    CreditCard,
    Plus,
    Trash2,
    Download,
    FileText,
    Zap,
    Target,
    Users,
    BarChart3,
    MessageSquare,
    Shield,
    Calendar,
    ExternalLink
} from 'lucide-react';
import styles from './billing.module.css';

// Pricing plans data
const PRICING_PLANS = [
    {
        id: 'free',
        name: 'Free',
        icon: Sparkles,
        price: 0,
        period: 'forever',
        description: 'Perfect for getting started with your job search',
        features: [
            { text: '5 job applications per month', included: true },
            { text: 'Basic CV templates', included: true },
            { text: 'Manual job search', included: true },
            { text: 'Email support', included: true },
            { text: 'AI job matching', included: false },
            { text: 'Interview prep tools', included: false },
            { text: 'Application tracking', included: false },
            { text: 'Priority support', included: false }
        ],
        popular: false,
        buttonText: 'Current Plan'
    },
    {
        id: 'pro',
        name: 'Pro',
        icon: Crown,
        price: 19,
        period: 'month',
        description: 'Best for active job seekers who want to stand out',
        features: [
            { text: 'Unlimited job applications', included: true },
            { text: 'All CV templates + AI optimization', included: true },
            { text: 'AI-powered job matching', included: true },
            { text: 'Interview prep & mock interviews', included: true },
            { text: 'Advanced application tracking', included: true },
            { text: 'Priority support', included: true },
            { text: 'Analytics dashboard', included: true },
            { text: 'Custom branding', included: false }
        ],
        popular: true,
        buttonText: 'Upgrade to Pro'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Building2,
        price: 49,
        period: 'month',
        description: 'For teams and organizations with advanced needs',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'Advanced analytics', included: true },
            { text: 'White-label branding', included: true },
            { text: 'API access', included: true },
            { text: 'SSO / SAML', included: true },
            { text: 'SLA guarantee', included: true }
        ],
        popular: false,
        buttonText: 'Contact Sales'
    }
];

// Sample payment methods
const PAYMENT_METHODS = [
    {
        id: 1,
        type: 'visa',
        last4: '4242',
        expiry: '12/26',
        isDefault: true
    },
    {
        id: 2,
        type: 'mastercard',
        last4: '8888',
        expiry: '09/25',
        isDefault: false
    }
];

// Sample billing history
const BILLING_HISTORY = [
    {
        id: 1,
        date: 'Jan 15, 2025',
        description: 'Pro Plan - Monthly',
        amount: 19.00,
        status: 'paid'
    },
    {
        id: 2,
        date: 'Dec 15, 2024',
        description: 'Pro Plan - Monthly',
        amount: 19.00,
        status: 'paid'
    },
    {
        id: 3,
        date: 'Nov 15, 2024',
        description: 'Pro Plan - Monthly',
        amount: 19.00,
        status: 'paid'
    },
    {
        id: 4,
        date: 'Oct 15, 2024',
        description: 'Pro Plan - Monthly',
        amount: 19.00,
        status: 'paid'
    }
];

// Features comparison data
const FEATURE_CATEGORIES = [
    {
        name: 'Job Search',
        icon: Target,
        features: [
            { name: 'Monthly Applications', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
            { name: 'Job Sources', free: '3', pro: '10+', enterprise: 'All + Custom' },
            { name: 'AI Job Matching', free: false, pro: true, enterprise: true },
            { name: 'Saved Searches', free: '1', pro: '10', enterprise: 'Unlimited' }
        ]
    },
    {
        name: 'CV & Documents',
        icon: FileText,
        features: [
            { name: 'CV Templates', free: '3', pro: 'All', enterprise: 'All + Custom' },
            { name: 'AI Optimization', free: false, pro: true, enterprise: true },
            { name: 'Cover Letter Generator', free: false, pro: true, enterprise: true },
            { name: 'Document Storage', free: '100MB', pro: '5GB', enterprise: 'Unlimited' }
        ]
    },
    {
        name: 'Interviews',
        icon: MessageSquare,
        features: [
            { name: 'Interview Prep', free: false, pro: true, enterprise: true },
            { name: 'Mock Interviews', free: false, pro: '10/mo', enterprise: 'Unlimited' },
            { name: 'AI Feedback', free: false, pro: true, enterprise: true },
            { name: 'Recording & Review', free: false, pro: true, enterprise: true }
        ]
    },
    {
        name: 'Analytics & Support',
        icon: BarChart3,
        features: [
            { name: 'Application Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Full Suite' },
            { name: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
            { name: 'Response Time', free: '48h', pro: '24h', enterprise: '4h' },
            { name: 'Training Sessions', free: false, pro: '2/mo', enterprise: 'Unlimited' }
        ]
    }
];

export default function BillingContent({ user, profile }) {
    const [currentPlan, setCurrentPlan] = useState('free');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
    const [showAddCard, setShowAddCard] = useState(false);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    const deletePaymentMethod = (id) => {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
    };

    const setDefaultPaymentMethod = (id) => {
        setPaymentMethods(prev => prev.map(m => ({
            ...m,
            isDefault: m.id === id
        })));
    };

    const getCardIcon = (type) => {
        switch(type) {
            case 'visa':
                return '💳 Visa';
            case 'mastercard':
                return '💳 Mastercard';
            case 'amex':
                return '💳 Amex';
            default:
                return '💳 Card';
        }
    };

    return (
        <DashboardLayout user={user} profile={profile} pageTitle="Billing">
            <div className={styles.billingPage}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Billing & Plans</span>
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Manage your subscription and payment methods
                        </p>
                    </div>
                </div>

                {/* Current Plan Banner */}
                <div className={styles.currentPlanBanner}>
                    <div className={styles.planBannerContent}>
                        <div className={styles.planBannerLeft}>
                            <div className={styles.planBannerIcon}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3>Your Current Plan: <span className={styles.planHighlight}>Free</span></h3>
                                <p>Upgrade to unlock all features and supercharge your job search</p>
                            </div>
                        </div>
                        <div className={styles.planBannerActions}>
                            <div className={styles.usageInfo}>
                                <span className={styles.usageLabel}>Applications Used</span>
                                <div className={styles.usageBar}>
                                    <div className={styles.usageProgress} style={{ width: '60%' }} />
                                </div>
                                <span className={styles.usageText}>3 / 5 this month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className={styles.cycleToggle}>
                    <button 
                        className={`${styles.cycleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button 
                        className={`${styles.cycleBtn} ${billingCycle === 'yearly' ? styles.active : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly
                        <span className={styles.saveBadge}>Save 20%</span>
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className={styles.pricingGrid}>
                    {PRICING_PLANS.map(plan => {
                        const IconComponent = plan.icon;
                        const displayPrice = billingCycle === 'yearly' 
                            ? Math.floor(plan.price * 0.8) 
                            : plan.price;
                        const isCurrentPlan = currentPlan === plan.id;
                        
                        return (
                            <div 
                                key={plan.id}
                                className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''} ${isCurrentPlan ? styles.current : ''}`}
                            >
                                {plan.popular && (
                                    <div className={styles.popularBadge}>Most Popular</div>
                                )}
                                {isCurrentPlan && (
                                    <div className={styles.currentBadge}>Current Plan</div>
                                )}
                                
                                <div className={styles.planHeader}>
                                    <div className={`${styles.planIcon} ${styles[plan.id]}`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <h3 className={styles.planName}>{plan.name}</h3>
                                    <p className={styles.planDesc}>{plan.description}</p>
                                </div>

                                <div className={styles.planPricing}>
                                    <span className={styles.currency}>$</span>
                                    <span className={styles.amount}>{displayPrice}</span>
                                    <span className={styles.period}>
                                        /{plan.period === 'forever' ? 'forever' : billingCycle === 'yearly' ? 'mo' : 'mo'}
                                    </span>
                                    {billingCycle === 'yearly' && plan.price > 0 && (
                                        <div className={styles.yearlyNote}>
                                            Billed ${displayPrice * 12}/year
                                        </div>
                                    )}
                                </div>

                                <ul className={styles.featuresList}>
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className={feature.included ? styles.included : styles.excluded}>
                                            {feature.included ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    className={`${styles.planBtn} ${isCurrentPlan ? styles.currentBtn : ''} ${plan.popular ? styles.primaryBtn : ''}`}
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Feature Comparison Table */}
                <div className={styles.comparisonSection}>
                    <h2 className={styles.sectionTitle}>
                        <Zap className="w-5 h-5" />
                        Feature Comparison
                    </h2>
                    
                    <div className={styles.comparisonTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.featureCol}>Feature</div>
                            <div className={styles.planCol}>Free</div>
                            <div className={styles.planCol}>Pro</div>
                            <div className={styles.planCol}>Enterprise</div>
                        </div>

                        {FEATURE_CATEGORIES.map(category => {
                            const CategoryIcon = category.icon;
                            return (
                                <div key={category.name} className={styles.categoryGroup}>
                                    <div className={styles.categoryHeader}>
                                        <CategoryIcon className="w-4 h-4" />
                                        {category.name}
                                    </div>
                                    {category.features.map((feature, idx) => (
                                        <div key={idx} className={styles.tableRow}>
                                            <div className={styles.featureCol}>{feature.name}</div>
                                            <div className={styles.planCol}>
                                                {typeof feature.free === 'boolean' ? (
                                                    feature.free ? (
                                                        <Check className={`w-4 h-4 ${styles.checkIcon}`} />
                                                    ) : (
                                                        <X className={`w-4 h-4 ${styles.xIcon}`} />
                                                    )
                                                ) : (
                                                    <span>{feature.free}</span>
                                                )}
                                            </div>
                                            <div className={styles.planCol}>
                                                {typeof feature.pro === 'boolean' ? (
                                                    feature.pro ? (
                                                        <Check className={`w-4 h-4 ${styles.checkIcon}`} />
                                                    ) : (
                                                        <X className={`w-4 h-4 ${styles.xIcon}`} />
                                                    )
                                                ) : (
                                                    <span>{feature.pro}</span>
                                                )}
                                            </div>
                                            <div className={styles.planCol}>
                                                {typeof feature.enterprise === 'boolean' ? (
                                                    feature.enterprise ? (
                                                        <Check className={`w-4 h-4 ${styles.checkIcon}`} />
                                                    ) : (
                                                        <X className={`w-4 h-4 ${styles.xIcon}`} />
                                                    )
                                                ) : (
                                                    <span>{feature.enterprise}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Two Column Layout for Payment Methods & Billing History */}
                <div className={styles.billingGrid}>
                    {/* Payment Methods */}
                    <div className={styles.paymentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <CreditCard className="w-5 h-5" />
                                Payment Methods
                            </h2>
                            <button 
                                className={styles.addBtn}
                                onClick={() => setShowAddCard(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Add Card
                            </button>
                        </div>

                        <div className={styles.cardsList}>
                            {paymentMethods.map(method => (
                                <div key={method.id} className={styles.cardItem}>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardType}>{getCardIcon(method.type)}</span>
                                        <div className={styles.cardDetails}>
                                            <span className={styles.cardNumber}>•••• •••• •••• {method.last4}</span>
                                            <span className={styles.cardExpiry}>Expires {method.expiry}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardActions}>
                                        {method.isDefault ? (
                                            <span className={styles.defaultBadge}>Default</span>
                                        ) : (
                                            <button 
                                                className={styles.setDefaultBtn}
                                                onClick={() => setDefaultPaymentMethod(method.id)}
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button 
                                            className={styles.deleteCardBtn}
                                            onClick={() => deletePaymentMethod(method.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Billing History */}
                    <div className={styles.historySection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <FileText className="w-5 h-5" />
                                Billing History
                            </h2>
                        </div>

                        <div className={styles.historyList}>
                            {BILLING_HISTORY.map(invoice => (
                                <div key={invoice.id} className={styles.historyItem}>
                                    <div className={styles.historyInfo}>
                                        <span className={styles.historyDate}>{invoice.date}</span>
                                        <span className={styles.historyDesc}>{invoice.description}</span>
                                    </div>
                                    <div className={styles.historyRight}>
                                        <span className={styles.historyAmount}>${invoice.amount.toFixed(2)}</span>
                                        <span className={`${styles.historyStatus} ${styles[invoice.status]}`}>
                                            {invoice.status}
                                        </span>
                                        <button className={styles.downloadBtn}>
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.viewAllLink}>
                            <a href="#">
                                View All Invoices
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className={styles.securityNotice}>
                    <Shield className="w-5 h-5" />
                    <div>
                        <strong>Secure Payment Processing</strong>
                        <p>All transactions are encrypted and processed securely through Stripe. We never store your full card details.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
