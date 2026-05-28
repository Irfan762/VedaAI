'use client';

import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { 
  Moon, Sun, Home, Users, FileText, 
  Settings, GraduationCap, FolderOpen, 
  Bell, ChevronDown, Plus, Menu, X, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode, setDarkMode, toggleDarkMode, setHistory, history } = useAssessmentStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDark = localStorage.getItem('vedaai_dark_mode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = storedDark ? storedDark === 'true' : prefersDark;
      setDarkMode(isDark);

      const storedHistory = localStorage.getItem('vedaai_history');
      if (storedHistory) {
        try {
          setHistory(JSON.parse(storedHistory));
        } catch (e) {
          // Ignore
        }
      }
    }
    setMounted(true);
  }, [setDarkMode, setHistory]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#eb5a3c]"></div>
      </div>
    );
  }

  // Active route helpers
  const isCreate = pathname === '/create';
  const isDetails = pathname.startsWith('/assessment');
  const isHome = pathname === '/';
  const isGroups = pathname.startsWith('/groups');
  const isToolkit = pathname.startsWith('/toolkit');
  const isLibrary = pathname.startsWith('/library');
  const isAssignments = isHome || isDetails;

  // Determine page title for mobile header
  const getPageTitle = () => {
    if (isCreate) return 'Create Assignment';
    if (isDetails) return 'Assignment Details';
    if (isGroups) return 'My Groups';
    if (isToolkit) return "AI Teacher's Toolkit";
    if (isLibrary) return 'My Library';
    return 'Assignments';
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-[#070913] transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* ========================================
          DESKTOP LEFT SIDEBAR (md+) - Hidden on Print
          ======================================== */}
      <aside className="w-[260px] border-r border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0d1020] flex flex-col justify-between p-5 shrink-0 transition-colors duration-300 no-print hidden md:flex">
        
        {/* Top Section */}
        <div className="space-y-6">
          {/* VedaAi Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 px-4 py-2 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#eb5a3c] shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-xl italic tracking-tighter">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              VedaAI
            </span>
          </Link>

          {/* Dynamic Action Button in Sidebar */}
          {isDetails ? (
            <button
              onClick={() => router.push('/toolkit')}
              className="w-full flex items-center justify-center space-x-2 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all border border-orange-500/20 active:scale-[0.98] shadow-sm group"
            >
              <div className="p-1 rounded bg-[#eb5a3c] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>AI Teacher's Toolkit</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/create')}
              className="w-full flex items-center justify-center space-x-2 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all border border-orange-500/20 active:scale-[0.98] shadow-sm group"
            >
              <div className="p-1 rounded bg-[#eb5a3c] text-white flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Create Assignment</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link 
              href="/"
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isDetails ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Home className="w-4.5 h-4.5" />
              <span>Home</span>
            </Link>

            <Link 
              href="/groups" 
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isGroups ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>My Groups</span>
            </Link>

            <Link 
              href="/"
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isHome ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4.5 h-4.5" />
                <span>Assignments</span>
              </div>
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#eb5a3c] text-white text-[10px] font-bold">
                {isDetails ? 32 : (history.length > 0 ? history.length : 10)}
              </span>
            </Link>

            <Link 
              href="/toolkit" 
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isToolkit ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <GraduationCap className="w-4.5 h-4.5" />
              <span>AI Teacher's Toolkit</span>
            </Link>

            <Link 
              href="/library" 
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLibrary ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <FolderOpen className="w-4.5 h-4.5" />
              <span>My Library</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          <Link 
            href="#"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Settings</span>
          </Link>

          {/* School Card */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-300 uppercase">DPS</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Delhi Public School</h4>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">Bokaro Steel City</p>
            </div>
          </div>
        </div>

      </aside>

      {/* ========================================
          MAIN CONTAINER
          ======================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ---- MOBILE HEADER (visible only on small screens) ---- */}
        <header className="md:hidden sticky top-0 z-30 w-full bg-white dark:bg-[#0d1020] border-b border-slate-200/60 dark:border-slate-800/60 no-print">
          <div className="px-4 h-14 flex items-center justify-between">
            {/* Left: Logo or Back + Page Title */}
            <div className="flex items-center space-x-3">
              {(isCreate || isDetails) ? (
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eb5a3c] flex items-center justify-center shadow-sm">
                    <span className="text-white font-black text-base italic">V</span>
                  </div>
                  <span className="text-base font-bold text-slate-800 dark:text-white">VedaAI</span>
                </Link>
              )}
              {(isCreate || isDetails) && (
                <span className="text-sm font-bold text-slate-800 dark:text-white">{getPageTitle()}</span>
              )}
            </div>

            {/* Right: Bell + Avatar + Menu */}
            <div className="flex items-center space-x-1">
              {/* Bell */}
              <div className="relative p-2 text-slate-500 dark:text-slate-400">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#eb5a3c] ring-2 ring-white dark:ring-[#0d1020]"></span>
              </div>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                <span className="text-[10px] font-extrabold text-white">JD</span>
              </div>
              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-500 dark:text-slate-400"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ---- DESKTOP HEADER (hidden on mobile) ---- */}
        <header className="hidden md:flex sticky top-0 z-30 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#070913]/70 backdrop-blur-md transition-colors no-print">
          <div className="px-6 lg:px-8 h-16 flex items-center justify-between w-full">
            {/* Left: back arrow + title */}
            <div className="flex items-center space-x-3">
              {(isCreate || isDetails) && (
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#eb5a3c]" />
                <span>{getPageTitle()}</span>
              </h2>
            </div>

            {/* Right: Dark mode + bell + avatar */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
              <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#eb5a3c] ring-2 ring-white dark:ring-slate-950"></span>
              </div>
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-extrabold text-xs overflow-hidden border border-slate-600">
                  <span className="text-[10px]">JD</span>
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300">John Doe</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>

      </div>

      {/* ========================================
          MOBILE SLIDE-IN DRAWER MENU
          ======================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0d1020] flex flex-col p-6 shadow-2xl animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#eb5a3c] flex items-center justify-center">
                  <span className="text-white font-black text-base italic">V</span>
                </div>
                <span className="text-base font-bold text-slate-800 dark:text-white">VedaAI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="space-y-1 flex-1">
              {[
                { href: '/', icon: Home, label: 'Home', active: isHome && !isDetails },
                { href: '/groups', icon: Users, label: 'My Groups', active: isGroups },
                { href: '/', icon: FileText, label: 'Assignments', active: isAssignments },
                { href: '/toolkit', icon: GraduationCap, label: "AI Teacher's Toolkit", active: isToolkit },
                { href: '/library', icon: FolderOpen, label: 'My Library', active: isLibrary },
              ].map(({ href, icon: Icon, label, active }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-[#eb5a3c]/10 text-[#eb5a3c] font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 w-full transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                  <span className="text-[10px] font-extrabold text-white">DPS</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Delhi Public School</h4>
                  <p className="text-[10px] text-slate-400 truncate">Bokaro Steel City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MOBILE BOTTOM TAB BAR (4 tabs, flat)
          ======================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden no-print">
        <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1020] flex items-center justify-around px-2">
          {/* Home */}
          <Link 
            href="/"
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-2 ${isHome && !isDetails ? 'text-[#eb5a3c]' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          {/* Assignments */}
          <Link 
            href="/"
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-2 ${isAssignments ? 'text-[#eb5a3c]' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold">Assignments</span>
          </Link>

          {/* Library */}
          <Link 
            href="/library"
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-2 ${isLibrary ? 'text-[#eb5a3c]' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold">Library</span>
          </Link>

          {/* AI Toolkit */}
          <Link 
            href="/toolkit"
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-2 ${isToolkit ? 'text-[#eb5a3c]' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold">AI Toolkit</span>
          </Link>
        </div>
      </div>

      {/* ========================================
          MOBILE FLOATING ACTION BUTTON (+)
          ======================================== */}
      {!isCreate && (
        <button
          onClick={() => router.push('/create')}
          className="fixed bottom-20 right-5 z-40 md:hidden w-12 h-12 rounded-full bg-[#eb5a3c] text-white shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-transform hover:bg-[#d04c33]"
          aria-label="Create Assignment"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

    </div>
  );
}

// Inline SVG ArrowLeft icon
function ArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={props.className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}
