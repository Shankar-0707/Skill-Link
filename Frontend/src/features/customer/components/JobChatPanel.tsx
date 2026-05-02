import React, { useEffect, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../../app/context/useAuth';
import { jobService } from '../services/jobService';
import type { ChatMessage } from '../types';
import { useSocket } from '../../../shared/hooks/useSocket';
import { SOCKET_EVENTS, type ChatMessagePayload } from '../../../services/socket/socket';

interface JobChatPanelProps {
  chatRoomId: string;
  title?: string;
}

export const JobChatPanel: React.FC<JobChatPanelProps> = ({
  chatRoomId,
  title = 'Chat',
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await jobService.getChatMessages(chatRoomId);
        if (active) {
          setMessages(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMessages();
    socket.emit(SOCKET_EVENTS.CHAT_JOIN, { chatRoomId });

    const handleMessage = (message: ChatMessagePayload) => {
      if (message.chatRoomId !== chatRoomId) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);

    return () => {
      active = false;
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
      socket.emit(SOCKET_EVENTS.CHAT_LEAVE, { chatRoomId });
    };
  }, [chatRoomId, socket]);

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }

    socket.emit(SOCKET_EVENTS.CHAT_SEND, {
      chatRoomId,
      message,
      tempId: crypto.randomUUID(),
    });
    setDraft('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>

      <div className="h-72 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-sm text-gray-400">No messages yet.</p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.senderUserId === user?.id;
            return (
              <div
                key={message.id}
                className={`max-w-[78%] rounded-xl px-3 py-2 text-sm ${
                  mine
                    ? 'self-end bg-gray-900 text-white'
                    : 'self-start bg-white border border-gray-200 text-gray-700'
                }`}
              >
                <p>{message.message}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-gray-300' : 'text-gray-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:opacity-90"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

