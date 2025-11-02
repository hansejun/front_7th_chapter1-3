import { test, expect } from './fixtures';

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
 */

// 테스트 설정
const APP_URL = 'http://localhost:5173';

// 테스트 스위트
test.describe('기본 일정 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 애플리케이션으로 이동
    await page.goto(APP_URL);

    // 페이지 로드 대기
    await expect(page).toHaveTitle('일정관리 앱으로 학습하는 테스트 코드');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('단일 일정 생성 및 검증', async ({ eventForm, eventList, createdEvents }) => {
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
    await eventForm.fillEventForm(eventData);

    // 2. 폼 제출
    await eventForm.submit();

    // 3. 폼이 초기화되었는지 확인
    await eventForm.expectFormCleared();

    // 4. 이벤트가 리스트에 표시되는지 확인
    await eventList.expectEventDetails({
      title: eventData.title,
      date: '2025-11-05',
      time: '14:00 - 15:30',
      description: eventData.description,
      location: eventData.location,
      category: '업무',
      notification: '10분 전',
    });

    // 5. Cleanup을 위해 생성된 이벤트 추적 (fixture가 자동으로 삭제)
    createdEvents.push(eventData.title);
  });

  test('일정 수정', async ({ page, eventForm, eventList, createdEvents }) => {
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

    await eventForm.fillEventForm(originalEvent);
    await eventForm.submit();
    await page.waitForTimeout(1000);

    // 2. 이벤트가 생성되었는지 확인
    await eventList.expectEventExists(originalEvent.title);

    // 3. 수정 버튼 클릭
    const editButton = eventList.getEditButton(originalEvent.title);
    await editButton.click();

    // 4. 폼이 기존 데이터로 채워졌는지 확인
    await expect(eventForm.titleInput).toHaveValue(originalEvent.title);

    // 5. 이벤트 수정
    const updatedEvent = {
      title: `${originalEvent.title} (수정됨)`,
      description: `${originalEvent.description} - 내용이 수정되었습니다`,
      location: '회의실 B',
      category: '개인',
    };

    await eventForm.titleInput.fill(updatedEvent.title);
    await eventForm.descriptionInput.fill(updatedEvent.description);
    await eventForm.locationInput.fill(updatedEvent.location);
    await eventForm.categorySelect.click();
    await page.getByRole('option', { name: updatedEvent.category }).click();

    // 6. 변경사항 제출
    await eventForm.submit();

    // 7. 수정된 이벤트가 리스트에 표시되는지 확인
    await eventList.expectEventDetails({
      title: updatedEvent.title,
      date: '2025-11-06',
      time: '10:00 - 11:00',
      description: updatedEvent.description,
      location: updatedEvent.location,
      category: '개인',
    });

    // 8. Cleanup을 위해 수정된 이벤트 추적 (fixture가 자동으로 삭제)
    createdEvents.push(updatedEvent.title);
  });

  test('일정 삭제', async ({ page, eventForm, eventList }) => {
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

    await eventForm.fillEventForm(eventData);
    await eventForm.submit();
    await page.waitForTimeout(1000);

    // 2. 이벤트가 생성되었는지 확인
    await eventList.expectEventExists(eventData.title);

    // 3. 이벤트 삭제
    const deleteButton = eventList.getDeleteButton(eventData.title);
    await deleteButton.click();

    // 4. 이벤트가 리스트에서 제거되었는지 확인 (waitForTimeout 대신 명시적 검증)
    await eventList.expectEventNotExists(eventData.title);

    // 참고: 삭제가 테스트의 목적이므로 createdEvents에 추가하지 않음
  });

  test('시간 유효성 검증', async ({ page, eventForm, eventList, createdEvents }) => {
    const timestamp = Date.now();
    const invalidEvent = {
      title: `유효성 검증 테스트 ${timestamp}`,
      date: '2025-11-08',
      startTime: '16:00',
      endTime: '14:00', // 유효하지 않음: 종료 시간이 시작 시간보다 이름
      description: '시간 유효성 테스트',
    };

    // 1. 유효하지 않은 시간 범위로 폼 채우기
    await eventForm.fillEventForm(invalidEvent);

    // 2. 제출 시도
    await eventForm.submitButton.click();

    // 3. 에러 메시지가 표시되는지 확인
    await expect(page.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeVisible();

    // 4. 폼이 초기화되지 않았는지 확인 (사용자가 수정할 수 있도록)
    await expect(eventForm.titleInput).toHaveValue(invalidEvent.title);

    // 5. 이벤트가 생성되지 않았는지 확인
    await eventList.expectEventNotExists(invalidEvent.title);

    // 6. 시간을 수정하고 정상 동작하는지 확인
    await eventForm.endTimeInput.fill('17:00');
    await eventForm.submit();
    await page.waitForTimeout(1000);

    // 7. 이벤트가 생성되었는지 확인
    await eventList.expectEventExists(invalidEvent.title);

    // 8. Cleanup을 위해 생성된 이벤트 추적 (fixture가 자동으로 삭제)
    createdEvents.push(invalidEvent.title);
  });
});

/**
 * FIXME: 일정 삭제 및 시간 유효성 검증에 대한 병렬 테스트 시에 실패
 */
