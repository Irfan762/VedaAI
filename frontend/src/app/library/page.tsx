import React from 'react';
import Link from 'next/link';
import { FolderOpen, Search } from 'lucide-react';

export default function LibraryPage() {
  // Placeholder library items
  const items = [
    { id: 1, title: 'Physics Chapter 1', type: 'Assessment', date: '2025-09-12' },
    { id: 2, title: 'Chemistry Lab Report', type: 'Assignment', date: '2025-08-30' },
    { id: 3, title: 'Math Quiz 2024', type: 'Assessment', date: '2024-12-05' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">My Library</h1>
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search library..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1020] focus:outline-none focus:ring-2 focus:ring-[#eb5a3c]/50"
        />
        <button className="p-2 rounded-full bg-[#eb5a3c] text-white hover:bg-[#d04c33] transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white dark:bg-[#0d1020] shadow-sm hover:shadow-md transition-shadow border border-slate-200/60 dark:border-slate-800/60"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{item.title}</h2>
              <FolderOpen className="w-5 h-5 text-[#eb5a3c]" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.type}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Created on {item.date}</p>
            <Link href="#" className="mt-2 inline-block text-sm text-[#eb5a3c] hover:underline">
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
