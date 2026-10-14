import React, { useState } from 'react';
import {
  StudentProfile,
  SubjectScore,
  ExamTerm,
} from '../types';
import {
  TrendingUp,
  BarChart,
  Radar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';

interface ScoreDashboardProps {
  student: StudentProfile;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
  onOpenReport: () => void;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  student,
  onUpdateStudent,
  onOpenReport,
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string>(
    student.exams[student.exams.length - 1]?.id || ''
  );
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SubjectScore>>({});
  const [isAddingScore, setIsAddingScore] = useState(false);
  const [newScoreSubject, setNewScoreSubject] = useState('국어');
  const [newScoreRaw, setNewScoreRaw] = useState(85);
  const [newScoreTarget, setNewScoreTarget] = useState(90);

  const currentExam =
    student.exams.find((e) => e.id === selectedTermId) ||
    student.exams[student.exams.length - 1];

  const handleStartEdit = (score: SubjectScore) => {
    setEditingScoreId(score.id);
    setEditFormData({ ...score });
  };

  const handleSaveEdit = () => {
    if (!editingScoreId || !currentExam) return;

    const updatedScores = currentExam.scores.map((sc) => {
      if (sc.id === editingScoreId) {
        const rawScore = Number(editFormData.rawScore ?? sc.rawScore);
        const targetScore = Number(editFormData.targetScore ?? sc.targetScore);
        // Estimate grade based on rawScore if not edited
        let grade = editFormData.grade ?? sc.grade;
        if (editFormData.rawScore !== undefined && editFormData.grade === undefined) {
          if (rawScore >= 90) grade = 1;
          else if (rawScore >= 80) grade = 2;
          else if (rawScore >= 70) grade = 3;
          else if (rawScore >= 60) grade = 4;
          else grade = 5;
        }

        return {
          ...sc,
          ...editFormData,
          rawScore,
          targetScore,
          grade,
        };
      }
      return sc;
    });

    const updatedExams = student.exams.map((ex) =>
      ex.id === currentExam.id ? { ...ex, scores: updatedScores } : ex
    );

    onUpdateStudent({
      ...student,
      exams: updatedExams,
    });

    setEditingScoreId(null);
  };

  const handleDeleteScore = (scoreId: string) => {
    if (!currentExam) return;
    const updatedScores = currentExam.scores.filter((sc) => sc.id !== scoreId);
    const updatedExams = student.exams.map((ex) =>
      ex.id === currentExam.id ? { ...ex, scores: updatedScores } : ex
    );
    onUpdateStudent({
      ...student,
      exams: updatedExams,
    });
  };

  const handleAddScore = () => {
    if (!currentExam) return;
    let grade = 1;
    if (newScoreRaw >= 90) grade = 1;
    else if (newScoreRaw >= 80) grade = 2;
    else if (newScoreRaw >= 70) grade = 3;
    else if (newScoreRaw >= 60) grade = 4;
    else grade = 5;

    const newScore: SubjectScore = {
      id: `sc_${Date.now()}`,
      subject: newScoreSubject,
      rawScore: Number(newScoreRaw),
      grade,
      targetScore: Number(newScoreTarget),
      feedback: '새로 추가된 과목',
    };

    const updatedExams = student.exams.map((ex) =>
      ex.id === currentExam.id
        ? { ...ex, scores: [...ex.scores, newScore] }
        : ex
    );

    onUpdateStudent({
      ...student,
      exams: updatedExams,
    });

    setIsAddingScore(false);
  };

  // Helper for Radar Chart calculations
  const renderRadarChart = () => {
    const scores = currentExam.scores;
    const total = scores.length;
    if (total < 3) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          과목이 3개 이상일 때 레이더 차트가 생성됩니다.
        </div>
      );
    }

    const size = 300;
    const center = size / 2;
    const radius = 100;

    // Axis angles
    const angleSlice = (Math.PI * 2) / total;

    // Grid circles: 20, 40, 60, 80, 100
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

    // Current scores polygon
    const currentPoints = scores.map((sc, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (sc.rawScore / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    // Target scores polygon
    const targetPoints = scores.map((sc, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (sc.targetScore / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative flex flex-col items-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background concentric polygons */}
          {gridLevels.map((lvl, idx) => {
            const pts = scores.map((_, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              const r = radius * lvl;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={pts}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          {/* Spokes */}
          {scores.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Target polygon (Amber dashed) */}
          <polygon
            points={targetPoints}
            fill="rgba(245, 158, 11, 0.08)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Current Score polygon (Blue) */}
          <polygon
            points={currentPoints}
            fill="rgba(59, 130, 246, 0.25)"
            stroke="#2563eb"
            strokeWidth="2.5"
          />

          {/* Points & Labels */}
          {scores.map((sc, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = (sc.rawScore / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            // Label position (slightly beyond radius)
            const labelR = radius + 22;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[11px] font-semibold fill-slate-700"
                >
                  {sc.subject}
                </text>
                <text
                  x={lx}
                  y={ly + 12}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-blue-600"
                >
                  {sc.rawScore}점
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center space-x-4 mt-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-medium">현재 성적</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed border-amber-500" />
            <span className="text-slate-600 font-medium">목표 성적</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper for Score Progression Trend Line Chart across all exam terms
  const renderTrendLineChart = () => {
    const exams = student.exams;
    if (exams.length < 2) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          2개 이상의 시험 성적이 등록되면 추이 곡선이 표시됩니다.
        </div>
      );
    }

    // Get unique subjects
    const subjects = Array.from(
      new Set(exams.flatMap((e) => e.scores.map((s) => s.subject)))
    );

    const colors = [
      '#2563eb', // blue
      '#dc2626', // red
      '#16a34a', // green
      '#9333ea', // purple
      '#ea580c', // orange
      '#0891b2', // cyan
    ];

    const chartWidth = 500;
    const chartHeight = 220;
    const padding = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const xStep = innerWidth / (exams.length - 1 || 1);

    return (
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
          {/* Y-axis gridlines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + innerHeight - (val / 100) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {exams.map((ex, idx) => {
            const x = padding.left + idx * xStep;
            return (
              <g key={ex.id}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#f8fafc"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-600"
                >
                  {ex.termName.replace('2025학년도 ', '')}
                </text>
              </g>
            );
          })}

          {/* Subject trend lines */}
          {subjects.map((subj, sIdx) => {
            const color = colors[sIdx % colors.length];
            const points: { x: number; y: number; score: number }[] = [];

            exams.forEach((ex, eIdx) => {
              const sc = ex.scores.find((s) => s.subject === subj);
              if (sc) {
                const x = padding.left + eIdx * xStep;
                const y = padding.top + innerHeight - (sc.rawScore / 100) * innerHeight;
                points.push({ x, y, score: sc.rawScore });
              }
            });

            if (points.length < 2) return null;

            const pathD = points
              .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
              .join(' ');

            return (
              <g key={subj}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, pIdx) => (
                  <g key={pIdx}>
                    <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="text-[10px] font-bold"
                      fill={color}
                    >
                      {p.score}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {subjects.map((subj, idx) => (
            <div key={subj} className="flex items-center space-x-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-slate-700 font-medium">{subj}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Term Selection & Report CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            조회 시험 선택:
          </label>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {student.exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.termName} ({ex.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>이전 학기 대비 성적 변화 레포트 보기</span>
          </button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Radar className="w-4 h-4 text-blue-600" />
                <span>과목별 성적 밸런스 레이더 분석</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                과목 간 성취도 균형과 목표치와의 격차를 한눈에 파악합니다.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200">
              {currentExam.termName}
            </span>
          </div>
          {renderRadarChart()}
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>시험 회차별 성적 변화 추이</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                중간고사 및 기말고사를 거치며 일어난 과목별 궤적을 확인합니다.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
              누적 추이 그래프
            </span>
          </div>
          {renderTrendLineChart()}
        </div>
      </div>

      {/* Target Gap Progress Bars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center space-x-2">
          <Target className="w-4 h-4 text-amber-500" />
          <span>과목별 목표 점수 달성률 및 Gap 분석</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          원점수와 목표 점수의 차이를 분석하여 다음 시험의 우선 공략 과목을 도출합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentExam.scores.map((sc) => {
            const gap = sc.targetScore - sc.rawScore;
            const pct = Math.min(100, Math.round((sc.rawScore / sc.targetScore) * 100));
            const isAchieved = gap <= 0;

            return (
              <div
                key={sc.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800">{sc.subject}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {sc.grade}등급
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">
                      {sc.rawScore}점 / {sc.targetScore}점
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isAchieved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isAchieved ? '목표 달성!' : `${gap}점 부족`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAchieved ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {sc.feedback && (
                  <p className="text-xs text-slate-500 mt-2 italic flex items-center space-x-1">
                    <span>💡 {sc.feedback}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editable Score Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <BarChart className="w-4 h-4 text-blue-600" />
              <span>상세 성적 내역 및 피드백 ({currentExam.termName})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              원점수, 등급, 석차, 목표 점수를 실시간으로 수정하거나 새 과목을 추가할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => setIsAddingScore(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>과목 성적 추가</span>
          </button>
        </div>

        {/* Add score inline modal */}
        {isAddingScore && (
          <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                과목명
              </label>
              <input
                type="text"
                value={newScoreSubject}
                onChange={(e) => setNewScoreSubject(e.target.value)}
                placeholder="예: 생명과학I"
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                원점수 (0~100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newScoreRaw}
                onChange={(e) => setNewScoreRaw(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm w-24 focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                목표 점수
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newScoreTarget}
                onChange={(e) => setNewScoreTarget(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm w-24 focus:outline-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2 mt-4">
              <button
                onClick={handleAddScore}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가 완료
              </button>
              <button
                onClick={() => setIsAddingScore(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">과목</th>
                <th className="py-3 px-3">원점수</th>
                <th className="py-3 px-3">등급</th>
                <th className="py-3 px-3">목표 점수</th>
                <th className="py-3 px-3">반 석차</th>
                <th className="py-3 px-3">전교 석차</th>
                <th className="py-3 px-4">취약점 및 상담 메모</th>
                <th className="py-3 px-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentExam.scores.map((sc) => {
                const isEditing = editingScoreId === sc.id;

                if (isEditing) {
                  return (
                    <tr key={sc.id} className="bg-blue-50/40">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {sc.subject}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={editFormData.rawScore ?? sc.rawScore}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              rawScore: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-1 bg-white border border-blue-400 rounded-md text-sm font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          max="9"
                          value={editFormData.grade ?? sc.grade}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              grade: Number(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1 bg-white border border-blue-400 rounded-md text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={editFormData.targetScore ?? sc.targetScore}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              targetScore: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-1 bg-white border border-blue-400 rounded-md text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={editFormData.rankClass ?? sc.rankClass ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              rankClass: Number(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-md text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={editFormData.rankTotal ?? sc.rankTotal ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              rankTotal: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-md text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editFormData.feedback ?? sc.feedback ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              feedback: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md"
                            title="저장"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingScoreId(null)}
                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sc.subject}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-blue-600 text-base">
                        {sc.rawScore}
                      </span>
                      <span className="text-xs text-slate-400 ml-0.5">점</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          sc.grade === 1
                            ? 'bg-amber-100 text-amber-800'
                            : sc.grade === 2
                            ? 'bg-blue-100 text-blue-800'
                            : sc.grade === 3
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sc.grade}등급
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {sc.targetScore}점
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {sc.rankClass ? `${sc.rankClass}등` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {sc.rankTotal ? `${sc.rankTotal}등` : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {sc.feedback || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleStartEdit(sc)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="점수 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScore(sc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
