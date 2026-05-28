'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { useAssessmentStore } from '../../../store/assessmentStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Printer, RotateCw, ArrowLeft, Loader2, Sparkles, 
  CheckSquare, AlertCircle, Eye, EyeOff, Download
} from 'lucide-react';

export default function AssessmentDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const assessmentId = id as string;

  const { addAssessmentToHistory } = useAssessmentStore();

  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom interactive states
  const [showAnswers, setShowAnswers] = useState(true); // Default true like Figma
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);
  const [regenStep, setRegenStep] = useState('Connecting to server...');

  const socketRef = useRef<any>(null);

  // Fetch paper details on mount
  useEffect(() => {
    fetchPaper();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [assessmentId]);

  const fetchPaper = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    const res = await fetch(`${apiBase}/api/assessments/${assessmentId}`);
      if (!res.ok) {
        throw new Error('Assessment not found or server offline.');
      }
      const data = await res.json();
      setPaper(data.assessment);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to retrieve assessment paper.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenProgress(0);
    setRegenStep('Submitting task...');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    const res = await fetch(`${apiBase}/api/assessments/${assessmentId}/regenerate`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Server rejected regeneration request');
      }

      // Socket progress
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiBase;
      const socket = io(socketUrl);
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join:assessment', assessmentId);
        setRegenProgress(5);
        setRegenStep('Regeneration queue active...');
      });

      socket.on('assessment:update', (data: any) => {
        setRegenProgress(data.progress);
        setRegenStep(data.currentStep);

        if (data.status === 'completed') {
          setPaper(data.result);
          addAssessmentToHistory(data.result);
          setTimeout(() => {
            setIsRegenerating(false);
            socket.disconnect();
          }, 1000);
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Generation re-compile failed.');
        }
      });

    } catch (e: any) {
      console.error(e);
      alert(`Regeneration failed: ${e.message}`);
      setIsRegenerating(false);
      if (socketRef.current) socketRef.current.disconnect();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDifficultyLabel = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return '[Easy]';
    if (d === 'medium' || d === 'moderate') return '[Moderate]';
    return '[Challenging]';
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12">
        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#eb5a3c]" />
          <span className="text-sm font-semibold">Retrieving compiled paper layout...</span>
        </div>
        <div className="h-60 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-20">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl inline-block">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Failed to load paper</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">{error || 'Unknown error occurred.'}</p>
        <Button onClick={fetchPaper} className="px-6">Retry Load</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-fade-in duration-300">
      
      {/* ==========================================
         FIGMA IMAGE 4: Dark Chat Acknowledgment Banner
         ========================================== */}
      <div className="p-6 rounded-2xl bg-slate-800 dark:bg-[#111429] text-white space-y-4 shadow-glass no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-700/30">
        <div className="space-y-1 max-w-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>AI Teacher's Assistant</span>
          </p>
          <p className="text-sm font-medium text-slate-200 leading-normal">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.title.includes('8') ? '8' : '5'} {paper.subject} classes on the NCERT chapters:
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-5 h-10.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow transition-all shrink-0 hover:scale-[1.02]"
        >
          <Download className="w-4 h-4 text-[#eb5a3c]" />
          <span>Download as PDF</span>
        </button>
      </div>

      {/* Extra Action Controls Toolbar */}
      <div className="flex items-center justify-between no-print px-1">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-[#eb5a3c] transition-colors space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center gap-1.5 text-xs h-9.5"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs h-9.5"
          >
            <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {/* ==========================================
         FIGMA IMAGE 4: White Exam Paper Sheet
         ========================================== */}
      <Card 
        variant="glass" 
        className="p-10 md:p-14 border border-slate-200 dark:border-slate-800 shadow-premium relative bg-white dark:bg-slate-900 print-paper font-serif text-slate-900 dark:text-slate-100"
      >
        {/* Paper Main Header */}
        <div className="text-center space-y-1.5 pb-5 border-b border-slate-300 dark:border-slate-850">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-center">
            Delhi Public School, Sector-4, Bokaro
          </h2>
          <p className="text-sm font-bold uppercase tracking-wider">
            Subject: {paper.subject}
          </p>
          <p className="text-sm font-bold uppercase tracking-wider">
            Class: {paper.title.includes('8') ? '8th' : '5th'}
          </p>
        </div>

        {/* Time and Marks line */}
        <div className="flex justify-between text-xs font-bold py-3 text-slate-600 dark:text-slate-400">
          <span>Time Allowed: 45 minutes</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>

        {/* Universal Instruction */}
        <p className="text-xs font-extrabold italic text-slate-500 dark:text-slate-400 pb-5">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student Fill-in Blanks */}
        <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300 pb-6 border-b border-slate-200 dark:border-slate-800 max-w-[280px]">
          <div className="flex items-end">
            <span className="shrink-0">Name:</span>
            <div className="flex-1 border-b border-slate-400 dark:border-slate-600 ml-2 h-4 min-w-[200px]"></div>
          </div>
          <div className="flex items-end">
            <span className="shrink-0">Roll Number:</span>
            <div className="flex-1 border-b border-slate-400 dark:border-slate-600 ml-2 h-4 min-w-[200px]"></div>
          </div>
          <div className="flex items-end">
            <span className="shrink-0">Class: {paper.title.includes('8') ? '8th' : '5th'} Section:</span>
            <div className="flex-1 border-b border-slate-400 dark:border-slate-600 ml-2 h-4 min-w-[120px]"></div>
          </div>
        </div>

        {/* Assessment Paper Content */}
        <div className="space-y-8 pt-8">
          {paper.sections && paper.sections.map((section: any, secIdx: number) => {
            const secLetter = String.fromCharCode(65 + secIdx); // A, B, C

            return (
              <div key={secIdx} className="space-y-5 print-section-header">
                
                {/* Centered Section Header */}
                <h3 className="text-base font-black text-center uppercase tracking-widest text-slate-900 dark:text-white">
                  Section {secLetter}
                </h3>

                {/* Section title description */}
                <div className="pl-2 space-y-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {section.title}
                  </h4>
                  <p className="text-xs font-bold italic text-slate-500 dark:text-slate-400">
                    {section.instruction}
                  </p>
                </div>

                {/* Questions list */}
                <div className="space-y-5 pl-2">
                  {section.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="text-xs space-y-2 print-question-card">
                      
                      {/* Question Line matching Figma formatting exactly */}
                      <p className="font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                        <span className="font-black mr-1">{qIdx + 1}.</span>
                        <span className="font-bold text-slate-505 dark:text-slate-400 mr-1.5">
                          {getDifficultyLabel(q.difficulty)}
                        </span>
                        <span>{q.question}</span>
                        <span className="font-bold text-slate-500 dark:text-slate-400 ml-1.5 whitespace-nowrap">
                          [{q.marks} Marks]
                        </span>
                      </p>

                      {/* Render options for MCQs */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 font-bold text-slate-600 dark:text-slate-400">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex items-center space-x-1.5">
                              <span className="font-black">({String.fromCharCode(97 + optIdx)})</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            );
          })}

          {/* End of Question Paper */}
          <div className="text-center pt-6 pb-2 border-b border-slate-350 dark:border-slate-800">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              End of Question Paper
            </span>
          </div>

          {/* Teacher's evaluation Answer Key */}
          {showAnswers && (
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#eb5a3c]" />
                <span>Answer Key:</span>
              </h3>
              
              <div className="space-y-3.5 pl-2 text-xs">
                {paper.sections.flatMap((s: any) => s.questions).map((q: any, idx: number) => (
                  <div key={idx} className="leading-relaxed text-slate-800 dark:text-slate-200">
                    <p className="font-semibold">
                      <span className="font-black mr-2">{idx + 1}.</span>
                      {q.correctAnswer ? q.correctAnswer : `Standard answer evaluation model. Criteria: formula accuracy, critical context definitions, and grammar structure.`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </Card>

      {/* REGENERATION WORKER MODAL OVERLAY */}
      {isRegenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Re-compiling Paper</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Recalculating exam templates...</p>
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-[#eb5a3c] fill-none transition-all duration-500"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - regenProgress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{regenProgress}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Progress</span>
              </div>
            </div>

            <div className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-left space-y-2.5">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-[#eb5a3c] animate-spin" />
                <span className="text-[10px] font-bold text-[#eb5a3c] uppercase tracking-wider">Generative Log:</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 leading-normal animate-pulse">
                {regenStep}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
