import { useEffect, useRef, useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  // useRef로 최신 값 참조 (리렌더링 방지)
  const eventsRef = useRef(events);
  const notifiedEventsRef = useRef(notifiedEvents);

  // ref 업데이트
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    notifiedEventsRef.current = notifiedEvents;
  }, [notifiedEvents]);

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const upcomingEvents = getUpcomingEvents(eventsRef.current, now, notifiedEventsRef.current);

      if (upcomingEvents.length > 0) {
        setNotifications((prev) => [
          ...prev,
          ...upcomingEvents.map((event) => ({
            id: event.id,
            message: createNotificationMessage(event),
          })),
        ]);

        setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
      }
    };

    const interval = setInterval(checkUpcomingEvents, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, []); // 빈 dependency로 interval 한 번만 설정

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
