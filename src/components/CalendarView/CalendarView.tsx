import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';

import { Event } from '../../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../../utils/dateUtils';
import { DraggableEvent } from '../DraggableEvent/DraggableEvent';
import { DroppableDateCell } from '../DroppableDateCell/DroppableDateCell';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// TableCell 스타일 상수
const tableCellStyles = {
  header: {
    width: '14.28%',
    padding: 1,
    textAlign: 'center' as const,
  },
  data: {
    height: '120px',
    verticalAlign: 'top' as const,
    width: '14.28%',
    padding: 1,
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
};

export interface CalendarViewProps {
  currentDate: Date;
  view: 'week' | 'month';
  events: Event[];
  notifiedEvents: string[];
  holidays?: Record<string, string>;
  onDateClick?: (date: Date) => void;
  onPrevClick?: () => void;
  onNextClick?: () => void;
  onViewChange?: (view: 'week' | 'month') => void;
}

export const CalendarView: FC<CalendarViewProps> = ({
  currentDate,
  view,
  events,
  notifiedEvents,
  holidays = {},
  onDateClick,
  onPrevClick,
  onNextClick,
  onViewChange,
}) => {
  const handleDateClick = (dateString: string) => {
    if (onDateClick) {
      onDateClick(new Date(dateString));
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={tableCellStyles.header}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => {
                  const day = date.getDate();
                  const dateString = formatDate(date);

                  return (
                    <TableCell key={date.toISOString()} sx={tableCellStyles.data}>
                      <DroppableDateCell dateString={dateString} onCellClick={handleDateClick}>
                        <Typography variant="body2" fontWeight="bold">
                          {day}
                        </Typography>
                        {events
                          .filter(
                            (event) => new Date(event.date).toDateString() === date.toDateString()
                          )
                          .map((event) => (
                            <DraggableEvent
                              key={event.id}
                              event={event}
                              notifiedEvents={notifiedEvents}
                            />
                          ))}
                      </DroppableDateCell>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={tableCellStyles.header}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{ ...tableCellStyles.data, position: 'relative' }}
                      >
                        {day && (
                          <DroppableDateCell dateString={dateString} onCellClick={handleDateClick}>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(events, day).map((event) => (
                              <DraggableEvent
                                key={event.id}
                                event={event}
                                notifiedEvents={notifiedEvents}
                              />
                            ))}
                          </DroppableDateCell>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={onPrevClick} data-testid="prev-button">
          <ChevronLeft />
        </IconButton>
        <Button
          variant={view === 'week' ? 'contained' : 'outlined'}
          onClick={() => onViewChange?.('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'month' ? 'contained' : 'outlined'}
          onClick={() => onViewChange?.('month')}
        >
          Month
        </Button>
        <IconButton onClick={onNextClick} data-testid="next-button">
          <ChevronRight />
        </IconButton>
      </Stack>
      {view === 'week' ? renderWeekView() : renderMonthView()}
    </Box>
  );
};
