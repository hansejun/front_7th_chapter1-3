import { expect } from '@playwright/test';

import { test } from './fixtures';
import { cleanupAllEvents } from './utils/database';

/**
 * E2E 테스트: 반복 일정 관리
 *
 * 이 테스트 스위트는 반복 일정의 생성, 수정, 삭제 기능을 검증합니다.
 * - 주간 반복 일정 생성
 * - 단일 항목 수정 ("이 일정만")
 * - 전체 시리즈 수정 ("모든 일정")
 * - 단일 항목 삭제
 * - 전체 시리즈 삭제
 * - 다양한 반복 유형 테스트
 *
 * Requirements:
 * - Backend server running on http://localhost:3000 with TEST_ENV=e2e
 * - Frontend server running on http://localhost:5173
 * - e2e.json file should exist and start empty or with test data
 */

const APP_URL = 'http://localhost:5173';

test.describe('반복 일정 관리 E2E 테스트', () => {
  let recurringEventTitle: string;
  let recurringEventTimestamp: number;

  test.beforeEach(async ({ page }) => {
    // 테스트 시작 전 모든 데이터 정리
    await cleanupAllEvents();

    // 각 테스트 전에 애플리케이션으로 이동
    await page.goto(APP_URL);

    // 고유 타임스탬프 생성
    recurringEventTimestamp = Date.now();
    recurringEventTitle = `주간 회의 ${recurringEventTimestamp}`;
  });

  test('시나리오 1: 주간 반복 일정 생성', async ({ calendarPage }) => {
    // 반복 일정 생성
    await calendarPage.eventForm.createRecurringEvent({
      title: recurringEventTitle,
      date: '2025-11-03', // 월요일
      startTime: '10:00',
      endTime: '11:00',
      description: `매주 월요일 팀 회의 (${recurringEventTimestamp})`,
      location: '회의실 A',
      category: '업무',
      repeatType: '매주',
      repeatInterval: 1,
      repeatEndDate: '2025-11-24', // 같은 달 안에 완료
      notificationTime: '10분 전',
    });

    // UI를 통해 생성된 일정 개수 확인 (화면에 표시된 것만)
    const count = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(count).toBe(4); // 주간 반복: 11/03, 11/10, 11/17, 11/24 = 4개

    // 첫 번째 이벤트가 리스트에 표시되는지 확인
    await calendarPage.eventList.expectEventExists(recurringEventTitle);
  });

  test('시나리오 2: 반복 일정 단일 항목 수정', async ({ page, calendarPage }) => {
    // 선행 조건: 주간 반복 일정 생성
    await calendarPage.eventForm.createRecurringEvent({
      title: recurringEventTitle,
      date: '2025-11-03',
      startTime: '10:00',
      endTime: '11:00',
      description: `매주 월요일 팀 회의 (${recurringEventTimestamp})`,
      location: '회의실 A',
      category: '업무',
      repeatType: '매주',
      repeatInterval: 1,
      repeatEndDate: '2025-11-24',
    });

    // 일정 목록에서 첫 번째 일정의 Edit 버튼 클릭
    await calendarPage.eventList.getEditButton(recurringEventTitle).click();

    // 반복 일정 수정 다이얼로그 처리 - "이 일정만"
    await calendarPage.recurringDialog.clickThisEventOnly();

    // 제목 수정
    const singleEditTitle = `${recurringEventTitle} (단일 수정)`;
    await calendarPage.eventForm.titleInput.fill(singleEditTitle);

    // 위치 수정
    await calendarPage.eventForm.locationInput.fill('회의실 B');

    // 일정 수정 버튼 클릭
    await calendarPage.eventForm.submitButton.click();

    // 폼이 리셋될 때까지 대기
    await calendarPage.eventForm.waitForFormReset();

    // UI 업데이트 완료를 위해 추가 대기
    await page.waitForTimeout(500);

    // UI를 통해 수정된 이벤트 확인 - 타임아웃 증가
    await expect(async () => {
      const singleEditCount = await calendarPage.eventList.getEventCountByTitle(singleEditTitle);
      expect(singleEditCount).toBe(1);
    }).toPass({ timeout: 5000 });
    await calendarPage.eventList.expectEventDetails({
      title: singleEditTitle,
      location: '회의실 B',
    });

    // 나머지 일정은 원래 제목을 유지하는지 UI에서 확인
    const unchangedCount = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(unchangedCount).toBe(3); // 4개 중 1개 수정, 3개 유지
  });

  test('시나리오 3: 반복 일정 전체 시리즈 수정', async ({ calendarPage }) => {
    // 선행 조건: 주간 반복 일정 생성
    await calendarPage.eventForm.createRecurringEvent({
      title: recurringEventTitle,
      date: '2025-11-03',
      startTime: '10:00',
      endTime: '11:00',
      description: `매주 월요일 팀 회의 (${recurringEventTimestamp})`,
      location: '회의실 A',
      category: '업무',
      repeatType: '매주',
      repeatInterval: 1,
      repeatEndDate: '2025-11-24',
    });

    // 일정 목록에서 첫 번째 일정의 Edit 버튼 클릭
    await calendarPage.eventList.getEditButton(recurringEventTitle).click();

    // 반복 일정 수정 다이얼로그 처리 - "모든 일정"
    await calendarPage.recurringDialog.clickAllEvents();

    // 설명 수정
    const seriesEditDescription = `전체 시리즈 수정됨 (${recurringEventTimestamp})`;
    await calendarPage.eventForm.descriptionInput.fill(seriesEditDescription);

    // 위치 수정
    await calendarPage.eventForm.locationInput.fill('회의실 C');

    // 일정 수정 버튼 클릭
    await calendarPage.eventForm.submitButton.click();

    // 폼이 리셋될 때까지 대기
    await calendarPage.eventForm.waitForFormReset();

    // UI를 통해 모든 일정이 수정되었는지 확인
    const count = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(count).toBe(4);

    // 첫 번째 이벤트의 수정된 내용 확인
    await calendarPage.eventList.expectEventDetails({
      title: recurringEventTitle,
      description: seriesEditDescription,
      location: '회의실 C',
    });
  });

  test('시나리오 4: 반복 일정 단일 항목 삭제', async ({ page, calendarPage }) => {
    // 선행 조건: 주간 반복 일정 생성
    await calendarPage.eventForm.createRecurringEvent({
      title: recurringEventTitle,
      date: '2025-11-03',
      startTime: '10:00',
      endTime: '11:00',
      description: `매주 월요일 팀 회의 (${recurringEventTimestamp})`,
      location: '회의실 A',
      category: '업무',
      repeatType: '매주',
      repeatInterval: 1,
      repeatEndDate: '2025-11-24',
    });

    // 일정 목록에서 첫 번째 일정의 Delete 버튼 클릭
    await calendarPage.eventList.getDeleteButton(recurringEventTitle).click();

    // 반복 일정 삭제 다이얼로그 처리 - "이 일정만"
    await calendarPage.recurringDialog.clickThisEventOnly();

    // 삭제 성공 메시지 대기
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });

    // UI를 통해 확인 - 1개가 삭제되어 3개만 남음
    const count = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(count).toBe(3);
  });

  test('시나리오 5: 반복 일정 전체 시리즈 삭제', async ({ page, calendarPage }) => {
    // 선행 조건: 주간 반복 일정 생성
    await calendarPage.eventForm.createRecurringEvent({
      title: recurringEventTitle,
      date: '2025-11-03',
      startTime: '10:00',
      endTime: '11:00',
      description: `매주 월요일 팀 회의 (${recurringEventTimestamp})`,
      location: '회의실 A',
      category: '업무',
      repeatType: '매주',
      repeatInterval: 1,
      repeatEndDate: '2025-11-24',
    });

    // 일정 목록에서 첫 번째 일정의 Delete 버튼 클릭
    await calendarPage.eventList.getDeleteButton(recurringEventTitle).click();

    // 반복 일정 삭제 다이얼로그 처리 - "모든 일정"
    await calendarPage.recurringDialog.clickAllEvents();

    // 삭제 성공 메시지 대기
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });

    // UI를 통해 확인 - 모든 일정이 삭제됨
    await calendarPage.eventList.expectEventNotExists(recurringEventTitle);
  });

  test('시나리오 6: 다양한 반복 유형 테스트 - 매일', async ({ calendarPage }) => {
    const dailyTitle = `매일 스탠드업 ${recurringEventTimestamp}`;

    await calendarPage.eventForm.createRecurringEvent({
      title: dailyTitle,
      date: '2025-11-03',
      startTime: '09:00',
      endTime: '09:15',
      description: '일일 스탠드업 미팅',
      location: '온라인',
      repeatType: '매일',
      repeatInterval: 1,
      repeatEndDate: '2025-11-07',
    });

    // UI를 통해 생성된 일정 개수 확인
    const count = await calendarPage.eventList.getEventCountByTitle(dailyTitle);
    expect(count).toBe(5); // 매일 반복: 11/03 ~ 11/07 = 5개
  });

  test('시나리오 6: 다양한 반복 유형 테스트 - 매월', async ({ page, calendarPage }) => {
    const monthlyTitle = `월간 보고 ${recurringEventTimestamp}`;

    await calendarPage.eventForm.createRecurringEvent({
      title: monthlyTitle,
      date: '2025-11-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '월간 실적 보고',
      location: '본사',
      repeatType: '매월',
      repeatInterval: 1,
      repeatEndDate: '2025-12-31',
    });

    // 11월에 1개 확인
    const novemberCount = await calendarPage.eventList.getEventCountByTitle(monthlyTitle);
    expect(novemberCount).toBe(1); // 11월 1일

    // 다음 달로 이동 (12월로)
    await page.getByRole('button', { name: /next/i }).click();

    // 12월에 1개 확인
    const decemberCount = await calendarPage.eventList.getEventCountByTitle(monthlyTitle);
    expect(decemberCount).toBe(1); // 12월 1일
  });

  test('시나리오 6: 다양한 반복 유형 테스트 - 매년', async ({ calendarPage }) => {
    const yearlyTitle = `생일 축하 ${recurringEventTimestamp}`;

    await calendarPage.eventForm.createRecurringEvent({
      title: yearlyTitle,
      date: '2025-11-15',
      startTime: '00:00',
      endTime: '23:59',
      description: '생일',
      location: '집',
      repeatType: '매년',
      repeatInterval: 1,
      repeatEndDate: '2025-12-30', // 최대 종료일
    });

    // UI를 통해 생성된 일정 개수 확인
    const count = await calendarPage.eventList.getEventCountByTitle(yearlyTitle);
    expect(count).toBe(1); // 매년 반복하지만 종료일이 1년 미만이므로 1개만 생성
  });

  test.afterEach(async () => {
    // 테스트 후 생성된 데이터 정리
    await cleanupAllEvents();
  });
});
