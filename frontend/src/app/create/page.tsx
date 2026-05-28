'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import io from 'socket.io-client';
import { useAssessmentStore } from '../../store/assessmentStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  Sparkles, FileText, ArrowRight, ArrowLeft, Upload, Check, 
  Trash2, Brain, Loader2, PlayCircle, AlertCircle, HelpCircle,
  Plus, Minus, Mic, UploadCloud, Calendar
} from 'lucide-react';

// Zod Validation Schema
const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(z.object({
    type: z.string(),
    count: z.number().min(1),
    marks: z.number().min(1)
  })).min(1, 'Add at least one question type'),
  additionalInstructions: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice Questions',
  short: 'Short Questions',
  diagram: 'Diagram/Graph-Based Questions',
  numerical: 'Numerical Problems'
};

export default function CreateAssignmentWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resume');

  const { draft, setDraft, activeJob, setActiveJob, updateActiveJobProgress, addAssessmentToHistory } = useAssessmentStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Socket Connection Ref
  const socketRef = useRef<any>(null);

  // Initialize Form with default items matching Figma Image 3
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: draft.title || 'Midterm Quiz',
      subject: draft.subject || 'Science',
      dueDate: draft.dueDate || '2025-06-21',
      questionTypes: [
        { type: 'mcq', count: 4, marks: 1 },
        { type: 'short', count: 3, marks: 2 },
        { type: 'diagram', count: 5, marks: 5 },
        { type: 'numerical', count: 5, marks: 5 }
      ],
      additionalInstructions: draft.additionalInstructions || ''
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questionTypes'
  });

  // Watch fields to sync draft details and compute totals
  const watchedFields = watch();
  useEffect(() => {
    // Autosave draft properties
    setDraft({
      title: watchedFields.title,
      subject: watchedFields.subject,
      dueDate: watchedFields.dueDate,
      additionalInstructions: watchedFields.additionalInstructions,
      // Map to old store types for backwards compatibility
      questionType: watchedFields.questionTypes?.map((t: any) => t.type) as any || ['mcq'],
      totalQuestions: watchedFields.questionTypes?.reduce((sum: number, t: any) => sum + (t.count || 0), 0) || 10,
      totalMarks: watchedFields.questionTypes?.reduce((sum: number, t: any) => sum + ((t.count || 0) * (t.marks || 0)), 0) || 50
    });
  }, [watchedFields, setDraft]);

  const totalQuestions = watchedFields.questionTypes?.reduce((sum: number, t: any) => sum + (t.count || 0), 0) || 0;
  const totalMarks = watchedFields.questionTypes?.reduce((sum: number, t: any) => sum + ((t.count || 0) * (t.marks || 0)), 0) || 0;

  // Track progress if resuming from URL
  useEffect(() => {
    if (resumeId) {
      handleStartGenerationSocket(resumeId);
    }
  }, [resumeId]);

  // Clean socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // WebSockets Progress Connection
  const handleStartGenerationSocket = (assessmentId: string) => {
    setIsSubmitting(true);
    setErrorText(null);
    
    setActiveJob({
      assessmentId,
      status: 'pending',
      progress: 0,
      currentStep: 'Establishing websocket connection...'
    });

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:assessment', assessmentId);
      updateActiveJobProgress(5, 'Subscribed to generator worker...');
    });

    socket.on('assessment:update', (data: any) => {
      updateActiveJobProgress(data.progress, data.currentStep, data.status, data.error);

      if (data.status === 'completed') {
        addAssessmentToHistory(data.result);
        setTimeout(() => {
          setIsSubmitting(false);
          setActiveJob(null);
          socket.disconnect();
          router.push(`/assessment/${assessmentId}`);
        }, 1200);
      } else if (data.status === 'failed') {
        setErrorText(data.error || 'AI generation encountered a parsing error.');
        setIsSubmitting(false);
        socket.disconnect();
      }
    });
  };

  // Submit Wizard Form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorText(null);

    // Map rows to backend schema format
    const typesMapped = data.questionTypes.map(t => t.type);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          subject: data.subject,
          dueDate: data.dueDate,
          questionType: typesMapped,
          totalQuestions,
          totalMarks,
          additionalInstructions: uploadedFile 
            ? `${data.additionalInstructions || ''}\n[Source Reference Attached: ${uploadedFile.name}]`
            : data.additionalInstructions
        })
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || 'Server rejected creation request');
      }

      const responseData = await response.json();
      const assessmentId = responseData.assessment._id || responseData.assessment.id;
      
      handleStartGenerationSocket(assessmentId);

    } catch (e: any) {
      console.error(e);
      setErrorText(e.message || 'Failed to submit creation parameters.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in duration-300 relative pb-10">
      
      {/* Header bar */}
      <div className="space-y-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eb5a3c]"></span>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create Assignment</h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Set up a new assignment for your students
          </p>
        </div>
        {/* Horizontal Progress Bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-[35%] h-full bg-slate-500 dark:bg-slate-400 rounded-full" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* ==========================================
           FIGMA IMAGE 3: Assignment Details Wizard Card
           ========================================== */}
        <Card variant="glass" className="p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-premium space-y-6">
          
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Assignment Details</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Basic information about your assignment</p>
          </div>

          {/* Core indexing fields hidden behind the hood, synced dynamically */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Course Title
              </label>
              <input
                type="text"
                className="w-full px-4 h-10 rounded-full border border-slate-200/80 dark:border-slate-800 bg-[#f8fafc]/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none"
                {...register('title')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-4 h-10 rounded-full border border-slate-200/80 dark:border-slate-800 bg-[#f8fafc]/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none"
                {...register('subject')}
              />
            </div>
          </div>

          {/* Reference Material Dropzone */}
          <div className="space-y-2">
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-800 dark:hover:border-slate-700/80 dark:bg-slate-900/10'}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc"
                  className="hidden"
                />
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 mb-3 border border-slate-100 dark:border-slate-800 shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 text-center">
                  Choose a file or drag & drop it here
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-1 text-center">JPEG, PNG, upto 10MB</p>
                
                <button 
                  type="button" 
                  className="mt-3 px-5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold bg-[#f8fafc] hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors shadow-sm"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#eb5a3c] text-white rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">{uploadedFile.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{uploadedFile.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">Upload images of your preferred document/image</p>
          </div>

          {/* Due Date Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500" htmlFor="dueDate">
              Due Date
            </label>
            <div className="relative flex items-center w-full">
              <input
                id="dueDate"
                type="date"
                placeholder="DD-MM-YYYY"
                className="w-full px-4 pr-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-800 bg-[#f8fafc]/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                {...register('dueDate')}
              />
              <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            {errors.dueDate && (
              <p className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.dueDate.message}</span>
              </p>
            )}
          </div>

          {/* Question Type Rows (Dynamic Grid) */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_12px_100px_100px_28px] md:grid-cols-[1fr_20px_120px_120px_36px] gap-2 md:gap-4 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
              <div>Question Type</div>
              <div></div>
              <div className="text-center">No. of Questions</div>
              <div className="text-center">Marks</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {fields.map((field, idx) => {
                const countVal = watchedFields.questionTypes?.[idx]?.count || 1;
                const marksVal = watchedFields.questionTypes?.[idx]?.marks || 1;

                return (
                  <div 
                    key={field.id} 
                    className="grid grid-cols-[1fr_12px_96px_96px_28px] md:grid-cols-[1fr_20px_116px_116px_36px] gap-2 md:gap-4 items-center bg-slate-50/40 dark:bg-slate-900/10 p-2 md:p-3 rounded-full border border-slate-150 dark:border-slate-800/60"
                  >
                    {/* Type Select */}
                    <select
                      className="w-full px-3.5 h-10 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                      {...register(`questionTypes.${idx}.type` as const)}
                    >
                      <option value="mcq">{QUESTION_TYPE_LABELS.mcq}</option>
                      <option value="short">{QUESTION_TYPE_LABELS.short}</option>
                      <option value="diagram">{QUESTION_TYPE_LABELS.diagram}</option>
                      <option value="numerical">{QUESTION_TYPE_LABELS.numerical}</option>
                    </select>

                    {/* Multiplication Sign */}
                    <span className="text-center text-xs font-extrabold text-slate-400 dark:text-slate-500 select-none">×</span>

                    {/* No. of Questions Pill */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 h-10 w-[100px] md:w-[120px] rounded-full overflow-hidden shrink-0">
                      <button type="button" onClick={() => setValue(`questionTypes.${idx}.count`, Math.max(1, countVal - 1))} className="w-7 md:w-8 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white select-none">{countVal}</span>
                      <button type="button" onClick={() => setValue(`questionTypes.${idx}.count`, countVal + 1)} className="w-7 md:w-8 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Marks Pill */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 h-10 w-[100px] md:w-[120px] rounded-full overflow-hidden shrink-0">
                      <button type="button" onClick={() => setValue(`questionTypes.${idx}.marks`, Math.max(1, marksVal - 1))} className="w-7 md:w-8 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white select-none">{marksVal}</span>
                      <button type="button" onClick={() => setValue(`questionTypes.${idx}.marks`, marksVal + 1)} className="w-7 md:w-8 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-7 h-7" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add row + Summary block */}
            <div className="flex flex-row items-center justify-between gap-4 pt-3">
              {/* + Add Question Type button */}
              <button
                type="button"
                onClick={() => append({ type: 'mcq', count: 5, marks: 1 })}
                className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-orange-600 transition-colors py-2"
              >
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                <span>Add Question Type</span>
              </button>

              {/* Summary Counts */}
              <div className="text-right text-xs font-bold text-slate-550 dark:text-slate-400 space-y-1 select-none pr-7">
                <p>Total Questions : <span className="text-slate-850 dark:text-white font-extrabold text-sm">{totalQuestions}</span></p>
                <p>Total Marks : <span className="text-slate-850 dark:text-white font-extrabold text-sm">{totalMarks}</span></p>
              </div>
            </div>

          </div>

          {/* Additional Information for better output */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500" htmlFor="instructions">
              Additional Information (For better output)
            </label>
            <div className="relative">
              <textarea
                id="instructions"
                rows={3}
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                className="w-full p-4 pr-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#f8fafc]/50 dark:bg-slate-900/50 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-colors"
                {...register('additionalInstructions')}
              />
              {/* Microphone icon */}
              <button
                type="button"
                className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center shadow-sm"
              >
                <Mic style={{ width: '16.36px', height: '16.36px' }} />
              </button>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="submit"
              className="h-10 rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#eb5a3c]" />
            </button>
          </div>

        </Card>
      </form>

      {/* GENERATION LIVE OVERLAY (Circular progress gauge) */}
      {isSubmitting && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in duration-300">
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white dark:bg-[#0d1020] border border-slate-100 dark:border-slate-800 shadow-premium flex flex-col items-center text-center space-y-6">
            
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Compiling Exam Paper</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Creating custom curriculum models...</p>
            </div>

            {/* Circular Gauge */}
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
                  strokeDashoffset={2 * Math.PI * 54 * (1 - activeJob.progress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{activeJob.progress}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Progress</span>
              </div>
            </div>

            {/* Live Progress Logs */}
            <div className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-left space-y-2.5">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-[#eb5a3c] animate-spin" />
                <span className="text-[10px] font-bold text-[#eb5a3c] uppercase tracking-wider">Generative Log:</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 leading-normal animate-pulse">
                {activeJob.currentStep}
              </p>
            </div>
            
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Please do not exit this page. AI processing runs in the background...
            </span>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/30 shadow-premium flex flex-col items-center text-center space-y-6">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Compilation Interrupted</h3>
              <p className="text-xs text-rose-500 font-semibold">Service encountered a processing exception</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-full text-left font-medium leading-relaxed">
              {errorText}
            </p>

            <div className="flex gap-4 w-full pt-2">
              <Button variant="outline" className="w-full text-xs font-bold" onClick={() => setErrorText(null)}>
                Dismiss
              </Button>
              <Button className="w-full bg-[#eb5a3c] hover:bg-orange-600 text-xs font-bold" onClick={() => { setErrorText(null); onSubmit(watchedFields); }}>
                Retry Compile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
