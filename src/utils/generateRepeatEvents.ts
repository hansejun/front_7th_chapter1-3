import { EventForm } from '../types';
import { formatDate } from './dateUtils';

// ! TEST CASE
export const generateRepeatEvents = (eventData: EventForm): EventForm[] => {
  const events: EventForm[] = [];
  const maxEndDate = new Date('2025-12-30');
  const startDate = new Date(eventData.date);
  const endDate = eventData.repeat.endDate ? new Date(eventData.repeat.endDate) : maxEndDate;

  const originalDay = startDate.getDate();
  const originalMonth = startDate.getMonth();

  let currentDate = new Date(startDate);

  if (eventData.repeat.type === 'none' || eventData.repeat.interval === 0) {
    return [eventData];
  }

  while (currentDate <= endDate) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
    });

    switch (eventData.repeat.type) {
      case 'daily':
        currentDate = new Date(
          currentDate.getTime() + eventData.repeat.interval * 24 * 60 * 60 * 1000
        );
        break;

      case 'weekly':
        currentDate = new Date(
          currentDate.getTime() + eventData.repeat.interval * 7 * 24 * 60 * 60 * 1000
        );
        break;

      case 'monthly': {
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + eventData.repeat.interval;

        // 월이 12를 넘으면 년도 증가
        while (month > 11) {
          year++;
          month -= 12;
        }

        currentDate = new Date(year, month, originalDay);

        // 날짜가 오버플로우된 경우 (예: 2월 31일 → 3월 2일이나 3일)
        // 해당 월에 원하는 날짜가 없으므로 다음 달로 이동
        while (currentDate.getDate() !== originalDay && currentDate <= endDate) {
          month++;
          if (month > 11) {
            year++;
            month = 0;
          }
          currentDate = new Date(year, month, originalDay);
        }
        break;
      }

      case 'yearly': {
        if (originalMonth === 1 && originalDay === 29) {
          currentDate.setFullYear(currentDate.getFullYear() + 4);
        } else {
          currentDate.setFullYear(currentDate.getFullYear() + eventData.repeat.interval);
        }

        currentDate.setMonth(originalMonth);
        currentDate.setDate(originalDay);

        if (currentDate.getMonth() !== originalMonth || currentDate.getDate() !== originalDay) {
          currentDate.setMonth(0);
          currentDate.setDate(1);
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }

        break;
      }
    }
  }

  return events;
};
