import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'starter' | 'pro' | 'institutional';
  kycStatus: 'pending' | 'verified' | 'rejected';
  twoFaEnabled: boolean;
  avatarUrl: string | null;
  isAdmin: boolean;
}

// ── Mock fallback ─────────────────────────────────────────────────────────────

const MOCK_USER: AuthUser = {
  id: 'mock-user-1',
  email: 'alex@novacrypt.io',
  firstName: 'Alex',
  lastName: 'Volkov',
  plan: 'pro',
  kycStatus: 'verified',
  twoFaEnabled: true,
  avatarUrl: 'https://i.pravatar.cc/40?img=12',
  isAdmin: false,
};

let _mockSession: AuthUser | null = null;

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(800);
    _mockSession = { ...MOCK_USER, email };
    return _mockSession;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await fetchProfile(data.user.id);
  return profile;
}

export async function signUp(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  plan: 'starter' | 'pro' | 'institutional';
}): Promise<AuthUser> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(1000);
    _mockSession = { ...MOCK_USER, email: params.email, firstName: params.firstName, lastName: params.lastName, plan: params.plan };
    return _mockSession;
  }

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { first_name: params.firstName, last_name: params.lastName } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sign up failed');

  // The `on_auth_user_created` trigger auto-creates the profile row (email +
  // names from user metadata). We upsert here only to persist the chosen plan
  // without colliding with that trigger on the primary key.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: data.user.id,
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        plan: params.plan,
        kyc_status: 'pending',
        two_fa_enabled: false,
        avatar_url: null,
      },
      { onConflict: 'id' },
    );
  if (profileError) throw new Error(profileError.message);

  return fetchProfile(data.user.id);
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    _mockSession = null;
    return;
  }
  await supabase.auth.signOut();
}

export async function getSession(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured || !supabase) {
    return _mockSession;
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return fetchProfile(data.session.user.id);
}

export async function updateProfile(
  userId: string,
  updates: { firstName?: string; lastName?: string; plan?: AuthUser['plan']; twoFaEnabled?: boolean },
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    if (_mockSession) {
      Object.assign(_mockSession, {
        firstName: updates.firstName ?? _mockSession.firstName,
        lastName: updates.lastName ?? _mockSession.lastName,
        twoFaEnabled: updates.twoFaEnabled ?? _mockSession.twoFaEnabled,
      });
    }
    return;
  }

  const { error } = await supabase.from('profiles').update({
    first_name: updates.firstName,
    last_name: updates.lastName,
    plan: updates.plan,
    two_fa_enabled: updates.twoFaEnabled,
  }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function changePassword(newPassword: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(400);
    return;
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ── Internal ──────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<AuthUser> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    plan: data.plan,
    kycStatus: data.kyc_status,
    twoFaEnabled: data.two_fa_enabled,
    avatarUrl: data.avatar_url,
    isAdmin: data.is_admin,
  };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
