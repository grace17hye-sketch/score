import {
  StudentProfile,
  ExamTerm,
  SubjectScore,
  HabitSurveyResponse,
  HabitDiagnosisResult,
  StudyPlanBlock,
} from '../types';
import { HABIT_QUESTIONS } from '../data/mockData';

export interface ScoreTrendReport {
  previousTermName: string;
  currentTermName: string;
  previousAvg: number;
  currentAvg: number;
  avgDelta: number;
  previousGradeAvg: number;
  currentGradeAvg: number;
  gradeDelta: number;
  subjectDeltas: {
    subject: string;
    prevScore: number;
    currScore: number;
    scoreDelta: number;
    prevGrade: number;
    currGrade: number;
    gradeDelta: number;
    isImproved: boolean;
    trendComment: string;
  }[];
  overallDiagnosis: string;
  prescription: string[];
}

export interface EfficiencyMatrixItem {
  subject: string;
  rawScore: number;
  weeklyHours: number;
  efficiencyIndex: number; // 점수 / 시간
  quadrant: '고효율 유지' | '비효율 정체(학습법 교정)' | '투입 부족(시간 확보)' | '안정적 성장';
  diagnosis: string;
  strategy: string;
  recommendedWeeklyHours: number;
}

// 1. Calculate Score Trend Report between two terms
export const generateScoreTrendReport = (
  student: StudentProfile,
  prevTermIndex: number = 0,
  currTermIndex: number = 1
): ScoreTrendReport => {
  const prevTerm: ExamTerm = student.exams[prevTermIndex] || student.exams[0];
  const currTerm: ExamTerm =
    student.exams[currTermIndex] || student.exams[student.exams.length - 1];

  const prevScoresMap = new Map<string, SubjectScore>();
  prevTerm.scores.forEach((s) => prevScoresMap.set(s.subject, s));

  let prevTotalScore = 0;
  let prevTotalGrade = 0;
  let currTotalScore = 0;
  let currTotalGrade = 0;

  const subjectDeltas = currTerm.scores.map((curr) => {
    const prev = prevScoresMap.get(curr.subject);
    const prevScore = prev ? prev.rawScore : curr.rawScore;
    const prevGrade = prev ? prev.grade : curr.grade;

    prevTotalScore += prevScore;
    prevTotalGrade += prevGrade;
    currTotalScore += curr.rawScore;
    currTotalGrade += curr.grade;

    const scoreDelta = curr.rawScore - prevScore;
    const gradeDelta = prevGrade - curr.grade; // grade 1 is better than 3, so positive is improvement

    let trendComment = '';
    if (scoreDelta >= 5) {
      trendComment = `대폭 성장(+${scoreDelta}점)! 맞춤형 학습법이 주효했습니다.`;
    } else if (scoreDelta > 0) {
      trendComment = `점진적 향상(+${scoreDelta}점) 추세입니다.`;
    } else if (scoreDelta === 0) {
      trendComment = `성적 유지 중입니다. 상위권 진입을 위한 심화 공략이 요구됩니다.`;
    } else {
      trendComment = `성적 하락(${scoreDelta}점). 개념 공백 및 오답 원인 정밀 재점검이 필요합니다.`;
    }

    return {
      subject: curr.subject,
      prevScore,
      currScore: curr.rawScore,
      scoreDelta,
      prevGrade,
      currGrade: curr.grade,
      gradeDelta,
      isImproved: scoreDelta > 0,
      trendComment,
    };
  });

  const count = currTerm.scores.length || 1;
  const previousAvg = Math.round((prevTotalScore / count) * 10) / 10;
  const currentAvg = Math.round((currTotalScore / count) * 10) / 10;
  const avgDelta = Math.round((currentAvg - previousAvg) * 10) / 10;
  const previousGradeAvg = Math.round((prevTotalGrade / count) * 10) / 10;
  const currentGradeAvg = Math.round((currTotalGrade / count) * 10) / 10;
  const gradeDelta = Math.round((previousGradeAvg - currentGradeAvg) * 10) / 10;

  let overallDiagnosis = '';
  if (avgDelta >= 4) {
    overallDiagnosis = `${student.name} 학생은 이전 학기 대비 평균 ${avgDelta}점의 괄목할 성장을 이루어냈습니다. 특히 취약 과목에 대한 집중 클리닉과 복습 루틴 정착이 등급 상승을 견인했습니다.`;
  } else if (avgDelta > 0) {
    overallDiagnosis = `${student.name} 학생은 이전 학기 대비 평균 ${avgDelta}점 상승하며 꾸준한 우상향 곡선을 그리고 있습니다. 현 페이스를 유지하며 킬러 문항에 대한 변별력 확보에 집중할 시점입니다.`;
  } else {
    overallDiagnosis = `${student.name} 학생의 평균 성적이 보합 및 다소 조정되었습니다. 시험 난이도 변동과 더불어 특정 취약 단원의 개념 누수 여부를 면밀히 재검토하여 즉각적인 학습 루틴 재조정이 필요합니다.`;
  }

  const prescription = [
    `취약 과목 우선 배치: 일일 자율 학습 시작 시 가장 부담스러운 과목(수학/영어 등)을 전반부 120분에 우선 해결`,
    `오답 3회독 누적 시스템: 틀린 문제는 [당일 밤] -> [주말 누적] -> [시험 2주 전] 최소 3차례 자력으로 백지에 완벽 유도`,
    `타임어택 실전 시뮬레이션: 주 1회 실제 시험 제한 시간보다 5분 짧게 타이머를 맞추고 OMR 카드 마킹까지 실전 연습`,
    `학습 시간 편식 방지: 자신 있는 과목에만 치우치지 않고 과목별 투입 시간과 성취도의 균형을 주간 단위로 피드백`,
  ];

  return {
    previousTermName: prevTerm.termName,
    currentTermName: currTerm.termName,
    previousAvg,
    currentAvg,
    avgDelta,
    previousGradeAvg,
    currentGradeAvg,
    gradeDelta,
    subjectDeltas,
    overallDiagnosis,
    prescription,
  };
};

