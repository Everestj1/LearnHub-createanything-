import { supabaseAuth } from '@/app/api/utils/supabase';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await supabaseAuth.signUp(email, password);
    
    return Response.json({
      user: result.user,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return Response.json(
      { error: error.message || 'Sign up failed' },
      { status: 400 }
    );
  }
}