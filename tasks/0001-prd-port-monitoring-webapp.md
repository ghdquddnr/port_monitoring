# PRD: Port Monitoring Web Application

## 1. Introduction/Overview

### Problem Statement
회사 개발 서버(Ubuntu)에서 리스닝 중인 포트들을 빠르게 확인하고 문제가 발생한 서비스를 즉시 조치하기 어려운 상황입니다. 현재는 SSH로 접속해서 `netstat`, `lsof`, `ss` 등의 명령어를 수동으로 실행해야 하며, 서비스 관리를 위해서는 추가적인 명령어 지식이 필요합니다.

### Solution
웹 기반 포트 모니터링 및 관리 도구를 개발하여, 브라우저에서 직관적인 UI로 포트 상태를 실시간으로 확인하고, 필요한 경우 프로세스를 종료하거나 재시작할 수 있는 기능을 제공합니다. Docker 컨테이너로 배포하여 간편한 설치와 실행을 지원합니다.

### Target Users
- 회사 개발 서버를 관리하는 시스템 관리자 (소수 인원)
- admin 계정 하나로 모든 사용자가 공유

## 2. Goals

### Primary Goals
1. **빠른 포트 조회**: 리스닝 중인 모든 포트를 5초 이내에 웹 UI에서 확인 가능
2. **즉각적인 문제 해결**: 문제 있는 서비스를 웹 UI에서 1분 이내에 중지 가능
3. **직관적인 UI**: 터미널 명령어 지식 없이도 누구나 사용 가능한 인터페이스
4. **간편한 배포**: Docker 컨테이너로 실행하여 설치/관리 용이

### Secondary Goals
- 포트 사용 현황을 시각적으로 파악하여 포트 충돌 사전 방지
- 자동 새로고침으로 실시간에 가까운 모니터링 제공
- 다크/라이트 모드 지원으로 다양한 작업 환경에 적응

## 3. User Stories

### US-1: 포트 현황 조회
**As a** 시스템 관리자
**I want to** 웹 브라우저에서 서버의 모든 리스닝 포트를 한눈에 확인
**So that** SSH 접속 없이 빠르게 포트 사용 현황을 파악할 수 있다

**Acceptance Criteria:**
- 포트 번호, 프로세스 이름, PID, 프로토콜, 연결 상태가 테이블 형태로 표시됨
- 페이지 로드 후 5초 이내에 모든 데이터가 표시됨
- 데이터가 없을 경우 "리스닝 중인 포트가 없습니다" 메시지 표시

### US-2: 포트 검색 및 필터링
**As a** 시스템 관리자
**I want to** 특정 포트 번호나 프로세스 이름으로 검색
**So that** 많은 포트 중에서 원하는 정보를 빠르게 찾을 수 있다

**Acceptance Criteria:**
- 검색창에 포트 번호 입력 시 해당 포트만 필터링됨
- 프로세스 이름으로 검색 가능 (부분 일치 지원)
- 검색 결과가 즉시 반영됨 (타이핑 중 실시간 필터링)

### US-3: 프로세스 종료
**As a** 시스템 관리자
**I want to** 문제가 있는 프로세스를 웹 UI에서 종료
**So that** SSH 접속 없이 빠르게 문제를 해결할 수 있다

**Acceptance Criteria:**
- 각 포트 항목에 "종료" 버튼이 표시됨
- 버튼 클릭 시 확인 다이얼로그가 표시됨
- 종료 성공 시 성공 메시지와 함께 해당 항목이 목록에서 사라짐
- 종료 실패 시 에러 메시지가 표시됨

### US-4: 서비스 재시작
**As a** 시스템 관리자
**I want to** 특정 서비스를 재시작
**So that** 서비스를 완전히 중지하지 않고 문제를 해결할 수 있다

