import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client on server-side with telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const generateAiCounseling = async (studentData: any): Promise<string> => {
  if (!apiKey) {
    return generateFallbackCounseling(studentData);
  }

  const prompt = `당신은 대한민국 최고의 입시 및 자기주도학습 전문 수석 성적 상담 컨설턴트입니다.
아래 학생의 실제 성적 내역, 과목별 주간 학습시간, 학습 습관 진단 결과, 목표 대학/학과 정보를 면밀히 분석하여,
학생이 실질적으로 성적을 도약시킬 수 있는 날카롭고 따뜻하며 구체적인 맞춤형 성적 성장 전략 상담 보고서를 작성해 주세요.

[학생 정보]
- 성명: ${studentData.name} (${studentData.gradeLevel}, ${studentData.track})
- 목표 대학 및 학과: ${studentData.targetUniversity} ${studentData.targetMajor}
- 특이사항 및 메모: ${studentData.notes || '없음'}

[시험 성적 내역]
${JSON.stringify(studentData.exams, null, 2)}

[과목별 주간 학습시간 및 고민]
${JSON.stringify(studentData.studyHours, null, 2)}

[학습 습관 진단 결과]
${JSON.stringify(studentData.habitResult || '진단 미실시', null, 2)}

다음의 5가지 섹션으로 나누어 전문적이고 신뢰감 있는 한국어로 작성해주세요:
1. 📊 [성적 및 학기별 성장 추이 총평]: 현재 성취도와 이전 대비 변동에 대한 정확한 진단과 칭찬
2. ⏱️ [과목별 학습 시간 대비 효율성(가성비) 정밀 분석]: 투자한 시간에 비해 점수가 나오지 않는 비효율 과목 원인 규명 및 고효율 과목 분석
3. 🎯 [과목별 핀포인트 성적 향상 필승 전략]: 국어, 수학, 영어, 탐구 과목별 구체적 공부법(개념, 기출, 오답, 교재 활용법)
4. 🧠 [학습 습관 및 시험 멘탈 극복 처방전]: 집중력, 스마트폰 통제, 시험 불안 해소 방안
5. 📅 [향후 4주간 실천 로드맵 및 격려]: 주차별 핵심 액션 플랜 및 학생을 위한 강력한 동기부여 메시지`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 대한민국 최고의 입시 전문 수석 컨설턴트이자 학생의 잠재력을 이끌어내는 따뜻한 멘토입니다. 실현 불가능한 이론적 조언 대신 학생의 데이터에 기반한 매우 구체적인 공부법과 루틴을 제안합니다.',
        temperature: 0.7,
      },
    });

    return response.text || generateFallbackCounseling(studentData);
  } catch (error) {
    console.error('Gemini API call failed, using fallback counseling engine:', error);
    return generateFallbackCounseling(studentData);
  }
};

export const chatWithAiCounselor = async (
  studentData: any,
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  userMessage: string
): Promise<string> => {
  if (!apiKey) {
    return generateFallbackChatResponse(userMessage, studentData);
  }

  const systemContext = `당신은 ${studentData.name} 학생(${studentData.gradeLevel}, 목표: ${studentData.targetUniversity} ${studentData.targetMajor})의 1:1 맞춤형 AI 성적 멘토입니다.
학생의 최근 성적과 학습 시간, 습관 데이터를 숙지하고 있으며, 학생이 묻는 질문에 친절하고 명쾌하게 수험생 눈높이에서 답해주세요.
항상 구체적인 예시(문제집 이름 예: 쎈, 자이스토리, 수능특강, 블랙라벨 등이나 3회독 복습법, 타임어택 등)를 들어 조언해주세요.`;

  try {
    const historyText = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? '학생/상담사' : 'AI멘토'}: ${m.text}`)
      .join('\n');

    const prompt = `${systemContext}

[대화 기록]
${historyText}

학생/상담사: ${userMessage}
AI멘토:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return (
      response.text ||
      generateFallbackChatResponse(userMessage, studentData)
    );
  } catch (error) {
    console.error('Gemini Chat call failed, using fallback:', error);
    return generateFallbackChatResponse(userMessage, studentData);
  }
};

