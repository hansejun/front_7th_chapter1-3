import { ChangeEvent, useState } from 'react';

import { Event, EventForm as EventFormType, RepeatInfo, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

interface UseEventFormParams {
  initialEvent?: Event;
  events: Event[];
  saveEvent: (event: Event | EventFormType) => Promise<void>;
  createRepeatEvent: (event: Event | EventFormType) => Promise<void>;
  handleRecurringEdit: (event: Event, editSingleOnly: boolean) => Promise<void>;
  onOverlap: (overlapping: Event[]) => void;
  onValidationError: (message: string) => void;
  onEditComplete: () => void;
}

export const useEventForm = ({
  initialEvent,
  events,
  saveEvent,
  createRepeatEvent,
  handleRecurringEdit,
  onOverlap,
  onValidationError,
  onEditComplete,
}: UseEventFormParams) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [isRepeating, setIsRepeating] = useState(
    !!initialEvent?.repeat.type && initialEvent.repeat.type !== 'none'
  );
  const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };

  // EventForm 컴포넌트에 전달할 formData 생성
  const formData: EventFormType = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: repeatType,
      interval: repeatInterval,
      endDate: repeatEndDate,
    },
    notificationTime,
  };

  // EventForm의 onFieldChange 핸들러
  const handleFieldChange = (field: keyof EventFormType, value: string | number | RepeatInfo) => {
    switch (field) {
      case 'title':
        setTitle(value as string);
        break;
      case 'date':
        setDate(value as string);
        break;
      case 'startTime': {
        const newStartTime = value as string;
        setStartTime(newStartTime);
        setTimeError(getTimeErrorMessage(newStartTime, endTime));
        break;
      }
      case 'endTime': {
        const newEndTime = value as string;
        setEndTime(newEndTime);
        setTimeError(getTimeErrorMessage(startTime, newEndTime));
        break;
      }
      case 'description':
        setDescription(value as string);
        break;
      case 'location':
        setLocation(value as string);
        break;
      case 'category':
        setCategory(value as string);
        break;
      case 'repeat': {
        const repeatInfo = value as RepeatInfo;
        setRepeatType(repeatInfo.type);
        setRepeatInterval(repeatInfo.interval);
        setRepeatEndDate(repeatInfo.endDate || '');
        setIsRepeating(repeatInfo.type !== 'none');
        break;
      }
      case 'notificationTime':
        setNotificationTime(value as number);
        break;
    }
  };

  const addEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      onValidationError('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (startTimeError || endTimeError) {
      onValidationError('시간 설정을 확인해주세요.');
      return;
    }

    const eventData: EventFormType = {
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    // 반복 생성은 반복 일정을 고려하지 않는다.
    if (isRepeating) {
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    if (hasOverlapEvent) {
      onOverlap(overlapping);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  const updateEvent = async () => {
    if (!editingEvent) {
      return;
    }

    if (!title || !date || !startTime || !endTime) {
      onValidationError('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (startTimeError || endTimeError) {
      onValidationError('시간 설정을 확인해주세요.');
      return;
    }

    const eventData: Event = {
      id: editingEvent.id,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent.repeat, // Keep original repeat settings for recurring event detection
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    if (hasOverlapEvent) {
      onOverlap(overlapping);
      return;
    }

    if (
      editingEvent.repeat.type !== 'none' &&
      editingEvent.repeat.interval > 0 &&
      recurringEditMode !== null
    ) {
      await handleRecurringEdit(eventData, recurringEditMode);
      setRecurringEditMode(null);
    } else {
      await saveEvent(eventData);
    }

    resetForm();
    onEditComplete();
  };

  return {
    formData,
    onFieldChange: handleFieldChange,
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    recurringEditMode,
    setRecurringEditMode,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    addEvent,
    updateEvent,
  };
};