// 2. Analyze Study Time & Efficiency Matrix
export const analyzeStudyEfficiency = (student: StudentProfile): EfficiencyMatrixItem[] => {
  const currentExam = student.exams[student.exams.length - 1];
  const scoreMap = new Map<string, number>();
  currentExam.scores.forEach((s) => scoreMap.set(s.subject, s.rawScore));

  return student.studyHours.map((sh) => {
    // Look up score or match partial string (e.g. "수학" matches "수학(수1)")
    let score = scoreMap.get(sh.subject);
    if (score === undefined) {
      for (const [subj, sc] of scoreMap.entries()) {
        if (subj.includes(sh.subject) || sh.subject.includes(subj)) {
          score = sc;
          break;
        }
      }
    }
    const finalScore = score !== undefined ? score : 80;
    const weeklyHours = sh.totalWeeklyHours || sh.selfStudyHours + sh.lectureHours || 1;
    const efficiencyIndex = Math.round((finalScore / weeklyHours) * 10) / 10;

    let quadrant: '고효율 유지' | '비효율 정체(학습법 교정)' | '투입 부족(시간 확보)' | '안정적 성장';
    let diagnosis = '';
    let strategy = '';
    let recommendedWeeklyHours = weeklyHours;

    if (finalScore >= 85 && weeklyHours <= 10) {
      quadrant = '고효율 유지';
      diagnosis = '학습 투입 시간 대비 성취도가 매우 우수합니다. 개념 이해도가 높고 핵심을 빠르게 파악하고 있습니다.';
      strategy = '시간을 무리하게 늘리기보다는 고난도 킬러 1~2제 위주로 감을 유지하며 타 취약 과목에 시간을 배분하세요.';
      recommendedWeeklyHours = weeklyHours;
    } else if (finalScore < 80 && weeklyHours >= 12) {
      quadrant = '비효율 정체(학습법 교정)';
      diagnosis = '주간 학습량이 많음에도 점수 정체 현상이 있습니다. 인강 눈팅, 해설지 조기 열람 등 수동적 학습이 원인일 가능성이 높습니다.';
      strategy = '해설지 금지 훈련(막혀도 10분 고민), 백지 복습, 틀린 이유 메타인지 기록을 통해 진짜 내 것으로 만드는 능동적 공부법으로 전면 전환하세요.';
      recommendedWeeklyHours = weeklyHours;
    } else if (finalScore < 80 && weeklyHours < 8) {
      quadrant = '투입 부족(시간 확보)';
      diagnosis = '절대적인 자습 시간이 부족하여 개념 망각 및 문제 풀이 연습량이 누락되어 있습니다.';
      strategy = '주간 자습 시간을 최소 3~5시간 이상 추가 확보해야 합니다. 매일 40분씩 단어 암기 및 기본 문제 10제 풀기 루틴을 강제하세요.';
      recommendedWeeklyHours = weeklyHours + 4;
    } else {
      quadrant = '안정적 성장';
      diagnosis = '투입한 시간만큼 정직하게 성적이 나오는 안정권입니다.';
      strategy = '단원별 취약점을 세분화하여 오답률이 높은 유형을 집중 공략하면 상위 등급 도약이 가능합니다.';
      recommendedWeeklyHours = weeklyHours + 1;
    }

    return {
      subject: sh.subject,
      rawScore: finalScore,
      weeklyHours,
      efficiencyIndex,
      quadrant,
      diagnosis,
      strategy,
      recommendedWeeklyHours,
    };
  });
};

