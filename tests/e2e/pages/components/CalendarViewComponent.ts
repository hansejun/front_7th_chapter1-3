import { Page, expect } from '@playwright/test';

/**
 * 캘린더 뷰 컴포넌트
 * 캘린더 표시와 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class CalendarViewComponent {
  constructor(private page: Page) {}

  /**
   * 날짜로 캘린더 셀 가져오기
   */
  getDateCell(day: number) {
    return this.page.locator(`td p`).filter({ hasText: new RegExp(`^${day}$`) });
  }

  /**
   * 특정 날짜에 이벤트가 표시되는지 확인
   */
  async expectEventOnDate(day: number, title: string) {
    const dateCell = this.getDateCell(day);
    await expect(dateCell).toBeVisible();

    // Check if the event title appears near this date
    const parentCell = dateCell.locator('..');
    await expect(parentCell.locator(`text="${title}"`)).toBeVisible({ timeout: 5000 });
  }

  /**
   * 특정 날짜에 이벤트가 표시되지 않는지 확인
   */
  async expectEventNotOnDate(day: number, title: string) {
    const dateCell = this.getDateCell(day);
    const parentCell = dateCell.locator('..');
    await expect(parentCell.locator(`text="${title}"`)).not.toBeVisible();
  }
}
