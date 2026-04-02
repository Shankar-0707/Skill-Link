import React, { useState } from 'react';
import { api } from '../services/api/api';

export const TestTokenRefresh: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testProtectedRoute = async () => {
    setLoading(true);
    setResult('Testing...');
    try {
      const response = await api.get('/auth/profile');
      console.log('Full response:', response.data);
      
      // Handle both wrapped and unwrapped responses
      const userData = response.data.data || response.data;
      const email = userData?.user?.email || userData?.email || 'Unknown';
      
      setResult(`✅ Success! Token refresh worked. Email: ${email}`);
    } catch (error: any) {
      console.error('Test error:', error);
      setResult(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg max-w-sm">
      <h3 className="mb-2 text-sm font-bold text-slate-900">Token Refresh Test</h3>
      <button
        onClick={testProtectedRoute}
        disabled={loading}
        className="mb-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Protected Route'}
      </button>
      {result && (
        <p className="text-xs text-slate-600 break-words">{result}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Set JWT_ACCESS_EXPIRES_IN=30s in backend .env, login, wait 30s, then click test
      </p>
    </div>
  );
};
