import { Page, expect } from '@playwright/test';

/**
 * 이벤트 리스트 컴포넌트
 * 이벤트 목록과 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class EventListComponent {
  constructor(private page: Page) {}

  /**
   * 제목으로 이벤트 카드 컨테이너 가져오기
   * 이벤트 리스트에서 특정 이벤트 카드를 찾습니다 (캘린더가 아닌)
   * 제목을 찾고 Edit/Delete 버튼이 있는 가장 가까운 상위 Box를 찾습니다.
   */
  getEventCardByTitle(title: string) {
    // Find the event in the event list specifically (not in the calendar)
    // by finding the title and ensuring it's in a container with Edit/Delete buttons
    return this.page
      .getByText(title, { exact: true })
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..')
      .filter({ has: this.page.getByRole('button', { name: /edit event/i }) })
      .first();
  }

  /**
   * 이벤트 수정 버튼 가져오기
   */
  getEditButton(title: string) {
    const eventCard = this.getEventCardByTitle(title);
    return eventCard.getByRole('button', { name: /edit event/i }).first();
  }

  /**
   * 이벤트 삭제 버튼 가져오기
   */
  getDeleteButton(title: string) {
    const eventCard = this.getEventCardByTitle(title);
    return eventCard.getByRole('button', { name: /delete event/i }).first();
  }

  /**
   * 이벤트가 리스트에 존재하는지 확인
   */
  async expectEventExists(title: string) {
    await expect(this.page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * 이벤트가 리스트에 존재하지 않는지 확인
   */
  async expectEventNotExists(title: string) {
    await expect(this.page.getByText(title).first()).not.toBeVisible({ timeout: 5000 });
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
  }) {
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
   * UI에 표시된 이벤트만 카운트합니다.
   */
  async getEventCountByTitle(title: string): Promise<number> {
    // 제목을 가진 모든 요소 찾기
    const titleElements = await this.page.getByText(title, { exact: true }).all();

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
  async expectNotificationDisplayed(notificationPattern: string | RegExp) {
    const locator =
      typeof notificationPattern === 'string'
        ? this.page.locator(`text=${notificationPattern}`)
        : this.page.locator(`text=${notificationPattern}`);

    await expect(locator.first()).toBeVisible();
  }

  /**
   * 전체 이벤트 개수를 반환합니다.
   * Delete 버튼 개수로 이벤트를 카운트합니다.
   * @returns 이벤트 개수
   */
  async getEventCount(): Promise<number> {
    try {
      // UI가 렌더링될 때까지 대기
      await this.page.waitForTimeout(500);

      // Delete 버튼으로 이벤트 카운트 (각 이벤트마다 고유한 Delete 버튼이 있음)
      const deleteButtons = await this.page.getByRole('button', { name: /delete event/i }).all();
      return deleteButtons.length;
    } catch (e) {
      console.error('Failed to count events:', e);
      return 0;
    }
  }

  /**
   * 모든 이벤트 삭제
   * cleanup이나 beforeEach/afterEach에서 사용합니다.
   */
  async deleteAllEvents() {
    const deleteButtons = this.page.getByRole('button', { name: 'Delete event' });
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
      await this.page.waitForTimeout(300);
    }
  }
}