**Acceptance Criteria:**
- systemd로 관리되는 서비스의 경우 "재시작" 버튼이 활성화됨
- 재시작 버튼 클릭 시 확인 다이얼로그 표시
- 재시작 진행 중 로딩 표시
- 재시작 완료 후 성공/실패 메시지 표시

### US-5: 포트 차단/해제
**As a** 시스템 관리자
**I want to** 특정 포트를 일시적으로 차단하거나 해제
**So that** 외부 접근을 제어하여 보안을 강화할 수 있다

**Acceptance Criteria:**
- 각 포트 항목에 "차단" 또는 "해제" 버튼이 상태에 따라 표시됨
- 차단 시 iptables 규칙이 추가되고 상태가 "차단됨"으로 변경됨
- 해제 시 iptables 규칙이 제거되고 상태가 "활성"으로 변경됨
- 작업 성공/실패 메시지 표시

### US-6: 자동 새로고침
**As a** 시스템 관리자
**I want to** 포트 현황이 자동으로 갱신되도록 설정
**So that** 수동으로 새로고침하지 않아도 최신 상태를 유지할 수 있다

**Acceptance Criteria:**
- 자동 새로고침 ON/OFF 토글 버튼 제공
- 새로고침 간격을 5초, 10초, 30초, 60초 중 선택 가능
- 설정이 브라우저에 저장되어 다음 방문 시에도 유지됨
- 수동 새로고침 버튼도 별도로 제공

### US-7: 로그인 및 세션 관리
**As a** 시스템 관리자
**I want to** admin 계정으로 로그인하여 인증된 사용자만 접근
**So that** 보안을 유지하면서 권한 있는 사용자만 서버 관리 기능을 사용할 수 있다

**Acceptance Criteria:**
- 로그인하지 않은 상태에서는 로그인 페이지만 표시됨
- username: admin, password는 환경 변수로 설정
- 로그인 성공 시 세션이 생성되고 메인 대시보드로 이동
- 세션은 1시간 동안 유지됨
- 로그아웃 버튼 제공

### US-8: 테마 전환
**As a** 시스템 관리자
**I want to** 라이트 모드와 다크 모드를 전환
**So that** 작업 환경과 시간대에 따라 편한 화면으로 사용할 수 있다

**Acceptance Criteria:**
- 헤더에 테마 전환 버튼 제공
- 버튼 클릭 시 즉시 라이트/다크 모드 전환
- 선택한 테마가 브라우저에 저장되어 다음 방문 시에도 유지됨
- TailwindCSS의 다크 모드 기능 활용

## 4. Functional Requirements

### FR-1: 포트 모니터링 코어 기능
1. **FR-1.1**: 시스템은 Ubuntu 서버에서 `ss -tulpn` 또는 `netstat -tulpn` 명령어를 실행하여 리스닝 중인 포트 정보를 수집해야 한다
2. **FR-1.2**: 각 포트에 대해 다음 정보를 제공해야 한다:
   - 포트 번호 (Port Number)
   - 프로토콜 (TCP/UDP)
   - 프로세스 이름 (Process Name)
   - 프로세스 ID (PID)
   - 로컬 주소 (Local Address)
   - 외부 주소 (Foreign Address, 연결된 경우)
   - 연결 상태 (State: LISTEN, ESTABLISHED, etc.)
3. **FR-1.3**: 수집된 데이터는 JSON 형태로 프론트엔드에 전달되어야 한다

### FR-2: 검색 및 필터링
4. **FR-2.1**: 포트 번호로 검색 가능해야 한다 (정확히 일치하는 포트만 표시)
5. **FR-2.2**: 프로세스 이름으로 검색 가능해야 한다 (부분 일치 지원, 대소문자 무시)
6. **FR-2.3**: 프로토콜(TCP/UDP)로 필터링 가능해야 한다
7. **FR-2.4**: 검색/필터는 클라이언트 사이드에서 즉시 적용되어야 한다 (서버 요청 불필요)

