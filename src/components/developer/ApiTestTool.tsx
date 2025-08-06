'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

const ApiTestTool = () => {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/auth/profile');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const options: RequestInit = {
        method,
      };
      if (method !== 'GET' && method !== 'HEAD' && body) {
        try {
          options.body = JSON.stringify(JSON.parse(body));
          options.headers = { 'Content-Type': 'application/json' };
        } catch (e) {
          throw new Error('Invalid JSON body.');
        }
      }
      const result = await apiFetch(endpoint, options);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Endpoint Tester</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="sm:w-1/4 rounded-md border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
            <option>PATCH</option>
          </select>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/v1/users"
            className="flex-grow rounded-md border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            required
          />
        </div>
        {(method !== 'GET' && method !== 'HEAD') && (
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Request Body (JSON)</label>
            <textarea
              id="body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full mt-1 p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 font-mono text-sm"
              placeholder='{ "key": "value" }'
            />
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
      {(response || error) && (
        <div className="mt-4">
          <h4 className="font-semibold">Response:</h4>
          <pre className={`text-sm p-4 rounded-md mt-2 overflow-x-auto ${error ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-800'} dark:bg-gray-900 dark:text-gray-300`}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestTool;
