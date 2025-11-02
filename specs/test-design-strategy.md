# 테스트 설계 전략: 드래그 앤 드롭 및 날짜 클릭 기능

**작성일**: 2025-11-02
**프로젝트**: Calendar Event Management Application
**기반 명세서**: `specs/drag-and-drop-date-click-feature.md`

---

## 1. 테스트 전략 개요

본 테스트 설계는 **YAGNI 원칙**을 따르며, 명세서에 명시된 기능만을 검증합니다. 기존 테스트 패턴(Vitest + React Testing Library + MSW)을 최대한 활용하여 일관성을 유지합니다.

### 복잡도 평가

- **복잡도**: Moderate (중간)
- **테스트 접근법**: 기존 통합 테스트 패턴 활용, 드래그 앤 드롭은 @dnd-kit 제공 테스트 유틸리티 사용

---

## 2. 테스트 범위 정의

### 2.1 유닛 테스트 (Unit Tests)

**위치**: `src/__tests__/unit/`

#### Feature 1: 드래그 앤 드롭

1. **드래그 가능 여부 판별 로직**

   - 파일: `dragAndDropUtils.spec.ts`
   - 함수: `isDraggable(event)` (신규 유틸리티)
   - 테스트 케이스:
     - 일반 일정 (repeat.type === 'none') → true 반환
     - 반복 일정 (repeat.type !== 'none') → false 반환

2. **날짜 변경 로직**
   - 파일: `dragAndDropUtils.spec.ts`
   - 함수: `updateEventDate(event, newDate)` (신규 유틸리티)
   - 테스트 케이스:
     - 날짜만 변경, 시간 필드 유지 검증
     - 입력 날짜 형식 검증 (YYYY-MM-DD)

#### Feature 2: 날짜 클릭

1. **날짜 포맷 변환**
   - 파일: `dateClickUtils.spec.ts` (필요 시)
   - 함수: 기존 `formatDate` 재사용
   - 테스트 케이스:
     - Date 객체 → YYYY-MM-DD 변환 검증

### 2.2 통합 테스트 (Integration Tests)

**위치**: `src/__tests__/integration/`

#### Feature 1: 드래그 앤 드롭

**파일**: `dragAndDropFeature.spec.tsx`

**테스트 케이스**:

1. **Week 뷰에서 드래그 앤 드롭 성공**

   - 일반 일정을 다른 날짜로 드래그
   - 날짜만 변경되고 시간은 유지되는지 확인
   - 서버 PUT 요청 확인 (MSW)
   - 스낵바 "일정이 수정되었습니다" 메시지 확인

2. **Month 뷰에서 드래그 앤 드롭 성공**

   - Week 뷰와 동일한 시나리오를 Month 뷰에서 검증

3. **반복 일정 드래그 불가**

   - 반복 일정을 드래그 시도
   - 드래그가 시작되지 않는지 확인

4. **겹침 발생 시 경고 다이얼로그**

   - 드롭 시 겹치는 일정이 있는 경우
   - 경고 다이얼로그가 표시되는지 확인
   - "계속 진행" 클릭 시 서버 업데이트 진행
   - "취소" 클릭 시 원래 상태 유지

5. **서버 업데이트 실패 시 롤백**

   - MSW로 서버 에러 시뮬레이션
   - 롤백되어 원래 날짜로 돌아가는지 확인
   - 에러 스낵바 메시지 확인

6. **같은 날짜로 드롭**
   - 같은 날짜로 드롭 시 서버 요청 없음 확인

#### Feature 2: 날짜 클릭

**파일**: `dateClickFeature.spec.tsx`

**테스트 케이스**:

1. **Week 뷰에서 날짜 클릭**

   - 빈 날짜 셀 클릭
   - 폼의 날짜 필드에 클릭한 날짜가 입력되는지 확인
   - 시간 필드는 변경되지 않는지 확인

2. **Month 뷰에서 날짜 클릭**

   - Week 뷰와 동일한 시나리오를 Month 뷰에서 검증

3. **이벤트 카드 클릭 시 날짜 입력 안 됨**

   - 이벤트 카드/칩 클릭
   - 폼의 날짜 필드가 변경되지 않는지 확인

4. **이벤트가 있는 셀의 빈 공간 클릭**
   - 이벤트가 있는 셀에서 빈 공간 클릭
   - 날짜 필드에 입력되는지 확인

---

## 3. 우선순위별 테스트 케이스

### P0 (필수): 핵심 기능