### FR-3: 프로세스 관리
8. **FR-3.1**: 각 포트 항목에 "종료" 버튼을 제공해야 한다
9. **FR-3.2**: 종료 버튼 클릭 시 "정말 프로세스 [프로세스명] (PID: [PID])를 종료하시겠습니까?" 확인 다이얼로그를 표시해야 한다
10. **FR-3.3**: 확인 시 `kill -9 [PID]` 명령어를 실행하여 프로세스를 강제 종료해야 한다
11. **FR-3.4**: systemd 서비스로 관리되는 프로세스의 경우 "재시작" 버튼을 추가로 제공해야 한다
12. **FR-3.5**: 재시작 버튼 클릭 시 `systemctl restart [서비스명]` 명령어를 실행해야 한다
13. **FR-3.6**: 프로세스 종료/재시작 후 성공 또는 실패 메시지를 사용자에게 표시해야 한다
14. **FR-3.7**: 프로세스 관리 작업은 sudo 권한이 필요하므로, Docker 컨테이너는 privileged 모드로 실행되거나 필요한 권한을 가져야 한다

### FR-4: 포트 차단/해제
15. **FR-4.1**: 각 포트 항목에 현재 차단 상태를 표시해야 한다 ("활성" 또는 "차단됨")
16. **FR-4.2**: 활성 상태 포트에는 "차단" 버튼을, 차단된 포트에는 "해제" 버튼을 제공해야 한다
17. **FR-4.3**: 포트 차단 시 `iptables -A INPUT -p [프로토콜] --dport [포트] -j DROP` 명령어를 실행해야 한다
18. **FR-4.4**: 포트 해제 시 `iptables -D INPUT -p [프로토콜] --dport [포트] -j DROP` 명령어를 실행해야 한다
19. **FR-4.5**: iptables 규칙 변경 후 현재 적용된 규칙을 확인하여 차단 상태를 업데이트해야 한다

### FR-5: 새로고침
20. **FR-5.1**: 수동 새로고침 버튼을 제공해야 한다
21. **FR-5.2**: 자동 새로고침 ON/OFF 토글 스위치를 제공해야 한다
22. **FR-5.3**: 자동 새로고침 간격을 선택할 수 있는 드롭다운을 제공해야 한다 (5초, 10초, 30초, 60초)
23. **FR-5.4**: 자동 새로고침 설정은 localStorage에 저장되어 브라우저를 닫았다 열어도 유지되어야 한다
24. **FR-5.5**: 자동 새로고침이 활성화된 경우, 설정된 간격마다 포트 정보를 자동으로 갱신해야 한다
25. **FR-5.6**: 데이터 로딩 중에는 로딩 인디케이터를 표시해야 한다

### FR-6: 인증 및 세션
26. **FR-6.1**: 로그인 페이지는 username과 password 입력 필드를 제공해야 한다
27. **FR-6.2**: username은 "admin"으로 고정되어야 한다
28. **FR-6.3**: password는 환경 변수 `ADMIN_PASSWORD`에서 읽어와 검증해야 한다
29. **FR-6.4**: 로그인 성공 시 세션 쿠키를 생성하고 메인 대시보드로 리다이렉트해야 한다
30. **FR-6.5**: 세션은 1시간 동안 유효해야 하며, 활동이 있을 경우 자동으로 갱신되어야 한다
31. **FR-6.6**: 인증되지 않은 사용자가 대시보드에 접근하려 하면 로그인 페이지로 리다이렉트해야 한다
32. **FR-6.7**: 로그아웃 버튼을 제공하며, 클릭 시 세션을 삭제하고 로그인 페이지로 이동해야 한다

