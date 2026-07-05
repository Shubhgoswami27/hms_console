'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (room?: string, onEventReceived?: (event: string, data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const onEventReceivedRef = useRef(onEventReceived);

  // Keep callback reference up to date without triggering useEffect
  useEffect(() => {
    onEventReceivedRef.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    // Connect to websocket server
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to real-time HMS WebSocket Gateway');
      
      if (room) {
        socket.emit('join_room', room);
      }
    });

    socket.onAny((eventName, ...args) => {
      if (onEventReceivedRef.current) {
        onEventReceivedRef.current(eventName, args[0]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [room]);

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const getSocket = () => socketRef.current;

  return { emit, getSocket };
};
