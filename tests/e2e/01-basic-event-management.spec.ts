import { expect, test } from './fixtures';

/**
 * E2E 테스트: 기본 일정 관리 (사용자 플로우 기반)
 *
 * 이 테스트 스위트는 실제 사용자가 일정을 관리하는 전체 플로우를 검증합니다:
 * - 일정 생성 → 확인 → 수정 → 재확인 → 삭제 → 정리 확인
 * - 시간 유효성 검증 포함
 *
 * 참고:
 * - app fixture가 자동으로 페이지를 로드하고 cleanup을 수행합니다
 * - 플로우 기반 테스트로 실제 사용자 경험을 시뮬레이션합니다
 */

test.describe('기본 일정 관리 - 사용자 플로우', () => {
  test('생성 → 조회 → 수정 → 삭제', async ({ page, calendarPage }) => {
    const timestamp = Date.now();

    // ========================================
    // Phase 1: 일정 생성
    // ========================================
    const eventData = {
      title: `팀 회의 ${timestamp}`,
      date: '2025-11-05',
      startTime: '14:00',
      endTime: '15:30',
      description: `주간 팀 회의 (${timestamp})`,
      location: '회의실 A',
      category: '업무',
      notification: '10분 전',
    };

    await calendarPage.eventForm.fillEventForm(eventData);
    await calendarPage.eventForm.submit();
    await calendarPage.eventForm.expectFormCleared();

    // ========================================
    // Phase 2: 생성된 일정 확인
    // ========================================

    await calendarPage.eventList.expectEventDetails({
      title: eventData.title,
      date: '2025-11-05',
      time: '14:00 - 15:30',
      description: eventData.description,
      location: eventData.location,
      category: '업무',
      notification: '10분 전',
    });

    await calendarPage.eventList.expectEventExists(eventData.title);

    // ========================================
    // Phase 3: 일정 수정
    // ========================================

    const editButton = calendarPage.eventList.getEditButton(eventData.title);
    await editButton.click();

    await expect(calendarPage.eventForm.titleInput).toHaveValue(eventData.title);

    const updatedEvent = {
      title: `${eventData.title} (장소변경)`,
      description: `${eventData.description} - 회의실이 변경되었습니다`,
      location: '회의실 B',
      category: '개인',
    };

    await calendarPage.eventForm.titleInput.fill(updatedEvent.title);
    await calendarPage.eventForm.descriptionInput.fill(updatedEvent.description);
    await calendarPage.eventForm.locationInput.fill(updatedEvent.location);
    await calendarPage.eventForm.categorySelect.click();
    await page.getByRole('option', { name: updatedEvent.category }).click();

    await calendarPage.eventForm.submit();

    // ========================================
    // Phase 4: 수정된 일정 확인
    // ========================================
    await page.waitForTimeout(500);

    await calendarPage.eventList.expectEventDetails({
      title: updatedEvent.title,
      date: '2025-11-05',
      time: '14:00 - 15:30',
      description: updatedEvent.description,
      location: updatedEvent.location,
      category: '개인',
    });

    // ========================================
    // Phase 5: 일정 삭제
    // ========================================
    const deleteButton = calendarPage.eventList.getDeleteButton(updatedEvent.title);
    await deleteButton.click();

    // ========================================
    // Phase 6: 삭제 확인
    // ========================================
    await calendarPage.eventList.expectEventNotExists(updatedEvent.title);
    await calendarPage.eventList.expectEventNotExists(eventData.title);
  });

  test('시간 유효성 검증 후 정상 생성 플로우', async ({ page, calendarPage }) => {
    const timestamp = Date.now();

    // ========================================
    // Phase 1: 잘못된 시간으로 생성 시도
    // ========================================
    const invalidEvent = {
      title: `프로젝트 리뷰 ${timestamp}`,
      date: '2025-11-08',
      startTime: '16:00',
      endTime: '14:00', // 유효하지 않음: 종료 시간이 시작 시간보다 이름
      description: '프로젝트 진행 상황 리뷰',
      location: '온라인',
    };

    await calendarPage.eventForm.fillEventForm(invalidEvent);

    await calendarPage.eventForm.submitButton.click();

    await expect(page.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeVisible();

    await expect(calendarPage.eventForm.titleInput).toHaveValue(invalidEvent.title);

    await calendarPage.eventList.expectEventNotExists(invalidEvent.title);

    // ========================================
    // Phase 2: 시간 수정 후 정상 생성
    // ========================================

    await calendarPage.eventForm.endTimeInput.fill('17:00');

    await calendarPage.eventForm.submit();
    await page.waitForTimeout(1000);

    // ========================================
    // Phase 3: 정상 생성 확인
    // ========================================
    await calendarPage.eventList.expectEventExists(invalidEvent.title);

    await calendarPage.eventList.expectEventDetails({
      title: invalidEvent.title,
      time: '16:00 - 17:00',
    });

    // ========================================
    // Phase 4: 정리
    // ========================================

    const deleteButton = calendarPage.eventList.getDeleteButton(invalidEvent.title);
    await deleteButton.click();

    await calendarPage.eventList.expectEventNotExists(invalidEvent.title);
  });
});
