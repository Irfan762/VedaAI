import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function GroupsPage() {
  // Placeholder groups data
  const groups = [
    { id: 1, name: 'Class 10‑A Science', members: 28 },
    { id: 2, name: 'Math Olympiad Prep', members: 15 },
    { id: 3, name: 'English Literature', members: 22 },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">My Groups</h1>
      <div className="flex justify-end mb-4">
        <Link
          href="#"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#eb5a3c] text-white hover:bg-[#d04c33] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Group</span>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-xl bg-white dark:bg-[#0d1020] shadow-sm hover:shadow-md transition-shadow border border-slate-200/60 dark:border-slate-800/60"
          >
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{g.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{g.members} members</p>
            <Link
              href="#"
              className="mt-2 inline-block text-sm text-[#eb5a3c] hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