const generateFallbackCounseling = (student: any): string => {
  const currentExam = student.exams?.[student.exams.length - 1];
  const scoresStr = currentExam?.scores
    ? currentExam.scores.map((s: any) => `${s.subject}: ${s.rawScore}점 (${s.grade}등급)`).join(', ')
    : '';

  return `### 1. 📊 [성적 및 학기별 성장 추이 총평]
${student.name} 학생은 목표 대학(${student.targetUniversity} ${student.targetMajor})을 향한 확고한 학업 의지를 보이고 있습니다. 최근 시험 성취도(${scoresStr})를 종합 분석했을 때, 기초 이해력은 매우 안정적으로 확보되어 있으나 고난도 변별력 문항에서의 정답률 편차가 다음 등급 도약의 핵심 분수령입니다.

### 2. ⏱️ [과목별 학습 시간 대비 효율성(가성비) 정밀 분석]
- **주간 학습 시간 분배 점검**: 현재 특정 과목에 투입된 시간에 비해 성취도가 정체되는 현상은 '수동적 학습(단순 인강 시청, 해설지 조기 열람)'에서 기인합니다.
- **시간당 효율성 극대화**: 자율학습 시간 중 '진짜 혼자 머리를 싸매고 고민하는 순수 자습 시간' 비중을 70% 이상으로 끌어올려야 합니다.

### 3. 🎯 [과목별 핀포인트 성적 향상 필승 전략]
- **수학**: '해설지 10분 금지 룰' 적용. 막히더라도 즉시 답지를 보지 말고 조건 분석과 개념 공식을 최소 10분간 유도한 후 해설과 비교하세요.
- **국어**: 비문학 독서 제재 문단 요약 훈련. 긴 지문일수록 문단별 핵심 문장에 밑줄을 긋고 문단 간의 인과/대립 관계를 여백에 도식화하는 구조 독해가 필수입니다.
- **영어**: 어휘 암기는 아침/저녁 20분씩 쪼개어 누적 암기하고, 주 1회 실전 모의고사 타임어택으로 순서/삽입 유형을 집중 방어하세요.
- **탐구**: 개념 단권화 노트에 빈출 함정 선지와 계산 팁을 빨간 펜으로 정리하여 시험 직전까지 단권화 회독을 진행하세요.

### 4. 🧠 [학습 습관 및 시험 멘탈 극복 처방전]
- **시험 불안 관리**: 시험 2주 전부터 주 1회 OMR 카드 마킹 및 실제 시험 시간표와 동일한 조건으로 모의고사를 실시하여 실전 감각을 체화하세요.
- **디지털 환경 통제**: 자습 중 스마트폰은 시야 밖(사물함 또는 거실)에 두고, 포모도로(50분 집중 + 10분 온전한 휴식) 기법을 준수하세요.

### 5. 📅 [향후 4주간 실천 로드맵 및 격려]
- **1주차**: 취약 단원 개념 메타인지 점검 및 누수된 공식 백지 복습
- **2주차**: 준킬러 기출 유형 3회독 누적 풀이
- **3주차**: 고난도 킬러 문항 집중 공략 및 오답노트 원인 분석
- **4주차**: 실전 타임어택 모의고사 3회 시행 및 마인드셋 안정화

"${student.name} 학생, 당신의 잠재력은 이미 충분히 입증되었습니다. 작은 오답 하나를 자력으로 정복할 때마다 목표 대학의 문은 더 활짝 열릴 것입니다!"`;
};

const generateFallbackChatResponse = (query: string, student: any): string => {
  if (query.includes('수학') || query.includes('계산') || query.includes('공식')) {
    return `${student.name} 학생의 수학 공부에 대해 말씀드릴게요! 수학은 '눈으로 보는 공부'가 아니라 '손으로 직접 쓰는 공부'여야 합니다. 틀린 문제는 해설지를 보지 말고 최소 7분간 개념을 떠올리며 자력 풀이를 시도해보세요. 그런 다음 해설지와 비교하여 내가 '어느 논리적 단계에서 막혔는지'를 빨간 펜으로 한 줄 기록하는 것이 1등급으로 가는 지름길입니다.`;
  }
  if (query.includes('영어') || query.includes('단어') || query.includes('독해')) {
    return `영어 성적 향상의 80%는 흔들리지 않는 어휘력과 구문 해석력에 있습니다. 매일 40개 단어를 아침 15분, 점심 10분, 저녁 15분 자투리 시간으로 3회 반복 암기하고, 빈칸 추론이나 문장 삽입 같은 고난도 지문은 문장 간의 역접/예시 논리 전개에 집중해 보세요!`;
  }
  if (query.includes('불안') || query.includes('긴장') || query.includes('시간')) {
    return `시험장 긴장감은 모든 우등생들도 똑같이 겪는 자연스러운 감정입니다. 긴장될 때는 깊게 복식호흡 3회를 하고, '내가 모르는 문제는 남들도 다 어렵다'는 굳은 확신을 가지세요. 평소 공부할 때 실제 시험시간보다 5분 짧게 타이머를 맞추고 푸는 훈련을 주 1회 꾸준히 하면 시험 불안이 획기적으로 줄어듭니다!`;
  }
  return `${student.name} 학생의 질문에 답변드립니다. 목표 달성을 위해서는 큰 목표를 오늘 당장 실행할 수 있는 '일일 3대 핵심 과제'로 쪼개어 하나씩 지워나가는 성취감이 가장 중요합니다. 플래너에 오늘 할 일을 명확히 적고 80% 이상 완수해 보세요. 함께 끝까지 응원하겠습니다!`;
};
