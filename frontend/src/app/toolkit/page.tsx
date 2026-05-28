import React from 'react';
import { GraduationCap, Sparkles, BookOpen, PenTool, FileText, Settings2 } from 'lucide-react';

export default function ToolkitPage() {
  const tools = [
    {
      id: 1,
      title: "Lesson Planner AI",
      description: "Generate comprehensive lesson plans aligned with your curriculum in seconds.",
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-500/20"
    },
    {
      id: 2,
      title: "Rubric Generator",
      description: "Create detailed grading rubrics for any assignment or project type automatically.",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-500/20"
    },
    {
      id: 3,
      title: "Question Bank Builder",
      description: "Extract questions from PDFs and articles to build a custom test bank.",
      icon: PenTool,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20"
    },
    {
      id: 4,
      title: "Parent Email Drafter",
      description: "Draft professional, empathetic emails for progress updates and interventions.",
      icon: Sparkles,
      color: "text-[#eb5a3c]",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-100 dark:border-orange-500/20"
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[#eb5a3c]" />
            AI Teacher's Toolkit
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Supercharge your workflow with purpose-built AI tools for educators.
          </p>
        </div>
        <button className="flex items-center justify-center space-x-2 h-11 px-6 rounded-full bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all shadow-sm active:scale-[0.98]">
          <Settings2 className="w-4 h-4" />
          <span>Toolkit Settings</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div 
            key={tool.id} 
            className="group relative flex flex-col bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Decorative background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-[#0d1020] dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${tool.bg} ${tool.border} ${tool.color} group-hover:scale-110 transition-transform duration-500 ease-out`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#eb5a3c] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Placeholder for future tools */}
        <div className="group relative flex flex-col bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 items-center justify-center min-h-[160px] cursor-pointer hover:border-[#eb5a3c]/50 hover:bg-[#eb5a3c]/5 transition-all">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3 group-hover:text-[#eb5a3c] transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-[#eb5a3c]">
            Suggest a New Tool
          </span>
        </div>
      </div>
    </div>
  );
}
