import React, { useState } from 'react';
import {
  StudentProfile,
} from '../types';
import {
  generateScoreTrendReport,
  ScoreTrendReport,
} from '../services/counselingEngine';
import {
  X,
  Printer,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Share2,
  FileText,
  Send,
} from 'lucide-react';

interface SemesterReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onOpenParentNotification: () => void;
}

export const SemesterReportModal: React.FC<SemesterReportModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenParentNotification,
}) => {
  const [prevTermIdx, setPrevTermIdx] = useState<number>(0);
  const [currTermIdx, setCurrTermIdx] = useState<number>(
    Math.max(0, student.exams.length - 1)
  );

  if (!isOpen) return null;

  const report: ScoreTrendReport = generateScoreTrendReport(
    student,
    prevTermIdx,
    currTermIdx
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header - Not printed */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                학기별 성적 변화 추이 종합 분석 레포트
              </h2>
              <p className="text-xs text-slate-500">
                이전 시험 대비 과목별 성장 지표 및 향후 학습 처방
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>레포트 인쇄 / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0">
          {/* Term Comparison Selector - hidden when printing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-bold text-slate-700">비교 기준:</span>
              <select
                value={prevTermIdx}
                onChange={(e) => setPrevTermIdx(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              >
                {student.exams.map((ex, idx) => (
                  <option key={ex.id} value={idx}>
                    이전: {ex.termName}
                  </option>
                ))}
              </select>

              <span className="text-slate-400 font-bold">➔</span>

              <select
                value={currTermIdx}
                onChange={(e) => setCurrTermIdx(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              >
                {student.exams.map((ex, idx) => (
                  <option key={ex.id} value={idx}>
                    현재: {ex.termName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenParentNotification();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>학부모 알림 발송하기</span>
            </button>
          </div>

          {/* Official Report Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Academic Performance Growth Report
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {student.name} 학생 성적 변화 추이 분석서
                </h1>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>소속: {student.gradeLevel} ({student.track})</p>
                <p>목표: {student.targetUniversity} {student.targetMajor}</p>
                <p className="font-semibold text-slate-700">발급일자: {new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>

          {/* Comparison KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block">이전 시험 평균</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">
                {report.previousAvg}점
              </span>
              <span className="text-xs text-slate-500 font-medium">{report.previousGradeAvg}등급</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 block">현재 시험 평균</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">
                {report.currentAvg}점
              </span>
              <span className="text-xs text-slate-500 font-medium">{report.currentGradeAvg}등급</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              report.avgDelta >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <span className="text-xs font-semibold block text-slate-600">평균 점수 변동</span>
              <div className="flex items-center space-x-1 mt-1">
                {report.avgDelta > 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : report.avgDelta < 0 ? (
                  <ArrowDownRight className="w-5 h-5 text-rose-600" />
                ) : (
                  <Minus className="w-5 h-5 text-slate-400" />
                )}
                <span className={`text-2xl font-black ${
                  report.avgDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {report.avgDelta > 0 ? `+${report.avgDelta}` : report.avgDelta}점
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {report.avgDelta >= 4 ? '대폭 상승 궤도' : report.avgDelta > 0 ? '점진적 상승' : '보합/정체'}
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <span className="text-xs text-blue-700 font-semibold block">등급 변화 지수</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {report.gradeDelta > 0 ? `+${report.gradeDelta}` : report.gradeDelta}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">
                {report.gradeDelta > 0 ? '전체 등급 향상' : '등급 유지'}
              </span>
            </div>
          </div>

          {/* Subject-by-Subject Delta Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">
                과목별 세부 성적 변동 내역
              </h3>
              <span className="text-xs text-slate-500">
                {report.previousTermName} ➔ {report.currentTermName}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">과목</th>
                  <th className="py-3 px-3">이전 점수</th>
                  <th className="py-3 px-3">현재 점수</th>
                  <th className="py-3 px-3">점수 변동</th>
                  <th className="py-3 px-3">등급 변동</th>
                  <th className="py-3 px-4">상세 분석 및 코멘트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.subjectDeltas.map((sd) => (
                  <tr key={sd.subject} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm">
                      {sd.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {sd.prevScore}점 ({sd.prevGrade}등급)
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {sd.currScore}점 ({sd.currGrade}등급)
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                          sd.scoreDelta > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : sd.scoreDelta < 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sd.scoreDelta > 0 ? `+${sd.scoreDelta}점` : `${sd.scoreDelta}점`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {sd.prevGrade}등급 ➔ <span className="font-bold text-blue-600">{sd.currGrade}등급</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {sd.trendComment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overall Counselor Diagnosis */}
          <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 space-y-2">
            <h3 className="font-bold text-sm text-indigo-950 flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>종합 성장 진단 및 전문가 소견</span>
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              {report.overallDiagnosis}
            </p>
          </div>

          {/* 4 Core Prescriptions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>다음 시험 1등급 도약을 위한 4대 처방전</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.prescription.map((rx, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed"
                >
                  <span className="font-bold text-slate-900 block mb-1">
                    처방 {idx + 1}. {rx.split(':')[0]}
                  </span>
                  <p>{rx.split(':')[1] || rx}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
