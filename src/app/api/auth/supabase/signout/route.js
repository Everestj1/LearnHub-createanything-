import { supabaseAuth } from '@/app/api/utils/supabase';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'No token provided' }, { status: 400 });
    }

    const token = authHeader.substring(7);
    await supabaseAuth.signOut(token);
    
    return Response.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    return Response.json(
      { error: error.message || 'Sign out failed' },
      { status: 500 }
    );
  }
}