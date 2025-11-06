/**
 * E2E 테스트 상수 정의
 * 프로젝트 전반에서 사용되는 상수들을 중앙 집중 관리합니다.
 */

/**
 * 대기 시간 상수 (밀리초)
 */
export const TIMEOUTS = {
  /** CSS 애니메이션 대기 시간 */
  ANIMATION: 300,
  /** 드롭다운 닫힘 대기 시간 */
  DROPDOWN_CLOSE: 2000,
  /** 검색 디바운스 대기 시간 */
  DEBOUNCE: 500,
  /** 짧은 대기 시간 */
  SHORT: 2000,
  /** 중간 대기 시간 */
  MEDIUM: 5000,
  /** 긴 대기 시간 */
  LONG: 10000,
} as const;

/**
 * 알림 옵션 텍스트
 * UI에 표시되는 알림 시간 옵션
 */
export const NOTIFICATION_OPTIONS = {
  ONE_MINUTE: '1분 전',
  TEN_MINUTES: '10분 전',
  ONE_HOUR: '1시간 전',
  ONE_DAY: '1일 전',
} as const;

/**
 * 알림 옵션 타입
 * TypeScript 타입으로 사용하기 위한 유니온 타입
 */
export type NotificationOption = (typeof NOTIFICATION_OPTIONS)[keyof typeof NOTIFICATION_OPTIONS];

/**
 * 반복 일정 타입
 * UI에 표시되는 반복 유형 한글 텍스트
 */
export const REPEAT_TYPES = {
  DAILY: '매일',
  WEEKLY: '매주',
  MONTHLY: '매월',
  YEARLY: '매년',
} as const;

/**
 * 반복 타입 리터럴 타입
 * TypeScript 타입으로 사용하기 위한 유니온 타입
 */
export type RepeatType = (typeof REPEAT_TYPES)[keyof typeof REPEAT_TYPES];

/**
 * 카테고리 옵션
 * UI에 표시되는 카테고리 텍스트
 */
export const CATEGORIES = {
  WORK: '업무',
  PERSONAL: '개인',
} as const;
