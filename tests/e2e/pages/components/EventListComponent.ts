import { Locator, Page, expect } from '@playwright/test';

import { TIMEOUTS } from '../../constants';

/**
 * 이벤트 리스트 컴포넌트
 * 이벤트 목록과 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class EventListComponent {
  constructor(private page: Page) {}

  /**
   * 이벤트 리스트 컨테이너 가져오기
   * 이벤트 목록 영역만 타겟팅합니다 (캘린더 뷰 제외)
   */
  get eventListContainer(): Locator {
    return this.page.getByTestId('event-list');
  }

  /**
   * 제목으로 이벤트 카드 컨테이너 가져오기
   * 이벤트 리스트에서 특정 이벤트 카드를 찾습니다 (캘린더가 아닌)
   *
   * 전략: data-testid를 사용하여 정확하게 이벤트 목록 영역만 검색
   * - event-list 컨테이너 내에서만 검색
   * - 제목 텍스트와 Edit 버튼을 모두 포함하는 Box 찾기
   */
  getEventCardByTitle(title: string): Locator {
    return this.eventListContainer
      .locator('[class*="MuiBox"]')
      .filter({ hasText: title })
      .filter({ has: this.page.getByRole('button', { name: /edit event/i }) })
      .first();
  }

  /**
   * 이벤트 수정 버튼 가져오기
   */
  getEditButton(title: string): Locator {
    const eventCard = this.getEventCardByTitle(title);
    return eventCard.getByRole('button', { name: /edit event/i }).first();
  }

  /**
   * 이벤트 삭제 버튼 가져오기
   */
  getDeleteButton(title: string): Locator {
    const eventCard = this.getEventCardByTitle(title);
    return eventCard.getByRole('button', { name: /delete event/i }).first();
  }

  /**
   * 이벤트가 리스트에 존재하는지 확인
   * 개선: getEventCardByTitle을 사용하여 더 정확한 검증
   */
  async expectEventExists(title: string): Promise<void> {
    const eventCard = this.getEventCardByTitle(title);
    await expect(eventCard).toBeVisible({ timeout: TIMEOUTS.LONG });
  }

  /**
   * 이벤트가 리스트에 존재하지 않는지 확인
   */
  async expectEventNotExists(title: string): Promise<void> {
    const eventCard = this.getEventCardByTitle(title);
    await expect(eventCard).not.toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * 이벤트 상세 정보 확인
   */
  async expectEventDetails(eventData: {
    title: string;
    date?: string;
    time?: string;
    description?: string;
    location?: string;
    category?: string;
    notification?: string;
  }): Promise<void> {
    await this.expectEventExists(eventData.title);

    const eventCard = this.getEventCardByTitle(eventData.title);

    if (eventData.date) {
      await expect(eventCard).toContainText(eventData.date);
    }

    if (eventData.time) {
      await expect(eventCard).toContainText(eventData.time);
    }

    if (eventData.description && eventData.description.trim()) {
      await expect(eventCard).toContainText(eventData.description);
    }

    if (eventData.location && eventData.location.trim()) {
      await expect(eventCard).toContainText(eventData.location);
    }

    if (eventData.category) {
      await expect(eventCard).toContainText(eventData.category);
    }

    if (eventData.notification) {
      await expect(eventCard).toContainText(eventData.notification);
    }
  }

  /**
   * 특정 제목을 가진 이벤트의 개수를 반환합니다.
   * 이벤트 목록 영역에 표시된 이벤트만 카운트합니다 (캘린더 뷰 제외).
   *
   * 개선: data-testid를 사용하여 정확하게 이벤트 목록만 카운트
   */
  async getEventCountByTitle(title: string): Promise<number> {
    // event-list 컨테이너 내에서 제목을 가진 모든 요소 찾기
    const titleElements = await this.eventListContainer.getByText(title, { exact: true }).all();

    let count = 0;
    for (const element of titleElements) {
      // 해당 요소가 Edit 버튼을 가진 컨테이너 안에 있는지 확인
      const container = element.locator('../../../..');
      const hasEditButton = await container.getByRole('button', { name: /edit event/i }).count();

      if (hasEditButton > 0) {
        count++;
      }
    }

    return count;
  }

  /**
   * 알림 설정이 표시되는지 확인
   * @param notificationPattern 알림 텍스트 패턴 (예: "알림: 1분 전", /알림.*1분/)
   */
  async expectNotificationDisplayed(notificationPattern: string | RegExp): Promise<void> {
    const locator =
      typeof notificationPattern === 'string'
        ? this.page.locator(`text=${notificationPattern}`)
        : this.page.locator(`text=${notificationPattern}`);

    await expect(locator.first()).toBeVisible();
  }

  /**
   * 전체 이벤트 개수를 반환합니다.
   * 이벤트 목록 영역의 Delete 버튼 개수로 카운트합니다 (캘린더 뷰 제외).
   * @returns 이벤트 개수
   */
  async getEventCount(): Promise<number> {
    try {
      // 페이지가 안정화될 때까지 대기
      await this.page.waitForLoadState('networkidle');

      // event-list 컨테이너 내의 Delete 버튼만 카운트
      const deleteButtons = await this.eventListContainer
        .getByRole('button', { name: /delete event/i })
        .all();
      return deleteButtons.length;
    } catch (error) {
      console.error('Failed to count events:', error);
      return 0;
    }
  }

  /**
   * 모든 이벤트 삭제
   * cleanup이나 beforeEach/afterEach에서 사용합니다.
   * 이벤트 목록 영역의 이벤트만 삭제합니다 (캘린더 뷰 제외).
   */
  async deleteAllEvents(): Promise<void> {
    const deleteButtons = this.eventListContainer.getByRole('button', { name: 'Delete event' });
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
      await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }
}
