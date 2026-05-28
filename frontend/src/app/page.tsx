'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../store/assessmentStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  Plus, FileText, Calendar, Loader2, Sparkles, 
  Trash2, AlertCircle, ChevronRight, Inbox, Search, Filter
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { history, setHistory } = useAssessmentStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/assessments');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.assessments);
        // Sync localstorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('vedaai_history', JSON.stringify(data.assessments));
        }
      }
    } catch (e) {
      console.error('Failed to sync assessments from server. Using local cache.', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/assessments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = history.filter(item => item._id !== id);
        setHistory(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vedaai_history', JSON.stringify(updated));
        }
      } else {
        alert('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Delete assessment error:', err);
    }
  };

  const filteredAssessments = history.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eb5a3c]"></span>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Assignments</h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Manage and create assessments for your classes
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => router.push('/create')}
            className="flex items-center space-x-1.5 px-4 h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-[#eb5a3c]" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#eb5a3c]" />
          <span className="text-xs font-bold uppercase tracking-wider">Syncing dashboard data...</span>
        </div>
      ) : filteredAssessments.length === 0 ? (
        /* ==========================================
           FIGMA IMAGE 1: Zero State Dashboard (Empty)
           ========================================== */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#0d1020]/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-premium max-w-4xl mx-auto">
          <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
            {/* Custom Empty Graphic */}
            <div className="absolute inset-0 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-full blur-2xl"></div>
            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-sm relative">
              <FileText className="w-10 h-10" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg border-2 border-white dark:border-[#0d1020]">
                ×
              </div>
            </div>
          </div>

          <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
            No assignments yet
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <button
            onClick={() => router.push('/create')}
            className="flex items-center space-x-1.5 px-6 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-[#eb5a3c]" />
            <span>Create Your First Assignment</span>
          </button>
        </div>
      ) : (
        /* ==========================================
           FIGMA IMAGE 2: Filled State Dashboard
           ========================================== */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Assignment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter By</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssessments.map((assessment) => (
              <Card
                key={assessment._id}
                variant="glass"
                onClick={() => router.push(`/assessment/${assessment._id}`)}
                className="p-6 border border-slate-200/50 dark:border-slate-800/80 shadow-premium hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[160px] relative"
              >
                
                {/* Top header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {assessment.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      {assessment.subject}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleDelete(e, assessment._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Meta Info */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 dark:border-slate-850/50 mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <span>Assigned on :</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Due :</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
