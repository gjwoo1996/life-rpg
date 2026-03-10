# DevContainer + Ollama 설정 가이드

이 문서는 Life RPG 프로젝트의 DevContainer 환경에서 로컬 LLM(Ollama)을 사용하기 위한 설정 방법을 설명합니다.

---

## 1. 사전 요구사항

- **Cursor IDE** 또는 **VS Code**
- **Docker** (Docker Compose v2+)
- **WSL2** (Windows 개발 시)
- **NVIDIA GPU** (선택, LLM 추론 가속용)

---

## 2. GPU 설정 (NVIDIA)

Ollama가 GPU를 사용하려면 호스트에 다음이 필요합니다.

### 2.1 Windows

- WSL2용 **최신 NVIDIA 드라이버** 설치
- [NVIDIA 드라이버 다운로드](https://www.nvidia.com/Download/index.aspx)

### 2.2 WSL2 (Ubuntu)

```bash
# nvidia-container-toolkit 설치
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
```

Docker 재시작 후 확인:

```bash
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

### 2.3 GPU 미지원 환경

GPU가 없거나 nvidia-container-toolkit이 없는 경우, `.devcontainer/docker-compose.yml`에서 Ollama 서비스의 다음 부분을 제거하세요:

```yaml
# 제거할 항목
runtime: nvidia
environment:
  - NVIDIA_VISIBLE_DEVICES=all
```

Ollama는 CPU로도 동작합니다 (추론 속도는 느려짐).

---

## 3. DevContainer 시작

1. 프로젝트를 Cursor/VS Code에서 열기
2. **Dev Containers: Reopen in Container** 실행 (명령 팔레트: `Ctrl+Shift+P` → "Reopen in Container")
3. 컨테이너 빌드 및 시작 대기

---

## 4. Ollama 모델 설치

### 자동 설치 (권장)

DevContainer 시작 시 `qwen2.5:7b` 모델이 **자동으로 확인**됩니다.

- 이미 설치되어 있으면 → 스킵
- 없으면 → 자동 다운로드 (첫 시작 시 2~5분 소요)
- 모델은 `ollama-data` 볼륨에 저장되므로 한 번만 다운로드됩니다

### 수동 설치 (필요 시)

자동 설치가 실패했거나 다른 모델이 필요할 때, **호스트 터미널**에서:

```bash
./.devcontainer/scripts/setup-ollama.sh
```

### 대안 모델

```bash
# 경량 모델 (3B)
docker compose -f .devcontainer/docker-compose.yml exec ollama ollama pull qwen2.5:3b

# 영어 위주
docker compose -f .devcontainer/docker-compose.yml exec ollama ollama pull phi3
```

---

## 5. 검증 체크리스트

| 단계 | 명령어 | 확인 사항 |
|------|--------|-----------|
| 1 | `docker compose ps` | workspace, ollama 서비스 실행 중 |
| 2 | `curl http://localhost:11434/api/tags` | Ollama API 응답 (호스트에서) |
| 3 | `curl http://ollama:11434/api/tags` | Ollama API 응답 (컨테이너 내에서) |
| 4 | `docker compose exec ollama ollama list` | qwen2.5:7b 등록 확인 |

---

## 6. 트러블슈팅

### Ollama 컨테이너가 시작되지 않음

- **GPU 관련**: `runtime: nvidia` 제거 후 CPU 모드로 시도
- **포트 충돌**: 11434 포트가 다른 프로세스에서 사용 중인지 확인

### 모델 다운로드 실패

- 네트워크 연결 확인
- `docker compose -f .devcontainer/docker-compose.yml logs ollama` 로 로그 확인

### setup-ollama.sh 실행 시 "connection refused"

- DevContainer가 완전히 시작될 때까지 1~2분 대기 후 재시도
- `docker compose ps`로 ollama 서비스 상태 확인

---

## 7. 환경 변수

DevContainer 내부에서 Rust 백엔드는 다음 환경 변수를 사용합니다:

- `OLLAMA_HOST=http://ollama:11434` — Ollama API 엔드포인트 (자동 설정됨)
