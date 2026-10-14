import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  NotificationLog,
} from '../types';
import { generateParentNotificationMessage } from '../services/counselingEngine';
import { listChatSpaces, sendChatMessage, ChatSpace } from '../services/googleChat';
import { getAccessToken } from '../services/firebaseAuth';
import {
  X,
  MessageSquare,
  Send,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  History,
  Phone,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react';

interface ParentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  notificationLogs: NotificationLog[];
  onAddLog: (log: NotificationLog) => void;
}

export const ParentNotificationModal: React.FC<ParentNotificationModalProps> = ({
  isOpen,
  onClose,
  student,
  notificationLogs,
  onAddLog,
}) => {
  const [counselorName, setCounselorName] = useState('수석 입시/성적 상담교사');
  const [messageText, setMessageText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'chat' | 'sms'>('chat');
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatConsoleUrl, setChatConsoleUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Confirmation dialog state (MANDATORY per Workspace Skill)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessageText(generateParentNotificationMessage(student, counselorName));
      loadSpaces();
    }
  }, [isOpen, student]);

  const loadSpaces = async () => {
    setIsLoadingSpaces(true);
    setChatError(null);
    setChatConsoleUrl(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setChatError('Google 로그인이 필요합니다. 상단에서 Google 계정으로 로그인해 주세요.');
        return;
      }
      const fetched = await listChatSpaces();
      setSpaces(fetched);
      if (fetched.length > 0) {
        setSelectedSpace(fetched[0].name);
      }
    } catch (err: any) {
      if (err.message?.includes('GOOGLE_CHAT_APP_NOT_CONFIGURED')) {
        setChatError(
          'Google Chat 앱 구성 필요: Google Chat API를 사용하려면 Google Cloud Console에서 Chat App 설정이 완료되어야 합니다.'
        );
        const projectIdMatch = err.message.match(/Project ID: ([\w-]+)/);
        const pid = projectIdMatch ? projectIdMatch[1] : 'gen-lang-client-0465960351';
        setChatConsoleUrl(
          `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${pid}`
        );
      } else {
        setChatError(err.message || 'Google Chat 스페이스 목록을 불러오지 못했습니다.');
      }
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);

    // Also record simulated SMS log
    const newLog: NotificationLog = {
      id: `log_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      recipient: student.parentPhone,
      channel: 'SMS / 알림톡',
      message: messageText.slice(0, 80) + '...',
      sentAt: new Date().toLocaleString('ko-KR'),
      status: 'success',
    };
    onAddLog(newLog);
    setSendSuccessMessage('클립보드에 복사되었으며 학부모 전송 로그에 기록되었습니다.');
    setTimeout(() => setSendSuccessMessage(null), 3500);
  };

  const handlePromptSendChat = () => {
    if (!selectedSpace) {
      alert('전송할 Google Chat 스페이스를 선택해주세요.');
      return;
    }
    // Open explicit confirmation dialog first (mandatory per skill)
    setShowConfirmDialog(true);
  };

  const handleExecuteSendChat = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);
    setSendSuccessMessage(null);
    setChatError(null);

    const spaceObj = spaces.find((s) => s.name === selectedSpace);
    const spaceDisplayName = spaceObj ? spaceObj.displayName : selectedSpace;

    const result = await sendChatMessage(selectedSpace, messageText);
    setIsSending(false);

    if (result.success) {
      const newLog: NotificationLog = {
        id: `log_${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        parentName: student.parentName,
        recipient: spaceDisplayName,
        channel: 'Google Chat',
        message: messageText.slice(0, 80) + '...',
        sentAt: new Date().toLocaleString('ko-KR'),
        status: 'success',
        spaceName: spaceDisplayName,
      };
      onAddLog(newLog);
      setSendSuccessMessage(`Google Chat '${spaceDisplayName}' 스페이스로 상담 알림이 성공적으로 전송되었습니다!`);
      setTimeout(() => setSendSuccessMessage(null), 4000);
    } else {
      if (result.isConfigurationError && result.consoleUrl) {
        setChatError(result.error || 'Google Chat 앱 설정이 필요합니다.');
        setChatConsoleUrl(result.consoleUrl);
      } else {
        setChatError(result.error || '메시지 전송에 실패했습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                학부모 상담 리포트 알림 발송 센터
              </h2>
              <p className="text-xs text-slate-500">
                {student.name} 학생의 성적 및 맞춤 학습 전략을 학부모({student.parentName} 님)께 전송합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Banner */}
          {sendSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}

          {/* Recipient & Channel Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">수신 학부모 정보</span>
              <p className="text-sm font-extrabold text-slate-900">
                {student.parentName} 학부모님 ({student.name} 학생)
              </p>
              <div className="flex items-center space-x-1 text-slate-500 mt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>연락처: {student.parentPhone}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-2">발송 채널 선택</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('chat')}
                  className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    selectedChannel === 'chat'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Google Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('sms')}
                  className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    selectedChannel === 'sms'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>SMS / 알림톡</span>
                </button>
              </div>
            </div>
          </div>

          {/* Google Chat Space Settings (if channel === 'chat') */}
          {selectedChannel === 'chat' && (
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>전송할 Google Chat 스페이스 선택</span>
                </span>
                <button
                  onClick={loadSpaces}
                  disabled={isLoadingSpaces}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {isLoadingSpaces ? '새로고침 중...' : '스페이스 목록 새로고침'}
                </button>
              </div>

              {spaces.length > 0 ? (
                <select
                  value={selectedSpace}
                  onChange={(e) => setSelectedSpace(e.target.value)}
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 focus:outline-blue-500"
                >
                  {spaces.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.displayName} ({s.name})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-blue-100 text-slate-600">
                  {isLoadingSpaces
                    ? '스페이스 목록을 불러오는 중...'
                    : '선택 가능한 Google Chat 스페이스가 없습니다. (비즈니스 계정 로그인 또는 권한 확인 필요)'}
                </div>
              )}

              {/* Chat Error & Console Link */}
              {chatError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{chatError}</p>
                  </div>
                  {chatConsoleUrl && (
                    <div className="pt-1">
                      <a
                        href={chatConsoleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 font-bold text-blue-700 hover:underline"
                      >
                        <span>Google Cloud Console에서 Chat API 구성하기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    💡 팁: Chat App 등록 전이라도 [SMS / 알림톡] 채널을 선택하여 원클릭으로 학부모 메시지를 복사 및 전송할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Editable Notification Message Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800">
                알림 메시지 내용 미리보기 및 수정
              </label>
              <button
                onClick={() =>
                  setMessageText(generateParentNotificationMessage(student, counselorName))
                }
                className="text-indigo-600 hover:underline text-[11px] font-semibold"
              >
                기본 템플릿으로 재설정
              </button>
            </div>
            <textarea
              rows={12}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-blue-500 shadow-inner"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopyMessage}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? '복사되었습니다!' : '문자/카톡 양식 복사하기'}</span>
            </button>

            {selectedChannel === 'chat' && (
              <button
                onClick={handlePromptSendChat}
                disabled={isSending || !selectedSpace}
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? '전송 중...' : 'Google Chat으로 발송하기'}</span>
              </button>
            )}
          </div>

          {/* Notification Logs */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h3 className="font-bold text-xs text-slate-700 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>최근 학부모 알림 발송 이력 ({notificationLogs.length}건)</span>
            </h3>

            {notificationLogs.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {notificationLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{log.parentName} 학부모님</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.channel}
                        </span>
                        <span className="text-slate-400 text-[10px]">{log.sentAt}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5 truncate max-w-md">{log.message}</p>
                    </div>
                    <span className="text-emerald-600 font-bold text-[11px] flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>발송 완료</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">아직 발송된 이력이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Workspace Skill User Confirmation Dialog for Destructive / Send Actions */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Google Chat 메시지 전송 확인
                  </h3>
                  <p className="text-xs text-slate-500">Google Workspace API 작업 확인</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p>
                  <strong>수신 스페이스:</strong> {spaces.find((s) => s.name === selectedSpace)?.displayName || selectedSpace}
                </p>
                <p>
                  <strong>대상 학생:</strong> {student.name} ({student.parentName} 학부모님 앞)
                </p>
                <p className="text-slate-500 mt-2">
                  위 스페이스로 학부모 상담 리포트를 전송하시겠습니까? 메시지가 Google Chat 채널에 게시됩니다.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSendChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  확인 및 전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
