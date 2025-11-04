import { Box } from '@mui/material';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';

import { EventForm } from './EventForm';
import { EventForm as EventFormType, RepeatInfo } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

const meta: Meta<typeof EventForm> = {
  title: 'Components/EventForm',
  component: EventForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `EventForm 컴포넌트는 일정을 추가하거나 수정할 수 있는 폼을 제공합니다.

**주요 기능:**
- **추가/수정 모드**: \`isEditMode\` prop으로 추가와 수정 모드를 구분합니다.
- **반복 일정 설정**: 매일, 매주, 매월, 매년 반복 옵션과 사용자 정의 간격을 지원합니다.
- **알림 설정**: 1분 전부터 1일 전까지 다양한 알림 시간 옵션을 제공합니다.
- **카테고리**: 업무, 개인, 가족, 기타 카테고리로 일정을 분류할 수 있습니다.
- **유효성 검증**: 시작/종료 시간 검증을 통해 올바른 시간 입력을 보장합니다.

**사용 시 주의사항:**
- 필수 필드: title, date, startTime, endTime
- \`startTimeError\`와 \`endTimeError\` prop으로 시간 검증 오류 메시지를 표시할 수 있습니다.
- \`onFieldChange\`는 각 필드 변경 시 호출되며, 필드명과 값을 전달받습니다.`,
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400, padding: 3 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    formData: {
      control: 'object',
      description: '폼 데이터 (EventForm 타입)',
      table: {
        type: { summary: 'EventForm' },
      },
    },
    isEditMode: {
      control: 'boolean',
      description: '수정 모드 여부',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    startTimeError: {
      control: 'text',
      description: '시작 시간 에러 메시지',
      table: {
        type: { summary: 'string | undefined' },
      },
    },
    endTimeError: {
      control: 'text',
      description: '종료 시간 에러 메시지',
      table: {
        type: { summary: 'string | undefined' },
      },
    },
    onFieldChange: {
      action: 'field-changed',
      description: '필드 변경 시 호출되는 콜백',
      table: {
        type: { summary: '(field: string, value: any) => void' },
      },
    },
    onSubmit: {
      action: 'submitted',
      description: '폼 제출 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onReset: {
      action: 'reset',
      description: '폼 리셋 시 호출되는 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const emptyFormData: EventFormType = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

const filledFormData: EventFormType = {
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

// 기본 모드 - 인터랙티브 (상태 변경 가능)
export const EmptyAddMode: Story = {
  args: {
    formData: emptyFormData,
    isEditMode: false,
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  render: function RenderWithHooks(args) {
    const [{ formData }, updateArgs] = useArgs();

    const handleFieldChange = (field: keyof EventFormType, value: string | number | RepeatInfo) => {
      updateArgs({
        formData: {
          ...formData,
          [field]: value,
        },
      });
    };

    // 시간 검증 에러 계산
    const { startTimeError, endTimeError } = getTimeErrorMessage(
      formData.startTime,
      formData.endTime
    );

    return (
      <EventForm
        {...args}
        formData={formData}
        startTimeError={startTimeError || undefined}
        endTimeError={endTimeError || undefined}
        onFieldChange={handleFieldChange}
        onSubmit={() => console.log('Submit:', formData)}
        onReset={() => updateArgs({ formData: emptyFormData })}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '빈 폼 상태의 추가 모드입니다. 사용자가 새로운 일정을 작성할 때 표시되는 초기 상태이며, **실제로 입력하고 상호작용할 수 있습니다**. 시작 시간이 종료 시간보다 늦으면 에러 메시지가 표시됩니다. Controls 패널에서 formData를 확인할 수 있습니다.',
      },
    },
  },
};

export const FilledEditMode: Story = {
  args: {
    formData: filledFormData,
    isEditMode: true,
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '일정 수정 모드입니다. 기존 일정의 정보가 폼에 채워진 상태로 표시됩니다.',
      },
    },
  },
};

// 에러 상태
export const WithTimeError: Story = {
  args: {
    formData: {
      ...filledFormData,
      startTime: '11:00',
      endTime: '10:00',
    },

    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다',
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `시간 검증 에러 상태를 보여줍니다. 시작 시간이 종료 시간보다 늦을 때 에러 메시지가 표시됩니다.`,
      },
    },
  },
};

// 반복 일정
export const WithRecurring: Story = {
  args: {
    formData: {
      ...filledFormData,
      repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
    },
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `반복 일정 설정이 활성화된 상태입니다.

- 반복 타입: 매주
- 반복 간격: 2주마다
- 종료 날짜: 2024-12-31`,
      },
    },
  },
};

// 알림 설정
export const WithNotification: Story = {
  args: {
    formData: {
      ...filledFormData,
      notificationTime: 60,
    },
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: '알림이 설정된 일정입니다. 1시간 전(60분)에 알림을 받도록 설정되어 있습니다.',
      },
    },
  },
};

// 모든 기능 사용
export const FullFeatured: Story = {
  args: {
    formData: {
      title: '중요한 프로젝트 미팅',
      date: '2024-11-10',
      startTime: '14:00',
      endTime: '16:00',
      description: '다음 분기 프로젝트 계획 논의',
      location: 'Zoom 회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
      notificationTime: 60,
    },
    isEditMode: false,
    onFieldChange: () => {},
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `모든 기능이 활성화된 완전한 일정 폼입니다.

- 제목, 날짜, 시간, 설명, 위치 모두 입력됨
- 카테고리: 업무
- 반복: 매주 1회, 2024-12-31까지
- 알림: 1시간 전`,
      },
    },
  },
};
