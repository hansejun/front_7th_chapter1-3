import { Box, Button } from '@mui/material';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';

import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../../types';

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `RecurringEventDialog는 반복 일정을 수정하거나 삭제할 때 사용자에게 선택 옵션을 제공하는 다이얼로그 컴포넌트입니다.

**주요 기능:**
- **수정 모드**: "이 일정만 수정" 또는 "모든 반복 일정 수정" 선택
- **삭제 모드**: "이 일정만 삭제" 또는 "모든 반복 일정 삭제" 선택
- **컨텍스트 정보**: 반복 일정의 제목과 반복 패턴 표시

**사용 시나리오:**
- 사용자가 반복 일정의 한 인스턴스를 수정/삭제하려 할 때
- 해당 일정만 변경할지, 모든 반복 일정을 변경할지 선택해야 할 때

**사용 시 주의사항:**
- \`mode\`가 'edit'이면 수정 관련 메시지, 'delete'면 삭제 관련 메시지가 표시됩니다.
- \`onConfirm\`은 사용자가 선택한 옵션(true: 단일 일정, false: 전체 일정)을 전달합니다.

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
    event: {
      control: 'object',
      description: '반복 일정 데이터',
      table: {
        type: { summary: 'Event | null' },
      },
    },
    mode: {
      control: 'radio',
      options: ['edit', 'delete'],
      description: '작업 타입 (수정 또는 삭제)',
      table: {
        type: { summary: "'edit' | 'delete'" },
        defaultValue: { summary: "'edit'" },
      },
    },
    onClose: {
      description: '다이얼로그 닫기 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onConfirm: {
      description: '옵션 선택 시 호출되는 콜백',
      table: {
        type: { summary: '(editSingleOnly: boolean) => void' },
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

  const handleConfirm = (editSingleOnly: boolean) => {
    console.log('Confirmed:', editSingleOnly ? '단일 일정' : '전체 일정');
    updateArgs({ open: false });
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        다이얼로그 열기
      </Button>
      <RecurringEventDialog {...args} onClose={handleClose} onConfirm={handleConfirm} />
    </Box>
  );
}

const recurringEvent: Event = {
  id: '1',
  title: '주간 팀 미팅',
  date: '2024-11-04',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 월요일 정기 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    id: 'weekly-meeting-1',
  },
  notificationTime: 10,
};

// 수정 다이얼로그
export const EditDialog: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: recurringEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story: `반복 일정 수정 다이얼로그입니다.

사용자는 다음 중 하나를 선택할 수 있습니다:
- **이 일정만 수정**: 현재 선택한 일정 인스턴스만 수정
- **모든 반복 일정 수정**: 동일한 반복 ID를 가진 모든 일정 수정

"다이얼로그 열기" 버튼을 클릭하거나 Controls 패널에서 \`open\`을 변경하여 다이얼로그를 제어할 수 있습니다.`,
      },
    },
  },
};

// 삭제 다이얼로그
export const DeleteDialog: Story = {
  args: {
    open: false,
    mode: 'delete',
    event: recurringEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story: `반복 일정 삭제 다이얼로그입니다.

사용자는 다음 중 하나를 선택할 수 있습니다:
- **이 일정만 삭제**: 현재 선택한 일정 인스턴스만 삭제
- **모든 반복 일정 삭제**: 동일한 반복 ID를 가진 모든 일정 삭제`,
      },
    },
  },
};

// 다양한 반복 타입
export const DailyRecurring: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: {
      ...recurringEvent,
      title: '데일리 스크럼',
      repeat: {
        type: 'daily',
        interval: 1,
        id: 'daily-scrum',
      },
    },
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story:
          '매일 반복되는 일정의 수정 다이얼로그입니다. 반복 타입에 따라 다이얼로그에 표시되는 정보가 달라집니다.',
      },
    },
  },
};

// 긴 제목 처리
export const WithLongTitle: Story = {
  args: {
    open: false,
    mode: 'delete',
    event: {
      ...recurringEvent,
      title: '아주 긴 제목의 반복 일정입니다. 이 일정은 매주 반복되는 중요한 회의입니다.',
      repeat: {
        type: 'weekly',
        interval: 2,
        id: 'long-title-meeting',
      },
    },
    onClose: () => {},
    onConfirm: () => {},
  },
  render: DialogWrapper,
  parameters: {
    docs: {
      description: {
        story:
          '매우 긴 제목의 반복 일정에 대한 삭제 다이얼로그입니다. 제목이 길어도 다이얼로그가 올바르게 표시되는지 확인할 수 있습니다.',
      },
    },
  },
};

// ============================================
// Visual Regression Testing Stories
// ============================================
// These stories are for Chromatic visual testing only
// They render the dialog in an open state for snapshot comparison

export const VisualTest_EditDialogOpen: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: recurringEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
  parameters: {
    docs: {
      disable: true, // Hide from Storybook Docs
    },
    chromatic: {
      delay: 300, // Wait for dialog animation to complete
    },
  },
};

export const VisualTest_DeleteDialogOpen: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: recurringEvent,
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

export const VisualTest_DailyRecurringOpen: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      ...recurringEvent,
      title: '데일리 스크럼',
      repeat: {
        type: 'daily',
        interval: 1,
        id: 'daily-scrum',
      },
    },
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

export const VisualTest_WithLongTitleOpen: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: {
      ...recurringEvent,
      title: '아주 긴 제목의 반복 일정입니다. 이 일정은 매주 반복되는 중요한 회의입니다.',
      repeat: {
        type: 'weekly',
        interval: 2,
        id: 'long-title-meeting',
      },
    },
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
