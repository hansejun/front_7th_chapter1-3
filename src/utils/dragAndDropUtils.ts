import { Event } from '../types';

/**
 * 일정이 드래그 가능한지 판별
 * 일반 일정(repeat.type === 'none')만 드래그 가능
 */
export function isDraggable(event: Event): boolean {
  return event.repeat.type === 'none';
}

/**
 * 일정의 날짜를 변경하고 나머지 필드는 유지
 * @param event 원본 일정
 * @param newDate 새로운 날짜 (YYYY-MM-DD 형식)
 * @returns 날짜가 변경된 새 일정 객체
 */
export function updateEventDate(event: Event, newDate: string): Event {
  return {
    ...event,
    date: newDate,
  };
}
