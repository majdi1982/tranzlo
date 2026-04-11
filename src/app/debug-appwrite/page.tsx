import * as React from 'react';

export default function DebugAppwritePage() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'NOT SET (Using Fallback)';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'NOT SET (Using Fallback)';
  const serverKeyStatus = process.env.APPWRITE_API_KEY_SERVER ? 'SET' : 'MISSING';

  return (
    <div className="p-10 font-mono text-sm space-y-4">
      <h1 className="text-xl font-bold mb-6 text-red-600 underline">Appwrite Configuration Debugger</h1>
      
      <div className="p-4 bg-gray-100 rounded border">
        <p className="font-bold">Public Endpoint:</p>
        <p className="text-blue-600">{endpoint}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded border">
        <p className="font-bold">Public Project ID:</p>
        <p className="text-blue-600">{projectId}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded border">
        <p className="font-bold">Server API Key Status:</p>
        <p className={serverKeyStatus === 'SET' ? 'text-green-600' : 'text-red-600'}>
          {serverKeyStatus}
        </p>
      </div>

      <div className="mt-10 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="font-bold mb-2">Checklist for "Project Not Found":</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>The ID above must match your Appwrite Console EXACTLY.</li>
          <li>The Browser Console (F12) Network tab must show "X-Appwrite-Project: {projectId}" in request headers.</li>
          <li>The "Web Platform" in Appwrite Console must have "localhost" registered.</li>
        </ul>
      </div>
    </div>
  );
}
