
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function createTestUser() {
    if (!supabaseServiceKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is not set.');
        return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = `e2e_test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
    const password = 'password123';

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'E2E Test User' }
        });

        if (error) {
            console.error('Error creating user:', error);
            return null;
        }

        return { email, password, userId: data.user.id };
    } catch (err) {
        console.error('Exception creating user:', err);
        return null;
    }
}
