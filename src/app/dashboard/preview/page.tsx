import Link from 'next/link';

const dashboards = [
  { name: 'Community', path: '/dashboard/community' },
  { name: 'Driver', path: '/dashboard/driver' },
  { name: 'Health Officer', path: '/dashboard/health-officer' },
  { name: 'Executive', path: '/dashboard/executive' },
  { name: 'Admin', path: '/dashboard/admin' },
  { name: 'Developer', path: '/dashboard/developer' },
];

export default function PreviewPage() {
  return (
    <div className="p-10 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Dashboard Preview</h1>
      <p className="mb-8 text-gray-600">Click on a dashboard name to view its main page. This provides a quick overview of the current UI status for each user role.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map(d => (
          <Link 
            key={d.name} 
            href={d.path}
            className="block p-6 bg-gray-50 hover:bg-blue-100 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <span className="text-xl font-semibold text-blue-700">{d.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
