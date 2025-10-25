import { useState, useEffect } from 'react';

export default function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('supabase_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/auth/supabase/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('supabase_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('supabase_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithCredentials = async ({ email, password, callbackUrl = '/', redirect = true }) => {
    try {
      const response = await fetch('/api/auth/supabase/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign in failed');
      }

      const data = await response.json();
      localStorage.setItem('supabase_token', data.access_token);
      setUser(data.user);

      if (redirect) {
        window.location.href = callbackUrl;
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpWithCredentials = async ({ email, password, name, callbackUrl = '/', redirect = true }) => {
    try {
      const response = await fetch('/api/auth/supabase/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign up failed');
      }

      const data = await response.json();
      localStorage.setItem('supabase_token', data.access_token);
      setUser(data.user);

      if (redirect) {
        window.location.href = callbackUrl;
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async ({ callbackUrl = '/', redirect = true }) => {
    try {
      const token = localStorage.getItem('supabase_token');
      if (token) {
        await fetch('/api/auth/supabase/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem('supabase_token');
      setUser(null);

      if (redirect) {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if API call fails
      localStorage.removeItem('supabase_token');
      setUser(null);
      
      if (redirect) {
        window.location.href = callbackUrl;
      }
    }
  };

  return {
    user,
    loading,
    signInWithCredentials,
    signUpWithCredentials,
    signOut,
  };
}