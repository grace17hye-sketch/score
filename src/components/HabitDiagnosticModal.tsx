import React, { useState } from 'react';
import {
  StudentProfile,
  HabitSurveyResponse,
} from '../types';
import { HABIT_QUESTIONS } from '../data/mockData';
import { evaluateHabitSurvey } from '../services/counselingEngine';
import {
  X,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
}

export const HabitDiagnosticModal: React.FC<HabitDiagnosticModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStudent,
}) => {
  // Pre-fill answers with existing result if available or default 3
  const [answers, setAnswers] = useState<HabitSurveyResponse>(() => {
    const initial: HabitSurveyResponse = {};
    HABIT_QUESTIONS.forEach((q) => {
      initial[q.id] = 4;
    });
    return initial;
  });

  const [showResultView, setShowResultView] = useState<boolean>(
    Boolean(student.habitResult)
  );

  if (!isOpen) return null;

  const handleSelectScore = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = HABIT_QUESTIONS.length;
  const isAllAnswered = answeredCount >= totalQuestions;

  const handleSubmitSurvey = () => {
    const evaluated = evaluateHabitSurvey(answers);
    onUpdateStudent({
      ...student,
      habitResult: evaluated,
    });
    setShowResultView(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleRetake = () => {
    setShowResultView(false);
  };

  const currentResult = student.habitResult || evaluateHabitSurvey(answers);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                자기주도 학습 습관 정밀 진단 검사
              </h2>
              <p className="text-xs text-slate-500">
                {student.name} 학생의 5대 핵심 학습 역량 및 메타인지 습관 분석
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {showResultView && student.habitResult ? (
            /* Results Screen */
            <div className="space-y-6">
              {/* Score summary banner */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-6 text-center">
                <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider block">
                  Learning Habit Quotient
                </span>
                <div className="flex items-baseline justify-center space-x-2 mt-2">
                  <span className="text-5xl font-black">{currentResult.totalScore}</span>
                  <span className="text-xl font-bold text-purple-200">/ 100점</span>
                </div>
                <div className="inline-block mt-3 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md font-extrabold text-sm border border-white/20">
                  {currentResult.overallGrade}
                </div>
                <p className="text-xs text-purple-200 mt-2">
                  진단 일자: {currentResult.surveyDate} • {student.name} 학생
                </p>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800">5대 학습 역량별 세부 진단</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentResult.categoryScores.map((cat) => (
                    <div
                      key={cat.categoryKey}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-purple-700">{cat.score}점</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              cat.status === '최우수'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cat.status === '양호'
                                ? 'bg-blue-100 text-blue-800'
                                : cat.status === '개선필요'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{cat.comment}</p>
                      <p className="text-[11px] text-purple-900 font-medium bg-purple-50 p-2 rounded-lg">
                        💡 <strong>실천 팁:</strong> {cat.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>학생의 두드러진 강점 역량</span>
                  </span>
                  <ul className="space-y-1 text-emerald-900">
                    {currentResult.keyStrengths.map((str, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>최우선 보완 시급 영역</span>
                  </span>
                  <ul className="space-y-1 text-amber-900">
                    {currentResult.keyWeaknesses.map((w, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Action Plan */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>학습 습관 교정을 위한 3대 즉각 실행 과제</span>
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  {currentResult.recommendedActions.map((act, i) => (
                    <div key={i} className="flex items-start space-x-2 bg-white/10 p-2.5 rounded-xl">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retake button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleRetake}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>설문 다시 응답하기</span>
                </button>
              </div>
            </div>
          ) : (
            /* Survey Questions Screen */
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                평소 자신의 실제 공부 모습에 가장 솔직하게 응답해 주세요. (1점: 전혀 아니다 ~ 5점: 매우 그렇다)
                총 15문항으로 약 2분 소요되며, 작성 즉시 영역별 정밀 진단서가 발급됩니다.
              </div>

              <div className="space-y-5">
                {HABIT_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {q.question}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {q.categoryLabel}
                      </span>
                    </div>

                    {/* 5-point buttons */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[
                        { val: 1, label: '전혀 아니다' },
                        { val: 2, label: '아니다' },
                        { val: 3, label: '보통이다' },
                        { val: 4, label: '그렇다' },
                        { val: 5, label: '매우 그렇다' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleSelectScore(q.id, item.val)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                            answers[q.id] === item.val
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs scale-102'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200'
                          }`}
                        >
                          <div className="text-sm font-extrabold">{item.val}</div>
                          <div className="text-[10px] opacity-80 mt-0.5 truncate">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  응답 완료: {answeredCount} / {totalQuestions} 문항
                </span>
                <button
                  onClick={handleSubmitSurvey}
                  disabled={!isAllAnswered}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <span>진단 결과 확인 및 리포트 반영</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