// 3. Dynamic Weekly Study Plan Generator
export const generateWeeklyStudyPlan = (
  student: StudentProfile,
  focusSubject?: string
): StudyPlanBlock[] => {
  const currentExam = student.exams[student.exams.length - 1];
  // Sort subjects by lowest score or largest target gap
  const sortedScores = [...currentExam.scores].sort(
    (a, b) => (b.targetScore - b.rawScore) - (a.targetScore - a.rawScore)
  );

  const primaryTarget = focusSubject || sortedScores[0]?.subject || '수학';
  const secondaryTarget = sortedScores[1]?.subject || '영어';
  const thirdTarget = sortedScores[2]?.subject || '국어';

  const plan: StudyPlanBlock[] = [
    {
      id: `plan_${Date.now()}_1`,
      day: '월',
      timeSlot: '야간 (19:00~23:00)',
      subject: primaryTarget,
      topic: `${primaryTarget} 취약 단원 개념 복습 & 표준 유형 15제`,
      targetMethod: '공식 암기가 아닌 기본 원리 유도 및 해설지 없이 1차 자력 풀이',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_2`,
      day: '화',
      timeSlot: '야간 (19:00~23:00)',
      subject: secondaryTarget,
      topic: `${secondaryTarget} 고난도 기출 분석 & 어휘/용어 총정리`,
      targetMethod: '지문 내 논리 구조 분석 및 오답 선지 함정 포인트 적기',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_3`,
      day: '수',
      timeSlot: '야간 (19:00~23:00)',
      subject: primaryTarget,
      topic: `${primaryTarget} 월요일 오답 문항 100% 백지 재풀이 & 심화 8제`,
      targetMethod: '틀린 이유를 문제 상단에 적고, 막힌 과정만 형광펜 체크',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_4`,
      day: '목',
      timeSlot: '야간 (19:00~23:00)',
      subject: thirdTarget,
      topic: `${thirdTarget} 핵심 기출 모의고사 풀이 및 해설 강의 수강`,
      targetMethod: '시간 제한 두고 풀기 + 약점 단원 체크리스트 작성',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_5`,
      day: '금',
      timeSlot: '야간 (19:00~23:00)',
      subject: primaryTarget,
      topic: `${primaryTarget} 준킬러 실전 타임어택 6문항 클리닉`,
      targetMethod: '한 문제당 7분 제한 타이머 작동 후 실전 긴장감 적응',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_6`,
      day: '토',
      timeSlot: '오전 (09:00~12:00)',
      subject: '전과목 모의고사',
      topic: `${primaryTarget} + ${secondaryTarget} 실전 모의고사 1회차`,
      targetMethod: '실제 시험시간과 동일한 환경(수능 샤프, OMR 답안지 작성)',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_7`,
      day: '토',
      timeSlot: '오후 (13:30~17:30)',
      subject: '탐구/선택과목',
      topic: '탐구 과목 개념 단권화 요약 & 기출 단원별 20제 풀이',
      targetMethod: '도표 분석 및 개념 선지 OX 오답노트 완성',
      completed: false,
    },
    {
      id: `plan_${Date.now()}_8`,
      day: '일',
      timeSlot: '야간 (19:00~23:00)',
      subject: '주간 피드백',
      topic: '주간 오답 바인더 총정리 및 다음 주 플래너 계획 수립',
      targetMethod: '이번 주 계획 달성률 산출 및 미진한 단원 다음 주 우선순위 반영',
      completed: false,
    },
  ];

  return plan;
};

