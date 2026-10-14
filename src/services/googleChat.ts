import { getAccessToken } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface ChatSpace {
  name: string; // e.g., "spaces/AAAAAAAAAAA"
  displayName: string;
  type: string;
}

export interface ChatMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isConfigurationError?: boolean;
  consoleUrl?: string;
}

export const listChatSpaces = async (): Promise<ChatSpace[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 로그인이 필요합니다. 먼저 로그인해주세요.');
  }

  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    if (res.status === 404 || errorJson.error?.status === 'NOT_FOUND') {
      const projectId = firebaseConfig.projectId;
      throw new Error(
        `GOOGLE_CHAT_APP_NOT_CONFIGURED: Google Chat 앱이 아직 Google Cloud 콘솔에서 구성되지 않았습니다. (Project ID: ${projectId})`
      );
    }
    throw new Error(
      errorJson.error?.message || `Google Chat 스페이스 목록 조회 실패 (${res.status})`
    );
  }

  const data = await res.json();
  return (
    data.spaces?.map((s: any) => ({
      name: s.name,
      displayName: s.displayName || s.name.replace('spaces/', '스페이스 '),
      type: s.type || 'SPACE',
    })) || []
  );
};

export const sendChatMessage = async (
  spaceName: string,
  messageText: string
): Promise<ChatMessageResult> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google 인증 토큰이 없습니다. 다시 로그인해 주세요.',
    };
  }

  const projectId = firebaseConfig.projectId;
  const consoleUrl = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${projectId}`;

  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: messageText,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 404 || err.error?.status === 'NOT_FOUND') {
        return {
          success: false,
          isConfigurationError: true,
          consoleUrl,
          error:
            'Google Chat 앱 구성 필요: Google Chat API는 비즈니스/엔터프라이즈 Workspace 계정 및 GCP 콘솔 내 Chat App 등록이 요구됩니다.',
        };
      }
      return {
        success: false,
        error: err.error?.message || `메시지 전송 실패 (상태 코드: ${res.status})`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data.name,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '네트워크 오류가 발생했습니다.',
    };
  }
};
