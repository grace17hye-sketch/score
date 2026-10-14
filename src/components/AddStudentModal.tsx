import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { X, UserPlus, GraduationCap, Target } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: StudentProfile) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('고등학교 2학년');
  const [track, setTrack] = useState<'인문계열' | '자연계열' | '예체능/자율'>('자연계열');
  const [targetUniversity, setTargetUniversity] = useState('서울대학교');
  const [targetMajor, setTargetMajor] = useState('컴퓨터공학부');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('010-1234-5678');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentProfile = {
      id: `std_${Date.now()}`,
      name: name.trim(),
      gradeLevel,
      track,
      targetUniversity: targetUniversity.trim() || '목표 대학 미정',
      targetMajor: targetMajor.trim() || '목표 학과 미정',
      parentName: parentName.trim() || '학부모',
      parentPhone: parentPhone.trim() || '010-0000-0000',
      notes: notes.trim(),
      exams: [
        {
          id: `term_${Date.now()}_1`,
          termName: '2025학년도 1학기 중간고사',
          date: '2025-05-02',
          scores: [
            { id: `sc_${Date.now()}_1`, subject: '국어', rawScore: 85, grade: 2, targetScore: 92, feedback: '문학 개념 점검' },
            { id: `sc_${Date.now()}_2`, subject: '수학', rawScore: 80, grade: 3, targetScore: 90, feedback: '계산 실수 방지' },
            { id: `sc_${Date.now()}_3`, subject: '영어', rawScore: 88, grade: 2, targetScore: 95, feedback: '단어 암기 유지' },
            { id: `sc_${Date.now()}_4`, subject: '탐구1', rawScore: 82, grade: 3, targetScore: 90, feedback: '개념 완성' },
          ],
        },
        {
          id: `term_${Date.now()}_2`,
          termName: '2025학년도 1학기 기말고사',
          date: '2025-07-08',
          scores: [
            { id: `sc_${Date.now()}_5`, subject: '국어', rawScore: 89, grade: 2, targetScore: 92, feedback: '비문학 독해 향상' },
            { id: `sc_${Date.now()}_6`, subject: '수학', rawScore: 86, grade: 2, targetScore: 90, feedback: '킬러 오답 클리닉' },
            { id: `sc_${Date.now()}_7`, subject: '영어', rawScore: 91, grade: 1, targetScore: 95, feedback: '1등급 진입' },
            { id: `sc_${Date.now()}_8`, subject: '탐구1', rawScore: 87, grade: 2, targetScore: 90, feedback: '성적 상승' },
          ],
        },
      ],
      studyHours: [
        { subject: '수학', selfStudyHours: 12, lectureHours: 5, totalWeeklyHours: 17, studyMethod: '유형서 및 기출 반복', difficultyNote: '준킬러 문항 시간 단축' },
        { subject: '영어', selfStudyHours: 6, lectureHours: 3, totalWeeklyHours: 9, studyMethod: '매일 어휘 30개 및 구문 독해', difficultyNote: '빈칸 추론 지문 논리' },
        { subject: '국어', selfStudyHours: 6, lectureHours: 2, totalWeeklyHours: 8, studyMethod: '기출 분석 및 갈래별 특징', difficultyNote: '비문학 정보 처리' },
        { subject: '탐구1', selfStudyHours: 5, lectureHours: 2, totalWeeklyHours: 7, studyMethod: '개념 단권화 및 기출', difficultyNote: '도표/실험 분석' },
      ],
      weeklyPlan: [
        { id: `wp_${Date.now()}_1`, day: '월', timeSlot: '야간 (19:00~23:00)', subject: '수학', topic: '취약 단원 기출 10제', targetMethod: '자력 풀이 및 오답 분석', completed: false },
        { id: `wp_${Date.now()}_2`, day: '화', timeSlot: '야간 (19:00~23:00)', subject: '국어', topic: '비문학 2지문 구조독해', targetMethod: '핵심어 및 문단 관계도 작성', completed: false },
      ],
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">새 상담 학생 등록</h2>
              <p className="text-xs text-slate-500">학생 기본 인적사항 및 목표를 입력합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">학생 성명 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 최다은"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-blue-500 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">학년</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                <option value="고등학교 1학년">고등학교 1학년</option>
                <option value="고등학교 2학년">고등학교 2학년</option>
                <option value="고등학교 3학년">고등학교 3학년</option>
                <option value="중학교 3학년">중학교 3학년</option>
                <option value="N수생/재수생">N수생/재수생</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">계열</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                <option value="자연계열">자연계열 (이과)</option>
                <option value="인문계열">인문계열 (문과)</option>
                <option value="예체능/자율">예체능 / 자율전공</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">학부모 성함</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="예: 최진호"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">목표 대학</label>
              <input
                type="text"
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="예: 서울대학교"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">목표 학과</label>
              <input
                type="text"
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="예: 생명공학부"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">학부모 연락처</label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">상담 메모 및 특이사항</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="학생의 성향, 주요 고민, 진로 희망 등"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
            >
              학생 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