// 4. Calculate Habit Survey Results
export const evaluateHabitSurvey = (answers: HabitSurveyResponse): HabitDiagnosisResult => {
  const categoryMap: {
    [key: string]: {
      label: string;
      sum: number;
      count: number;
      scores: number[];
    };
  } = {
    concentration: { label: '집중도 및 몰입', sum: 0, count: 0, scores: [] },
    timeManagement: { label: '시간 관리 및 계획성', sum: 0, count: 0, scores: [] },
    review: { label: '오답 및 복습 루틴', sum: 0, count: 0, scores: [] },
    anxiety: { label: '시험 불안 및 멘탈 관리', sum: 0, count: 0, scores: [] },
    digital: { label: '디지털 기기 및 환경 통제력', sum: 0, count: 0, scores: [] },
  };

  HABIT_QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 3;
    if (categoryMap[q.category]) {
      categoryMap[q.category].sum += val;
      categoryMap[q.category].count += 1;
      categoryMap[q.category].scores.push(val);
    }
  });

  let grandSum = 0;
  let grandTotal = 0;

  const categoryScores = Object.entries(categoryMap).map(([key, data]) => {
    grandSum += data.sum;
    grandTotal += data.count * 5;
    // Normalized to 0 ~ 100
    const score = Math.round((data.sum / (data.count * 5)) * 100);

    let status: '최우수' | '우수' | '양호' | '개선필요' | '위험';
    let comment = '';
    let tip = '';

    if (score >= 88) {
      status = '최우수';
      comment = '자기주도적 학습의 모범 수준입니다. 꾸준히 유지할 수 있도록 격려가 필요합니다.';
      tip = '현재의 훌륭한 습관을 흔들림 없이 유지하고, 성공 경험을 기록해 두세요.';
    } else if (score >= 78) {
      status = '우수';
      comment = '상위권 학생들의 안정적인 학습 루틴을 견고하게 갖추고 있습니다.';
      tip = '주간 학습 리듬이 흐트러지지 않도록 미세 조정을 이어가세요.';
    } else if (score >= 68) {
      status = '양호';
      comment = '대체로 긍정적인 습관을 형성하고 있으나, 상황에 따라 다소 편차가 발생합니다.';
      tip = '취약한 상황(피로할 때, 시험 직전 등)의 행동 규칙을 미리 정해두세요.';
    } else if (score >= 55) {
      status = '개선필요';
      comment = '성적 향상의 걸림돌이 되는 비효율적인 패턴이 관찰됩니다.';
      tip = '무리한 계획보다는 작은 성공 경험(하루 20분 규칙 등)을 먼저 쌓으세요.';
    } else {
      status = '위험';
      comment = '학습 효능감을 저해하고 시간 낭비를 유발하는 긴급 교정 대상 습관입니다.';
      tip = '부모님 및 상담 선생님과 함께 환경적 강제 장치(스마트폰 격리 등)를 마련하세요.';
    }

    return {
      category: data.label,
      categoryKey: key,
      score,
      status,
      comment,
      tip,
    };
  });

  const totalScore = Math.round((grandSum / grandTotal) * 100);

  let overallGrade = '보통 (B등급)';
  if (totalScore >= 85) overallGrade = '최우수 (S등급)';
  else if (totalScore >= 75) overallGrade = '우수 (A등급)';
  else if (totalScore >= 60) overallGrade = '개선필요 (C등급)';
  else overallGrade = '집중코칭필요 (D등급)';

  // Find top strengths and weaknesses
  const sortedCategories = [...categoryScores].sort((a, b) => b.score - a.score);
  const keyStrengths = sortedCategories
    .slice(0, 2)
    .map((c) => `${c.category} 역량 우수 (${c.score}점): ${c.comment}`);
  const keyWeaknesses = sortedCategories
    .slice(-2)
    .reverse()
    .map((c) => `${c.category} 보완 시급 (${c.score}점): ${c.tip}`);

  const recommendedActions = [
    `가장 취약한 [${sortedCategories[sortedCategories.length - 1].category}] 영역에 대해 이번 주 1가지 핵심 행동 규칙 즉각 실행`,
    `매일 학습 시작 전 10분 마인드셋 & 플래너 점검 루틴 확립`,
    `공부 시간 동안 스마트폰 물리적 격리(사물함 또는 거실 보관) 습관화`,
  ];

  return {
    totalScore,
    overallGrade,
    categoryScores,
    keyStrengths,
    keyWeaknesses,
    recommendedActions,
    surveyDate: new Date().toISOString().split('T')[0],
  };
};

