import { test as base } from '@playwright/test';

import { EventForm } from './pages/EventForm';
import { EventList } from './pages/EventList';
import { RecurringEventDialog } from './pages/RecurringEventDialog';
import { cleanupAllEvents } from './utils/database';

/**
 * 커스텀 Fixtures 타입 정의
 */
type EventFixtures = {
  eventForm: EventForm;
  eventList: EventList;
  recurringEventDialog: RecurringEventDialog;
  createdEvents: string[];
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
   * EventForm Page Object Fixture
   * 각 테스트마다 새로운 EventForm 인스턴스 제공
   */
  eventForm: async ({ page }, use) => {
    const eventForm = new EventForm(page);
    await use(eventForm);
  },

  /**
   * EventList Page Object Fixture
   * 각 테스트마다 새로운 EventList 인스턴스 제공
   */
  eventList: async ({ page }, use) => {
    const eventList = new EventList(page);
    await use(eventList);
  },

  /**
   * RecurringEventDialog Page Object Fixture
   * 각 테스트마다 새로운 RecurringEventDialog 인스턴스 제공
   */
  recurringEventDialog: async ({ page }, use) => {
    const recurringEventDialog = new RecurringEventDialog(page);
    await use(recurringEventDialog);
  },

  /**
   * 생성된 이벤트 자동 추적 및 Cleanup Fixture
   *
   * 사용법:
   * ```typescript
   * test('example', async ({ eventForm, createdEvents }) => {
   *   await eventForm.fillEventForm(data);
   *   await eventForm.submit();
   *   createdEvents.push(data.title);  // 추적 등록
   *   // 테스트 종료 시 자동으로 삭제됨
   * });
   * ```
   */

  createdEvents: async (_, use) => {
    const events: string[] = [];

    // Setup: 빈 배열 제공
    await use(events);

    // Teardown: 테스트 종료 후 API를 통한 자동 cleanup
    // 빠르고 확실한 cleanup을 위해 reset API 사용
    await cleanupAllEvents();
  },
});

export { expect } from '@playwright/test';
