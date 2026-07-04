import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      // Disconnect if logged out
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    // Connect only once
    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socket.emit('join', user._id);
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });
    } else {
      // Re-join room if already connected
      if (socket.connected) {
        socket.emit('join', user._id);
      }
    }

    socketRef.current = socket;

    // Listen for notifications
    const handleNotification = (notification) => {
      // Show toast notification
      const icon = {
        sale: '💰',
        purchase: '🎨',
        follow: '👤',
        bid: '🔨',
        outbid: '⚡',
        commission: '📝',
        system: 'ℹ️',
      }[notification.type] || '🔔';

      toast(notification.message || notification.title, {
        icon,
        duration: 5000,
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
        },
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket?.off('notification', handleNotification);
    };
  }, [isAuthenticated, user?._id]);

  const emit = useCallback((event, data) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  return { socket: socketRef.current, emit };
};

export default useSocket;
