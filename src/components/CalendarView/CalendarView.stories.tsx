import { DndContext } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react';

import { CalendarView } from './CalendarView';
import { Event } from '../../types';

const meta: Meta<typeof CalendarView> = {
  title: 'Components/CalendarView',
  component: CalendarView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `CalendarView 컴포넌트는 캘린더를 주간(Week) 또는 월간(Month) 형태로 표시하는 컴포넌트입니다.

**주요 기능:**
- **뷰 전환**: Week/Month 버튼으로 주간/월간 뷰 모드를 전환할 수 있습니다.
- **네비게이션**: 이전/다음 버튼으로 주/월 단위로 날짜를 이동할 수 있습니다.
- **알림 표시**: \`notifiedEvents\` prop을 통해 알림이 완료된 일정을 시각적으로 구분합니다 (빨간색 배경 + 🔔 아이콘).
- **반복 일정**: 반복 일정은 🔁 아이콘으로 표시됩니다.
- **공휴일 표시**: \`holidays\` prop을 통해 월간 뷰에서 공휴일 이름을 표시할 수 있습니다.
- **드래그 앤 드롭**: \`@dnd-kit/core\`의 DndContext와 함께 사용하여 일정을 다른 날짜로 드래그하여 이동할 수 있습니다.

**사용 시 주의사항:**
- 드래그 앤 드롭 기능을 사용하려면 반드시 \`<DndContext>\`로 감싸야 합니다.
- \`notifiedEvents\`는 문자열 배열로 일정 ID를 전달해야 합니다.
- \`holidays\`는 'YYYY-MM-DD' 형식의 날짜 문자열을 키로 사용합니다.`,
      },
    },
  },
  decorators: [
    (Story) => (
      <DndContext>
        <Story />
      </DndContext>
    ),
  ],
  argTypes: {
    view: {
      control: 'radio',
      options: ['week', 'month'],
      description: '캘린더 보기 모드 (주간/월간)',
      table: {
        type: { summary: "'week' | 'month'" },
        defaultValue: { summary: 'week' },
      },
    },
    currentDate: {
      control: 'date',
      description: '현재 표시할 날짜',
      table: {
        type: { summary: 'Date' },
      },
    },
    events: {
      control: 'object',
      description: '표시할 일정 목록',
      table: {
        type: { summary: 'Event[]' },
      },
    },
    notifiedEvents: {
      control: 'object',
      description: '알림이 완료된 일정의 ID 배열',
      table: {
        type: { summary: 'number[]' },
        defaultValue: { summary: '[]' },
      },
    },
    holidays: {
      control: 'object',
      description: '공휴일 정보 (날짜 문자열: 공휴일명)',
      table: {
        type: { summary: 'Record<string, string>' },
        defaultValue: { summary: '{}' },
      },
    },
    onDateClick: {
      action: 'date-clicked',
      description: '날짜 셀 클릭 시 호출되는 콜백',
      table: {
        type: { summary: '(date: Date) => void' },
      },
    },
    onPrevClick: {
      action: 'prev-clicked',
      description: '이전 버튼 클릭 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onNextClick: {
      action: 'next-clicked',
      description: '다음 버튼 클릭 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onViewChange: {
      action: 'view-changed',
      description: '뷰 모드 변경 시 호출되는 콜백',
      table: {
        type: { summary: "(view: 'week' | 'month') => void" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 통합 Mock 이벤트 데이터 (일반 일정 + 반복 일정)
const mockEvents: Event[] = [
  {
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
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-11-04',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '사내 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '프로젝트 마감',
    date: '2024-11-05',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기 프로젝트 마감일',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1440,
  },
  {
    id: '4',
    title: '가족 저녁',
    date: '2024-11-06',
    startTime: '19:00',
    endTime: '21:00',
    description: '가족과 저녁 식사',
    location: '집',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  // 반복 일정
  {
    id: '5',
    title: '데일리 스크럼',
    date: '2024-11-04',
    startTime: '09:00',
    endTime: '09:15',
    description: '매일 아침 스크럼',
    location: 'Zoom',
    category: '업무',
    repeat: { type: 'daily', interval: 1, id: 'daily-scrum' },
    notificationTime: 5,
  },
  {
    id: '6',
    title: '데일리 스크럼',
    date: '2024-11-05',
    startTime: '09:00',
    endTime: '09:15',
    description: '매일 아침 스크럼',
    location: 'Zoom',
    category: '업무',
    repeat: { type: 'daily', interval: 1, id: 'daily-scrum' },
    notificationTime: 5,
  },
  {
    id: '7',
    title: '데일리 스크럼',
    date: '2024-11-06',
    startTime: '09:00',
    endTime: '09:15',
    description: '매일 아침 스크럼',
    location: 'Zoom',
    category: '업무',
    repeat: { type: 'daily', interval: 1, id: 'daily-scrum' },
    notificationTime: 5,
  },
];

const holidays = {
  '2024-11-01': '한글날',
  '2024-11-03': '개천절',
  '2024-11-09': '대체공휴일',
};

// 주간 뷰 - 일반 일정과 반복 일정 포함
export const WeekView: Story = {
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'week',
    events: mockEvents,
    notifiedEvents: [],
    holidays: {},
  },
  render: (args) => {
    // Storybook의 date control은 timestamp를 반환하므로 Date 객체로 변환
    const currentDate =
      typeof args.currentDate === 'number' ? new Date(args.currentDate) : args.currentDate;

    return (
      <CalendarView
        {...args}
        currentDate={currentDate}
        view={args.view}
        events={args.events}
        notifiedEvents={args.notifiedEvents}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**주간 뷰의 기본 상태입니다.**

- 7일간의 일정을 한눈에 확인
- 일반 일정 4개 + 반복 일정(데일리 스크럼) 3개 포함
- Controls 패널에서 \`view\`를 'month'로 변경하여 월간 뷰로 전환 가능
        `,
      },
    },
  },
};

// 월간 뷰 - 일반 일정과 반복 일정 포함
export const MonthView: Story = {
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'month',
    events: mockEvents,
    notifiedEvents: [],
    holidays: {},
  },
  render: (args) => {
    const currentDate =
      typeof args.currentDate === 'number' ? new Date(args.currentDate) : args.currentDate;

    return (
      <CalendarView
        {...args}
        currentDate={currentDate}
        view={args.view}
        events={args.events}
        notifiedEvents={args.notifiedEvents}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**월간 뷰의 기본 상태입니다.**

- 한 달의 모든 날짜와 일정을 표시
- 주 단위로 구분된 캘린더 레이아웃
- Controls 패널에서 \`view\`를 'week'로 변경하여 주간 뷰로 전환 가능
        `,
      },
    },
  },
};

// 주간 뷰 - 알림 완료된 일정 포함
export const WeekViewWithNotifications: Story = {
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'week',
    events: mockEvents,
    notifiedEvents: ['1', '3'], // 팀 회의와 프로젝트 마감 알림 완료
    holidays: {},
  },
  render: (args) => {
    const currentDate =
      typeof args.currentDate === 'number' ? new Date(args.currentDate) : args.currentDate;

    return (
      <CalendarView
        {...args}
        currentDate={currentDate}
        view={args.view}
        events={args.events}
        notifiedEvents={args.notifiedEvents}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**알림이 완료된 일정을 시각적으로 구분하는 예시입니다.**

- \`notifiedEvents: ['1', '3']\` - ID가 1번과 3번인 일정에 알림 완료 표시
- 알림 완료된 일정은 **빨간색 배경** + **굵은 글씨** + **🔔 아이콘**으로 표시됩니다
- "팀 회의"와 "프로젝트 마감" 일정이 알림 상태로 표시됩니다

**시각적 차이:**
- 일반 일정: 회색 배경 (#f5f5f5)
- 알림 완료: 빨간색 배경 (#ffebee), 빨간색 텍스트 (#d32f2f)
        `,
      },
    },
  },
};

