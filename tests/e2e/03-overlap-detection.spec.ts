import { test, expect } from './fixtures';

/**
 * E2E 테스트: 일정 겹침 감지 (사용자 플로우 기반)
 *
 * 이 테스트 스위트는 실제 사용자가 일정 겹침 상황을 처리하는 플로우를 검증합니다:
 * - 일정 생성 → 겹치는 일정 생성 시도 → 경고 확인 → 취소/계속 결정 → 시간 조정
 */

const timestamp = Date.now();

test.describe('일정 겹침 감지 - 사용자 플로우', () => {
  test('일정 겹침 처리 플로우: 생성 → 겹침 시도 → 취소 → 재시도 → 계속 → 시간 조정', async ({
    calendarPage,
    page,
  }) => {
    const baseEventTitle = `기획 회의 ${timestamp}`;
    const overlappingEventTitle = `디자인 리뷰 ${timestamp}`;

    // ========================================
    // Phase 1: 첫 번째 일정 생성
    // ========================================

    // 기본 일정 생성 (14:00 - 16:00)
    await calendarPage.eventForm.fillEventForm({
      title: baseEventTitle,
      date: '2025-11-12',
      startTime: '14:00',
      endTime: '16:00',
      description: '신규 기능 기획 논의',
      location: '회의실 A',
      category: '업무',
    });
    await calendarPage.eventForm.submitForm();

    // 일정 목록에 생성되었는지 확인
    await calendarPage.eventList.expectEventExists(baseEventTitle);

    // ========================================
    // Phase 2: 겹치는 일정 생성 시도 (취소 선택)
    // ========================================

    // 겹치는 일정 생성 시도 (15:00 - 17:00)
    await calendarPage.eventForm.fillEventForm({
      title: overlappingEventTitle,
      date: '2025-11-12',
      startTime: '15:00',
      endTime: '17:00',
      description: '디자인 시안 검토',
      location: '회의실 B',
      category: '업무',
    });

    // 제출하고 겹침 경고 다이얼로그 확인
    await calendarPage.eventForm.submitForm();
    await calendarPage.overlapDialog.expectVisible();
    await calendarPage.overlapDialog.expectEventInDialog(baseEventTitle, '14:00-16:00');

    // 취소 버튼 클릭
    await calendarPage.overlapDialog.clickCancel();
    await calendarPage.overlapDialog.expectNotVisible();

    // 겹치는 일정이 생성되지 않았는지 확인
    await calendarPage.eventList.expectEventNotExists(overlappingEventTitle);

    // 폼에 데이터가 유지되어 있는지 확인 (사용자가 수정 가능)
    await calendarPage.eventForm.expectTitleValue(overlappingEventTitle);

    // ========================================
    // Phase 3: 재시도 및 계속 선택
    // ========================================

    // 다시 제출
    await calendarPage.eventForm.submitForm();

    // 다이얼로그가 다시 나타남
    await calendarPage.overlapDialog.expectVisible();

    // "계속" 버튼 클릭하여 겹침을 무시하고 생성
    await calendarPage.overlapDialog.clickContinue();
    await calendarPage.overlapDialog.expectNotVisible();

    // 두 일정 모두 표시되어야 함
    await calendarPage.eventList.expectEventExists(baseEventTitle);
    await calendarPage.eventList.expectEventExists(overlappingEventTitle);

    // ========================================
    // Phase 4: 겹치는 일정 시간 조정
    // ========================================

    // 겹치는 일정 수정하여 시간 조정
    const editButton = calendarPage.eventList.getEditButton(overlappingEventTitle);
    await editButton.click();

    // 시작 시간을 16:00으로 변경하여 겹침 해소
    await calendarPage.eventForm.startTimeInput.fill('16:00');
    await calendarPage.eventForm.endTimeInput.fill('17:00');

    // 수정 제출
    await calendarPage.eventForm.submit();

    // 이제 겹침 경고가 나타나지 않아야 함
    await page.waitForTimeout(500);

    // 시간이 올바르게 수정되었는지 확인
    await calendarPage.eventList.expectEventDetails({
      title: overlappingEventTitle,
      time: '16:00 - 17:00',
    });

    // ========================================
    // Phase 5: 정리
    // ========================================

    // 두 일정 모두 삭제
    await calendarPage.eventList.getDeleteButton(baseEventTitle).click();
    await calendarPage.eventList.expectEventNotExists(baseEventTitle);

    await calendarPage.eventList.getDeleteButton(overlappingEventTitle).click();
    await calendarPage.eventList.expectEventNotExists(overlappingEventTitle);
  });

  test('다양한 겹침 패턴 검증 플로우', async ({ calendarPage, page }) => {
    const testTimestamp = Date.now();
    const baseTitle = `베이스 일정 ${testTimestamp}`;

    // ========================================
    // Phase 1: 기준 일정 생성 (14:00 - 16:00)
    // ========================================
    await calendarPage.eventForm.fillEventForm({
      title: baseTitle,
      date: '2025-11-12',
      startTime: '14:00',
      endTime: '16:00',
      description: '기준 일정',
      location: '회의실 A',
    });
    await calendarPage.eventForm.submitForm();
    await calendarPage.eventList.expectEventExists(baseTitle);

    // ========================================
    // Phase 2: 완전 포함 겹침 테스트 (14:30 - 15:30)
    // ========================================
    const fullyContainedTitle = `완전 포함 ${testTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: fullyContainedTitle,
      date: '2025-11-12',
      startTime: '14:30',
      endTime: '15:30',
    });
    await calendarPage.eventForm.submitForm();

    // 겹침 경고가 나타나야 함
    await calendarPage.overlapDialog.expectVisible();
    await calendarPage.overlapDialog.clickCancel();

    // ========================================
    // Phase 3: 시작 시간 겹침 테스트 (13:00 - 14:30)
    // ========================================
    const startOverlapTitle = `시작 겹침 ${testTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: startOverlapTitle,
      date: '2025-11-12',
      startTime: '13:00',
      endTime: '14:30',
    });
    await calendarPage.eventForm.submitForm();

    // 겹침 경고가 나타나야 함
    await calendarPage.overlapDialog.expectVisible();
    await calendarPage.overlapDialog.clickCancel();

    // ========================================
    // Phase 4: 경계 케이스 - 겹치지 않음 (16:00 - 17:00)
    // ========================================
    const nonOverlapTitle = `겹치지 않음 ${testTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: nonOverlapTitle,
      date: '2025-11-12',
      startTime: '16:00',
      endTime: '17:00',
    });
    await calendarPage.eventForm.submitForm();

    // 겹침 경고가 나타나지 않고 정상 생성되어야 함
    await expect(page.locator('text=일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });
    await calendarPage.eventList.expectEventExists(nonOverlapTitle);

    // ========================================
    // Phase 5: 다른 날짜 - 겹치지 않음 (11-13, 14:00 - 16:00)
    // ========================================
    const differentDayTitle = `다른 날 ${testTimestamp}`;
    await calendarPage.eventForm.fillEventForm({
      title: differentDayTitle,
      date: '2025-11-13', // 다른 날짜
      startTime: '14:00',
      endTime: '16:00',
    });
    await calendarPage.eventForm.submitForm();

    // 겹침 경고가 나타나지 않아야 함
    await expect(page.locator('text=일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });
    await calendarPage.eventList.expectEventExists(differentDayTitle);

    // ========================================
    // Phase 6: 모든 일정 정리
    // ========================================
    await calendarPage.eventList.getDeleteButton(baseTitle).click();
    await calendarPage.eventList.getDeleteButton(nonOverlapTitle).click();
    await calendarPage.eventList.getDeleteButton(differentDayTitle).click();

    await calendarPage.eventList.expectEventNotExists(baseTitle);
    await calendarPage.eventList.expectEventNotExists(nonOverlapTitle);
    await calendarPage.eventList.expectEventNotExists(differentDayTitle);
  });
});
