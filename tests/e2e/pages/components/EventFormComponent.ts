import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * 이벤트 폼 컴포넌트
 * 이벤트 생성/수정 폼과 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class EventFormComponent {
  constructor(private page: Page) {}

  // Form field selectors
  get titleInput() {
    return this.page.getByRole('textbox', { name: '제목' });
  }

  get dateInput() {
    return this.page.getByRole('textbox', { name: '날짜' });
  }

  get startTimeInput() {
    return this.page.getByRole('textbox', { name: '시작 시간' });
  }

  get endTimeInput() {
    return this.page.getByRole('textbox', { name: '종료 시간' });
  }

  get descriptionInput() {
    return this.page.getByRole('textbox', { name: '설명' });
  }

  get locationInput() {
    return this.page.getByRole('textbox', { name: '위치' });
  }

  get categorySelect() {
    return this.page.getByRole('combobox', { name: '업무' });
  }

  get notificationSelect() {
    return this.page.getByRole('combobox', { name: /10분 전/ });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /일정 추가|일정 수정/ });
  }

  // Recurring event fields
  get repeatCheckbox() {
    return this.page.getByRole('checkbox', { name: '반복 일정' });
  }

  get repeatTypeSelect() {
    return this.page.locator('[aria-label="반복 유형"]');
  }

  get repeatIntervalInput() {
    return this.page.locator('#repeat-interval');
  }

  get repeatEndDateInput() {
    return this.page.locator('#repeat-end-date');
  }

  /**
   * 이벤트 폼 작성
   */
  async fillEventForm(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    notification?: string;
  }) {
    await this.titleInput.fill(eventData.title);
    await this.dateInput.fill(eventData.date);
    await this.startTimeInput.fill(eventData.startTime);
    await this.endTimeInput.fill(eventData.endTime);

    if (eventData.description) {
      await this.descriptionInput.fill(eventData.description);
    }

    if (eventData.location) {
      await this.locationInput.fill(eventData.location);
    }

    if (eventData.category) {
      await this.categorySelect.click();
      await this.page.getByRole('option').filter({ hasText: eventData.category }).click();
    }

    if (eventData.notification) {
      await this.notificationSelect.click();
      await this.page.getByRole('option').filter({ hasText: eventData.notification }).click();
    }
  }

  /**
   * 폼 제출
   */
  async submit() {
    await this.submitButton.click();

    // Handle potential overlap dialog
    const overlapDialog = this.page.getByText('일정 겹침 경고');
    const isDialogVisible = await overlapDialog.isVisible({ timeout: 1000 }).catch(() => false);

    if (isDialogVisible) {
      // Click "계속" (Continue) button to proceed with creation
      await this.page.getByRole('button', { name: /계속/ }).click();
    }
  }

  /**
   * 폼이 초기화되었는지 확인
   */
  async expectFormCleared() {
    await expect(this.titleInput).toHaveValue('');
    await expect(this.descriptionInput).toHaveValue('');
    await expect(this.locationInput).toHaveValue('');
  }

  /**
   * 반복 일정 체크박스를 활성화합니다.
   */
  async enableRecurring() {
    await this.repeatCheckbox.check();
    // 반복 옵션이 나타날 때까지 대기
    await this.repeatTypeSelect.waitFor({ state: 'visible', timeout: 2000 });
  }

  /**
   * 반복 유형을 선택합니다.
   * @param repeatType '매일' | '매주' | '매월' | '매년'
   */
  async selectRepeatType(repeatType: '매일' | '매주' | '매월' | '매년') {
    await this.repeatTypeSelect.click();
    // MUI Select의 드롭다운 메뉴가 포털로 렌더링되므로 filter 사용
    await this.page.getByRole('option').filter({ hasText: repeatType }).click();
  }

  /**
   * 반복 간격을 설정합니다.
   * @param interval 반복 간격 (예: 1, 2, 3)
   */
  async setRepeatInterval(interval: number) {
    await this.repeatIntervalInput.fill(String(interval));
  }

  /**
   * 반복 종료일을 설정합니다.
   * @param endDate 종료일 (YYYY-MM-DD 형식)
   */
  async setRepeatEndDate(endDate: string) {
    await this.repeatEndDateInput.fill(endDate);
  }

  /**
   * 반복 일정 폼을 작성합니다.
   * fillEventForm()과 동일하지만 반복 설정을 추가로 받습니다.
   */
  async fillRecurringEventForm(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    repeatType: '매일' | '매주' | '매월' | '매년';
    repeatInterval?: number;
    repeatEndDate: string;
    notificationTime?: string;
  }) {
    // 기본 필드 작성
    await this.titleInput.fill(eventData.title);
    await this.dateInput.fill(eventData.date);
    await this.startTimeInput.fill(eventData.startTime);
    await this.endTimeInput.fill(eventData.endTime);

    if (eventData.description) {
      await this.descriptionInput.fill(eventData.description);
    }

    if (eventData.location) {
      await this.locationInput.fill(eventData.location);
    }

    if (eventData.category) {
      await this.categorySelect.click();
      await this.page.getByRole('option').filter({ hasText: eventData.category }).click();
    }

    // 반복 일정 활성화
    await this.enableRecurring();

    // 반복 유형 선택
    await this.selectRepeatType(eventData.repeatType);

    // 반복 간격 설정 (선택사항)
    if (eventData.repeatInterval) {
      await this.setRepeatInterval(eventData.repeatInterval);
    }

    // 반복 종료일 설정
    await this.setRepeatEndDate(eventData.repeatEndDate);

    // 알림 설정 (선택사항)
    if (eventData.notificationTime) {
      await this.notificationSelect.click();
      await this.page.getByRole('option').filter({ hasText: eventData.notificationTime }).click();
    }
  }

  /**
   * 반복 일정을 생성하고 성공 메시지를 기다립니다.
   * fillRecurringEventForm() + submit() + 성공 메시지 대기를 한번에 수행합니다.
   */
  async createRecurringEvent(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    repeatType: '매일' | '매주' | '매월' | '매년';
    repeatInterval?: number;
    repeatEndDate: string;
    notificationTime?: string;
  }) {
    await this.fillRecurringEventForm(eventData);
    await this.submitButton.click();

    // 일정 추가 성공 메시지 대기
    await this.page.waitForSelector('text=일정이 추가되었습니다', { timeout: 5000 });
  }

  /**
   * 폼이 리셋될 때까지 대기합니다 (제목 필드가 비워짐).
   * 일정 수정 후 폼이 초기화되는지 확인할 때 유용합니다.
   */
  async waitForFormReset() {
    await this.page.waitForFunction(
      () => (document.querySelector('#title') as HTMLInputElement)?.value === '',
      { timeout: 3000 }
    );
  }
}
