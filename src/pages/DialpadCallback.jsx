import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DialpadCallback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        return;
      }

      await base44.functions.invoke('dialpadOAuthNew', {
        action: 'exchangeCode',
        code: code
      });

      setStatus('success');
      
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error) {
      console.error('Callback error:', error);
      setStatus('error');
      setError(error.message || 'Failed to connect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connecting Dialpad...</h2>
            <p className="text-slate-600">Please wait</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connected!</h2>
            <p className="text-slate-600">Dialpad connected successfully. This window will close automatically.</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connection Failed</h2>
            <p className="text-slate-600 mb-2">{error || 'Unable to connect Dialpad.'}</p>
            <p className="text-sm text-slate-500">You can close this window and try again.</p>
          </>
        )}
      </div>
    </div>
  );
}