import { Page, expect } from '@playwright/test';

/**
 * 반복 일정 다이얼로그 컴포넌트
 * 반복 일정 수정/삭제 시 나타나는 다이얼로그 처리를 캡슐화합니다.
 *
 * 다이얼로그 구조:
 * - 제목: "해당 일정만 ..." 텍스트 포함
 * - 버튼:
 *   - "예": 이 일정만 수정/삭제
 *   - "아니오": 모든 일정 수정/삭제
 *   - "취소": 작업 취소
 */
export class RecurringDialogComponent {
  constructor(private page: Page) {}

  /**
   * 다이얼로그 텍스트 선택자
   */
  get dialogText() {
    return this.page.getByText('해당 일정만');
  }

  /**
   * "예" 버튼 (이 일정만)
   */
  get yesButton() {
    return this.page.getByRole('button', { name: '예' });
  }

  /**
   * "아니오" 버튼 (모든 일정)
   */
  get noButton() {
    return this.page.getByRole('button', { name: '아니오' });
  }

  /**
   * "취소" 버튼
   */
  get cancelButton() {
    return this.page.getByRole('button', { name: '취소' });
  }

  /**
   * 다이얼로그가 나타날 때까지 대기합니다.
   * @param timeout 대기 시간 (기본값: 5000ms)
   */
  async waitForDialog(timeout = 5000) {
    await this.dialogText.waitFor({ state: 'visible', timeout });
  }

  /**
   * 다이얼로그가 사라질 때까지 대기합니다.
   * @param timeout 대기 시간 (기본값: 2000ms)
   */
  async waitForDialogHidden(timeout = 2000) {
    await this.dialogText.waitFor({ state: 'hidden', timeout });
  }

  /**
   * "이 일정만" 옵션을 선택합니다 ("예" 버튼 클릭).
   * 다이얼로그 대기 후 자동으로 클릭합니다.
   */
  async clickThisEventOnly() {
    await this.waitForDialog();
    await this.yesButton.click();
    await this.waitForDialogHidden();
  }

  /**
   * "모든 일정" 옵션을 선택합니다 ("아니오" 버튼 클릭).
   * 다이얼로그 대기 후 자동으로 클릭합니다.
   */
  async clickAllEvents() {
    await this.waitForDialog();
    await this.noButton.click();
    await this.waitForDialogHidden();
  }

  /**
   * 다이얼로그를 취소합니다 ("취소" 버튼 클릭).
   * 다이얼로그 대기 후 자동으로 클릭합니다.
   */
  async clickCancel() {
    await this.waitForDialog();
    await this.cancelButton.click();
    await this.waitForDialogHidden();
  }

  /**
   * 다이얼로그가 표시되는지 확인합니다.
   */
  async expectDialogVisible() {
    await expect(this.dialogText).toBeVisible();
  }

  /**
   * 다이얼로그가 숨겨졌는지 확인합니다.
   */
  async expectDialogHidden() {
    await expect(this.dialogText).not.toBeVisible();
  }

  /**
   * 선택에 따라 적절한 버튼을 클릭합니다.
   * @param option 'this' | 'all' | 'cancel'
   */
  async handleDialog(option: 'this' | 'all' | 'cancel') {
    switch (option) {
      case 'this':
        await this.clickThisEventOnly();
        break;
      case 'all':
        await this.clickAllEvents();
        break;
      case 'cancel':
        await this.clickCancel();
        break;
      default:
        throw new Error(`Unknown dialog option: ${option}`);
    }
  }
}
