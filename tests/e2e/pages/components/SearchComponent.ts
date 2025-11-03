import { Page, expect } from '@playwright/test';

/**
 * 검색 컴포넌트
 * 일정 검색 기능과 관련된 모든 선택자와 액션을 캡슐화합니다.
 *
 * 검색 기능:
 * - 제목, 설명, 위치로 검색 가능
 * - 실시간 필터링 (debounce 적용)
 * - 검색어 초기화
 */
export class SearchComponent {
  constructor(private page: Page) {}

  /**
   * 검색 입력 필드
   */
  get searchInput() {
    return this.page.getByRole('textbox', { name: '일정 검색' });
  }

  /**
   * 검색 결과 없음 메시지
   */
  get noResultsMessage() {
    return this.page.getByText(/검색 결과가 없습니다/i);
  }

  /**
   * 검색어를 입력합니다.
   * @param keyword 검색할 키워드
   */
  async search(keyword: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(keyword);
    // 검색 필터링이 적용될 때까지 대기 (debounce)
    await this.page.waitForTimeout(500);
  }

  /**
   * 검색어를 초기화합니다.
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * 검색 필드의 값을 확인합니다.
   * @param expectedValue 예상되는 검색어
   */
  async expectSearchValue(expectedValue: string) {
    await expect(this.searchInput).toHaveValue(expectedValue);
  }

  /**
   * 검색 입력 필드가 표시되는지 확인합니다.
   */
  async expectSearchInputVisible() {
    await expect(this.searchInput).toBeVisible();
  }

  /**
   * 검색 입력 필드의 placeholder를 확인합니다.
   * @param placeholder 예상되는 placeholder 텍스트
   */
  async expectPlaceholder(placeholder: string) {
    await expect(this.searchInput).toHaveAttribute('placeholder', placeholder);
  }

  /**
   * "검색 결과가 없습니다" 메시지가 표시되는지 확인합니다.
   */
  async expectNoResults() {
    await expect(this.noResultsMessage).toBeVisible();
  }

  /**
   * 검색 필드가 비어있는지 확인합니다.
   */
  async expectSearchEmpty() {
    await expect(this.searchInput).toHaveValue('');
  }
}
