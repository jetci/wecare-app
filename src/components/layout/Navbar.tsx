import React from 'react'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const [dark, setDark] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 lg:col-span-12">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">WeCare Dashboard</h2>
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle Dark Mode"
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
      </button>
    </header>
  )
}
