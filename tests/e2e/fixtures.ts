import { test as base } from '@playwright/test';

import { CalendarPage } from './pages/CalendarPage';
import { cleanupAllEvents } from './utils/database';

const APP_URL = 'http://localhost:5173';

/**
 * 커스텀 Fixtures 타입 정의
 */
type EventFixtures = {
  calendarPage: CalendarPage;
};

/**
 * Playwright Test를 확장하여 커스텀 Fixtures 제공
 *
 * Fixtures 장점:
 * 1. Setup/Teardown을 한 곳에서 관리
 * 2. 테스트 실패해도 cleanup 보장
 * 3. 공유 상태 없이 독립적
 * 4. 재사용 가능
 */
export const test = base.extend<EventFixtures>({
  /**
   * CalendarPage Fixture - Composition Pattern
   * 각 테스트마다 새로운 CalendarPage 인스턴스 제공
   *
   * CalendarPage는 다음 컴포넌트를 포함합니다:
   * - eventForm: 이벤트 생성/수정 폼
   * - eventList: 이벤트 목록
   * - recurringDialog: 반복 일정 다이얼로그
   * - calendarView: 캘린더 뷰
   *
   * 사용 예시:
   * ```typescript
   * await calendarPage.eventForm.fillEventForm(data);
   * await calendarPage.eventList.expectEventExists(title);
   * ```
   */
  calendarPage: async ({ page }, use) => {
    // Setup: 페이지 네비게이션 및 초기화
    await page.goto(APP_URL);

    const calendarPage = new CalendarPage(page);

    await use(calendarPage);

    // Teardown: 모든 이벤트 cleanup
    await cleanupAllEvents();
  },
});

export { expect } from '@playwright/test';
