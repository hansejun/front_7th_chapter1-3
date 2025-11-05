import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Close, Delete, Edit, Notifications, Repeat } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView } from './components/CalendarView/CalendarView.tsx';
import { CalendarViewControl } from './components/CalendarView/CalendarViewControl.tsx';
import { DraggableEvent } from './components/DraggableEvent/DraggableEvent.tsx';
import { EventForm } from './components/EventForm/EventForm.tsx';
import OverlapWarningDialog from './components/OverlapWarningDialog/OverlapWarningDialog.tsx';
import RecurringEventDialog from './components/RecurringEventDialog/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useDragAndDrop } from './hooks/useDragAndDrop.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types.ts';
import { getRepeatTypeLabel } from './utils/repeatTypeUtils.ts';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');
  const [pendingDragUpdate, setPendingDragUpdate] = useState<Event | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const { events, saveEvent, deleteEvent, createRepeatEvent, fetchEvents } = useEventOperations(
    false,
    () => {}
  );

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      await fetchEvents();
    }
  );

  const {
    formData,
    startTimeError,
    endTimeError,
    editingEvent,
    onFieldChange,
    setEditingEvent,
    resetForm,
    editEvent,
    setRecurringEditMode,
    addEvent,
    updateEvent,
  } = useEventForm({
    events,
    saveEvent,
    createRepeatEvent,
    handleRecurringEdit,
    onOverlap: (overlapping) => {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    },
    onValidationError: (message) => {
      enqueueSnackbar(message, { variant: 'error' });
    },
    onEditComplete: () => {
      setEditingEvent(null);
    },
  });

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  // 드래그 앤 드롭 센서 설정 (클릭과 구분하기 위해 delay 사용)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px 이상 이동해야 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms 누르고 있어야 드래그 시작
        tolerance: 5,
      },
    })
  );

  // 드래그 앤 드롭 처리
  const handleDrop = async (updatedEvent: Event, hasOverlap: boolean, overlapping: Event[]) => {
    if (hasOverlap) {
      // 겹침 발생 시 경고 다이얼로그 표시
      setOverlappingEvents(overlapping);
      setPendingDragUpdate(updatedEvent);
      setIsOverlapDialogOpen(true);
    } else {
      // 겹침 없으면 바로 업데이트
      try {
        await saveEvent(updatedEvent);
        enqueueSnackbar('일정이 수정되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 수정 실패', { variant: 'error' });
      }
    }
  };

  const { activeEvent, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop({
    events,
    onDrop: handleDrop,
  });

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const addOrUpdateEvent = async () => {
    if (editingEvent) {
      await updateEvent();
    } else {
      await addEvent();
    }
  };

  const handleCalendarDateClick = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onFieldChange('date', dateString);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventForm
          formData={formData}
          isEditMode={!!editingEvent}
          startTimeError={startTimeError || undefined}
          endTimeError={endTimeError || undefined}
          onFieldChange={onFieldChange}
          onSubmit={addOrUpdateEvent}
        />

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Typography variant="h4">일정 보기</Typography>

          <CalendarViewControl
            view={view}
            onPrevClick={() => navigate('prev')}
            onNextClick={() => navigate('next')}
            onViewChange={setView}
          />
          <CalendarView
            currentDate={currentDate}
            view={view}
            events={filteredEvents}
            notifiedEvents={notifiedEvents}
            holidays={holidays}
            onDateClick={handleCalendarDateClick}
          />
          <DragOverlay>
            {activeEvent ? (
              <DraggableEvent event={activeEvent} overlay={true} notifiedEvents={notifiedEvents} />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="search">일정 검색</FormLabel>
            <TextField
              id="search"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                      {event.repeat.type !== 'none' && (
                        <Tooltip
                          title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                            event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                          }`}
                        >
                          <Repeat fontSize="small" />
                        </Tooltip>
                      )}
                      <Typography
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                      >
                        {event.title}
                      </Typography>
                    </Stack>
                    <Typography>{event.date}</Typography>
                    <Typography>
                      {event.startTime} - {event.endTime}
                    </Typography>
                    <Typography>{event.description}</Typography>
                    <Typography>{event.location}</Typography>
                    <Typography>카테고리: {event.category}</Typography>
                    {event.repeat.type !== 'none' && (
                      <Typography>
                        반복: {event.repeat.interval}
                        {event.repeat.type === 'daily' && '일'}
                        {event.repeat.type === 'weekly' && '주'}
                        {event.repeat.type === 'monthly' && '월'}
                        {event.repeat.type === 'yearly' && '년'}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Typography>
                    )}
                    <Typography>
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => handleEditEvent(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => handleDeleteEvent(event)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <OverlapWarningDialog
        open={isOverlapDialogOpen}
        onClose={() => {
          setIsOverlapDialogOpen(false);
          setPendingDragUpdate(null);
        }}
        onConfirm={async () => {
          setIsOverlapDialogOpen(false);
          try {
            if (pendingDragUpdate) {
              // 드래그 앤 드롭으로 인한 겹침
              await saveEvent(pendingDragUpdate);
              setPendingDragUpdate(null);
              enqueueSnackbar('일정이 수정되었습니다', { variant: 'success' });
            } else {
              // 일반 폼 저장으로 인한 겹침 - formData를 직접 저장
              if (editingEvent) {
                await saveEvent({
                  ...formData,
                  id: editingEvent.id,
                  repeat: editingEvent.repeat,
                });
                resetForm();
                setEditingEvent(null);
              } else {
                await saveEvent(formData);
                resetForm();
              }
              enqueueSnackbar('일정이 저장되었습니다', { variant: 'success' });
            }
          } catch (error) {
            console.error(error);
            enqueueSnackbar('일정 저장 실패', { variant: 'error' });
          }
        }}
        overlappingEvents={overlappingEvents}
      />

      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
        mode={recurringDialogMode}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
