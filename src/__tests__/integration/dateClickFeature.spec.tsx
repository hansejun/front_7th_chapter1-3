import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('날짜 클릭: Week 뷰', () => {
  it('빈 날짜 셀을 클릭하면 폼의 날짜 필드에 해당 날짜가 입력된다', async () => {
    const { user } = setup(<App />);

    // Week 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await screen.findByText('일정 로딩 완료!');

    // TODO: 빈 날짜 셀 클릭 시뮬레이션
    // 예상 동작:
    // 1. Week 뷰에서 빈 날짜 셀 찾기 (예: 2025-10-03)
    // 2. 해당 셀 클릭
    // 3. 폼의 날짜 필드에 클릭한 날짜가 입력됨

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-03');

    // 검증: 시간 필드는 변경되지 않음
    // const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    // const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    // expect(startTimeInput.value).toBe('');
    // expect(endTimeInput.value).toBe('');

    // 현재 RED 상태 - 날짜 클릭 기능 미구현
    expect(true).toBe(false);
  });

  it('시간 필드는 변경되지 않는다', async () => {
    const { user } = setup(<App />);

    // Week 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await screen.findByText('일정 로딩 완료!');

    // 먼저 시간 필드에 값 입력
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    // TODO: 빈 날짜 셀 클릭
    // 예상 동작:
    // 1. 날짜 필드만 변경
    // 2. 시작 시간 '10:00' 유지
    // 3. 종료 시간 '11:00' 유지

    // 검증
    // const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    // const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    // expect(startTimeInput.value).toBe('10:00');
    // expect(endTimeInput.value).toBe('11:00');

    // 현재 RED 상태
    expect(true).toBe(false);
  });
});

describe('날짜 클릭: Month 뷰', () => {
  it('빈 날짜 셀을 클릭하면 폼의 날짜 필드에 해당 날짜가 입력된다', async () => {
    setup(<App />);

    // 기본 뷰는 Month 뷰
    await screen.findByText('일정 로딩 완료!');

    // TODO: 빈 날짜 셀 클릭 시뮬레이션
    // 예상 동작:
    // 1. Month 뷰에서 빈 날짜 셀 찾기 (예: 15일)
    // 2. 해당 셀 클릭
    // 3. 폼의 날짜 필드에 클릭한 날짜가 입력됨 (2025-10-15)

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-15');

    // 현재 RED 상태
    expect(true).toBe(false);
  });

  it('여러 날짜를 연속으로 클릭하면 마지막 클릭한 날짜가 입력된다', async () => {
    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // TODO: 여러 날짜 셀 연속 클릭
    // 예상 동작:
    // 1. 첫 번째 날짜 클릭 (예: 10일)
    // 2. 두 번째 날짜 클릭 (예: 15일)
    // 3. 세 번째 날짜 클릭 (예: 20일)
    // 4. 폼에는 마지막 클릭한 날짜만 입력됨

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-20');

    // 현재 RED 상태
    expect(true).toBe(false);
  });
});

describe('날짜 클릭: 이벤트와의 상호작용', () => {
  it('이벤트 카드를 클릭하면 날짜 필드가 변경되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-1',
        title: '클릭 테스트 일정',
        date: '2025-10-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 카드 클릭 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await screen.findByText('일정 로딩 완료!');

    // TODO: 이벤트 카드/칩 클릭
    // 예상 동작:
    // 1. Week 뷰에서 '클릭 테스트 일정' 이벤트 카드 찾기
    // 2. 이벤트 카드 클릭
    // 3. 날짜 필드 변경 없음

    // 검증
    // expect(dateInput.value).toBe(initialValue);

    // 현재 RED 상태
    expect(true).toBe(false);
  });

  it('이벤트가 있는 셀의 빈 공간을 클릭하면 날짜가 입력된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-2',
        title: '기존 일정',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await screen.findByText('일정 로딩 완료!');

    // TODO: 이벤트가 있는 셀에서 빈 공간 클릭
    // 예상 동작:
    // 1. 2025-10-02 셀 찾기 (이 셀에는 '기존 일정'이 있음)
    // 2. 이벤트 카드가 아닌 셀의 빈 공간 클릭
    // 3. 날짜 필드에 2025-10-02 입력됨

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-02');

    // 현재 RED 상태
    expect(true).toBe(false);
  });

  it('Week 뷰에서 이벤트 카드 클릭 후 빈 셀 클릭하면 날짜가 입력된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-3',
        title: '테스트 일정',
        date: '2025-10-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    await screen.findByText('일정 로딩 완료!');

    // TODO: 이벤트 카드 클릭 후 빈 셀 클릭
    // 예상 동작:
    // 1. '테스트 일정' 이벤트 카드 클릭 (날짜 입력 안 됨)
    // 2. 다른 빈 날짜 셀 클릭 (예: 2025-10-04)
    // 3. 날짜 필드에 2025-10-04 입력됨

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-04');

    // 현재 RED 상태
    expect(true).toBe(false);
  });
});

describe('날짜 클릭: Month 뷰에서 이벤트와의 상호작용', () => {
  it('Month 뷰에서 이벤트 칩을 클릭하면 날짜 필드가 변경되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-4',
        title: 'Month 뷰 클릭 테스트',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    setup(<App />);

    // 기본 뷰는 Month 뷰
    await screen.findByText('일정 로딩 완료!');

    // TODO: Month 뷰에서 이벤트 칩 클릭
    // 예상 동작:
    // 1. 'Month 뷰 클릭 테스트' 이벤트 칩 찾기
    // 2. 이벤트 칩 클릭
    // 3. 날짜 필드 변경 없음

    // 검증
    // expect(dateInput.value).toBe(initialValue);

    // 현재 RED 상태
    expect(true).toBe(false);
  });

  it('Month 뷰에서 이벤트가 있는 셀의 빈 공간을 클릭하면 날짜가 입력된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-5',
        title: '기존 월간 일정',
        date: '2025-10-20',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // TODO: Month 뷰에서 이벤트가 있는 셀의 빈 공간 클릭
    // 예상 동작:
    // 1. 2025-10-20 셀 찾기 (이 셀에는 '기존 월간 일정'이 있음)
    // 2. 이벤트 칩이 아닌 셀의 빈 공간 클릭
    // 3. 날짜 필드에 2025-10-20 입력됨

    // 검증
    // const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    // expect(dateInput.value).toBe('2025-10-20');

    // 현재 RED 상태
    expect(true).toBe(false);
  });
});
