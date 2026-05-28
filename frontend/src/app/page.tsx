'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../store/assessmentStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  Plus, FileText, Calendar, Loader2, Sparkles, 
  Trash2, AlertCircle, ChevronRight, Inbox, Search, Filter, MoreVertical
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { history, setHistory } = useAssessmentStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/assessments`);
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/assessments/${id}`, {
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
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#0d1020]/20 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-premium max-w-4xl mx-auto">
          {/* Custom SVG Empty State Illustration */}
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 select-none pointer-events-none">
            <circle cx="90" cy="90" r="60" fill="#F1F5F9" className="dark:fill-slate-900/50" />
            <path d="M45 75C35 70 30 85 45 80C50 78 52 82 48 88" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <rect x="75" y="45" width="46" height="60" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
            <line x1="83" y1="57" x2="101" y2="57" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" className="dark:stroke-white" />
            <line x1="83" y1="67" x2="113" y2="67" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="83" y1="77" x2="113" y2="77" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="83" y1="87" x2="103" y2="87" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <rect x="127" y="53" width="22" height="14" rx="3" fill="#E2E8F0" className="dark:fill-slate-850" />
            <circle cx="132" cy="60" r="1.5" fill="#94A3B8" />
            <line x1="137" y1="60" x2="145" y2="60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="112" y1="105" x2="132" y2="125" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" className="dark:stroke-slate-800" />
            <line x1="114" y1="107" x2="130" y2="123" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="95" r="18" fill="white" stroke="#CBD5E1" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
            <circle cx="100" cy="95" r="13" fill="#EF4444" />
            <path d="M96 91L104 99M104 91L96 99" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-full border border-slate-200/50 dark:border-slate-800/80">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 rounded-full border border-slate-200/80 dark:border-slate-800 bg-[#f8fafc]/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350 dark:focus:ring-slate-700"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 px-4 h-9 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-premium hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[160px] relative"
              >
                
                {/* Top header */}
                <div className="flex items-start justify-between gap-4 relative">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-[#eb5a3c] dark:group-hover:text-orange-400 transition-colors">
                      {assessment.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-505 font-bold uppercase tracking-wider">
                      {assessment.subject}
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === assessment._id ? null : assessment._id);
                      }}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenuId === assessment._id && (
                      <div 
                        className="absolute right-0 top-8 z-20 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-premium p-1 text-[11px] font-bold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            router.push(`/assessment/${assessment._id}`);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          View Assignment
                        </button>
                        <button
                          onClick={(e) => {
                            setActiveMenuId(null);
                            handleDelete(e, assessment._id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Meta Info */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100/50 dark:border-slate-850/50 mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-505">
                  <div className="flex items-center gap-1">
                    <span>Assigned on :</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatDate(assessment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Due :</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatDate(assessment.dueDate)}
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
