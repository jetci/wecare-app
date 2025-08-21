import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100">
      <h1 className="mb-4 text-4xl font-bold text-red-600">403 - Unauthorized</h1>
      <p className="mb-8 text-lg text-gray-700">You do not have permission to access this page.</p>
      <Link href="/">
        <a className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Go to Homepage</a>
      </Link>
    </div>
  );
}
