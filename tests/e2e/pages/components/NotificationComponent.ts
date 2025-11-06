import { Locator, Page, expect } from '@playwright/test';

import { TIMEOUTS } from '../../constants';

/**
 * 알림 컴포넌트
 * 화면 우측 상단에 표시되는 알림(Alert)과 관련된 모든 선택자와 액션을 캡슐화합니다.
 */
export class NotificationComponent {
  constructor(private page: Page) {}

  /**
   * 알림 컨테이너 (fixed position stack)
   */
  get notificationStack(): Locator {
    return this.page.locator('[role="alert"]').locator('..');
  }

  /**
   * 모든 알림 Alert 요소들
   */
  get allNotifications(): Locator {
    return this.page.locator('[role="alert"]');
  }

  /**
   * 특정 인덱스의 알림
   */
  getNotificationByIndex(index: number): Locator {
    return this.allNotifications.nth(index);
  }

  /**
   * 특정 인덱스의 알림 닫기 버튼
   */
  getCloseButton(index: number): Locator {
    // MUI Alert의 닫기 버튼은 IconButton으로 렌더링되며, Close 아이콘을 포함함
    return this.getNotificationByIndex(index).locator('button[aria-label="close"]');
  }

  /**
   * 특정 텍스트를 포함하는 알림이 표시되는지 확인
   * @param text 알림 메시지에 포함되어야 할 텍스트 (문자열 또는 정규표현식)
   */
  async expectNotificationVisible(text: string | RegExp): Promise<void> {
    const locator =
      typeof text === 'string'
        ? this.page.locator('[role="alert"]').filter({ hasText: text })
        : this.page.locator('[role="alert"]').filter({ hasText: text });

    await expect(locator.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * 알림 개수 확인
   * @param count 예상되는 알림 개수
   */
  async expectNotificationCount(count: number): Promise<void> {
    await expect(this.allNotifications).toHaveCount(count, { timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * 알림이 표시되지 않는지 확인
   */
  async expectNotificationNotVisible(): Promise<void> {
    await expect(this.allNotifications).toHaveCount(0, { timeout: TIMEOUTS.SHORT });
  }

  /**
   * 특정 인덱스의 알림 메시지 가져오기
   * @param index 알림 인덱스 (0부터 시작)
   * @returns 알림 메시지 텍스트
   */
  async getNotificationMessage(index: number): Promise<string> {
    const notification = this.getNotificationByIndex(index);
    return await notification.textContent().then((text) => text?.trim() || '');
  }

  /**
   * 특정 인덱스의 알림 닫기
   * @param index 알림 인덱스 (0부터 시작)
   */
  async closeNotification(index: number): Promise<void> {
    await this.getCloseButton(index).click();
  }

  /**
   * 모든 알림 닫기
   * 모든 알림의 닫기 버튼을 순차적으로 클릭합니다.
   */
  async closeAllNotifications(): Promise<void> {
    const count = await this.allNotifications.count();
    for (let i = 0; i < count; i++) {
      // 항상 첫 번째 알림을 닫음 (닫으면 다음 알림이 첫 번째가 됨)
      await this.closeNotification(0);
      await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }

  /**
   * 특정 텍스트를 포함하는 알림이 존재하는지 확인 (표시 여부와 무관)
   * @param text 검색할 텍스트
   * @returns 존재하면 true, 아니면 false
   */
  async hasNotificationWithText(text: string | RegExp): Promise<boolean> {
    const locator =
      typeof text === 'string'
        ? this.page.locator('[role="alert"]').filter({ hasText: text })
        : this.page.locator('[role="alert"]').filter({ hasText: text });

    return (await locator.count()) > 0;
  }

  /**
   * 알림이 나타날 때까지 대기
   * @param text 대기할 알림 텍스트 (선택사항)
   * @param timeout 최대 대기 시간 (기본값: TIMEOUTS.LONG)
   */
  async waitForNotification(
    text?: string | RegExp,
    timeout: number = TIMEOUTS.LONG
  ): Promise<void> {
    if (text) {
      const locator =
        typeof text === 'string'
          ? this.page.locator('[role="alert"]').filter({ hasText: text })
          : this.page.locator('[role="alert"]').filter({ hasText: text });

      await locator.first().waitFor({ state: 'visible', timeout });
    } else {
      await this.allNotifications.first().waitFor({ state: 'visible', timeout });
    }
  }

  /**
   * 알림이 사라질 때까지 대기
   * @param timeout 최대 대기 시간 (기본값: TIMEOUTS.MEDIUM)
   */
  async waitForNotificationToDisappear(timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await this.allNotifications.first().waitFor({ state: 'detached', timeout });
  }
}
