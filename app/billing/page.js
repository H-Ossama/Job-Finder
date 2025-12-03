import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BillingContent from './BillingContent';

export const metadata = {
    title: 'Billing | Job Finder Pro',
    description: 'Manage your subscription and billing',
};

export default async function BillingPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return <BillingContent user={user} profile={profile} />;
}
