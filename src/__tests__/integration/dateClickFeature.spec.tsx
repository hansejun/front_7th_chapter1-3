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

    // Week 뷰에서 9월 28일(일요일) 셀 클릭
    const weekView = screen.getByTestId('week-view');
    const dateCell = weekView.querySelector('[data-date="2025-09-28"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 검증: 날짜 필드에 2025-09-28이 입력됨
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-09-28');

    // 검증: 시간 필드는 변경되지 않음
    const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    expect(startTimeInput.value).toBe('');
    expect(endTimeInput.value).toBe('');
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

    // Week 뷰에서 9월 28일 셀 클릭
    const weekView = screen.getByTestId('week-view');
    const dateCell = weekView.querySelector('[data-date="2025-09-28"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 검증: 시간 필드 유지
    const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    expect(startTimeInput.value).toBe('10:00');
    expect(endTimeInput.value).toBe('11:00');
  });
});

describe('날짜 클릭: Month 뷰', () => {
  it('빈 날짜 셀을 클릭하면 폼의 날짜 필드에 해당 날짜가 입력된다', async () => {
    const { user } = setup(<App />);

    // 기본 뷰는 Month 뷰 (2025년 10월 달력 표시)
    await screen.findByText('일정 로딩 완료!');

    // Month 뷰에서 2025-10-16 날짜의 DroppableDateCell을 찾아 클릭
    const dateCell = screen.getByTestId('month-view').querySelector('[data-date="2025-10-16"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 검증: 날짜 필드에 2025-10-16이 정확히 입력됨
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-16');
  });

  it('여러 날짜를 연속으로 클릭하면 마지막 클릭한 날짜가 입력된다', async () => {
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');

    // 여러 날짜 셀 연속 클릭 (10일 -> 15일 -> 20일)
    const dateCell10 = monthView.querySelector('[data-date="2025-10-10"]');
    const dateCell15 = monthView.querySelector('[data-date="2025-10-15"]');
    const dateCell20 = monthView.querySelector('[data-date="2025-10-20"]');

    if (!dateCell10 || !dateCell15 || !dateCell20) {
      throw new Error('Date cells not found');
    }

    await user.click(dateCell10);
    await user.click(dateCell15);
    await user.click(dateCell20);

    // 검증: 마지막 클릭한 날짜(2025-10-20)가 입력됨
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-20');
  });
});

describe('날짜 클릭: 이벤트와의 상호작용', () => {
  it('이벤트 카드를 클릭하면 날짜 필드가 변경되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: 'click-test-1',
        title: '클릭 테스트 일정',
        date: '2025-09-30',
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

    // 초기 날짜 값 저장
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const initialValue = dateInput.value;

    // Week 뷰 내에서 이벤트 카드 찾기 및 클릭
    const weekView = screen.getByTestId('week-view');
    const eventCard = within(weekView).getByText('클릭 테스트 일정');
    await user.click(eventCard);

    // 검증: 날짜 필드가 변경되지 않음
    expect(dateInput.value).toBe(initialValue);
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

    // Week 뷰에서 10월 2일 셀 클릭 (이벤트가 있는 날)
    const weekView = screen.getByTestId('week-view');
    const dateCell = weekView.querySelector('[data-date="2025-10-02"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 검증: 날짜가 입력됨
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-02');
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

    // Week 뷰 내에서 이벤트 카드 클릭
    const weekView = screen.getByTestId('week-view');
    const eventCard = within(weekView).getByText('테스트 일정');
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const initialValue = dateInput.value;

    await user.click(eventCard);

    // 이벤트 클릭 후 날짜 필드는 변경 안 됨
    expect(dateInput.value).toBe(initialValue);

    // 빈 날짜 셀 클릭 (10월 3일)
    const dateCell = weekView.querySelector('[data-date="2025-10-03"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 날짜가 입력됨
    expect(dateInput.value).toBe('2025-10-03');
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

    const { user } = setup(<App />);

    // 기본 뷰는 Month 뷰
    await screen.findByText('일정 로딩 완료!');

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const initialValue = dateInput.value;

    // Month 뷰 내에서 이벤트 칩 클릭
    const monthView = screen.getByTestId('month-view');
    const eventChip = within(monthView).getByText('Month 뷰 클릭 테스트');
    await user.click(eventChip);

    // 검증: 날짜 필드 변경 없음
    expect(dateInput.value).toBe(initialValue);
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

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // Month 뷰에서 10월 20일 셀 클릭 (이벤트가 있는 날)
    const monthView = screen.getByTestId('month-view');
    const dateCell = monthView.querySelector('[data-date="2025-10-20"]');
    if (!dateCell) throw new Error('Date cell not found');

    await user.click(dateCell);

    // 검증: 날짜가 입력됨
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-20');
  });
});
