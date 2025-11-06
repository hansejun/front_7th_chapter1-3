/**
 * E2E 테스트: 검색 및 네비게이션 (사용자 플로우 기반)
 *
 * 이 테스트 스위트는 실제 사용자가 일정을 검색하고 네비게이션하는 플로우를 검증합니다:
 * - 다양한 일정 생성 → 검색으로 찾기 → 해당 일정 수정 → 월간/주간 뷰 전환 → 네비게이션
 *
 */

import { test, expect } from './fixtures';

const timestamp = Date.now();
const searchKeyword = `PROJECT_${timestamp}`;

interface TestEvent {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
}

const testEvents: TestEvent[] = [
  {
    title: `${searchKeyword} 기획 회의`,
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '프로젝트 기획 논의',
    location: '회의실 A',
    category: '업무',
  },
  {
    title: '일반 회의',
    date: '2025-11-16',
    startTime: '14:00',
    endTime: '15:00',
    description: `${searchKeyword} 진행 상황 리뷰`,
    location: '회의실 B',
    category: '업무',
  },
  {
    title: '점심 약속',
    date: '2025-11-17',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심 식사',
    location: `${searchKeyword} 레스토랑`,
    category: '개인',
  },
  {
    title: '개인 작업',
    date: '2025-11-18',
    startTime: '16:00',
    endTime: '17:00',
    description: '개인 업무 처리',
    location: '사무실',
    category: '개인',
  },
];

