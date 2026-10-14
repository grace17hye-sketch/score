import React, { useState } from 'react';
import {
  StudentProfile,
  StudyPlanBlock,
} from '../types';
import { generateWeeklyStudyPlan } from '../services/counselingEngine';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Printer,
  Check,
  Clock,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyPlanScheduleProps {
  student: StudentProfile;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
}

export const StudyPlanSchedule: React.FC<StudyPlanScheduleProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [selectedFocus, setSelectedFocus] = useState<string>('자동 추천');
  const [isCopied, setIsCopied] = useState(false);
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // New block form state
  const [newDay, setNewDay] = useState<'월' | '화' | '수' | '목' | '금' | '토' | '일'>('월');
  const [newTimeSlot, setNewTimeSlot] = useState<
    '오전 (09:00~12:00)' | '오후 (13:30~17:30)' | '야간 (19:00~23:00)'
  >('야간 (19:00~23:00)');
  const [newSubject, setNewSubject] = useState('수학');
  const [newTopic, setNewTopic] = useState('');
  const [newMethod, setNewMethod] = useState('');

  const plans = student.weeklyPlan || [];
  const completedCount = plans.filter((p) => p.completed).length;
  const totalCount = plans.length || 1;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const handleToggleCompleted = (blockId: string) => {
    const updated = plans.map((p) => {
      if (p.id === blockId) {
        const next = !p.completed;
        if (next && completedCount + 1 === totalCount) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return { ...p, completed: next };
      }
      return p;
    });

    onUpdateStudent({
      ...student,
      weeklyPlan: updated,
    });
  };

  const handleAutoGenerate = () => {
    const focus = selectedFocus === '자동 추천' ? undefined : selectedFocus;
    const generated = generateWeeklyStudyPlan(student, focus);
    onUpdateStudent({
      ...student,
      weeklyPlan: generated,
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    const updated = plans.filter((p) => p.id !== blockId);
    onUpdateStudent({
      ...student,
      weeklyPlan: updated,
    });
  };

  const handleAddBlock = () => {
    if (!newTopic.trim()) return;
    const newBlock: StudyPlanBlock = {
      id: `plan_${Date.now()}`,
      day: newDay,
      timeSlot: newTimeSlot,
      subject: newSubject,
      topic: newTopic,
      targetMethod: newMethod || '자력 풀이 및 오답 분석',
      completed: false,
    };

    onUpdateStudent({
      ...student,
      weeklyPlan: [...plans, newBlock],
    });

    setNewTopic('');
    setNewMethod('');
    setIsAddingBlock(false);
  };

  const handleCopySchedule = () => {
    const text = plans
      .map(
        (p) =>
          `[${p.day}요일 ${p.timeSlot.split(' ')[0]}] ${p.subject}: ${p.topic} (${p.targetMethod}) [${
            p.completed ? '완료' : '진행중'
          }]`
      )
      .join('\n');

    navigator.clipboard.writeText(
      `📅 [${student.name} 학생의 맞춤형 주간 학습 계획표]\n\n` + text
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const days: Array<'월' | '화' | '수' | '목' | '금' | '토' | '일'> = [
    '월',
    '화',
    '수',
    '목',
    '금',
    '토',
    '일',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Controller */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
              <CalendarDays className="w-4 h-4" />
              <span>성적 향상 맞춤형 주간 학습 스케줄러</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {student.name} 학생 전용 7일 집중 학습 플래너
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              취약 과목의 우선 배치와 3회독 누적 복습 주기가 자동 반영된 실천형 계획표입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600 pl-2">집중 과목:</span>
              <select
                value={selectedFocus}
                onChange={(e) => setSelectedFocus(e.target.value)}
                className="bg-transparent font-bold text-slate-800 pr-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="자동 추천">AI 취약과목 자동추천</option>
                {student.studyHours.map((sh) => (
                  <option key={sh.subject} value={sh.subject}>
                    {sh.subject} 집중
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAutoGenerate}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>계획표 자동 생성</span>
            </button>

            <button
              onClick={() => setIsAddingBlock(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>직접 추가</span>
            </button>

            <button
              onClick={handleCopySchedule}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '복사 완료' : '플래너 복사'}</span>
            </button>
          </div>
        </div>

        {/* Weekly Completion Progress */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>이번 주 학습 과제 달성률</span>
            </span>
            <span className="font-extrabold text-blue-600 text-sm">
              {completedCount} / {totalCount} 완료 ({completionRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Block Inline Modal */}
      {isAddingBlock && (
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-blue-900">새 학습 일정 추가</h3>
            <button
              onClick={() => setIsAddingBlock(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">요일</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}요일
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">시간대</label>
              <select
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="오전 (09:00~12:00)">오전 (09:00~12:00)</option>
                <option value="오후 (13:30~17:30)">오후 (13:30~17:30)</option>
                <option value="야간 (19:00~23:00)">야간 (19:00~23:00)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">과목</label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="예: 수학, 영어"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
              >
              </input>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">구체적 학습 목표</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="예: 수열 귀납법 10제 풀이"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <input
              type="text"
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              placeholder="구체적 실천법 (예: 해설지 10분 금지 후 자력 풀이)"
              className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium mr-3"
            />
            <button
              onClick={handleAddBlock}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
            >
              계획표에 추가
            </button>
          </div>
        </div>
      )}

      {/* 7-Days Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {days.map((day) => {
          const dayPlans = plans.filter((p) => p.day === day);

          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Day Header */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    day === '토' || day === '일'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                        day === '일'
                          ? 'bg-red-100 text-red-700'
                          : day === '토'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {day}
                    </span>
                    <span className="font-bold text-sm text-slate-800">{day}요일</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {dayPlans.filter((p) => p.completed).length} / {dayPlans.length} 완료
                  </span>
                </div>

                {/* Day Blocks */}
                <div className="p-3 space-y-2.5">
                  {dayPlans.map((block) => (
                    <div
                      key={block.id}
                      className={`p-3 rounded-xl border transition-all ${
                        block.completed
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleToggleCompleted(block.id)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            {block.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              block.subject.includes('수학')
                                ? 'bg-blue-100 text-blue-800'
                                : block.subject.includes('국어')
                                ? 'bg-orange-100 text-orange-800'
                                : block.subject.includes('영어')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {block.subject}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pl-5">
                        <p
                          className={`text-xs font-bold leading-snug ${
                            block.completed
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {block.topic}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          🎯 {block.targetMethod}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
                          ⏰ {block.timeSlot}
                        </span>
                      </div>
                    </div>
                  ))}

                  {dayPlans.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      등록된 일정이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