### FR-7: UI/UX
33. **FR-7.1**: Next.js App Router를 사용하여 페이지를 구성해야 한다
34. **FR-7.2**: TailwindCSS를 사용하여 스타일링해야 한다
35. **FR-7.3**: 라이트 모드와 다크 모드를 지원해야 한다 (TailwindCSS의 `dark:` 접두사 활용)
36. **FR-7.4**: 테마 전환 버튼을 헤더에 제공해야 한다 (해/달 아이콘)
37. **FR-7.5**: 선택된 테마는 localStorage에 저장되어 다음 방문 시에도 유지되어야 한다
38. **FR-7.6**: 포트 목록은 반응형 테이블로 표시되어야 한다
39. **FR-7.7**: 모바일 환경에서도 기본적인 조회 기능은 사용 가능해야 한다 (관리 기능은 데스크톱 우선)

### FR-8: 백엔드 API
40. **FR-8.1**: `GET /api/ports` - 모든 리스닝 포트 정보를 JSON 배열로 반환
41. **FR-8.2**: `POST /api/ports/kill` - body: `{pid: number}` - 지정된 프로세스를 종료
42. **FR-8.3**: `POST /api/ports/restart` - body: `{service: string}` - 지정된 서비스를 재시작
43. **FR-8.4**: `POST /api/ports/block` - body: `{port: number, protocol: string}` - 포트 차단
44. **FR-8.5**: `POST /api/ports/unblock` - body: `{port: number, protocol: string}` - 포트 차단 해제
45. **FR-8.6**: `POST /api/auth/login` - body: `{username: string, password: string}` - 로그인
46. **FR-8.7**: `POST /api/auth/logout` - 로그아웃
47. **FR-8.8**: 모든 API 엔드포인트는 `/api/auth/*`를 제외하고 인증이 필요해야 한다
48. **FR-8.9**: API 에러는 적절한 HTTP 상태 코드와 에러 메시지를 JSON으로 반환해야 한다

## 5. Non-Functional Requirements

### NFR-1: 성능
- **NFR-1.1**: 포트 목록 조회는 5초 이내에 완료되어야 한다
- **NFR-1.2**: 프로세스 종료/재시작은 10초 이내에 완료되어야 한다
- **NFR-1.3**: 포트 차단/해제는 5초 이내에 완료되어야 한다

### NFR-2: 보안
- **NFR-2.1**: 비밀번호는 환경 변수로 관리되어 코드에 하드코딩되지 않아야 한다
- **NFR-2.2**: 세션은 HttpOnly 쿠키로 관리되어야 한다
- **NFR-2.3**: HTTPS를 권장하지만, 내부 네트워크 사용으로 HTTP도 허용한다
- **NFR-2.4**: 로그인 실패 시 3초 딜레이를 추가하여 brute force 공격을 방지해야 한다

### NFR-3: 호환성
- **NFR-3.1**: 최신 버전의 Chrome, Firefox, Safari, Edge 브라우저를 지원해야 한다
- **NFR-3.2**: Ubuntu 20.04 이상에서 동작해야 한다
- **NFR-3.3**: Docker 20.10 이상에서 컨테이너 실행이 가능해야 한다

### NFR-4: 가용성
- **NFR-4.1**: 애플리케이션은 Docker 컨테이너 재시작 시 자동으로 복구되어야 한다
- **NFR-4.2**: 컨테이너 장애 시 Docker의 restart policy로 자동 재시작되어야 한다

## 6. Non-Goals (Out of Scope)

이 기능에 포함되지 **않는** 것들:

1. **다중 사용자 관리**: admin 계정 하나만 사용하므로, 사용자 등록/관리 기능은 제공하지 않음
2. **권한 시스템**: 역할 기반 접근 제어(RBAC)나 세분화된 권한 관리 없음
3. **감사 로그**: 누가 언제 어떤 작업을 했는지 기록하는 감사 로그 기능 없음
4. **알림 기능**: 포트 상태 변경 시 이메일/Slack 알림 기능 없음
5. **히스토리 추적**: 포트 사용 이력이나 프로세스 변경 이력 추적 없음
6. **다중 서버 관리**: 하나의 Ubuntu 서버만 관리하며, 여러 서버를 동시에 관리하는 기능 없음
7. **모바일 앱**: 웹 앱만 제공하며, 네이티브 모바일 앱은 제공하지 않음
8. **상세 통계/그래프**: 포트 사용 추이나 리소스 사용량 그래프 등의 통계 기능 없음
9. **백업/복원**: 설정이나 상태를 백업하고 복원하는 기능 없음
10. **API 문서**: Swagger/OpenAPI 같은 공식 API 문서 생성 없음 (개발자용 간단한 주석으로 충분)