// 5. Parent Notification Message Composer
export const generateParentNotificationMessage = (
  student: StudentProfile,
  counselorName: string = '담임/전문상담교사'
): string => {
  const currentExam = student.exams[student.exams.length - 1];
  const prevExam = student.exams[student.exams.length - 2];

  let scoreSummary = '';
  currentExam.scores.forEach((s) => {
    scoreSummary += `  • ${s.subject}: ${s.rawScore}점 (${s.grade}등급 / 목표 ${s.targetScore}점)\n`;
  });

  let trendNote = '';
  if (prevExam) {
    const report = generateScoreTrendReport(student);
    const sign = report.avgDelta >= 0 ? '+' : '';
    trendNote = `📈 [이전 시험 대비 성적 추이]\n- 평균 성적: ${report.previousAvg}점 ➔ ${report.currentAvg}점 (${sign}${report.avgDelta}점 변동)\n- 종합 진단: ${report.overallDiagnosis}\n\n`;
  }

  const habitSummary = student.habitResult
    ? `🧠 [학습 습관 진단 결과]\n- 종합 점수: ${student.habitResult.totalScore}점 (${student.habitResult.overallGrade})\n- 핵심 강점: ${student.habitResult.keyStrengths[0] || '자기주도성'}\n- 중점 지도 영역: ${student.habitResult.keyWeaknesses[0] || '시간 관리'}\n\n`
    : '';

  const parentMessage = `[EduCare AI 스마트 성적 상담 안내]

존경하는 ${student.name} 학생의 학부모(${student.parentName})님, 안녕하십니까.
${counselorName}입니다.

${student.name} 학생의 '${currentExam.termName}' 성적 분석 결과 및 맞춤형 학습 상담 내용을 전해드립니다.

📊 [최근 성적 현황 요약]
${scoreSummary}
${trendNote}${habitSummary}🎯 [앞으로 4주간 집중 지도 전략]
1. 취약 과목 우선 배정: 자습 시간의 45% 이상을 집중 투자하여 개념 공백을 메우겠습니다.
2. 오답 3회독 누적 시스템: 틀린 문제를 자력으로 완벽히 풀 때까지 체계적으로 점검합니다.
3. 시험 실전 타임어택: 시험장 불안 해소를 위해 주 1회 모의 OMR 실전 훈련을 진행합니다.

🏡 [가정에서의 지도 및 협조 요청사항]
• ${student.name} 학생이 이번 시험을 위해 정말 치열하게 노력했습니다. 결과에 대한 질책보다는 '꾸준한 노력과 성장 가능성'에 따뜻한 칭찬과 지지를 부탁드립니다.
• 귀가 후 스마트폰 사용 시간을 자연스럽게 조절할 수 있도록 가족과 함께하는 저녁 대화 시간을 권장해 드립니다.

학생의 목표(${student.targetUniversity} ${student.targetMajor}) 달성을 위해 최선을 다해 지도하겠습니다.
궁금하신 사항은 언제든 문의해 주시기 바랍니다.

- 스마트 성적 상담 센터 드림 -`;

  return parentMessage;
};
