import { Box, Button } from '@mui/material';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';

import OverlapWarningDialog from './OverlapWarningDialog';
import { Event } from '../../types';

const meta: Meta<typeof OverlapWarningDialog> = {
  title: 'Components/OverlapWarningDialog',
  component: OverlapWarningDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `OverlapWarningDialog는 일정 시간이 겹칠 때 사용자에게 경고를 표시하고 계속 진행할지 묻는 다이얼로그 컴포넌트입니다.

**주요 기능:**
- **겹치는 일정 목록 표시**: 현재 일정과 시간이 겹치는 모든 일정을 보여줍니다
- **확인/취소 선택**: 사용자가 겹침을 무시하고 계속 진행하거나 취소할 수 있습니다
- **상세 정보 제공**: 각 겹치는 일정의 제목, 날짜, 시간을 표시합니다

**사용 시나리오:**
- 사용자가 새 일정을 추가하거나 수정할 때 기존 일정과 시간이 겹치는 경우
- 드래그 앤 드롭으로 일정을 이동할 때 다른 일정과 겹치는 경우

**인터랙션:**
- 아래 "다이얼로그 열기" 버튼을 클릭하거나 Controls 패널에서 \`open\`을 \`true\`로 변경하여 다이얼로그를 볼 수 있습니다.`,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 상태',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    overlappingEvents: {
      control: 'object',
      description: '겹치는 일정 목록',
      table: {
        type: { summary: 'Event[]' },
      },
    },
    onClose: {
      description: '다이얼로그 닫기 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onConfirm: {
      description: '계속 진행 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for interactive dialog control
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DialogWrapper(args: any) {
  const [, updateArgs] = useArgs();

  const handleOpen = () => {
    updateArgs({ open: true });
  };

  const handleClose = () => {
    updateArgs({ open: false });
  };

  const handleConfirm = () => {
    console.log('User confirmed to proceed despite overlap');
    updateArgs({ open: false });
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        다이얼로그 열기
      </Button>
      <OverlapWarningDialog {...args} onClose={handleClose} onConfirm={handleConfirm} />
    </Box>
  );
}

// Sample overlapping events for testing
const singleOverlap: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-11-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const multipleOverlaps: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-11-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 리뷰',
    date: '2024-11-05',
    startTime: '14:30',
    endTime: '15:30',
    description: '분기별 프로젝트 리뷰',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '1:1 미팅',
    date: '2024-11-05',
    startTime: '14:45',
    endTime: '15:45',
    description: '매니저와 1:1',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const longTitleOverlap: Event[] = [
  {
    id: '1',
    title: '아주 긴 제목의 일정입니다. 이 일정은 매우 중요한 프로젝트 킥오프 미팅입니다.',
    date: '2024-11-05',
    startTime: '10:00',
    endTime: '12:00',
    description: '새로운 프로젝트 시작',
    location: '본사 대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// 단일 겹침
export const SingleOverlap: Story = {
  args: {
    open: false,
    overlappingEvents: singleOverlap,
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story: `하나의 일정과 겹치는 경우입니다.

다이얼로그는 겹치는 일정의 정보를 명확하게 표시하여 사용자가 의사결정을 할 수 있도록 합니다.`,
      },
    },
  },
};

// 다중 겹침
export const MultipleOverlaps: Story = {
  args: {
    open: false,
    overlappingEvents: multipleOverlaps,
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story: `여러 일정과 동시에 겹치는 경우입니다.

세 개 이상의 일정이 겹칠 때도 모든 정보를 스크롤 가능한 형태로 표시합니다.`,
      },
    },
  },
};

// 긴 제목 처리
export const LongTitleOverlap: Story = {
  args: {
    open: false,
    overlappingEvents: longTitleOverlap,
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story: `매우 긴 제목의 일정과 겹치는 경우입니다.

긴 제목도 다이얼로그 내에서 올바르게 표시되고 줄바꿈이 적용됩니다.`,
      },
    },
  },
};

// ============================================
// Visual Regression Testing Stories
// ============================================
// These stories are for Chromatic visual testing only
// They render the dialog in an open state for snapshot comparison

export const VisualTest_SingleOverlapOpen: Story = {
  args: {
    open: true,
    overlappingEvents: singleOverlap,
    onClose: () => {},
    onConfirm: () => {},
  },
  parameters: {
    docs: {
      disable: true,
    },
    chromatic: {
      delay: 300,
    },
  },
};

export const VisualTest_MultipleOverlapsOpen: Story = {
  args: {
    open: true,
    overlappingEvents: multipleOverlaps,
    onClose: () => {},
    onConfirm: () => {},
  },
  parameters: {
    docs: {
      disable: true,
    },
    chromatic: {
      delay: 300,
    },
  },
};

export const VisualTest_LongTitleOverlapOpen: Story = {
  args: {
    open: true,
    overlappingEvents: longTitleOverlap,
    onClose: () => {},
    onConfirm: () => {},
  },
  parameters: {
    docs: {
      disable: true,
    },
    chromatic: {
      delay: 300,
    },
  },
};