## 7. Design Considerations

### UI/UX Design

#### 로그인 페이지
- 중앙 정렬된 로그인 폼
- 회사 로고 또는 애플리케이션 이름 표시
- Username (admin 고정, disabled 상태)
- Password 입력 필드
- "로그인" 버튼
- 에러 메시지 표시 영역

#### 메인 대시보드
**헤더:**
- 애플리케이션 제목 (좌측)
- 자동 새로고침 컨트롤 (중앙)
  - ON/OFF 토글
  - 간격 선택 드롭다운
- 테마 전환 버튼 (우측)
- 로그아웃 버튼 (우측)

**컨트롤 바:**
- 검색 입력 필드 (좌측)
- 프로토콜 필터 (TCP/UDP/All)
- 수동 새로고침 버튼 (우측)
- 마지막 업데이트 시간 표시

**포트 테이블:**
컬럼 구성:
1. 포트 번호 (Port)
2. 프로토콜 (Protocol)
3. 프로세스 (Process)
4. PID
5. 로컬 주소 (Local Address)
6. 외부 주소 (Foreign Address)
7. 상태 (State)
8. 차단 상태 (Status: 활성/차단됨)
9. 액션 (Actions: 종료/재시작/차단/해제 버튼)

**색상 체계:**
- 라이트 모드: 화이트 배경, 그레이 텍스트, 블루 액센트
- 다크 모드: 다크 그레이 배경, 라이트 그레이 텍스트, 블루 액센트

**버튼 디자인:**
- 종료: 레드 계열 (danger)
- 재시작: 옐로우/오렌지 계열 (warning)
- 차단: 그레이 계열 (secondary)
- 해제: 그린 계열 (success)

### Component Structure
```
app/
├── layout.tsx (root layout, theme provider)
├── page.tsx (redirect to /login or /dashboard)
├── login/
│   └── page.tsx (login page)
├── dashboard/
│   └── page.tsx (main dashboard)
├── api/
│   ├── ports/
│   │   ├── route.ts (GET /api/ports)
│   │   ├── kill/route.ts (POST)
│   │   ├── restart/route.ts (POST)
│   │   ├── block/route.ts (POST)
│   │   └── unblock/route.ts (POST)
│   └── auth/
│       ├── login/route.ts (POST)
│       └── logout/route.ts (POST)
├── components/
│   ├── PortTable.tsx
│   ├── SearchBar.tsx
│   ├── RefreshControl.tsx
│   ├── ThemeToggle.tsx
│   └── Header.tsx
└── lib/
    ├── auth.ts (session management)
    ├── ports.ts (port data fetching)
    └── theme.ts (theme management)
```

## 8. Technical Considerations

### Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 18+, TailwindCSS 3+
- **Backend**: Next.js API Routes (Node.js runtime)
- **Authentication**: Simple session-based auth with cookies
- **State Management**: React Context API or Zustand (lightweight)
- **HTTP Client**: Native fetch API

### Docker Configuration

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml (참고용)
```yaml
version: '3.8'
services:
  port-monitor:
    build: .
    container_name: port-monitor
    network_mode: host
    privileged: true
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
      - PORT=8080
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

#### 실행 방법
```bash
# Build
docker build -t port-monitor .

# Run with host network and privileged mode
docker run -d \
  --name port-monitor \
  --network host \
  --privileged \
  -e ADMIN_PASSWORD=your_secure_password \
  --restart unless-stopped \
  port-monitor
