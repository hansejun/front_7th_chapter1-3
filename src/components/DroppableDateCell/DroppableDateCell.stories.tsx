import { DndContext } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { DroppableDateCell } from './DroppableDateCell';

const meta: Meta<typeof DroppableDateCell> = {
  title: 'Components/DroppableDateCell',
  component: DroppableDateCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `DroppableDateCell은 캘린더에서 드래그 앤 드롭을 지원하는 날짜 셀 컴포넌트입니다.

**주요 기능:**
- **드롭 가능한 영역**: 이벤트를 드래그하여 날짜 셀에 드롭 가능
- **셀 클릭 이벤트**: 날짜 셀 클릭 시 콜백 실행
- **호버 효과**: 드래그 중일 때 시각적 피드백 제공

**사용 시나리오:**
- 캘린더의 각 날짜 셀 렌더링
- 이벤트 드래그 앤 드롭 기능 제공
- 날짜 셀 클릭으로 새 이벤트 생성

**시각적 회귀 테스트:**
- 다양한 텍스트 길이에 따른 셀 레이아웃 확인
- 긴 텍스트 처리 및 오버플로우 동작 검증
- 여러 이벤트가 있을 때의 레이아웃 안정성 확인`,
      },
    },
  },
  decorators: [
    (Story) => (
      <DndContext>
        <Box sx={{ width: '200px', height: '150px', border: '1px solid #ddd' }}>
          <Story />
        </Box>
      </DndContext>
    ),
  ],
  argTypes: {
    dateString: {
      control: 'text',
      description: 'YYYY-MM-DD 형식의 날짜 문자열',
      table: {
        type: { summary: 'string' },
      },
    },
    children: {
      control: false,
      description: '셀 내부에 렌더링될 콘텐츠',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    onCellClick: {
      action: 'cell-clicked',
      description: '셀 클릭 시 호출되는 콜백',
      table: {
        type: { summary: '(date: string) => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 짧은 텍스트
export const ShortText: Story = {
  args: {
    dateString: '2024-11-05',
    children: (
      <Box p={1}>
        <Typography variant="body2" color="text.secondary">
          5
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
          회의
        </Typography>
      </Box>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '짧은 텍스트(2-3자)가 있는 셀입니다. 기본적인 레이아웃을 확인합니다.',
      },
    },
  },
};

// 긴 텍스트 (ellipsis 처리)
export const LongTextWithEllipsis: Story = {
  args: {
    dateString: '2024-11-05',
    children: (
      <Box p={1}>
        <Typography variant="body2" color="text.secondary">
          5
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          2024년 4분기 영업 실적 보고 및 2025년 1분기 계획 수립을 위한 전사 경영진 미팅
        </Typography>
      </Box>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '매우 긴 텍스트가 있는 셀입니다. 텍스트가 셀 너비를 초과할 때 ellipsis(...) 처리가 올바르게 적용되는지 확인합니다.',
      },
    },
  },
};

// 여러 개의 긴 텍스트 (최악의 시나리오)
export const MultipleLongTexts: Story = {
  args: {
    dateString: '2024-11-05',
    children: (
      <Box p={1}>
        <Typography variant="body2" color="text.secondary">
          5
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          월간 전사 정기 회의 및 실적 보고
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          중요 고객사 방문 및 계약 논의
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          신입 사원 오리엔테이션 및 교육
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          4분기 마케팅 전략 회의
        </Typography>
      </Box>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '긴 텍스트가 여러 개 있는 최악의 시나리오입니다. 레이아웃이 깨지지 않고 모든 텍스트가 ellipsis 처리되는지 확인합니다.',
      },
    },
  },
};

// 실제 이벤트 스타일 (컬러 배지)
export const WithColorBadges: Story = {
  args: {
    dateString: '2024-11-05',
    children: (
      <Box p={1}>
        <Typography variant="body2" color="text.secondary">
          5
        </Typography>
        <Box
          sx={{
            mt: 0.5,
            p: 0.5,
            backgroundColor: '#1976d2',
            borderRadius: 1,
            color: 'white',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            업무 미팅
          </Typography>
        </Box>
        <Box
          sx={{
            mt: 0.5,
            p: 0.5,
            backgroundColor: '#d32f2f',
            borderRadius: 1,
            color: 'white',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            긴급 회의
          </Typography>
        </Box>
        <Box
          sx={{
            mt: 0.5,
            p: 0.5,
            backgroundColor: '#388e3c',
            borderRadius: 1,
            color: 'white',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            개인 일정
          </Typography>
        </Box>
      </Box>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '실제 캘린더 이벤트 스타일입니다. 컬러 배지와 함께 여러 이벤트가 표시될 때 레이아웃이 올바르게 동작하는지 확인합니다.',
      },
    },
  },
};
