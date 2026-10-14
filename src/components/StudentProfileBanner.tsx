import React from 'react';
import {
  Target,
  Clock,
  Award,
  Sparkles,
  BarChart3,
  CalendarDays,
  Brain,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { StudentProfile } from '../types';

export type ActiveTab = 'scores' | 'study-time' | 'weekly-plan' | 'habits' | 'ai-counselor';

interface StudentProfileBannerProps {
  student: StudentProfile;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const StudentProfileBanner: React.FC<StudentProfileBannerProps> = ({
  student,
  activeTab,
  onTabChange,
}) => {
  const currentExam = student.exams[student.exams.length - 1];
  const totalScore = currentExam.scores.reduce((acc, s) => acc + s.rawScore, 0);
  const avgScore = Math.round((totalScore / currentExam.scores.length) * 10) / 10;
  const gradeSum = currentExam.scores.reduce((acc, s) => acc + s.grade, 0);
  const avgGrade = Math.round((gradeSum / currentExam.scores.length) * 10) / 10;

  const totalWeeklyStudy = student.studyHours.reduce(
    (acc, sh) => acc + (sh.totalWeeklyHours || sh.selfStudyHours + sh.lectureHours),
    0
  );
  const totalSelfStudy = student.studyHours.reduce((acc, sh) => acc + sh.selfStudyHours, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 px-6 py-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Student Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/20 rounded-full backdrop-blur-xs">
                  {student.gradeLevel}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/40 rounded-full border border-indigo-300/30">
                  {student.track}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1.5 text-blue-100 text-sm">
                <span className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-amber-300" />
                  <span>목표: {student.targetUniversity} {student.targetMajor}</span>
                </span>
                <span className="text-white/40">•</span>
                <span>학부모: {student.parentName} ({student.parentPhone})</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-[11px] text-blue-200 block">최근 시험 평균</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-bold">{avgScore}</span>
                <span className="text-xs text-blue-200">점</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-[11px] text-blue-200 block">평균 등급</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-bold text-amber-300">{avgGrade}</span>
                <span className="text-xs text-blue-200">등급</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-[11px] text-blue-200 block">주간 순공 시간</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-bold text-emerald-300">{totalSelfStudy}</span>
                <span className="text-xs text-blue-200">시간/주</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-[11px] text-blue-200 block">습관 진단 결과</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-base font-bold text-purple-200">
                  {student.habitResult ? student.habitResult.overallGrade.split(' ')[0] : '미진단'}
                </span>
                {student.habitResult && (
                  <span className="text-xs text-blue-200">({student.habitResult.totalScore}점)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="px-4 border-t border-slate-100 flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 bg-slate-50/50">
        <button
          onClick={() => onTabChange('scores')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'scores'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>성적 분석 & 그래프</span>
        </button>

        <button
          onClick={() => onTabChange('study-time')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'study-time'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>학습시간 & 전략 분석</span>
        </button>

        <button
          onClick={() => onTabChange('weekly-plan')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'weekly-plan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>주간 학습 계획표</span>
        </button>

        <button
          onClick={() => onTabChange('habits')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'habits'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>학습 습관 진단</span>
        </button>

        <button
          onClick={() => onTabChange('ai-counselor')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ai-counselor'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100/70 border border-purple-200/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI 1:1 맞춤 상담실</span>
        </button>
      </div>
    </div>
  );
};