```

**중요 사항:**
- `--network host`: 호스트의 네트워크 스택에 직접 접근하여 포트 정보를 조회
- `--privileged`: 프로세스 종료, iptables 조작 등 권한이 필요한 작업 수행
- 보안 고려사항: 프로덕션 환경에서는 필요한 최소 권한만 부여하는 것을 권장 (추후 개선 가능)

### Command Execution
백엔드에서 시스템 명령어를 실행하기 위해 Node.js의 `child_process` 모듈을 사용:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 예시: 포트 정보 조회
const { stdout } = await execAsync('ss -tulpn');

// 예시: 프로세스 종료
await execAsync(`kill -9 ${pid}`);
```

**에러 처리:**
- 명령어 실행 실패 시 stderr를 캡처하여 사용자에게 의미 있는 에러 메시지 표시
- 권한 부족, 존재하지 않는 PID 등의 케이스 처리

### Security Considerations
1. **Input Validation**: 모든 사용자 입력(PID, 포트 번호, 서비스 이름)을 검증하여 command injection 방지
2. **Session Security**: HttpOnly, SameSite 속성을 가진 쿠키로 세션 관리
3. **Rate Limiting**: 로그인 API에 rate limiting 적용 (선택적, 내부 네트워크에서는 우선순위 낮음)
4. **Environment Variables**: 민감한 정보는 환경 변수로 관리

### Dependencies (참고)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

## 9. Success Metrics

### Primary Metrics
1. **작업 완료 시간**:
   - 포트 조회: 5초 이내 달성률 > 95%
   - 문제 서비스 중지: 1분 이내 달성률 > 90%

2. **사용성**:
   - 초기 사용자가 교육 없이 기본 조회 기능 사용 가능
   - 프로세스 종료 기능을 2단계 이내 클릭으로 수행 가능

3. **안정성**:
   - 애플리케이션 가동 시간(Uptime) > 99%
   - API 에러율 < 5%

### Secondary Metrics
- 사용자 만족도: 관리자들이 SSH 접속 대신 웹 UI를 선호하는지 확인
- 반응 시간: 자동 새로고침 간격 내 데이터 갱신 성공률 > 95%

## 10. Open Questions

### Technical Questions
1. **Q: systemd 서비스 감지 방법**
   - A: `systemctl status [PID]` 명령어로 프로세스가 systemd로 관리되는지 확인 가능. 구현 중 결정.

2. **Q: iptables 규칙 영구 저장 여부**
   - A: 현재는 런타임에만 적용. 서버 재부팅 시 규칙이 사라짐. 필요 시 추후 `iptables-persistent` 활용 고려.

3. **Q: Docker 컨테이너의 권한 최소화 방법**
   - A: 초기에는 `--privileged` 사용. 추후 개선으로 specific capabilities만 부여하는 방식 고려 (CAP_SYS_ADMIN, CAP_NET_ADMIN 등).

### Product Questions
4. **Q: 여러 관리자가 동시에 사용할 때 충돌 처리**
   - A: 현재는 동시 작업에 대한 잠금 메커니즘 없음. 실제 사용 중 문제 발생 시 낙관적 잠금 또는 작업 큐 도입 검토.

5. **Q: 포트 차단 시 경고 메시지 필요 여부**
   - A: 중요 포트(22-SSH, 80-HTTP, 443-HTTPS 등)를 차단할 때 추가 경고 표시 여부는 사용자 피드백 후 결정.

6. **Q: 모바일 환경 지원 범위**
   - A: 기본 조회는 가능하도록 반응형 디자인 적용. 관리 기능(종료/재시작/차단)은 데스크톱 우선. 실사용 후 모바일 지원 범위 재검토.

---

## Document Version
- **Version**: 1.0
- **Date**: 2025-09-30
- **Author**: AI Assistant (based on user requirements)
- **Status**: Ready for Development