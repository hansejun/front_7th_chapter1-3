import { test, expect } from './fixtures';
import { CalendarPage } from './pages/CalendarPage';
import { cleanupAllEvents } from './utils/database';

/**
 * E2E 테스트: 알림 시스템
 *
 * 이 테스트 스위트는 다음을 검증합니다:
 * - 시나리오 1: 알림 시간 설정 UI (드롭다운 옵션)
 * - 시나리오 2: 알림 설정이 일정에 올바르게 표시되는지 검증
 * - 시나리오 3: 실시간 알림 표시 (Playwright Clock API 사용)
 *
 * 지원되는 알림 옵션:
 * - 1분 전, 10분 전, 1시간 전, 2시간 전, 1일 전
 *
 * 테스트 환경:
 * - 백엔드: http://localhost:3000 (TEST_ENV=e2e 사용)
 * - 프론트엔드: http://localhost:5173
 * - 데이터 파일: src/__mocks__/response/e2e.json
 */

test.describe('알림 시스템', () => {
  test.describe('시나리오 1: 알림 시간 설정 UI', () => {
    test('모든 알림 시간 옵션이 표시되어야 함', async ({ calendarPage, page }) => {
      // 알림 드롭다운 열기
      await calendarPage.eventForm.openNotificationDropdown();

      // 모든 옵션이 표시되는지 확인
      await calendarPage.eventForm.expectNotificationOptionsVisible();

      // 드롭다운 닫기
      await page.keyboard.press('Escape');
    });
  });

  test.describe('시나리오 2: 알림 설정 표시 검증', () => {
    test('다양한 알림 시간으로 일정을 생성하고 표시를 확인해야 함', async ({
      calendarPage,
      page,
    }) => {
      const notificationTimestamp = Date.now();

      // 1분 전 알림 일정 생성
      await calendarPage.eventForm.fillEventForm({
        title: `1분알림 ${notificationTimestamp}`,
        date: '2025-11-20',
        startTime: '10:00',
        endTime: '11:00',
        notification: '1분 전',
      });
      await calendarPage.eventForm.submitForm();

      await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();

      // 이벤트 리스트에 알림 설정이 표시되는지 확인
      await calendarPage.eventList.expectNotificationDisplayed(/알림.*1분/);

      // 10분 전 알림 일정 생성
      await calendarPage.eventForm.fillEventForm({
        title: `10분알림 ${notificationTimestamp}`,
        date: '2025-11-21',
        startTime: '14:00',
        endTime: '15:00',
        notification: '10분 전',
      });
      await calendarPage.eventForm.submitForm();

      await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();

      // 이벤트 리스트에 알림 설정이 표시되는지 확인
      await calendarPage.eventList.expectNotificationDisplayed(/알림.*10분/);

      // 1시간 전 알림 일정 생성
      await calendarPage.eventForm.fillEventForm({
        title: `1시간알림 ${notificationTimestamp}`,
        date: '2025-11-22',
        startTime: '16:00',
        endTime: '17:00',
        notification: '1시간 전',
      });
      await calendarPage.eventForm.submitForm();

      await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();

      // 이벤트 리스트에 알림 설정이 표시되는지 확인
      await calendarPage.eventList.expectNotificationDisplayed(/알림.*1시간/);

      // 참고: 일정 정리는 calendarPage fixture에서 자동으로 처리됨
    });
  });

  test.describe('시나리오 3: 실시간 알림 표시 (Clock API)', () => {
    test('10분 전 알림이 정확한 시간에 표시되어야 함', async ({ page, context }) => {
      // 새 컨텍스트로 완전히 독립적인 테스트
      await context.clearCookies();

      // 현재 시간 고정 (Clock API는 페이지 로드 전에 설치 필요)
      const baseTime = new Date('2025-11-15T14:00:00');
      await page.clock.install({ time: baseTime });

      // 페이지 로드
      await page.goto('http://localhost:5173');

      // POM 인스턴스 수동 생성 (fixture는 이미 페이지를 로드하므로 사용 불가)
      const calendarPage = new CalendarPage(page);

      // 15분 후 일정 생성 (14:15 - 14:30)
      const eventStart = new Date(baseTime.getTime() + 15 * 60000);
      const eventEnd = new Date(baseTime.getTime() + 30 * 60000);

      // POM의 eventForm 컴포넌트 사용
      await calendarPage.eventForm.fillEventForm({
        title: '10분전알림테스트',
        date: eventStart.toISOString().split('T')[0],
        startTime: eventStart.toTimeString().substring(0, 5),
        endTime: eventEnd.toTimeString().substring(0, 5),
        notification: '10분 전',
      });
      await calendarPage.eventForm.submitForm();

      await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();

      // 5분 후로 시간 점프 (14:05 - 알림 트리거 시점: 이벤트 시작 10분 전)
      await page.clock.fastForward('05:00');
      await page.waitForTimeout(2000); // 알림 체크 interval 대기

      // POM의 notification 컴포넌트 사용
      await calendarPage.notification.expectNotificationVisible(/10분/);

      // Cleanup 수동 처리 (fixture를 사용하지 않으므로)
      await cleanupAllEvents();
    });
  });
});
