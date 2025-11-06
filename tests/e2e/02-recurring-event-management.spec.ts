import { expect } from '@playwright/test';

import { test } from './fixtures';

/**
 * E2E 테스트: 반복 일정 관리 (사용자 플로우 기반)
 *
 * 이 테스트 스위트는 실제 사용자가 반복 일정을 관리하는 전체 플로우를 검증합니다:
 * - 플로우 1: 주간 반복 일정의 전체 생명주기 (생성 → 단일 수정 → 전체 수정 → 단일 삭제 → 전체 삭제)
 * - 플로우 2: 다양한 반복 유형 테스트 (매일, 매월, 매년)
 *
 */

test.describe('반복 일정 관리 - 사용자 플로우', () => {
  test('주간 반복 일정 생성 및 단일 항목 관리: 생성 → 단일 수정 → 단일 삭제', async ({
    calendarPage,
    page,
  }) => {
    const recurringEventTimestamp = Date.now();
    const recurringEventTitle = `주간 회의 ${recurringEventTimestamp}`;

    // ========================================
    // Phase 1: 주간 반복 일정 생성
    // ========================================
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

    // 1-1. UI를 통해 생성된 일정 개수 확인 (4개: 11/03, 11/10, 11/17, 11/24)
    const initialCount = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(initialCount).toBe(4);

    await calendarPage.eventList.expectEventExists(recurringEventTitle);

    // ========================================
    // Phase 2: 단일 항목 수정
    // ========================================

    await calendarPage.eventList.getEditButton(recurringEventTitle).click();

    await calendarPage.recurringDialog.clickThisEventOnly();

    const singleEditTitle = `${recurringEventTitle} (긴급)`;
    await calendarPage.eventForm.titleInput.fill(singleEditTitle);
    await calendarPage.eventForm.locationInput.fill('회의실 B');

    await calendarPage.eventForm.submitButton.click();
    await calendarPage.eventForm.waitForFormReset();
    await page.waitForTimeout(500);

    // 수정된 단일 이벤트 확인
    await expect(async () => {
      const singleEditCount = await calendarPage.eventList.getEventCountByTitle(singleEditTitle);
      expect(singleEditCount).toBe(1);
    }).toPass({ timeout: 5000 });

    await calendarPage.eventList.expectEventDetails({
      title: singleEditTitle,
      location: '회의실 B',
    });

    // 나머지 일정은 원래 제목 유지 확인
    const unchangedCount = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(unchangedCount).toBe(3); // 4개 중 1개 수정, 3개 유지

    // ========================================
    // Phase 3: 단일 항목 삭제
    // ========================================

    await calendarPage.eventList.getDeleteButton(singleEditTitle).click();
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });

    await calendarPage.eventList.expectEventNotExists(singleEditTitle);

    // 나머지 원래 일정들은 여전히 존재
    const afterDelete = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(afterDelete).toBe(3);
  });

  test('주간 반복 일정 전체 시리즈 관리: 생성 → 전체 수정 → 전체 삭제', async ({
    calendarPage,
    page,
  }) => {
    const recurringEventTimestamp = Date.now();
    const recurringEventTitle = `주간 회의 ${recurringEventTimestamp}`;
    // ========================================
    // Phase 1: 주간 반복 일정 생성
    // ========================================
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
      notificationTime: '10분 전',
    });

    const initialCount = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(initialCount).toBe(4);

    // ========================================
    // Phase 2: 전체 시리즈 수정
    // ========================================

    await calendarPage.eventList.getEditButton(recurringEventTitle).click();

    // "모든 일정" 선택
    await calendarPage.recurringDialog.clickAllEvents();

    // 설명과 위치 수정
    const seriesEditDescription = `전체 시리즈 수정됨 (${recurringEventTimestamp})`;
    await calendarPage.eventForm.descriptionInput.fill(seriesEditDescription);
    await calendarPage.eventForm.locationInput.fill('회의실 C');

    // 수정 제출
    await calendarPage.eventForm.submitButton.click();
    await calendarPage.eventForm.waitForFormReset();
    await page.waitForTimeout(1000);

    //모든 일정이 수정되었는지 확인
    const seriesCount = await calendarPage.eventList.getEventCountByTitle(recurringEventTitle);
    expect(seriesCount).toBe(4);

    // 수정된 내용 확인
    await calendarPage.eventList.expectEventDetails({
      title: recurringEventTitle,
      description: seriesEditDescription,
      location: '회의실 C',
    });

    // ========================================
    // Phase 3: 전체 시리즈 삭제
    // ========================================
    // Delete 버튼 클릭
    await calendarPage.eventList.getDeleteButton(recurringEventTitle).click();

    // "모든 일정" 선택
    await calendarPage.recurringDialog.clickAllEvents();

    // 삭제 성공 메시지 대기
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });

    // 모든 일정이 삭제됨 확인
    await calendarPage.eventList.expectEventNotExists(recurringEventTitle);
  });

  test('다양한 반복 유형 플로우: 매일 → 매월 → 매년 생성 및 확인', async ({
    calendarPage,
    page,
  }) => {
    const recurringEventTimestamp = Date.now();

    // ========================================
    // Phase 1: 매일 반복 일정 생성
    // ========================================
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

    // 생성된 일정 개수 확인 (매일: 11/03 ~ 11/07 = 5개)
    const dailyCount = await calendarPage.eventList.getEventCountByTitle(dailyTitle);
    expect(dailyCount).toBe(5);

    await calendarPage.eventList.expectEventExists(dailyTitle);

    // ========================================
    // Phase 2: 매월 반복 일정 생성
    // ========================================
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

    await page.waitForTimeout(1000);

    // 11월에 1개 확인 (매월 반복 일정)
    await expect(async () => {
      const novemberCount = await calendarPage.eventList.getEventCountByTitle(monthlyTitle);
      expect(novemberCount).toBe(1); // 11월 1일
    }).toPass({ timeout: 5000 });

    // 다음 달로 네비게이션
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // 12월에 1개 확인
    const decemberCount = await calendarPage.eventList.getEventCountByTitle(monthlyTitle);
    expect(decemberCount).toBe(1); // 12월 1일

    // 다시 11월로 돌아가기
    await page.getByRole('button', { name: /prev/i }).click();
    await page.waitForTimeout(1000);

    // ========================================
    // Phase 3: 매년 반복 일정 생성
    // ========================================
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

    await page.waitForTimeout(1000);

    // 매년 반복하지만 종료일이 1년 미만이므로 1개만 생성
    await expect(async () => {
      const yearlyCount = await calendarPage.eventList.getEventCountByTitle(yearlyTitle);
      expect(yearlyCount).toBe(1);
    }).toPass({ timeout: 5000 });

    // ========================================
    // Phase 4: 모든 반복 일정 정리 확인
    // ========================================

    // 매일 반복 일정 전체 삭제
    await calendarPage.eventList.getDeleteButton(dailyTitle).click();
    await calendarPage.recurringDialog.clickAllEvents();
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });
    await calendarPage.eventList.expectEventNotExists(dailyTitle);

    // 매월 반복 일정 전체 삭제
    await calendarPage.eventList.getDeleteButton(monthlyTitle).click();
    await calendarPage.recurringDialog.clickAllEvents();
    await page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 5000 });
    await calendarPage.eventList.expectEventNotExists(monthlyTitle);

    // 매년 반복 일정 삭제 (1개만 있으므로 다이얼로그 없을 수 있음)
    const yearlyDeleteButton = calendarPage.eventList.getDeleteButton(yearlyTitle);
    await yearlyDeleteButton.click();

    await page.waitForTimeout(1000);
    await calendarPage.eventList.expectEventNotExists(yearlyTitle);
  });
});
