import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  FileSpreadsheet,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle2,
  LogOut,
  Sparkles,
  Plus,
} from 'lucide-react';
import { StudentProfile } from '../types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import { User } from 'firebase/auth';

interface HeaderProps {
  students: StudentProfile[];
  currentStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
  onAddNewStudent: () => void;
  onOpenReport: () => void;
  onOpenHabits: () => void;
  onOpenPlan: () => void;
  onOpenNotification: () => void;
  onOpenWorkspace: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onAddNewStudent,
  onOpenReport,
  onOpenHabits,
  onOpenPlan,
  onOpenNotification,
  onOpenWorkspace,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('로그인 실패:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  EduCare AI
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  성적 상담 솔루션
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                성적 추이 분석 • 학습시간 진단 • AI 맞춤 로드맵 • 학부모 알림
              </p>
            </div>
          </div>

          {/* Student Selector */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Users className="w-4 h-4 text-slate-500 ml-2" />
              <select
                value={currentStudent.id}
                onChange={(e) => {
                  const found = students.find((s) => s.id === e.target.value);
                  if (found) onSelectStudent(found);
                }}
                className="bg-transparent text-sm font-medium text-slate-800 py-1 px-2.5 focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.gradeLevel} / {s.track})
                  </option>
                ))}
              </select>
              <button
                onClick={onAddNewStudent}
                title="새 학생 등록"
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="hidden lg:flex items-center space-x-1.5 ml-2">
              <button
                onClick={onOpenReport}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>성적추이 레포트</span>
              </button>
              <button
                onClick={onOpenHabits}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-purple-600 hover:bg-slate-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>습관 진단</span>
              </button>
              <button
                onClick={onOpenPlan}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>주간 계획표</span>
              </button>
              <button
                onClick={onOpenNotification}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>학부모 알림</span>
              </button>
              <button
                onClick={onOpenWorkspace}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-slate-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sheets 연동</span>
              </button>
            </div>

            {/* Google Sign-in / Workspace Status (Mandatory official styling) */}
            <div className="ml-3 flex items-center">
              {user ? (
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-full text-xs">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <span className="font-medium text-slate-700 max-w-[100px] truncate hidden md:inline">
                    {user.displayName || user.email}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Workspace 연동 활성" />
                  <button
                    onClick={handleSignOut}
                    title="로그아웃"
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? '로그인 중...' : 'Google 로그인'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
