import { StudentProfile } from '../types';
import { getAccessToken } from './firebaseAuth';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const createAndExportStudentSheet = async (
  student: StudentProfile
): Promise<ExportResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 로그인이 필요합니다. 먼저 Google 계정으로 로그인해 주세요.');
  }

  // 1. Create a new Spreadsheet
  const title = `[EduCare] ${student.name} 학생 성적 및 학습 상담 리포트`;
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: '성적 현황',
            gridProperties: { rowCount: 40, columnCount: 12 },
          },
        },
        {
          properties: {
            title: '과목별 학습시간 및 전략',
            gridProperties: { rowCount: 30, columnCount: 8 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Sheets 생성 실패 (${createRes.status}): 권한이 올바른지 확인해주세요.`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data for '성적 현황' Sheet
  const scoresRows: (string | number)[][] = [
    ['학생 기본 정보'],
    ['학생 성명', student.name, '학년', student.gradeLevel, '계열', student.track],
    ['목표 대학', student.targetUniversity, '목표 학과', student.targetMajor, '학부모 성함', student.parentName],
    [],
    ['[시험별 성적 내역]'],
    ['시험명', '일자', '과목', '원점수', '등급', '표준점수', '백분위', '반석차', '전교석차', '목표점수', '피드백'],
  ];

  student.exams.forEach((exam) => {
    exam.scores.forEach((sc) => {
      scoresRows.push([
        exam.termName,
        exam.date,
        sc.subject,
        sc.rawScore,
        `${sc.grade}등급`,
        sc.standardScore ?? '-',
        sc.percentile ? `${sc.percentile}%` : '-',
        sc.rankClass ? `${sc.rankClass}등` : '-',
        sc.rankTotal ? `${sc.rankTotal}등` : '-',
        sc.targetScore,
        sc.feedback || '',
      ]);
    });
  });

  // 3. Write '성적 현황' Sheet values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'성적 현황'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: scoresRows,
      }),
    }
  );

  // 4. Prepare Data for '과목별 학습시간 및 전략' Sheet
  const studyRows: (string | number)[][] = [
    ['과목별 주간 학습시간 분석 및 맞춤형 공부 전략'],
    ['과목명', '주간 자습(시간)', '주간 강의/학원(시간)', '총 주간시간', '현재 공부 방식', '취약점 및 보완사항'],
  ];

  student.studyHours.forEach((sh) => {
    studyRows.push([
      sh.subject,
      sh.selfStudyHours,
      sh.lectureHours,
      sh.totalWeeklyHours,
      sh.studyMethod,
      sh.difficultyNote,
    ]);
  });

  if (student.habitResult) {
    studyRows.push([]);
    studyRows.push(['[학습 습관 진단 결과 요약]']);
    studyRows.push(['종합 점수', `${student.habitResult.totalScore}점`, '종합 등급', student.habitResult.overallGrade]);
    studyRows.push(['진단 일자', student.habitResult.surveyDate]);
    studyRows.push(['영역명', '점수', '상태', '전문가 코멘트', '추천 처방 팁']);
    student.habitResult.categoryScores.forEach((cat) => {
      studyRows.push([cat.category, `${cat.score}점`, cat.status, cat.comment, cat.tip]);
    });
  }

  // 5. Write '과목별 학습시간 및 전략' Sheet values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'과목별 학습시간 및 전략'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: studyRows,
      }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
};
