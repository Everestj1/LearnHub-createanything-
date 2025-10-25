// Supabase database and auth utilities

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Database query function (replaces sql template tag)
async function sql(query, params = []) {
  let finalQuery = query;
  
  // Replace $1, $2, etc. with actual values for Supabase
  if (typeof query === 'string' && params.length > 0) {
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let value = param;
      
      // Handle different types
      if (typeof param === 'string') {
        value = `'${param.replace(/'/g, "''")}'`; // Escape single quotes
      } else if (param === null) {
        value = 'NULL';
      } else if (typeof param === 'boolean') {
        value = param.toString();
      }
      
      finalQuery = finalQuery.replace(new RegExp(`\\${placeholder}\\b`, 'g'), value);
    });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({ query: finalQuery })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database query failed: ${error}`);
  }

  return await response.json();
}

// Enhanced sql function with direct table access
sql.table = (tableName) => ({
  select: async (columns = '*', filters = {}) => {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?select=${columns}`;
    
    Object.entries(filters).forEach(([key, value]) => {
      url += `&${key}=eq.${value}`;
    });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${tableName}`);
    }

    return await response.json();
  },

  insert: async (data) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to insert into ${tableName}: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  },

  update: async (filters, data) => {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?`;
    
    Object.entries(filters).forEach(([key, value], index) => {
      if (index > 0) url += '&';
      url += `${key}=eq.${value}`;
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update ${tableName}: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  },

  delete: async (filters) => {
    let url = `${SUPABASE_URL}/rest/v1/${tableName}?`;
    
    Object.entries(filters).forEach(([key, value], index) => {
      if (index > 0) url += '&';
      url += `${key}=eq.${value}`;
    });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete from ${tableName}: ${error}`);
    }

    return true;
  }
});

// Transaction support
sql.transaction = async (queries) => {
  // For now, execute queries sequentially
  // Supabase doesn't have direct transaction support via REST API
  const results = [];
  for (const query of queries) {
    const result = await query;
    results.push(result);
  }
  return results;
};

// Auth utilities
export const supabaseAuth = {
  // Sign up with email/password
  signUp: async (email, password) => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Sign up failed');
    }

    return await response.json();
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Sign in failed');
    }

    return await response.json();
  },

  // Get user from token
  getUser: async (token) => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  },

  // Sign out
  signOut: async (token) => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      }
    });

    return response.ok;
  }
};

export default sql;