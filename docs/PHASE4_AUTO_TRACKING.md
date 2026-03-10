# Phase 4: 자동 생산성 추적 (예정)

## 목표
- VSCode, 브라우저, 게임, 학습 플랫폼 사용 시간 자동 기록
- 일일 요약 → AI 평가 → XP 변환

## 기술 방향
- Windows: 활동 로그/이벤트 수집
- 브라우저: 확장 프로그램 또는 로컬 히스토리
- VSCode: 로그/API (가능 시)

## 데이터
- `auto_activity_logs`: `date`, `app_name`, `duration_minutes`, `metadata`
- AI 평가 파이프라인 재사용 (Phase 2)
