import React, { useState } from 'react';
import {
  StudentProfile,
  SubjectStudyTime,
} from '../types';
import {
  analyzeStudyEfficiency,
  EfficiencyMatrixItem,
} from '../services/counselingEngine';
import {
  Clock,
  Compass,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudyTimeAnalysisProps {
  student: StudentProfile;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
  onGeneratePlanWithFocus: (subject: string) => void;
}

export const StudyTimeAnalysis: React.FC<StudyTimeAnalysisProps> = ({
  student,
  onUpdateStudent,
  onGeneratePlanWithFocus,
}) => {
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [selfHours, setSelfHours] = useState<number>(10);
  const [lectureHours, setLectureHours] = useState<number>(4);

  const efficiencyItems: EfficiencyMatrixItem[] = analyzeStudyEfficiency(student);

  const totalSelfHours = student.studyHours.reduce((acc, sh) => acc + sh.selfStudyHours, 0);
  const totalLectureHours = student.studyHours.reduce((acc, sh) => acc + sh.lectureHours, 0);
  const totalWeeklyHours = totalSelfHours + totalLectureHours;
  const selfRatio = totalWeeklyHours > 0 ? Math.round((totalSelfHours / totalWeeklyHours) * 100) : 0;

  const handleStartEdit = (sh: SubjectStudyTime) => {
    setEditingSubject(sh.subject);
    setSelfHours(sh.selfStudyHours);
    setLectureHours(sh.lectureHours);
  };

  const handleSaveHours = (subject: string) => {
    const updated = student.studyHours.map((sh) => {
      if (sh.subject === subject) {
        const total = Number(selfHours) + Number(lectureHours);
        return {
          ...sh,
          selfStudyHours: Number(selfHours),
          lectureHours: Number(lectureHours),
          totalWeeklyHours: total,
        };
      }
      return sh;
    });

    onUpdateStudent({
      ...student,
      studyHours: updated,
    });
    setEditingSubject(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Hours & Self-study Ratio */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>주간 학습 시간 및 순공 집중도 진단</span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight">
              {student.name} 학생의 주간 총 학습량: <span className="text-amber-400">{totalWeeklyHours}시간</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              자기주도 자율학습(순공) {totalSelfHours}시간 • 학원 및 인터넷 강의 {totalLectureHours}시간
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
            <div>
              <span className="text-[11px] text-slate-300 block">순수 자율학습 비중</span>
              <span className="text-2xl font-black text-emerald-400">{selfRatio}%</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-xs text-slate-200">
              {selfRatio >= 60 ? (
                <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>황금 순공 비율 달성</span>
                </span>
              ) : (
                <span className="text-amber-300 font-semibold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>인강 과다, 자습 증대 권고</span>
                </span>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">상위권 권장: 60% 이상</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Efficiency Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>학습 시간 대비 성취도(효율성) 4분면 매트릭스</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              투자한 시간에 비해 점수가 나오는지, 아니면 학습법 교정이나 시간 증대가 필요한지 진단합니다.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            효율성 지수 분석
          </span>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: 고효율 유지 */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-emerald-950">1사분면: 고효율 유지 (High Efficiency)</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                적은 시간 • 고득점
              </span>
            </div>
            <p className="text-xs text-emerald-800 mb-3">
              개념 이해도가 높고 핵심을 빠르게 파악합니다. 무리한 시간 추가보다 킬러 1~2제 감 유지를 권장합니다.
            </p>
            <div className="space-y-1.5">
              {efficiencyItems.filter((i) => i.quadrant === '고효율 유지').map((item) => (
                <div
                  key={item.subject}
                  className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{item.subject}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">주 {item.weeklyHours}시간</span>
                    <span className="font-bold text-emerald-700">{item.rawScore}점</span>
                  </div>
                </div>
              ))}
              {efficiencyItems.filter((i) => i.quadrant === '고효율 유지').length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">해당 과목 없음</p>
              )}
            </div>
          </div>

          {/* Quadrant 2: 비효율 정체 - 학습법 교정 요망 */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-amber-950">2사분면: 비효율 정체 (집중 교정 요망)</h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                많은 시간 • 점수 정체
              </span>
            </div>
            <p className="text-xs text-amber-900 mb-3">
              시간을 많이 쏟는데 점수가 안 오르는 상태입니다. 인강 눈팅이나 해설지 조기 열람 등 수동적 공부법 교정 필수!
            </p>
            <div className="space-y-1.5">
              {efficiencyItems.filter((i) => i.quadrant === '비효율 정체(학습법 교정)').map((item) => (
                <div
                  key={item.subject}
                  className="bg-white/80 p-2.5 rounded-lg border border-amber-300 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.subject}</span>
                    <span className="text-[10px] text-amber-700 ml-1.5 font-medium">⚠️ 학습법 전면 혁신</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">주 {item.weeklyHours}시간 투입</span>
                    <span className="font-bold text-amber-700">{item.rawScore}점</span>
                  </div>
                </div>
              ))}
              {efficiencyItems.filter((i) => i.quadrant === '비효율 정체(학습법 교정)').length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">해당 과목 없음</p>
              )}
            </div>
          </div>

          {/* Quadrant 3: 투입 부족 - 절대시간 확보 */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-bold text-sm text-rose-950">3사분면: 투입 부족 (절대시간 확보 필수)</h3>
              </div>
              <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                적은 시간 • 점수 낮음
              </span>
            </div>
            <p className="text-xs text-rose-800 mb-3">
              절대적인 자습 시간이 부족하여 개념이 휘발되고 있습니다. 주간 자율학습 시간을 주 3~5시간 이상 즉각 증대해야 합니다.
            </p>
            <div className="space-y-1.5">
              {efficiencyItems.filter((i) => i.quadrant === '투입 부족(시간 확보)').map((item) => (
                <div
                  key={item.subject}
                  className="bg-white/80 p-2.5 rounded-lg border border-rose-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{item.subject}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">주 {item.weeklyHours}시간 (권장: {item.recommendedWeeklyHours}시간)</span>
                    <span className="font-bold text-rose-600">{item.rawScore}점</span>
                  </div>
                </div>
              ))}
              {efficiencyItems.filter((i) => i.quadrant === '투입 부족(시간 확보)').length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">해당 과목 없음</p>
              )}
            </div>
          </div>

          {/* Quadrant 4: 안정적 성장 */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="font-bold text-sm text-blue-950">4사분면: 안정적 성장 (Steady Progress)</h3>
              </div>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                적정 투입 • 비례 성장
              </span>
            </div>
            <p className="text-xs text-blue-800 mb-3">
              공부한 만큼 정직하게 성적이 나오는 안정권입니다. 단원별 오답 누적 복습으로 상위 등급 도약을 노리세요.
            </p>
            <div className="space-y-1.5">
              {efficiencyItems.filter((i) => i.quadrant === '안정적 성장').map((item) => (
                <div
                  key={item.subject}
                  className="bg-white/80 p-2.5 rounded-lg border border-blue-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{item.subject}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">주 {item.weeklyHours}시간</span>
                    <span className="font-bold text-blue-600">{item.rawScore}점</span>
                  </div>
                </div>
              ))}
              {efficiencyItems.filter((i) => i.quadrant === '안정적 성장').length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">해당 과목 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customized Study Strategy Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>과목별 맞춤형 공부 전략 & 솔루션 처방</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              학습시간과 성취도를 종합 분석하여 도출된 과목별 핵심 공부 행동 지침입니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {student.studyHours.map((sh) => {
            const eff = efficiencyItems.find((e) => e.subject === sh.subject);
            const isEditing = editingSubject === sh.subject;

            return (
              <div
                key={sh.subject}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {sh.subject.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{sh.subject}</h3>
                        <span className="text-xs text-slate-500">
                          주간 총 {sh.totalWeeklyHours}시간 (순공 {sh.selfStudyHours}h + 강의 {sh.lectureHours}h)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {eff && (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            eff.quadrant === '고효율 유지'
                              ? 'bg-emerald-100 text-emerald-800'
                              : eff.quadrant === '비효율 정체(학습법 교정)'
                              ? 'bg-amber-100 text-amber-900'
                              : eff.quadrant === '투입 부족(시간 확보)'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {eff.quadrant}
                        </span>
                      )}
                      <button
                        onClick={() => (isEditing ? handleSaveHours(sh.subject) : handleStartEdit(sh))}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                        title="학습시간 수정"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline hours editing */}
                  {isEditing && (
                    <div className="my-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">자율학습(h)</label>
                        <input
                          type="number"
                          value={selfHours}
                          onChange={(e) => setSelfHours(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">학원/인강(h)</label>
                        <input
                          type="number"
                          value={lectureHours}
                          onChange={(e) => setLectureHours(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveHours(sh.subject)}
                        className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                      >
                        반영
                      </button>
                    </div>
                  )}

                  {/* Diagnosis & Strategy */}
                  <div className="mt-3.5 space-y-2.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">
                        🔍 현재 문제점 및 진단
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {sh.difficultyNote || eff?.diagnosis}
                      </p>
                    </div>

                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <span className="font-bold text-blue-900 block mb-1 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>맞춤형 처방 전략</span>
                      </span>
                      <p className="text-blue-950 leading-relaxed font-medium">
                        {eff?.strategy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA to plan */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    추천 자습시간: 주 {eff?.recommendedWeeklyHours || sh.selfStudyHours}시간
                  </span>
                  <button
                    onClick={() => onGeneratePlanWithFocus(sh.subject)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>이 과목 집중 계획표 생성</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
