import { Link } from 'react-router-dom';

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">ReqWiz Documentation</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700 mb-2">
          ReqWiz is a lightweight API client that lets you compose HTTP requests,
          save request history, and organize calls into collections.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Tabs & Features</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>Composer:</strong> Build and send HTTP requests. Enter method,
            URL, headers, and request body, then click "Send".
          </li>
          <li>
            <strong>History:</strong> View a chronological list of past requests,
            including status codes and timestamps.
          </li>
          <li>
            <strong>Collections:</strong> Group related requests into named
            collections for better organization.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Navigate to the Composer tab.</li>
          <li>Select HTTP method (GET, POST, PUT, DELETE).</li>
          <li>Enter the full request URL.</li>
          <li>Add headers in key/value format as needed.</li>
          <li>For POST/PUT, enter a JSON request body.</li>
          <li>Click <code>Send</code>. Response will display below.</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Routes</h2>
        <table className="min-w-full bg-white text-gray-700 mb-6">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Endpoint</th>
              <th className="px-4 py-2 border">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border"><code>POST /api/send-request</code></td>
              <td className="px-4 py-2 border">Forward an HTTP request. Body:  method, url, headers, body .</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border"><code>GET /api/history</code></td>
              <td className="px-4 py-2 border">Retrieve saved request history.</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border"><code>GET /api/collections</code></td>
              <td className="px-4 py-2 border">List collections.</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border"><code>POST /api/collections</code></td>
              <td className="px-4 py-2 border">Create a new collection.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <Link to="/" className="text-blue-600 hover:underline">
          &larr; Back to Home
        </Link>
      </section>
    </div>
  );
}