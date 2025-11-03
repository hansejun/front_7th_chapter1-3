import { expect, test } from './fixtures';

/**
 * E2E 테스트: 기본 일정 관리
 *
 * 이 테스트 스위트는 일정 관리의 기본 CRUD 작업을 다룹니다:
 * - 단일 일정 생성
 * - 일정 수정
 * - 일정 삭제
 * - 시간 유효성 검증
 *
 * 사전 요구사항:
 * - 애플리케이션이 http://localhost:5173 에서 실행 중
 * - 백엔드 서버가 http://localhost:3000 에서 실행 중
 * - TEST_ENV=e2e 환경 변수 설정
 *
 * 참고:
 * - app fixture가 자동으로 페이지를 로드하고 cleanup을 수행합니다
 * - 각 테스트는 독립적으로 실행되며, 테스트 간 상태가 공유되지 않습니다
 */

// 테스트 스위트
test.describe('기본 일정 관리', () => {
  test('단일 일정 생성 및 검증', async ({ calendarPage }) => {
    // 테스트 격리를 위한 고유 타임스탬프 생성
    const timestamp = Date.now();
    const eventData = {
      title: `E2E 테스트 일정 ${timestamp}`,
      date: '2025-11-05',
      startTime: '14:00',
      endTime: '15:30',
      description: `자동화 테스트로 생성된 일정 (${timestamp})`,
      location: 'E2E 테스트 회의실',
      category: '업무',
      notification: '10분 전',
    };

    // 1. 폼 채우기
    await calendarPage.eventForm.fillEventForm(eventData);

    // 2. 폼 제출
    await calendarPage.eventForm.submit();

    // 3. 폼이 초기화되었는지 확인
    await calendarPage.eventForm.expectFormCleared();

    // 4. 이벤트가 리스트에 표시되는지 확인
    await calendarPage.eventList.expectEventDetails({
      title: eventData.title,
      date: '2025-11-05',
      time: '14:00 - 15:30',
      description: eventData.description,
      location: eventData.location,
      category: '업무',
      notification: '10분 전',
    });

    // 참고: app fixture가 자동으로 cleanup 수행
  });

  test('일정 수정', async ({ page, calendarPage }) => {
    // 1. 수정할 이벤트 생성
    const timestamp = Date.now();
    const originalEvent = {
      title: `E2E 편집 테스트 ${timestamp}`,
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: `편집 전 설명 (${timestamp})`,
      location: '회의실 A',
      category: '업무',
      notification: '10분 전',
    };

    await calendarPage.eventForm.fillEventForm(originalEvent);
    await calendarPage.eventForm.submit();
    await page.waitForTimeout(1000);

    // 2. 이벤트가 생성되었는지 확인
    await calendarPage.eventList.expectEventExists(originalEvent.title);

    // 3. 수정 버튼 클릭
    const editButton = calendarPage.eventList.getEditButton(originalEvent.title);
    await editButton.click();

    // 4. 폼이 기존 데이터로 채워졌는지 확인
    await expect(calendarPage.eventForm.titleInput).toHaveValue(originalEvent.title);

    // 5. 이벤트 수정
    const updatedEvent = {
      title: `${originalEvent.title} (수정됨)`,
      description: `${originalEvent.description} - 내용이 수정되었습니다`,
      location: '회의실 B',
      category: '개인',
    };

    await calendarPage.eventForm.titleInput.fill(updatedEvent.title);
    await calendarPage.eventForm.descriptionInput.fill(updatedEvent.description);
    await calendarPage.eventForm.locationInput.fill(updatedEvent.location);
    await calendarPage.eventForm.categorySelect.click();
    await page.getByRole('option', { name: updatedEvent.category }).click();

    // 6. 변경사항 제출
    await calendarPage.eventForm.submit();

    // 7. 수정된 이벤트가 리스트에 표시되는지 확인
    await calendarPage.eventList.expectEventDetails({
      title: updatedEvent.title,
      date: '2025-11-06',
      time: '10:00 - 11:00',
      description: updatedEvent.description,
      location: updatedEvent.location,
      category: '개인',
    });

    // 참고: app fixture가 자동으로 cleanup 수행
  });

  test('일정 삭제', async ({ page, calendarPage }) => {
    // 1. 삭제할 이벤트 생성
    const timestamp = Date.now();
    const eventData = {
      title: `E2E 삭제 테스트 ${timestamp}`,
      date: '2025-11-07',
      startTime: '16:00',
      endTime: '17:00',
      description: `삭제될 일정 (${timestamp})`,
      location: '테스트 장소',
      category: '업무',
    };

    await calendarPage.eventForm.fillEventForm(eventData);
    await calendarPage.eventForm.submit();
    await page.waitForTimeout(1000);

    // 2. 이벤트가 생성되었는지 확인
    await calendarPage.eventList.expectEventExists(eventData.title);

    // 3. 이벤트 삭제
    const deleteButton = calendarPage.eventList.getDeleteButton(eventData.title);
    await deleteButton.click();

    // 4. 이벤트가 리스트에서 제거되었는지 확인 (waitForTimeout 대신 명시적 검증)
    await calendarPage.eventList.expectEventNotExists(eventData.title);

    // 참고: 삭제가 테스트의 목적이므로 createdEvents에 추가하지 않음
  });

  test('시간 유효성 검증', async ({ page, calendarPage }) => {
    const timestamp = Date.now();
    const invalidEvent = {
      title: `유효성 검증 테스트 ${timestamp}`,
      date: '2025-11-08',
      startTime: '16:00',
      endTime: '14:00', // 유효하지 않음: 종료 시간이 시작 시간보다 이름
      description: '시간 유효성 테스트',
    };

    // 1. 유효하지 않은 시간 범위로 폼 채우기
    await calendarPage.eventForm.fillEventForm(invalidEvent);

    // 2. 제출 시도
    await calendarPage.eventForm.submitButton.click();

    // 3. 에러 메시지가 표시되는지 확인
    await expect(page.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeVisible();

    // 4. 폼이 초기화되지 않았는지 확인 (사용자가 수정할 수 있도록)
    await expect(calendarPage.eventForm.titleInput).toHaveValue(invalidEvent.title);

    // 5. 이벤트가 생성되지 않았는지 확인
    await calendarPage.eventList.expectEventNotExists(invalidEvent.title);

    // 6. 시간을 수정하고 정상 동작하는지 확인
    await calendarPage.eventForm.endTimeInput.fill('17:00');
    await calendarPage.eventForm.submit();
    await page.waitForTimeout(1000);

    // 7. 이벤트가 생성되었는지 확인
    await calendarPage.eventList.expectEventExists(invalidEvent.title);

    // 참고: app fixture가 자동으로 cleanup 수행
  });
});
