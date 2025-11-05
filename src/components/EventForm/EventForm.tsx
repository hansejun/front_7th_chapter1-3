import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';

import { EventForm as EventFormType, RepeatInfo, RepeatType } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export interface EventFormProps {
  formData: EventFormType;
  isEditMode?: boolean;
  startTimeError?: string;
  endTimeError?: string;
  onFieldChange: (field: keyof EventFormType, value: string | number | RepeatInfo) => void;
  onSubmit: () => void;
  onReset?: () => void;
}

export const EventForm: FC<EventFormProps> = ({
  formData,
  isEditMode = false,
  startTimeError,
  endTimeError,
  onFieldChange,
  onSubmit,
}) => {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange('startTime', e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange('endTime', e.target.value);
  };

  // isRepeating 상태는 formData.repeat.type이 'none'이 아닌지로 판단
  const isRepeating = formData.repeat.type !== 'none';

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{isEditMode ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={formData.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={formData.startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(formData.startTime, formData.endTime)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={formData.endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(formData.startTime, formData.endTime)}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={formData.location}
          onChange={(e) => onFieldChange('location', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!isEditMode && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeating}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    onFieldChange('repeat', {
                      ...formData.repeat,
                      type: 'daily',
                    });
                  } else {
                    onFieldChange('repeat', {
                      ...formData.repeat,
                      type: 'none',
                    });
                  }
                }}
              />
            }
            label="반복 일정"
          />
        </FormControl>
      )}

      {isRepeating && !isEditMode && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 유형</FormLabel>
            <Select
              size="small"
              value={formData.repeat.type}
              aria-label="반복 유형"
              onChange={(e) =>
                onFieldChange('repeat', {
                  ...formData.repeat,
                  type: e.target.value as RepeatType,
                })
              }
            >
              <MenuItem value="daily" aria-label="daily-option">
                매일
              </MenuItem>
              <MenuItem value="weekly" aria-label="weekly-option">
                매주
              </MenuItem>
              <MenuItem value="monthly" aria-label="monthly-option">
                매월
              </MenuItem>
              <MenuItem value="yearly" aria-label="yearly-option">
                매년
              </MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
              <TextField
                id="repeat-interval"
                size="small"
                type="number"
                value={formData.repeat.interval}
                onChange={(e) =>
                  onFieldChange('repeat', {
                    ...formData.repeat,
                    interval: Number(e.target.value),
                  })
                }
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
              <TextField
                id="repeat-end-date"
                size="small"
                type="date"
                value={formData.repeat.endDate || ''}
                onChange={(e) =>
                  onFieldChange('repeat', {
                    ...formData.repeat,
                    endDate: e.target.value,
                  })
                }
              />
            </FormControl>
          </Stack>
        </Stack>
      )}

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={formData.notificationTime}
          onChange={(e) => onFieldChange('notificationTime', Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {isEditMode ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};
