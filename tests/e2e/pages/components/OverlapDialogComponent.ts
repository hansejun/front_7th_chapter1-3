import { Page, expect } from '@playwright/test';

/**
 * 일정 겹침 다이얼로그 컴포넌트
 * 이벤트 겹침 경고 다이얼로그와 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class OverlapDialogComponent {
  constructor(private page: Page) {}

  /**
   * 겹침 다이얼로그 가져오기
   */
  get dialog() {
    return this.page.getByRole('dialog').filter({ hasText: '일정 겹침' });
  }

  /**
   * 취소 버튼
   */
  get cancelButton() {
    return this.page.getByRole('button', { name: '취소' });
  }

  /**
   * 계속 버튼
   */
  get continueButton() {
    return this.page.getByRole('button', { name: '계속' });
  }

  /**
   * 다이얼로그가 표시되는지 확인
   */
  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  /**
   * 다이얼로그에 겹치는 이벤트 정보가 표시되는지 확인
   * @param eventTitle 이벤트 제목
   * @param timeRange 시간 범위 (예: "14:00-16:00")
   */
  async expectEventInDialog(eventTitle: string, timeRange: string) {
    await expect(this.dialog).toContainText(eventTitle);
    await expect(this.dialog).toContainText(timeRange);
  }

  /**
   * 취소 버튼 클릭
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * 계속 버튼 클릭
   */
  async clickContinue() {
    await this.continueButton.click();
  }

  /**
   * 다이얼로그가 닫혔는지 확인
   */
  async expectNotVisible() {
    await expect(this.dialog).not.toBeVisible();
  }
}
