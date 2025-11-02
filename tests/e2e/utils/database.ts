/**
 * E2E 테스트를 위한 데이터베이스 유틸리티
 * 테스트 격리를 위한 cleanup 기능을 제공합니다.
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 모든 이벤트를 삭제합니다.
 * beforeEach/afterEach에서 테스트 격리를 위해 사용합니다.
 */
export async function cleanupAllEvents() {
  await fetch(`${API_BASE_URL}/events/reset`, {
    method: 'POST',
  });
}