test.describe('검색 및 네비게이션 - 사용자 플로우', () => {
  test('일정 검색 및 관리 플로우: 생성 → 검색 → 수정 → 삭제', async ({ calendarPage }) => {
    test.setTimeout(30000);

    // ========================================
    // Phase 1: 다양한 일정 생성
    // ========================================
    for (const event of testEvents) {
      await calendarPage.eventForm.fillEventForm(event);
      await calendarPage.eventForm.submit();
      await calendarPage.eventList.expectEventExists(event.title);
    }

    // 모든 일정이 생성되었는지 확인
    const initialCount = await calendarPage.eventList.getEventCount();
    expect(initialCount).toBeGreaterThanOrEqual(4);

    // ========================================
    // Phase 2: 검색으로 일정 찾기
    // ========================================

    // 검색 필드 확인
    await calendarPage.search.expectSearchInputVisible();
    await calendarPage.search.expectPlaceholder('검색어를 입력하세요');

    // 키워드로 검색 (3개의 일정이 필터링되어야 함)
    await calendarPage.search.search(searchKeyword);

    // 필터링된 결과 확인
    await calendarPage.eventList.expectEventExists(`${searchKeyword} 기획 회의`);
    await calendarPage.eventList.expectEventExists('일반 회의');
    await calendarPage.eventList.expectEventExists('점심 약속');

    // 검색되지 않은 일정은 표시되지 않음
    const filteredCount = await calendarPage.eventList.getEventCount();
    expect(filteredCount).toBe(3);

    // ========================================
    // Phase 3: 검색된 일정 수정
    // ========================================

    // 검색된 일정 중 하나 선택하여 수정
    const editButton = calendarPage.eventList.getEditButton(`${searchKeyword} 기획 회의`);
    await editButton.click();

    // 제목 수정
    const updatedTitle = `${searchKeyword} 기획 회의 (수정됨)`;
    await calendarPage.eventForm.titleInput.fill(updatedTitle);
    await calendarPage.eventForm.submit();

    // 수정된 일정 확인
    await calendarPage.eventList.expectEventExists(updatedTitle);

    // ========================================
    // Phase 4: 검색 초기화
    // ========================================
    // 검색 초기화
    await calendarPage.search.clearSearch();

    // 모든 일정이 다시 표시됨
    const countAfterClear = await calendarPage.eventList.getEventCount();
    expect(countAfterClear).toBeGreaterThanOrEqual(4);

    // ========================================
    // Phase 5: 검색된 일정 삭제
    // ========================================

    // 다시 검색
    await calendarPage.search.search(searchKeyword);

    // 수정된 일정 삭제
    const deleteButton = calendarPage.eventList.getDeleteButton(updatedTitle);
    await deleteButton.click();

    // 삭제 확인
    await calendarPage.eventList.expectEventNotExists(updatedTitle);

    // 검색 결과가 2개로 줄어듦
    const afterDeleteCount = await calendarPage.eventList.getEventCount();
    expect(afterDeleteCount).toBe(2);

    // ========================================
    // Phase 6: 정리
    // ========================================
    await calendarPage.search.clearSearch();
  });

  test('캘린더 네비게이션 및 뷰 전환 플로우', async ({ calendarPage }) => {
    test.setTimeout(30000);

    // ========================================
    // Phase 1: 테스트 일정 생성
    // ========================================
    for (const event of testEvents.slice(0, 2)) {
      await calendarPage.eventForm.fillEventForm(event);
      await calendarPage.eventForm.submit();
      await calendarPage.eventList.expectEventExists(event.title);
    }

    // ========================================
    // Phase 2: 초기 뷰 확인 (월간 뷰)
    // ========================================

    // 월간 뷰 확인
    await calendarPage.calendarView.expectMonthView();
    await calendarPage.calendarView.expectMonthHeading('2025년 11월');

    // ========================================
    // Phase 3: 주간 뷰로 전환
    // ========================================

    // 주간 뷰로 전환
    await calendarPage.calendarView.switchToWeekView();
    await calendarPage.calendarView.expectWeekView();

    // ========================================
    // Phase 4: 월간 뷰로 다시 전환
    // ========================================

    // 월간 뷰로 복귀
    await calendarPage.calendarView.switchToMonthView();
    await calendarPage.calendarView.expectMonthView();
    await calendarPage.calendarView.expectMonthHeading('2025년 11월');

    // ========================================
    // Phase 5: 다음 달로 네비게이션
    // ========================================

    // 다음 달 버튼 클릭
    await calendarPage.calendarView.clickNextButton();
    await calendarPage.calendarView.expectMonthHeading('2025년 12월');

    // 5-2. 12월에는 일정이 없음 확인
    const decemberCount = await calendarPage.eventList.getEventCount();
    expect(decemberCount).toBe(0);

    // ========================================
    // Phase 6: 이전 달로 돌아가기
    // ========================================

    // 이전 달 버튼 클릭
    await calendarPage.calendarView.clickPreviousButton();
    await calendarPage.calendarView.expectMonthHeading('2025년 11월');

    // 일정이 다시 표시됨
    const novemberCount = await calendarPage.eventList.getEventCount();
    expect(novemberCount).toBeGreaterThanOrEqual(2);

    // ========================================
    // Phase 7: 주간 뷰 네비게이션
    // ========================================
    // 주간 뷰로 전환
    await calendarPage.calendarView.switchToWeekView();

    // 다음 주로 이동
    await calendarPage.calendarView.clickNextButton();

    // 이전 주로 돌아가기
    await calendarPage.calendarView.clickPreviousButton();

    // 여전히 주간 뷰인지 확인
    await calendarPage.calendarView.expectWeekView();
  });

  test('검색과 네비게이션 통합 플로우', async ({ calendarPage, page }) => {
    test.setTimeout(30000);

    // ========================================
    // Phase 1: 테스트 일정 생성
    // ========================================
    for (const event of testEvents) {
      await calendarPage.eventForm.fillEventForm(event);
      await calendarPage.eventForm.submit();
      await calendarPage.eventList.expectEventExists(event.title);
    }

    // ========================================
    // Phase 2: 검색 필터 적용
    // ========================================
    await calendarPage.search.search(searchKeyword);
    await calendarPage.eventList.expectEventExists(`${searchKeyword} 기획 회의`);

    // ========================================
    // Phase 3: 검색 활성화 상태에서 다음 달로 이동
    // ========================================
    // 다음 달로 이동
    await calendarPage.calendarView.clickNextButton();
    await calendarPage.calendarView.expectMonthHeading('2025년 12월');

    // 검색 필터가 여전히 활성화되어 있는지 확인
    await calendarPage.search.expectSearchValue(searchKeyword);

    await page.waitForTimeout(1000);

    // 3-3. 12월 뷰에는 11월 일정이 없으므로 0개
    const filteredCount = await calendarPage.eventList.getEventCount();
    expect(filteredCount).toBe(0);

    // ========================================
    // Phase 4: 11월로 돌아가기
    // ========================================
    // 이전 달로 이동
    await calendarPage.calendarView.clickPreviousButton();
    await calendarPage.calendarView.expectMonthHeading('2025년 11월');

    // 검색 필터가 유지되고 있는지 확인
    await calendarPage.search.expectSearchValue(searchKeyword);

    // 네비게이션 후 UI 업데이트 대기
    await page.waitForTimeout(1000);

    // 검색된 일정이 다시 표시됨
    const backToNovemberCount = await calendarPage.eventList.getEventCount();
    expect(backToNovemberCount).toBeGreaterThanOrEqual(3);

    // ========================================
    // Phase 5: 검색 초기화
    // ========================================
    await calendarPage.search.clearSearch();

    const allEventsCount = await calendarPage.eventList.getEventCount();
    expect(allEventsCount).toBeGreaterThanOrEqual(4);
  });

  test('검색 결과 없음 처리 플로우', async ({ calendarPage }) => {
    // ========================================
    // Phase 1: 존재하지 않는 키워드로 검색
    // ========================================
    const nonExistentKeyword = `NONEXISTENT_${Date.now()}_KEYWORD`;
    await calendarPage.search.search(nonExistentKeyword);

    // ========================================
    // Phase 2: 결과 없음 확인
    // ========================================

    // "검색 결과가 없습니다" 메시지 표시
    await calendarPage.search.expectNoResults();

    // ========================================
    // Phase 3: 검색 초기화 후 정상 표시
    // ========================================
    await calendarPage.search.clearSearch();

    const countAfterClear = await calendarPage.eventList.getEventCount();
    expect(countAfterClear).toBeGreaterThanOrEqual(0);
  });
});
