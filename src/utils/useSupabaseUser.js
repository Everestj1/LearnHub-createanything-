import { useState, useEffect } from 'react';

export default function useSupabaseUser() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) {
        setData(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/supabase/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result.user);
      } else {
        localStorage.removeItem('supabase_token');
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('supabase_token');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    data,
    loading,
    refetch,
  };
}