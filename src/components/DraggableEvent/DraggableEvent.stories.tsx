import { DndContext } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import { DraggableEvent } from './DraggableEvent';
import { Event } from '../../types';

const meta: Meta<typeof DraggableEvent> = {
  title: 'Components/DraggableEvent',
  component: DraggableEvent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `DraggableEvent는 캘린더에 표시되는 개별 일정 아이템 컴포넌트입니다.

**주요 기능:**
- **드래그 앤 드롭**: \`@dnd-kit/core\`를 사용하여 일정을 다른 날짜로 드래그 가능
- **알림 표시**: 알림이 완료된 일정은 빨간색 배경과 🔔 아이콘으로 표시
- **반복 일정 표시**: 반복 일정은 🔁 아이콘으로 표시
- **카테고리 구분**: 업무, 개인, 가족, 기타 카테고리에 따라 시각적으로 구분

**시각적 상태:**
- 일반 일정: 회색 배경 (#f5f5f5)
- 알림 완료: 빨간색 배경 (#ffebee) + 빨간색 텍스트 (#d32f2f) + 굵은 글씨

**사용 시 주의사항:**
- 드래그 기능을 사용하려면 반드시 \`<DndContext>\`로 감싸야 합니다.
- \`notifiedEvents\`는 문자열 배열로 일정 ID를 전달해야 합니다.`,
      },
    },
  },
  decorators: [
    (Story) => (
      <DndContext>
        <Box sx={{ width: 300, padding: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Story />
        </Box>
      </DndContext>
    ),
  ],
  argTypes: {
    event: {
      control: 'object',
      description: '이벤트 데이터',
      table: {
        type: { summary: 'Event' },
      },
    },
    notifiedEvents: {
      control: 'object',
      description: '알림이 완료된 이벤트 ID 목록 (문자열 배열)',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' },
      },
    },
    overlay: {
      control: 'boolean',
      description: '드래그 오버레이 모드 (드래그 중 표시되는 복사본)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2024-11-04',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 스프린트 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

// 기본 일정
export const Default: Story = {
  args: {
    event: baseEvent,
    notifiedEvents: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '기본 일정 아이템입니다. 업무 카테고리이며, 알림과 반복 설정이 없는 일반 일정입니다.',
      },
    },
  },
};

// 알림 완료 상태
export const WithNotificationCompleted: Story = {
  args: {
    event: {
      ...baseEvent,
      notificationTime: 30,
    },
    notifiedEvents: ['1'],
  },
  parameters: {
    docs: {
      description: {
        story: `알림이 완료된 일정입니다.

**시각적 변화:**
- 배경색: 회색 → 빨간색 (#ffebee)
- 텍스트: 기본 → 빨간색 + 굵게 (#d32f2f)
- 아이콘: 🔔 알림 아이콘 표시`,
      },
    },
  },
};

// 반복 일정
export const RecurringEvent: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '주간 팀 미팅',
      repeat: { type: 'weekly', interval: 1, id: 'weekly-meeting' },
    },
    notifiedEvents: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '반복 일정 아이템입니다. 🔁 반복 아이콘이 표시되며, 마우스를 올리면 반복 패턴 정보를 확인할 수 있습니다.',
      },
    },
  },
};

// 반복 + 알림 완료
export const RecurringWithNotification: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '데일리 스크럼',
      repeat: { type: 'daily', interval: 1, id: 'daily-scrum' },
      notificationTime: 5,
    },
    notifiedEvents: ['1'],
  },
  parameters: {
    docs: {
      description: {
        story: `반복 일정이면서 알림도 완료된 상태입니다.

- 🔁 반복 아이콘
- 🔔 알림 아이콘
- 빨간색 배경 + 굵은 텍스트`,
      },
    },
  },
};

// 긴 제목 처리
export const WithLongTitle: Story = {
  args: {
    event: {
      ...baseEvent,
      title:
        '아주 긴 제목의 일정입니다. 이 일정은 제목이 너무 길어서 한 줄에 다 표시되지 않을 수 있습니다.',
    },
    notifiedEvents: [],
  },
  parameters: {
    docs: {
      description: {
        story: '매우 긴 제목의 일정입니다. `noWrap` 속성으로 말줄임표(...)가 표시됩니다.',
      },
    },
  },
};

// 다양한 카테고리
export const DifferentCategories: Story = {
  args: {
    event: {
      ...baseEvent,
      category: '가족',
      title: '가족 저녁',
    },
    notifiedEvents: [],
  },
  parameters: {
    docs: {
      description: {
        story: `카테고리별 일정 표시 예시입니다.

Controls 패널에서 \`event.category\`를 변경하여 다양한 카테고리를 확인할 수 있습니다:
- 업무
- 개인
- 가족
- 기타`,
      },
    },
  },
};
