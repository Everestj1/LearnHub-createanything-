import { supabaseAuth } from '@/app/api/utils/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await supabaseAuth.signIn(email, password);
    
    return Response.json({
      user: result.user,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return Response.json(
      { error: error.message || 'Sign in failed' },
      { status: 401 }
    );
  }
}