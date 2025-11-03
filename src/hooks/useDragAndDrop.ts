import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';

import { Event } from '../types';
import { isDraggable, updateEventDate } from '../utils/dragAndDropUtils';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseDragAndDropProps {
  events: Event[];
  /** Callback fired when an event is successfully dropped on a new date */
  onDrop: (event: Event, hasOverlap: boolean, overlappingEvents: Event[]) => void;
}

export function useDragAndDrop({ events, onDrop }: UseDragAndDropProps) {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedEvent = events.find((e) => e.id === event.active.id);
    if (draggedEvent && isDraggable(draggedEvent)) {
      setActiveEvent(draggedEvent);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (!over || !activeEvent) {
      setActiveEvent(null);
      return;
    }

    // over.id는 날짜 문자열 (YYYY-MM-DD)
    const newDate = over.id as string;
    const originalDate = activeEvent.date;

    // 같은 날짜로 드롭하면 아무 일도 안 함
    if (newDate === originalDate) {
      setActiveEvent(null);
      return;
    }

    // 날짜 변경
    const updatedEvent = updateEventDate(activeEvent, newDate);

    // 겹침 감지
    const overlapping = findOverlappingEvents(updatedEvent, events);
    const hasOverlap = overlapping.length > 0;

    // 콜백 호출 (겹침 여부와 겹치는 이벤트 전달)
    onDrop(updatedEvent, hasOverlap, overlapping);

    setActiveEvent(null);
  };

  const handleDragCancel = () => {
    setActiveEvent(null);
  };

  return {
    activeEvent,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
