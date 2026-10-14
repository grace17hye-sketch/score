import React, { useState } from 'react';
import { StudentProfile, NotificationLog } from './types';
import { INITIAL_STUDENTS } from './data/mockData';
import { Header } from './components/Header';
import { StudentProfileBanner, ActiveTab } from './components/StudentProfileBanner';
import { ScoreDashboard } from './components/ScoreDashboard';
import { StudyTimeAnalysis } from './components/StudyTimeAnalysis';
import { StudyPlanSchedule } from './components/StudyPlanSchedule';
import { HabitDiagnosticModal } from './components/HabitDiagnosticModal';
import { SemesterReportModal } from './components/SemesterReportModal';
import { ParentNotificationModal } from './components/ParentNotificationModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AiCounselorChat } from './components/AiCounselorChat';

export default function App() {
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [currentStudentId, setCurrentStudentId] = useState<string>(
    INITIAL_STUDENTS[0].id
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('scores');

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHabitOpen, setIsHabitOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Notification logs
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([
    {
      id: 'log_seed_1',
      studentId: 'std_01',
      studentName: '김서연',
      parentName: '이지은',
      recipient: '010-3849-2910',
      channel: 'SMS / 알림톡',
      message: '[EduCare AI] 김서연 학생 1학기 기말고사 성적 분석 및 4주 맞춤 학습 로드맵...',
      sentAt: '2025-07-09 오후 04:30',
      status: 'success',
    },
  ]);

  const currentStudent =
    students.find((s) => s.id === currentStudentId) || students[0];

  const handleUpdateStudent = (updatedStudent: StudentProfile) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleAddStudent = (newStudent: StudentProfile) => {
    setStudents((prev) => [newStudent, ...prev]);
    setCurrentStudentId(newStudent.id);
  };

  const handleAddNotificationLog = (log: NotificationLog) => {
    setNotificationLogs((prev) => [log, ...prev]);
  };

  const handleGeneratePlanWithFocus = (subject: string) => {
    setActiveTab('weekly-plan');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Navigation Header */}
      <Header
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={(s) => setCurrentStudentId(s.id)}
        onAddNewStudent={() => setIsAddStudentOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenHabits={() => setIsHabitOpen(true)}
        onOpenPlan={() => setActiveTab('weekly-plan')}
        onOpenNotification={() => setIsNotificationOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Student Profile Banner & Tab Switcher */}
        <StudentProfileBanner
          student={currentStudent}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab 1: Score Dashboard */}
        {activeTab === 'scores' && (
          <ScoreDashboard
            student={currentStudent}
            onUpdateStudent={handleUpdateStudent}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {/* Tab 2: Study Time & Efficiency Analysis */}
        {activeTab === 'study-time' && (
          <StudyTimeAnalysis
            student={currentStudent}
            onUpdateStudent={handleUpdateStudent}
            onGeneratePlanWithFocus={handleGeneratePlanWithFocus}
          />
        )}

        {/* Tab 3: Weekly Study Plan Schedule */}
        {activeTab === 'weekly-plan' && (
          <StudyPlanSchedule
            student={currentStudent}
            onUpdateStudent={handleUpdateStudent}
          />
        )}

        {/* Tab 4: Habit Diagnostic Results & Survey trigger */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {currentStudent.name} 학생의 자기주도 학습 습관 진단서
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  몰입도, 시간 관리, 오답 복습, 시험 불안, 디지털 통제 5대 역량 평가
                </p>
              </div>
              <button
                onClick={() => setIsHabitOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                진단 설문 검사 참여 / 수정하기
              </button>
            </div>

            {currentStudent.habitResult ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
                    <span className="text-xs font-semibold text-purple-700 block">종합 진단 점수</span>
                    <span className="text-3xl font-black text-purple-900 mt-1 block">
                      {currentStudent.habitResult.totalScore}점
                    </span>
                    <span className="text-xs font-bold text-purple-800">
                      {currentStudent.habitResult.overallGrade}
                    </span>
                  </div>

                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 md:col-span-2">
                    <span className="text-xs font-bold text-emerald-900 block mb-1">
                      핵심 강점 분석
                    </span>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      {currentStudent.habitResult.keyStrengths.map((str, i) => (
                        <li key={i}>• {str}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentStudent.habitResult.categoryScores.map((cat) => (
                    <div
                      key={cat.categoryKey}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">{cat.category}</span>
                        <span className="font-extrabold text-sm text-purple-700">{cat.score}점</span>
                      </div>
                      <p className="text-xs text-slate-600">{cat.comment}</p>
                      <p className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-lg font-medium">
                        💡 {cat.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-500 text-sm mb-4">
                  아직 학습 습관 설문이 완료되지 않았습니다.
                </p>
                <button
                  onClick={() => setIsHabitOpen(true)}
                  className="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  지금 15문항 검사 시작하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: AI Counselor Mentoring Chamber */}
        {activeTab === 'ai-counselor' && (
          <AiCounselorChat student={currentStudent} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduCare AI © 2026 스마트 성적 상담 및 맞춤형 학습 케어 시스템</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Google Sheets & Google Chat 연동 지원</span>
            <span>Gemini AI 입시 상담 엔진</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SemesterReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        student={currentStudent}
        onOpenParentNotification={() => setIsNotificationOpen(true)}
      />

      <HabitDiagnosticModal
        isOpen={isHabitOpen}
        onClose={() => setIsHabitOpen(false)}
        student={currentStudent}
        onUpdateStudent={handleUpdateStudent}
      />

      <ParentNotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        student={currentStudent}
        notificationLogs={notificationLogs}
        onAddLog={handleAddNotificationLog}
      />

      <GoogleWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        student={currentStudent}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
}
