import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/context/useAuth";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  SOCKET_EVENTS,
  type AppSocket,
} from "../../services/socket/socket";

type UseSocketOptions = {
  autoConnect?: boolean;
};

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { isAuthenticated, isBootstrapping } = useAuth();
  const socket = useMemo(() => getSocket(), []);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (isBootstrapping || !autoConnect) {
      return;
    }

    if (isAuthenticated) {
      connectSocket();
      return;
    }

    disconnectSocket();
  }, [autoConnect, isAuthenticated, isBootstrapping]);

  const emit = useCallback<AppSocket["emit"]>(
    (...args) => socket.emit(...args),
    [socket],
  );

  return {
    socket,
    isConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
    emit,
    events: SOCKET_EVENTS,
  };
}

