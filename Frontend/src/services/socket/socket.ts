import { io, type Socket } from "socket.io-client";
import { API_URL } from "../api/api";
import { getAccessToken } from "../../features/auth/utils/tokenStorage";

export const SOCKET_EVENTS = {
  CONNECTED: "realtime:connected",
  JOB_CREATED: "job:created",
  JOB_NOTIFICATION: "job:notification",
  JOB_OFFER_ACCEPTED: "job:offerAccepted",
  JOB_OFFER_REJECTED: "job:offerRejected",
  JOB_CONTRACT_SENT: "job:contractSent",
  JOB_CONTRACT_ACCEPTED: "job:contractAccepted",
  JOB_CONTRACT_REJECTED: "job:contractRejected",
  JOB_JOIN: "job:join",
  JOB_LEAVE: "job:leave",
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",
  CHAT_SEND: "chat:send",
  CHAT_MESSAGE: "chat:message",
  SOCKET_ERROR: "socket:error",
} as const;

export type JobNotificationPayload = {
  jobId: string;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  scheduledAt: string | null;
  customerName?: string | null;
};

export type ChatMessagePayload = {
  id: string;
  tempId?: string;
  chatRoomId: string;
  jobId: string;
  senderUserId: string;
  senderRole: string;
  message: string;
  createdAt: string;
};

type ServerToClientEvents = {
  [SOCKET_EVENTS.CONNECTED]: (payload: { userId: string; role: string }) => void;
  [SOCKET_EVENTS.JOB_NOTIFICATION]: (payload: JobNotificationPayload) => void;
  [SOCKET_EVENTS.JOB_OFFER_ACCEPTED]: (payload: { jobId: string; offerId: string; workerId: string; workerName?: string }) => void;
  [SOCKET_EVENTS.JOB_CONTRACT_SENT]: (payload: { jobId: string; workerId: string; contractId: string }) => void;
  [SOCKET_EVENTS.JOB_CONTRACT_ACCEPTED]: (payload: { jobId: string; workerId: string; contractId: string }) => void;
  [SOCKET_EVENTS.CHAT_MESSAGE]: (payload: ChatMessagePayload) => void;
  [SOCKET_EVENTS.SOCKET_ERROR]: (payload: { message: string }) => void;
};

type ClientToServerEvents = {
  [SOCKET_EVENTS.JOB_JOIN]: (
    payload: { jobId: string },
    callback?: (response: { ok: boolean }) => void,
  ) => void;
  [SOCKET_EVENTS.JOB_LEAVE]: (
    payload: { jobId: string },
    callback?: (response: { ok: boolean }) => void,
  ) => void;
  [SOCKET_EVENTS.CHAT_JOIN]: (
    payload: { chatRoomId: string },
    callback?: (response: { ok: boolean }) => void,
  ) => void;
  [SOCKET_EVENTS.CHAT_LEAVE]: (
    payload: { chatRoomId: string },
    callback?: (response: { ok: boolean }) => void,
  ) => void;
  [SOCKET_EVENTS.CHAT_SEND]: (
    payload: { chatRoomId: string; message: string; tempId?: string },
    callback?: (response: { ok: boolean; message?: ChatMessagePayload }) => void,
  ) => void;
};

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function normalizeSocketUrl(rawUrl: string) {
  return rawUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

const SOCKET_URL = normalizeSocketUrl(
  import.meta.env.VITE_SOCKET_URL || API_URL,
);

let socket: AppSocket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}

export function connectSocket() {
  const activeSocket = getSocket();
  const token = getAccessToken();

  if (!token) {
    return activeSocket;
  }

  activeSocket.auth = { token };

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