// 월간 뷰 - 공휴일 포함
export const MonthViewWithHolidays: Story = {
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'month',
    events: mockEvents,
    notifiedEvents: [],
    holidays,
  },
  render: (args) => {
    const currentDate =
      typeof args.currentDate === 'number' ? new Date(args.currentDate) : args.currentDate;

    return (
      <CalendarView
        {...args}
        currentDate={currentDate}
        view={args.view}
        events={args.events}
        notifiedEvents={args.notifiedEvents}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**공휴일 정보가 포함된 월간 뷰입니다.**

- \`holidays\` prop을 통해 공휴일 정보 전달
- 날짜 아래에 공휴일 이름이 빨간색으로 표시됩니다
- 포함된 공휴일:
  - 11월 1일: 한글날
  - 11월 3일: 개천절
  - 11월 9일: 대체공휴일

**사용법:**
\`\`\`typescript
holidays={{
  '2024-11-01': '한글날',
  '2024-11-03': '개천절',
  '2024-11-09': '대체공휴일'
}}
\`\`\`
        `,
      },
    },
  },
};

// 긴 제목 처리
export const LongTitleEvents: Story = {
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'week',
    events: [
      {
        id: '200',
        title:
          '아주 긴 제목의 일정입니다. 이 일정은 제목이 너무 길어서 셀에 다 표시되지 않을 수 있습니다.',
        date: '2024-11-04',
        startTime: '14:00',
        endTime: '15:00',
        description: '긴 제목 테스트',
        location: '',
        category: '기타',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '201',
        title: '짧은 제목',
        date: '2024-11-04',
        startTime: '15:00',
        endTime: '16:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ],
    notifiedEvents: [],
    holidays: {},
  },
  render: (args) => {
    const currentDate =
      typeof args.currentDate === 'number' ? new Date(args.currentDate) : args.currentDate;

    return (
      <CalendarView
        {...args}
        currentDate={currentDate}
        view={args.view}
        events={args.events}
        notifiedEvents={args.notifiedEvents}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**긴 제목의 일정이 어떻게 표시되는지 테스트하는 스토리입니다.**

- 매우 긴 제목의 일정과 짧은 제목의 일정을 비교
- 제목이 셀 너비를 초과할 경우 \`noWrap\` 속성으로 텍스트가 말줄임표(...)로 처리됩니다
- 일정 제목에 마우스를 올리면 전체 제목을 확인할 수 있습니다

**테스트 케이스:**
- 긴 제목: "아주 긴 제목의 일정입니다. 이 일정은 제목이 너무 길어서..."
- 짧은 제목: "짧은 제목"
        `,
      },
    },
  },
};
