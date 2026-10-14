import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Lightbulb,
  BookOpen,
  Award,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface AiCounselorChatProps {
  student: StudentProfile;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const AiCounselorChat: React.FC<AiCounselorChatProps> = ({ student }) => {
  const [counselingReport, setCounselingReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_init',
      role: 'model',
      text: `안녕하세요, ${student.name} 학생! 저는 당신의 목표(${student.targetUniversity} ${student.targetMajor}) 달성을 돕는 1:1 수석 입시/학습 AI 멘토입니다.\n\n최근 성적과 과목별 학습시간, 습관 진단 데이터를 바탕으로 가장 효과적인 성적 도약 전략을 안내해 드립니다. 궁금한 점이 있다면 무엇이든 물어보세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingMessage]);

  const handleGenerateFullCounseling = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/gemini/counseling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student }),
      });
      const data = await res.json();
      if (data.counseling) {
        setCounselingReport(data.counseling);
      }
    } catch (err) {
      console.error('AI Counseling generation error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isSendingMessage) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSendingMessage(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          messages: messages.map((m) => ({ role: m.role, text: m.text })),
          newMessage: text,
        }),
      });

      const data = await res.json();
      const reply = data.reply || '답변을 생성하지 못했습니다. 다시 시도해 주세요.';

      const botMsg: Message = {
        id: `b_${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const quickQuestions = [
    '수학 준킬러 문항 정답률을 올리려면 어떤 문제집과 회독법이 좋을까요?',
    '시험 전날 시간 배분과 긴장감(불안) 극복 루틴을 알려줘',
    '인강 듣는 시간은 많은데 점수가 정체되는 이유와 해결책은?',
    '영어 빈칸추론과 순서배열 유형 풀이 비결이 궁금해',
  ];

  return (
    <div className="space-y-6">
      {/* Top AI Counseling Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-purple-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini 3.8 Flash 기반 정밀 성적 성장 AI 컨설팅</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {student.name} 학생의 데이터 기반 1:1 맞춤 성장 로드맵
            </h2>
            <p className="text-xs text-slate-300">
              성적 내역, 학습 효율, 습관 진단 데이터를 유기적으로 결합하여 현실적이고 구체적인 액션 플랜을 제시합니다.
            </p>
          </div>

          <button
            onClick={handleGenerateFullCounseling}
            disabled={isGeneratingReport}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingReport ? 'animate-spin' : ''}`} />
            <span>{isGeneratingReport ? 'AI 심층 분석 생성 중...' : '맞춤 상담 리포트 생성'}</span>
          </button>
        </div>

        {/* Generated Report Content Box */}
        {counselingReport && (
          <div className="mt-6 pt-6 border-t border-purple-800/60 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap">
            {counselingReport}
          </div>
        )}
      </div>

      {/* Interactive 1:1 Chat Mentoring Chamber */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                1:1 실시간 맞춤 학습 상담실
              </h3>
              <p className="text-[11px] text-slate-500">
                {student.name} 학생의 성적 데이터가 상담 문맥에 자동 반영됩니다.
              </p>
            </div>
          </div>
          <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>상담 가능</span>
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isSendingMessage && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center space-x-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-200" />
                <span className="ml-1">데이터 분석 및 맞춤 처방 도출 중...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>추천 질문:</span>
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-200 text-xs shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="성적 향상법, 특정 과목 취약점, 공부 시간 분배 등에 대해 질문해 보세요..."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-500 font-medium"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isSendingMessage}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