1. **드래그 앤 드롭: Week 뷰에서 드래그 앤 드롭 성공** (통합)
2. **드래그 앤 드롭: 반복 일정 드래그 불가** (통합)
3. **드래그 앤 드롭: 드래그 가능 여부 판별 로직** (유닛)
4. **드래그 앤 드롭: 날짜 변경 로직** (유닛)
5. **날짜 클릭: Week 뷰에서 날짜 클릭** (통합)
6. **날짜 클릭: 이벤트 카드 클릭 시 날짜 입력 안 됨** (통합)

### P1 (중요): 주요 엣지 케이스

7. **드래그 앤 드롭: Month 뷰에서 드래그 앤 드롭 성공** (통합)
8. **드래그 앤 드롭: 겹침 발생 시 경고 다이얼로그** (통합)
9. **드래그 앤 드롭: 서버 업데이트 실패 시 롤백** (통합)
10. **날짜 클릭: Month 뷰에서 날짜 클릭** (통합)
11. **날짜 클릭: 이벤트가 있는 셀의 빈 공간 클릭** (통합)

### P2 (선택): 추가 검증

12. **드래그 앤 드롭: 같은 날짜로 드롭** (통합)

---

## 4. 기존 테스트 패턴 활용 방안

### 4.1 재사용 가능한 테스트 유틸리티

1. **MSW 핸들러**

   - 파일: `src/__mocks__/handlersUtils.ts`
   - 함수:
     - `setupMockHandlerCreation()` - POST 요청 모킹
     - `setupMockHandlerUpdating()` - PUT 요청 모킹
     - `setupMockHandlerDeletion()` - DELETE 요청 모킹

2. **테스트 셋업**

   - 파일: `src/__tests__/medium.integration.spec.tsx`
   - 함수:
     - `setup(element)` - ThemeProvider, SnackbarProvider 래핑
     - `saveSchedule(user, form)` - 일정 생성 헬퍼

3. **기존 유틸리티**
   - `findOverlappingEvents` - 겹침 감지 (드래그 중 검증)
   - `formatDate` - 날짜 포맷 변환

### 4.2 참고할 기존 테스트 파일

1. **통합 테스트 패턴**

   - `src/__tests__/medium.integration.spec.tsx`
   - 폼 입력, 저장, 확인 플로우 참고

2. **유닛 테스트 패턴**

   - `src/__tests__/unit/easy.eventOverlap.spec.ts`
   - 유틸리티 함수 테스트 구조 참고

3. **컴포넌트 테스트 패턴**
   - `src/__tests__/components/RecurringEventDialog.spec.tsx`
   - 다이얼로그 상호작용 테스트 참고

### 4.3 테스트 라이브러리 및 도구

- **Vitest**: 테스트 러너
- **React Testing Library**: 컴포넌트 렌더링 및 상호작용
- **@testing-library/user-event**: 사용자 이벤트 시뮬레이션
- **MSW (Mock Service Worker)**: API 모킹
- **@dnd-kit/testing** (신규): 드래그 앤 드롭 테스트 유틸리티

---

## 5. 테스트 구현 순서

### Phase 1: 유닛 테스트 (RED 상태 생성)

1. `dragAndDropUtils.spec.ts` 작성

   - `isDraggable` 함수 테스트
   - `updateEventDate` 함수 테스트

2. `dateClickUtils.spec.ts` 작성 (필요 시)
   - 날짜 포맷 변환 테스트

**예상 결과**: 모든 테스트 FAIL (유틸리티 함수 미구현)

---

### Phase 2: 통합 테스트 - Feature 1 (드래그 앤 드롭)

3. `dragAndDropFeature.spec.tsx` 작성
   - P0 테스트 케이스 먼저 작성:
     - Week 뷰에서 드래그 앤 드롭 성공
     - 반복 일정 드래그 불가
   - P1 테스트 케이스:
     - Month 뷰에서 드래그 앤 드롭 성공
     - 겹침 발생 시 경고 다이얼로그
     - 서버 업데이트 실패 시 롤백
   - P2 테스트 케이스:
     - 같은 날짜로 드롭

**예상 결과**: 모든 테스트 FAIL (드래그 앤 드롭 기능 미구현)

---

### Phase 3: 통합 테스트 - Feature 2 (날짜 클릭)

4. `dateClickFeature.spec.tsx` 작성
   - P0 테스트 케이스:
     - Week 뷰에서 날짜 클릭
     - 이벤트 카드 클릭 시 날짜 입력 안 됨
   - P1 테스트 케이스:
     - Month 뷰에서 날짜 클릭
     - 이벤트가 있는 셀의 빈 공간 클릭

