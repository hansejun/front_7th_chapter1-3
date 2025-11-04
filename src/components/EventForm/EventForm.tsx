import { Notifications, Repeat } from '@mui/icons-material';
import {
  Button,
  FormControl,
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
import { getRepeatTypeLabel } from '../../utils/repeatTypeUtils';
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
  onReset,
}) => {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    onFieldChange('startTime', newStartTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    onFieldChange('endTime', newEndTime);
  };

  const hasFormErrors = !!startTimeError || !!endTimeError;
  const isFormEmpty = !formData.title || !formData.date || !formData.startTime || !formData.endTime;

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
          placeholder="일정 제목을 입력하세요"
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
          placeholder="일정 설명을 입력하세요"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={formData.location}
          onChange={(e) => onFieldChange('location', e.target.value)}
          placeholder="장소를 입력하세요"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="category">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>
          <Repeat fontSize="small" /> 반복 설정
        </FormLabel>
        <Stack spacing={1}>
          <Select
            size="small"
            value={formData.repeat.type}
            onChange={(e) =>
              onFieldChange('repeat', {
                ...formData.repeat,
                type: e.target.value as RepeatType,
              })
            }
          >
            <MenuItem value="none">반복 없음</MenuItem>
            <MenuItem value="daily">매일</MenuItem>
            <MenuItem value="weekly">매주</MenuItem>
            <MenuItem value="monthly">매월</MenuItem>
            <MenuItem value="yearly">매년</MenuItem>
          </Select>

          {formData.repeat.type !== 'none' && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  type="number"
                  value={formData.repeat.interval}
                  onChange={(e) =>
                    onFieldChange('repeat', {
                      ...formData.repeat,
                      interval: parseInt(e.target.value) || 1,
                    })
                  }
                  inputProps={{ min: 1 }}
                  sx={{ width: 80 }}
                />
                <Typography>{getRepeatTypeLabel(formData.repeat.type)}마다</Typography>
              </Stack>

              {!isEditMode && (
                <TextField
                  size="small"
                  type="date"
                  label="종료일"
                  value={formData.repeat.endDate || ''}
                  onChange={(e) =>
                    onFieldChange('repeat', {
                      ...formData.repeat,
                      endDate: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </>
          )}
        </Stack>
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>
          <Notifications fontSize="small" /> 알림
        </FormLabel>
        <Select
          size="small"
          value={formData.notificationTime}
          onChange={(e) => onFieldChange('notificationTime', Number(e.target.value))}
        >
          <MenuItem value={0}>알림 없음</MenuItem>
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={hasFormErrors || isFormEmpty}
          fullWidth
        >
          {isEditMode ? '수정' : '추가'}
        </Button>
        {onReset && (
          <Button variant="outlined" onClick={onReset} fullWidth>
            초기화
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
