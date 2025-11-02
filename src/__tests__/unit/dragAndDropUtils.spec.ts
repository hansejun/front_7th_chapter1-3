import { Event } from '../../types';
import { isDraggable, updateEventDate } from '../../utils/dragAndDropUtils';

describe('isDraggable', () => {
  it('일반 일정 (repeat.type === "none")은 드래그 가능하다', () => {
    const event: Event = {
      id: '1',
      title: '일반 일정',
      date: '2025-11-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '드래그 가능한 일정',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    expect(isDraggable(event)).toBe(true);
  });

  it('반복 일정 (repeat.type === "daily")은 드래그 불가능하다', () => {
    const event: Event = {
      id: '2',
      title: '반복 일정',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '드래그 불가능한 일정',
      location: '회의실 B',
      category: '개인',
      repeat: { type: 'daily', interval: 1, endDate: '2025-11-10' },
      notificationTime: 10,
    };

    expect(isDraggable(event)).toBe(false);
  });

  it('반복 일정 (repeat.type === "weekly")은 드래그 불가능하다', () => {
    const event: Event = {
      id: '3',
      title: '주간 반복 일정',
      date: '2025-11-07',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-28' },
      notificationTime: 0,
    };

    expect(isDraggable(event)).toBe(false);
  });

  it('반복 일정 (repeat.type === "monthly")은 드래그 불가능하다', () => {
    const event: Event = {
      id: '4',
      title: '월간 반복 일정',
      date: '2025-11-08',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'monthly', interval: 1, endDate: '2026-01-08' },
      notificationTime: 5,
    };

    expect(isDraggable(event)).toBe(false);
  });

  it('반복 일정 (repeat.type === "yearly")은 드래그 불가능하다', () => {
    const event: Event = {
      id: '5',
      title: '연간 반복 일정',
      date: '2025-11-09',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '기타',
      repeat: { type: 'yearly', interval: 1, endDate: '2028-11-09' },
      notificationTime: 0,
    };

    expect(isDraggable(event)).toBe(false);
  });
});

describe('updateEventDate', () => {
  it('날짜만 변경하고 시간 필드는 유지한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2025-11-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '날짜 변경 테스트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const newDate = '2025-11-10';
    const updatedEvent = updateEventDate(event, newDate);

    expect(updatedEvent.date).toBe(newDate);
    expect(updatedEvent.startTime).toBe('10:00');
    expect(updatedEvent.endTime).toBe('11:00');
    expect(updatedEvent.title).toBe('테스트 일정');
    expect(updatedEvent.description).toBe('날짜 변경 테스트');
    expect(updatedEvent.location).toBe('회의실 A');
    expect(updatedEvent.category).toBe('업무');
  });

  it('다른 날짜로 변경해도 모든 다른 필드는 유지된다', () => {
    const event: Event = {
      id: '2',
      title: '중요 회의',
      date: '2025-11-15',
      startTime: '14:30',
      endTime: '16:00',
      description: '프로젝트 리뷰',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const newDate = '2025-11-20';
    const updatedEvent = updateEventDate(event, newDate);

    expect(updatedEvent.date).toBe(newDate);
    expect(updatedEvent.startTime).toBe('14:30');
    expect(updatedEvent.endTime).toBe('16:00');
    expect(updatedEvent.notificationTime).toBe(10);
    expect(updatedEvent.id).toBe('2');
  });

  it('날짜 형식 YYYY-MM-DD를 정확히 받아들인다', () => {
    const event: Event = {
      id: '3',
      title: '포맷 테스트',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const newDate = '2025-12-31';
    const updatedEvent = updateEventDate(event, newDate);

    expect(updatedEvent.date).toBe('2025-12-31');
  });
});