**예상 결과**: 모든 테스트 FAIL (날짜 클릭 기능 미구현)

---

## 6. 테스트 데이터 전략

### 6.1 Mock 데이터

**기존 패턴 활용**: `src/__mocks__/response/realEvents.json`

**신규 테스트 이벤트**:

```json
{
  "id": "drag-test-1",
  "title": "드래그 테스트 일정",
  "date": "2025-11-05",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "드래그 앤 드롭 테스트용",
  "location": "테스트 장소",
  "category": "업무",
  "repeat": { "type": "none", "interval": 0 },
  "notificationTime": 0
}
```

```json
{
  "id": "drag-test-2",
  "title": "반복 일정 (드래그 불가)",
  "date": "2025-11-06",
  "startTime": "14:00",
  "endTime": "15:00",
  "description": "반복 일정 테스트",
  "location": "",
  "category": "개인",
  "repeat": { "type": "daily", "interval": 1, "endDate": "2025-11-10" },
  "notificationTime": 0
}
```

### 6.2 MSW 핸들러 확장

**기존 핸들러 재사용**: `src/__mocks__/handlers.ts`

**추가 핸들러 (필요 시)**:

- 서버 에러 시뮬레이션: `setupMockHandlerError()`

---

## 7. 테스트 커버리지 목표

### 7.1 전체 커버리지

- **목표**: 80% 이상
- **우선순위**: 신규 코드 (드래그 앤 드롭, 날짜 클릭 관련)

### 7.2 파일별 커버리지 목표

| 파일                                | 목표 커버리지 | 우선순위 |
| ----------------------------------- | ------------- | -------- |
| `src/utils/dragAndDropUtils.ts`     | 100%          | P0       |
| `src/hooks/useDragAndDrop.ts`       | 90%           | P0       |
| `src/App.tsx` (드래그 앤 드롭 부분) | 80%           | P0       |
| `src/App.tsx` (날짜 클릭 부분)      | 80%           | P0       |

---

## 8. 테스트 실행 전략

### 8.1 개발 중

```bash
pnpm test -- --watch dragAndDrop
pnpm test -- --watch dateClick
```

### 8.2 전체 테스트

```bash
pnpm test
```

### 8.3 커버리지 확인

```bash
pnpm test:coverage
```

---

## 9. 제약사항 및 고려사항

### 9.1 YAGNI 제약사항

- ❌ **구현하지 않을 것**:

  - 과도한 엣지 케이스 테스트 (예: 네트워크 장애 복구)
  - 성능 테스트 (드래그 중 렌더링 최적화)
  - 접근성 테스트 (키보드 탐색) - 별도 단계에서 진행

- ✅ **구현할 것**:
  - 명세서에 명시된 기능만 검증
  - 기존 테스트 패턴 최대한 활용
  - 핵심 기능 (P0, P1) 우선 구현

### 9.2 기술적 고려사항

1. **@dnd-kit 라이브러리 테스트**

   - `@dnd-kit/testing` 유틸리티 활용
   - 드래그 이벤트 시뮬레이션 방법 학습 필요

2. **이벤트 전파 제어**

   - `stopPropagation` 동작 검증
   - React Testing Library의 `fireEvent` vs `userEvent` 차이 이해

3. **비동기 처리**
   - 서버 요청 대기: `waitFor`, `findBy*` 활용
   - MSW 핸들러 비동기 응답 처리

---

## 10. 성공 기준

### 10.1 테스트 통과 기준

- [ ] Phase 1 (유닛 테스트): 모든 P0 유닛 테스트 RED 상태
- [ ] Phase 2 (드래그 앤 드롭 통합): 모든 P0, P1 통합 테스트 RED 상태
- [ ] Phase 3 (날짜 클릭 통합): 모든 P0, P1 통합 테스트 RED 상태

### 10.2 품질 기준

- [ ] 테스트 코드는 기존 패턴과 일관성 유지
- [ ] 모든 테스트는 독립적으로 실행 가능
- [ ] 테스트 네이밍은 명확하고 이해하기 쉬움
- [ ] 각 테스트는 하나의 시나리오만 검증

---

## 11. 다음 단계

1. **사용자 승인 대기**

   - 본 테스트 설계 전략 검토 요청
   - 수정 사항 반영

2. **STAGE 3으로 진행**
   - @test-code-generator 호출
   - 본 전략에 따라 테스트 코드 생성 (RED 상태)

---

**테스트 설계 전략 작성 완료**
다음 단계: STAGE 3 - 테스트 코드 생성 (사용자 승인 후 진행)
