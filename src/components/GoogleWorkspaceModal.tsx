import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  createAndExportStudentSheet,
  ExportResult,
} from '../services/googleSheets';
import {
  getAccessToken,
  googleSignIn,
} from '../services/firebaseAuth';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOpen) return null;

  const handlePromptExport = async () => {
    setErrorMessage(null);
    const token = await getAccessToken();
    if (!token) {
      try {
        await googleSignIn();
      } catch (err: any) {
        setErrorMessage('Google 계정 로그인이 취소되었거나 실패했습니다.');
        return;
      }
    }
    // Show mandatory confirmation modal before creating/writing spreadsheet
    setShowConfirmModal(true);
  };

  const handleExecuteExport = async () => {
    setShowConfirmModal(false);
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const result = await createAndExportStudentSheet(student);
      setExportResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || '스프레드시트 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Google Sheets 성적 데이터 동기화
              </h2>
              <p className="text-xs text-slate-500">
                학생의 전체 시험 기록 및 학습시간을 구글 스프레드시트에 내보냅니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info card */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
          <p className="font-bold flex items-center space-x-1.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>생성되는 시트 구조 (2개 탭)</span>
          </p>
          <ul className="space-y-1 pl-5 list-disc text-emerald-900">
            <li><strong>'성적 현황' 탭:</strong> {student.name} 학생의 전 학기 시험 성적, 등급, 석차 및 과목별 피드백</li>
            <li><strong>'과목별 학습시간 및 전략' 탭:</strong> 순공 시간, 인강 시간, 4분면 진단 및 습관 검사 요약</li>
          </ul>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Success view */}
        {exportResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Google Sheets 생성이 완료되었습니다!</span>
            </div>
            <p className="text-xs text-emerald-700">
              구글 드라이브 내 새 스프레드시트가 정상적으로 작성되었습니다. 아래 링크를 통해 바로 확인하실 수 있습니다.
            </p>
            <a
              href={exportResult.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>스프레드시트 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handlePromptExport}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>시트 생성 및 데이터 기록 중...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>내 Google Sheets에 내보내기</span>
              </>
            )}
          </button>
        </div>

        {/* Mandatory Confirmation Modal for Workspace Data Write */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Google Sheets 파일 생성 확인
                  </h3>
                  <p className="text-xs text-slate-500">Google Workspace API 작업 확인</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 leading-relaxed">
                <p>
                  <strong>파일명:</strong> [EduCare] {student.name} 학생 성적 및 학습 상담 리포트
                </p>
                <p>
                  <strong>대상 데이터:</strong> {student.name} 학생의 시험 성적 {student.exams.length}건, 과목별 학습시간 및 습관 진단 데이터
                </p>
                <p className="text-slate-500 pt-1">
                  사용자의 Google Drive 계정에 위 새 스프레드시트를 생성하고 데이터를 기록하시겠습니까?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleExecuteExport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  확인 및 생성
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
