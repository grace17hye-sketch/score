export interface SubjectScore {
  id: string;
  subject: string; // 국어, 수학, 영어, 한국사, 탐구1, 탐구2 등
  rawScore: number; // 0 ~ 100
  grade: number; // 1 ~ 9등급
  standardScore?: number; // 표준점수
  percentile?: number; // 백분위
  rankClass?: number; // 반 석차
  rankTotal?: number; // 전교 석차
  targetScore: number; // 목표 점수
  feedback?: string;
}

export interface ExamTerm {
  id: string;
  termName: string; // e.g. "2025학년도 1학기 중간고사", "2025학년도 1학기 기말고사", "2025학년도 2학기 중간고사"
  date: string;
  scores: SubjectScore[];
}

export interface SubjectStudyTime {
  subject: string;
  selfStudyHours: number; // 주간 자율 학습 시간 (hours/week)
  lectureHours: number; // 주간 학원/인강 시간 (hours/week)
  totalWeeklyHours: number;
  studyMethod: string; // 현재 공부 방식 요약
  difficultyNote: string; // 학생이 느끼는 어려움
}

export interface HabitQuestion {
  id: number;
  category: 'concentration' | 'timeManagement' | 'review' | 'anxiety' | 'digital';
  categoryLabel: string;
  question: string;
}

export interface HabitSurveyResponse {
  [questionId: number]: number; // 1 to 5 scale
}

export interface HabitCategoryScore {
  category: string;
  categoryKey: string;
  score: number; // 0 ~ 100
  status: '최우수' | '우수' | '양호' | '개선필요' | '위험';
  comment: string;
  tip: string;
}

export interface HabitDiagnosisResult {
  totalScore: number; // 0 ~ 100
  overallGrade: string;
  categoryScores: HabitCategoryScore[];
  keyStrengths: string[];
  keyWeaknesses: string[];
  recommendedActions: string[];
  surveyDate: string;
}

export interface StudyPlanBlock {
  id: string;
  day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
  timeSlot: '오전 (09:00~12:00)' | '오후 (13:30~17:30)' | '야간 (19:00~23:00)';
  subject: string;
  topic: string;
  targetMethod: string;
  completed: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  gradeLevel: string; // e.g., "고등학교 2학년"
  track: '인문계열' | '자연계열' | '예체능/자율';
  targetMajor: string; // e.g., "컴퓨터공학과", "경영학과"
  targetUniversity: string; // e.g., "연세대학교", "고려대학교"
  parentName: string;
  parentPhone: string;
  parentChatSpace?: string; // Optional Google Chat space
  notes: string;
  exams: ExamTerm[];
  studyHours: SubjectStudyTime[];
  habitResult?: HabitDiagnosisResult;
  weeklyPlan: StudyPlanBlock[];
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  recipient: string;
  channel: 'Google Chat' | 'SMS / 알림톡';
  message: string;
  sentAt: string;
  status: 'success' | 'failed';
  spaceName?: string;
}
