import { Page, expect } from '@playwright/test';

/**
 * 캘린더 뷰 컴포넌트
 * 캘린더 표시와 관련된 모든 선택자와 액션을 캡슐화합니다.
 *
 * 기능:
 * - 월간/주간 뷰 전환
 * - 이전/다음 달/주 네비게이션
 * - 날짜 셀 클릭
 * - 캘린더 이벤트 표시 확인
 */
export class CalendarViewComponent {
  constructor(private page: Page) {}

  /**
   * 뷰 선택 콤보박스 (Month/Week)
   * 현재 표시된 텍스트(Month 또는 Week)로 선택자를 찾습니다
   */
  getViewSelector(currentView: 'Month' | 'Week') {
    return this.page.getByRole('combobox').filter({ hasText: currentView });
  }

  /**
   * 이전 달/주 버튼
   */
  get previousButton() {
    return this.page.getByRole('button', { name: 'Previous' });
  }

  /**
   * 다음 달/주 버튼
   */
  get nextButton() {
    return this.page.getByRole('button', { name: 'Next' });
  }

  /**
   * 날짜로 캘린더 셀 가져오기
   */
  getDateCell(day: number) {
    return this.page.locator(`td p`).filter({ hasText: new RegExp(`^${day}$`) });
  }

  /**
   * 월 헤딩 가져오기 (예: "2025년 11월")
   */
  getMonthHeading(yearMonth: string) {
    return this.page.getByRole('heading', { name: new RegExp(yearMonth, 'i'), level: 5 });
  }

  // ==================== 뷰 전환 메서드 ====================

  /**
   * 주간 뷰로 전환합니다.
   */
  async switchToWeekView() {
    // 현재 Month 뷰인 combobox를 찾아 클릭
    const viewSelector = this.getViewSelector('Month');
    await viewSelector.click();
    await this.page.waitForTimeout(300);

    // 드롭다운에서 Week 옵션 클릭
    await this.page.getByRole('option', { name: 'week-option' }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 월간 뷰로 전환합니다.
   */
  async switchToMonthView() {
    // 현재 Week 뷰인 combobox를 찾아 클릭
    const viewSelector = this.getViewSelector('Week');
    await viewSelector.click();
    await this.page.waitForTimeout(300);

    // 드롭다운에서 Month 옵션 클릭
    await this.page.getByRole('option', { name: 'month-option' }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 현재 뷰가 월간 뷰인지 확인합니다.
   */
  async expectMonthView() {
    const monthSelector = this.page.getByRole('combobox').filter({ hasText: 'Month' }).first();
    await expect(monthSelector).toBeVisible();
  }

  /**
   * 현재 뷰가 주간 뷰인지 확인합니다.
   */
  async expectWeekView() {
    const weekSelector = this.page.getByRole('combobox').filter({ hasText: 'Week' }).first();
    await expect(weekSelector).toBeVisible();
  }

  // ==================== 네비게이션 메서드 ====================

  /**
   * 다음 달/주로 이동합니다.
   */
  async clickNextButton() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 이전 달/주로 이동합니다.
   */
  async clickPreviousButton() {
    await this.previousButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 월 헤딩이 표시되는지 확인합니다.
   * @param yearMonth 예: "2025년 11월"
   */
  async expectMonthHeading(yearMonth: string) {
    const heading = this.getMonthHeading(yearMonth);
    await expect(heading).toBeVisible();
  }

  // ==================== 날짜 클릭 메서드 ====================

  /**
   * 특정 날짜 셀을 클릭합니다.
   * 현재 표시된 월의 날짜를 클릭합니다.
   * @param day 날짜 (1-31)
   */
  async clickDateCell(day: number) {
    // 현재 월의 연도와 월을 가져오기
    const heading = await this.page.getByRole('heading', { level: 5 }).first().textContent();
    if (!heading) {
      throw new Error('Could not find calendar heading');
    }

    // "2025년 11월" 형식에서 연도와 월 추출
    const match = heading.match(/(\d{4})년 (\d+)월/);
    if (!match) {
      throw new Error(`Could not parse calendar heading: ${heading}`);
    }

    const year = match[1];
    const month = match[2].padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    // data-date 속성으로 날짜 셀 찾기
    const dateCell = this.page.locator(`[data-date="${dateString}"]`);

    // 날짜 셀이 존재하고 클릭 가능한지 확인
    await dateCell.waitFor({ state: 'visible', timeout: 5000 });
    await dateCell.click();
    await this.page.waitForTimeout(500);
  }

  // ==================== 이벤트 표시 확인 메서드 ====================

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
