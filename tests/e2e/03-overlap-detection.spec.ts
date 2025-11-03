import { test, expect } from './fixtures';

/**
 * E2E 테스트: 일정 겹침 감지
 *
 * 이 테스트 스위트는 다음을 검증합니다:
 * - 일정 겹침 감지 및 경고 다이얼로그
 * - 다양한 겹침 패턴 (완전 포함, 부분 겹침, 경계 케이스)
 * - 겹침 경고 다이얼로그 상호작용 (취소/계속)
 *
 * 테스트 환경:
 * - 백엔드: http://localhost:3000 (TEST_ENV=e2e 사용)
 * - 프론트엔드: http://localhost:5173
 * - 데이터 파일: src/__mocks__/response/e2e.json
 */

// 테스트 실행마다 고유한 타임스탬프를 사용하여 충돌 방지
const timestamp = Date.now();
const baseEventTitle = `기본 일정 ${timestamp}`;
const overlappingEventTitle = `겹치는 일정 ${timestamp}`;

test.describe('일정 겹침 감지', () => {
  test.describe('시나리오 1: 일정 겹침 감지 및 경고', () => {
    test('겹치는 일정을 감지하고 경고 다이얼로그를 표시해야 함', async ({ calendarPage }) => {
      // 1단계: 기본 일정 생성 (14:00 - 16:00)
      await calendarPage.eventForm.fillEventForm({
        title: baseEventTitle,
        date: '2025-11-12',
        startTime: '14:00',
        endTime: '16:00',
      });
      await calendarPage.eventForm.submitForm();

      // 일정 목록에 일정이 생성되었는지 확인
      await calendarPage.eventList.expectEventExists(baseEventTitle);

      // 2단계: 겹치는 일정 생성 (15:00 - 17:00)
      await calendarPage.eventForm.fillEventForm({
        title: overlappingEventTitle,
        date: '2025-11-12',
        startTime: '15:00',
        endTime: '17:00',
      });

      // 제출하고 겹침 경고 다이얼로그 확인
      await calendarPage.eventForm.submitForm();

      // 겹침 경고 다이얼로그가 나타나는지 확인
      await calendarPage.overlapDialog.expectVisible();
      await calendarPage.overlapDialog.expectEventInDialog(baseEventTitle, '14:00-16:00');

      // 3단계: 겹침 경고 취소 테스트
      await calendarPage.overlapDialog.clickCancel();

      // 다이얼로그가 닫혀야 함
      await calendarPage.overlapDialog.expectNotVisible();

      // 겹치는 일정이 생성되지 않아야 함
      await calendarPage.eventList.expectEventNotExists(overlappingEventTitle);

      // 폼에 데이터가 유지되어야 함
      await calendarPage.eventForm.expectTitleValue(overlappingEventTitle);

      // 4단계: 겹치는 일정 생성 진행
      await calendarPage.eventForm.submitForm();

      // 다이얼로그가 다시 나타남
      await calendarPage.overlapDialog.expectVisible();

      // "계속" 버튼 클릭
      await calendarPage.overlapDialog.clickContinue();

      // 다이얼로그가 닫혀야 함
      await calendarPage.overlapDialog.expectNotVisible();

      // 두 일정 모두 표시되어야 함
      await calendarPage.eventList.expectEventExists(baseEventTitle);
      await calendarPage.eventList.expectEventExists(overlappingEventTitle);

      // 참고: 일정 정리는 calendarPage fixture에서 자동으로 처리됨
    });
  });

  test.describe('시나리오 2: 다양한 겹침 패턴', () => {
    const testTimestamp = Date.now();

    test.beforeEach(async ({ calendarPage }) => {
      // 겹침 테스트용 기본 일정 생성 (2025-11-12, 14:00 - 16:00)
      await calendarPage.eventForm.fillEventForm({
        title: `베이스 ${testTimestamp}`,
        date: '2025-11-12',
        startTime: '14:00',
        endTime: '16:00',
      });
      await calendarPage.eventForm.submitForm();

      // 일정이 실제로 생성되었는지 확인
      await calendarPage.eventList.expectEventExists(`베이스 ${testTimestamp}`);
    });

    test('완전히 포함된 겹침을 감지해야 함 (14:30 - 15:30)', async ({ calendarPage }) => {
      await calendarPage.eventForm.fillEventForm({
        title: `완전 포함 ${testTimestamp}`,
        date: '2025-11-12',
        startTime: '14:30',
        endTime: '15:30',
      });
      await calendarPage.eventForm.submitForm();

      // 겹침 경고가 나타나야 함
      await calendarPage.overlapDialog.expectVisible();

      // 다이얼로그 취소
      await calendarPage.overlapDialog.clickCancel();
    });

    test('시작 시간 겹침을 감지해야 함 (13:00 - 14:30)', async ({ calendarPage }) => {
      await calendarPage.eventForm.fillEventForm({
        title: `시작 겹침 ${testTimestamp}`,
        date: '2025-11-12',
        startTime: '13:00',
        endTime: '14:30',
      });
      await calendarPage.eventForm.submitForm();

      // 겹침 경고가 나타나야 함
      await calendarPage.overlapDialog.expectVisible();

      // 다이얼로그 취소
      await calendarPage.overlapDialog.clickCancel();
    });

    test('종료 시간이 시작 시간과 같을 때 겹치지 않아야 함 (16:00 - 17:00)', async ({
      calendarPage,
      page,
    }) => {
      await calendarPage.eventForm.fillEventForm({
        title: `겹치지 않음 ${testTimestamp}`,
        date: '2025-11-12',
        startTime: '16:00',
        endTime: '17:00',
      });
      await calendarPage.eventForm.submitForm();

      // 겹침 경고가 나타나지 않아야 함 (경계 케이스)
      // 성공 알림 대기
      await expect(page.locator('text=일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

      // 일정이 성공적으로 생성되어야 함
      await calendarPage.eventList.expectEventExists(`겹치지 않음 ${testTimestamp}`);
    });

    test('다른 날짜에는 겹치지 않아야 함', async ({ calendarPage, page }) => {
      await calendarPage.eventForm.fillEventForm({
        title: `다른 날 ${testTimestamp}`,
        date: '2025-11-13', // 다른 날짜
        startTime: '14:00',
        endTime: '16:00',
      });
      await calendarPage.eventForm.submitForm();

      // 겹침 경고가 나타나지 않아야 함
      // 성공 알림 대기
      await expect(page.locator('text=일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

      // 일정이 성공적으로 생성되어야 함
      await calendarPage.eventList.expectEventExists(`다른 날 ${testTimestamp}`);
    });
  });
});
