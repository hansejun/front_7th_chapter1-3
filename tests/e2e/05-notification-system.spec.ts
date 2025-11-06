import { test, expect } from './fixtures';
import { CalendarPage } from './pages/CalendarPage';
import { cleanupAllEvents } from './utils/database';

/**
 * E2E 테스트: 알림 시스템 (사용자 플로우 기반)
 *
 * 이 테스트 스위트는 실제 사용자가 알림을 설정하고 확인하는 플로우를 검증합니다:
 * - 알림 설정하여 일정 생성 → 알림 설정 확인 → Clock API로 시간 이동 → 알림 노출 확인
 * - 알림 시간 수정 → 새 알림 시간 확인
 *
 * 지원되는 알림 옵션:
 * - 1분 전, 10분 전, 1시간 전, 2시간 전, 1일 전
 *
 */

test.describe('알림 시스템 - 사용자 플로우', () => {
  test('알림 설정 확인 플로우: 다양한 알림 시간 설정 및 표시 검증', async ({
    calendarPage,
    page,
  }) => {
    const notificationTimestamp = Date.now();

    // ========================================
    // Phase 1: 알림 옵션 확인
    // ========================================
    // 알림 드롭다운 열기
    await calendarPage.eventForm.openNotificationDropdown();

    // 모든 옵션이 표시되는지 확인
    await calendarPage.eventForm.expectNotificationOptionsVisible();

    // 드롭다운 닫기
    await page.keyboard.press('Escape');

    // ========================================
    // Phase 2: 1분 전 알림 일정 생성
    // ========================================
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

    // ========================================
    // Phase 3: 10분 전 알림 일정 생성
    // ========================================
    await calendarPage.eventForm.fillEventForm({
      title: `10분알림 ${notificationTimestamp}`,
      date: '2025-11-21',
      startTime: '14:00',
      endTime: '15:00',
      notification: '10분 전',
    });
    await calendarPage.eventForm.submitForm();

    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();
    await calendarPage.eventList.expectNotificationDisplayed(/알림.*10분/);

    // ========================================
    // Phase 4: 1시간 전 알림 일정 생성
    // ========================================
    await calendarPage.eventForm.fillEventForm({
      title: `1시간알림 ${notificationTimestamp}`,
      date: '2025-11-22',
      startTime: '16:00',
      endTime: '17:00',
      notification: '1시간 전',
    });
    await calendarPage.eventForm.submitForm();

    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();
    await calendarPage.eventList.expectNotificationDisplayed(/알림.*1시간/);

    // ========================================
    // Phase 5: 알림 시간 수정 플로우
    // ========================================
    // 첫 번째 일정의 알림 시간 수정
    const editButton = calendarPage.eventList.getEditButton(`1분알림 ${notificationTimestamp}`);
    await editButton.click();

    // 알림 시간을 10분 전으로 변경
    await calendarPage.eventForm.openNotificationDropdown();
    await page.getByRole('option', { name: /10분 전/i }).click();

    // 수정 제출
    await calendarPage.eventForm.submitButton.click();

    // 수정된 알림 설정 확인
    await page.waitForTimeout(500);
    await calendarPage.eventList.expectNotificationDisplayed(/알림.*10분/);
  });

  test('실시간 알림 표시 플로우: Clock API를 통한 알림 트리거 검증', async ({ page, context }) => {
    await context.clearCookies(); // 이게 필요한가?

    // ========================================
    // Phase 1: 시간 고정 및 페이지 로드
    // ========================================

    // 현재 시간 고정
    const baseTime = new Date('2025-11-15T14:00:00');
    await page.clock.install({ time: baseTime });

    // 페이지 로드
    await page.goto('http://localhost:5173');

    // POM 인스턴스 수동 생성 (fixture는 이미 페이지를 로드하므로 사용 불가 -> Clock API 사용 위해)
    const calendarPage = new CalendarPage(page);

    // ========================================
    // Phase 2: 10분 후 시작하는 일정 생성
    // ========================================

    // 15분 후 일정 생성 (14:15 - 14:30) with 10분 전 알림
    const eventStart = new Date(baseTime.getTime() + 15 * 60000);
    const eventEnd = new Date(baseTime.getTime() + 30 * 60000);

    await calendarPage.eventForm.fillEventForm({
      title: '10분전알림테스트',
      date: eventStart.toISOString().split('T')[0],
      startTime: eventStart.toTimeString().substring(0, 5),
      endTime: eventEnd.toTimeString().substring(0, 5),
      notification: '10분 전',
    });
    await calendarPage.eventForm.submitForm();

    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();

    // ========================================
    // Phase 3: 알림 설정이 저장되었는지 확인
    // ========================================
    await calendarPage.eventList.expectEventExists('10분전알림테스트');
    await calendarPage.eventList.expectNotificationDisplayed(/알림.*10분/);

    // ========================================
    // Phase 4: 시간 이동하여 알림 트리거
    // ========================================

    // 5분 후로 시간 점프 (14:05 - 알림 트리거 시점: 이벤트 시작 10분 전)
    await page.clock.fastForward('05:00');
    await page.waitForTimeout(2000); // 알림 체크 interval 대기

    // 알림이 표시되는지 확인
    await calendarPage.notification.expectNotificationVisible(/10분/);

    // ========================================
    // Phase 5: 알림 닫기
    // ========================================
    // (알림이 자동으로 사라지거나 사용자가 닫을 수 있음)
    // 이 부분은 애플리케이션의 알림 동작에 따라 추가 검증 가능

    // ========================================
    // Phase 6: Cleanup 수동 처리
    // ========================================
    await cleanupAllEvents();
  });

  test('다양한 알림 시간 옵션 플로우', async ({ calendarPage, page }) => {
    const notificationTimestamp = Date.now();

    // ========================================
    // Phase 1: 1분 전 알림 일정 생성
    // ========================================
    const event1Title = `1분테스트 ${notificationTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: event1Title,
      date: '2025-11-25',
      startTime: '15:00',
      endTime: '16:00',
      notification: '1분 전',
    });
    await calendarPage.eventForm.submitForm();
    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();
    await page.waitForTimeout(1000);

    // ========================================
    // Phase 2: 10분 전 알림 일정 생성
    // ========================================
    const event2Title = `10분테스트 ${notificationTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: event2Title,
      date: '2025-11-25',
      startTime: '16:00',
      endTime: '17:00',
      notification: '10분 전',
    });
    await calendarPage.eventForm.submitForm();
    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();
    await page.waitForTimeout(1000);

    // ========================================
    // Phase 3: 1시간 전 알림 일정 생성
    // ========================================
    const event3Title = `1시간테스트 ${notificationTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: event3Title,
      date: '2025-11-25',
      startTime: '17:00',
      endTime: '18:00',
      notification: '1시간 전',
    });
    await calendarPage.eventForm.submitForm();
    await expect(page.locator('text=일정이 추가되었습니다').first()).toBeVisible();
    await page.waitForTimeout(1000);

    // ========================================
    // Phase 4: 모든 알림 설정 확인
    // ========================================
    await calendarPage.eventList.expectEventExists(event1Title);
    await calendarPage.eventList.expectEventExists(event2Title);
    await calendarPage.eventList.expectEventExists(event3Title);

    // ========================================
    // Phase 5: 정리
    // ========================================
  });
});
