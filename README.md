# 과제 3

### 필수 스펙

- 드래그 앤 드롭(D&D) 기능 개발
  - [x] 캘린더의 일정을 마우스로 끌어 다른 날짜나 시간으로 옮기는 기능을 구현합니다.
- 날짜 클릭으로 일정 생성 기능 개발
  - [x] 캘린더의 비어있는 날짜 셀을 클릭하면, 해당 날짜가 자동으로 폼에 채워지도록 하세요.

## 기본 과제

### 기본과제 제출

- 아래 작성된 E2E 테스트 작성은 필수입니다. 추가로 작성하고 싶다면 작성해주세요.
- 여기서 말하는 전반은 Create, Read, Update, Delete 모두에 해당합니다.

1. [x] 기본 일정 관리 워크플로우 전반을 검증하세요.
2. [x] 반복 일정 관리 워크플로우 전반을 검증하세요.
3. [x] 일정 겹침 처리 방식에 대해 검증하세요.
4. [x] 알림 시스템 관련 노출 조건에 대해 검증하세요.
5. [x] 검색 및 필터링 전반에 대해 검증하세요.

### 심화과제

- 아래 시각적 회귀 테스트는 필수 입니다. 추가로 작성하고 싶다면 작성해주세요.

1. [x] 타입에 따른 캘린더 뷰 렌더링 (Storybook 스토리 작성 완료)
2. [x] 일정 상태별 시각적 표현 (Storybook 스토리 작성 완료)
3. [x] 다이얼로그 및 모달 (Storybook 스토리 작성 완료)
4. [x] 폼 컨트롤 상태 (Storybook 스토리 작성 완료)
5. [x] 각 셀 텍스트 길이에 따른 처리 (Storybook 스토리 작성 완료)

## Storybook & Chromatic 설정

### Storybook 실행

```bash
pnpm storybook
```

### Storybook 빌드

```bash
pnpm build-storybook
```

### Chromatic 배포

```bash
pnpm chromatic
```

### 시각적 회귀 테스트 구성

1. **Storybook 컴포넌트 스토리**

   - `CalendarView`: 주간/월간 뷰, 공휴일, 바쁜 날, 긴 제목 처리
   - `DraggableEvent`: 카테고리별, 알림 상태별, 반복 일정별 표시
   - `RecurringEventDialog`: 반복 일정 수정/삭제 다이얼로그
   - `EventForm`: 폼 상태(빈 폼, 채워진 폼, 에러 상태, 반복 설정)

2. **Chromatic CI/CD**
   - GitHub Actions를 통한 자동 시각적 회귀 테스트
   - PR 생성 시 자동 실행
   - 시각적 변경 감지 및 리포트

### 프로젝트 설정 요구사항

Chromatic을 활용하려면 다음 설정이 필요합니다:

1. Chromatic 계정에서 프로젝트 토큰 발급
2. GitHub Secrets에 `CHROMATIC_PROJECT_TOKEN` 추가
3. `chromatic.config.json`의 `projectId` 업데이트
