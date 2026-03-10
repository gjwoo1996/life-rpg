# Phase 3: Windows 활동 추적 (예정)

## 목표
- 목표 예: "리그오브레전드 하루 1시간 이하"
- 프로세스 실행 감지 → 사용 시간 추적 → 제한 초과 시 종료

## 기술 요구사항
- Windows: 프로세스 열거/모니터링 API
- Rust: `windows` crate 또는 `sysinfo`
- Tauri: 백그라운드 플러그인 또는 sidecar

## 데이터 구조
- `process_limits` 테이블: `goal_id`, `process_name`, `max_minutes_per_day`
- `process_usage` 테이블: `date`, `process_name`, `minutes_used`

## 주의사항
- Tauri 빌드 타겟: Windows (PROJECT_SPEC §10)
- Linux DevContainer에서는 Windows 전용 코드 분리 필요 (cfg 조건부 컴파일)
