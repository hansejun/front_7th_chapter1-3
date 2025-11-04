import { useDraggable } from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { Event } from '../../types';
import { isDraggable } from '../../utils/dragAndDropUtils';
import { getRepeatTypeLabel } from '../../utils/repeatTypeUtils';

// 스타일 상수
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
  },
};

interface DraggableEventProps {
  event: Event;
  overlay?: boolean;
  notifiedEvents: string[];
}

export const DraggableEvent = ({ event, overlay = false, notifiedEvents }: DraggableEventProps) => {
  const draggable = useDraggable({
    id: event.id,
    disabled: overlay || !isDraggable(event),
  });

  const isNotified = notifiedEvents.includes(event.id);
  const isRepeating = event.repeat.type !== 'none';

  const style =
    !overlay && draggable.transform
      ? {
          transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
          opacity: draggable.isDragging ? 0.5 : 1,
        }
      : undefined;

  return (
    <Box
      ref={overlay ? undefined : draggable.setNodeRef}
      style={style}
      {...(overlay ? {} : draggable.listeners)}
      {...(overlay ? {} : draggable.attributes)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        cursor: isDraggable(event) ? (draggable.isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && (
          <Tooltip
            title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
              event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
            }`}
          >
            <Repeat fontSize="small" />
          </Tooltip>
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};
