export const REALTIME_EVENTS = {
  CONNECTED: 'realtime:connected',
  JOB_CREATED: 'job:created',
  JOB_UPDATED: 'job:updated',
  JOB_NOTIFICATION: 'job:notification',
  JOB_OFFER_ACCEPTED: 'job:offerAccepted',
  JOB_OFFER_REJECTED: 'job:offerRejected',
  JOB_CONTRACT_SENT: 'job:contractSent',
  JOB_CONTRACT_ACCEPTED: 'job:contractAccepted',
  JOB_CONTRACT_REJECTED: 'job:contractRejected',
  JOB_JOIN: 'job:join',
  JOB_LEAVE: 'job:leave',
  CHAT_JOIN: 'chat:join',
  CHAT_LEAVE: 'chat:leave',
  CHAT_SEND: 'chat:send',
  CHAT_MESSAGE: 'chat:message',
  SOCKET_ERROR: 'socket:error',
} as const;

export type RealtimeEvent =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
