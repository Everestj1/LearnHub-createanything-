import { supabaseAuth } from '@/app/api/utils/supabase';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ user: null });
    }

    const token = authHeader.substring(7);
    const user = await supabaseAuth.getUser(token);
    
    if (user) {
      return Response.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        }
      });
    }

    return Response.json({ user: null });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json({ user: null });
  }
}