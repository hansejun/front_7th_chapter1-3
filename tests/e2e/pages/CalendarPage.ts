import { Page } from '@playwright/test';

import { CalendarViewComponent } from './components/CalendarViewComponent';
import { EventFormComponent } from './components/EventFormComponent';
import { EventListComponent } from './components/EventListComponent';
import { RecurringDialogComponent } from './components/RecurringDialogComponent';

/**
 * Calendar Page Object - Composition Pattern
 *
 * 단일 페이지 애플리케이션을 논리적 컴포넌트로 분리하여 관리합니다.
 * 각 컴포넌트는 독립적으로 관리되며, 재사용 가능한 구조를 제공합니다.
 *
 * 사용 예시:
 * ```typescript
 * await calendarPage.eventForm.fillEventForm(data);
 * await calendarPage.eventList.expectEventExists(title);
 * await calendarPage.recurringDialog.clickThisEventOnly();
 * await calendarPage.calendarView.expectEventOnDate(15, title);
 * ```
 *
 * 장점:
 * - Composition 패턴 적용 (업계 표준)
 * - 각 컴포넌트 독립적 관리 및 테스트 가능
 * - 명확한 계층 구조
 * - 높은 재사용성
 */
export class CalendarPage {
  /** 이벤트 생성/수정 폼 컴포넌트 */
  public readonly eventForm: EventFormComponent;

  /** 이벤트 목록 컴포넌트 */
  public readonly eventList: EventListComponent;

  /** 반복 일정 다이얼로그 컴포넌트 */
  public readonly recurringDialog: RecurringDialogComponent;

  /** 캘린더 뷰 컴포넌트 */
  public readonly calendarView: CalendarViewComponent;

  constructor(private page: Page) {
    this.eventForm = new EventFormComponent(page);
    this.eventList = new EventListComponent(page);
    this.recurringDialog = new RecurringDialogComponent(page);
    this.calendarView = new CalendarViewComponent(page);
  }
}
