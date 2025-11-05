import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';

interface CalendarViewControlProps {
  view: 'week' | 'month';
  onPrevClick: () => void;
  onNextClick: () => void;
  onViewChange: (view: 'week' | 'month') => void;
}

export const CalendarViewControl = ({
  view,
  onPrevClick,
  onNextClick,
  onViewChange,
}: CalendarViewControlProps) => {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={onPrevClick}>
        <ChevronLeft />
      </IconButton>
      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => onViewChange?.(e.target.value as 'week' | 'month')}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>
      <IconButton aria-label="Next" onClick={onNextClick}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};
