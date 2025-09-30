# Task List: Port Monitoring Web Application

Based on PRD: `0001-prd-port-monitoring-webapp.md`

## Relevant Files

### Project Configuration
- `package.json` - Next.js 프로젝트 dependencies 및 scripts 정의 ✅
- `tsconfig.json` - TypeScript 컴파일러 설정 (strict mode) ✅
- `tailwind.config.ts` - TailwindCSS 설정 (다크 모드 포함) ✅
- `postcss.config.js` - PostCSS 설정 ✅
- `next.config.js` - Next.js 설정 ✅
- `.env.example` - 환경 변수 예시 파일 ✅
- `.gitignore` - Git ignore 패턴 ✅
- `.prettierrc` - Prettier 코드 포맷팅 설정 ✅
- `.prettierignore` - Prettier ignore 패턴 ✅
- `.eslintrc.json` - ESLint 설정 ✅
- `jest.config.js` - Jest 테스트 설정 ✅
- `jest.setup.js` - Jest 초기 설정 파일 ✅
- `Dockerfile` - Docker 이미지 빌드 설정
- `docker-compose.yml` - Docker Compose 실행 설정

### Authentication & Session
- `app/lib/auth.ts` - 세션 관리 및 인증 유틸리티 함수
- `app/lib/auth.test.ts` - 인증 로직 단위 테스트
- `app/api/auth/login/route.ts` - 로그인 API 엔드포인트
- `app/api/auth/logout/route.ts` - 로그아웃 API 엔드포인트
- `app/middleware.ts` - 인증 미들웨어 (protected routes)

### Port Monitoring Core
- `app/lib/ports.ts` - 포트 정보 수집 및 파싱 로직
- `app/lib/ports.test.ts` - 포트 모니터링 로직 단위 테스트
- `app/lib/systemCommands.ts` - 시스템 명령어 실행 유틸리티 (exec wrapper)
- `app/lib/systemCommands.test.ts` - 시스템 명령어 실행 단위 테스트
- `app/api/ports/route.ts` - 포트 목록 조회 API (GET /api/ports)
- `app/api/ports/kill/route.ts` - 프로세스 종료 API
- `app/api/ports/restart/route.ts` - 서비스 재시작 API
- `app/api/ports/block/route.ts` - 포트 차단 API
- `app/api/ports/unblock/route.ts` - 포트 차단 해제 API

### UI Components
- `app/components/Header.tsx` - 헤더 컴포넌트 (앱 제목, 테마 전환, 로그아웃)
- `app/components/ThemeToggle.tsx` - 다크/라이트 모드 전환 버튼
- `app/components/RefreshControl.tsx` - 자동/수동 새로고침 컨트롤
- `app/components/SearchBar.tsx` - 검색 및 필터링 바
- `app/components/PortTable.tsx` - 포트 정보 테이블
- `app/components/ConfirmDialog.tsx` - 확인 다이얼로그 (종료/재시작/차단 확인)
- `app/components/LoadingSpinner.tsx` - 로딩 인디케이터
- `app/components/Toast.tsx` - 성공/에러 메시지 토스트 알림

### Pages
- `app/layout.tsx` - Root layout (테마 provider, 글로벌 스타일)
- `app/page.tsx` - Root page (로그인/대시보드로 리다이렉트)
- `app/login/page.tsx` - 로그인 페이지
- `app/dashboard/page.tsx` - 메인 대시보드 페이지

### Utilities & Context
- `app/lib/theme.ts` - 테마 관리 유틸리티
- `app/lib/theme.test.ts` - 테마 관리 단위 테스트
- `app/context/ThemeContext.tsx` - 테마 컨텍스트 provider
- `app/hooks/useAutoRefresh.ts` - 자동 새로고침 커스텀 훅
- `app/hooks/usePortData.ts` - 포트 데이터 fetching 커스텀 훅
- `app/types/port.ts` - 포트 데이터 타입 정의
- `app/types/api.ts` - API 요청/응답 타입 정의

### Global Styles
- `app/globals.css` - TailwindCSS imports 및 글로벌 스타일

### Notes
- 단위 테스트는 테스트 대상 파일과 같은 디렉토리에 `.test.ts` 확장자로 배치
- Jest를 사용하여 테스트 실행: `npx jest` 또는 `npm test`
- 통합 테스트는 별도로 작성하지 않고, API 엔드포인트는 수동 테스트 또는 Postman 사용

## Tasks

### 1.0 프로젝트 초기 설정 및 개발 환경 구성
- [x] 1.0 프로젝트 초기 설정 및 개발 환경 구성
  - [x] 1.1 Next.js 프로젝트 초기화 (`npx create-next-app@latest` with App Router, TypeScript, TailwindCSS)
  - [x] 1.2 프로젝트 디렉토리 구조 생성 (`app/lib`, `app/components`, `app/context`, `app/hooks`, `app/types`)
  - [x] 1.3 TailwindCSS 다크 모드 설정 (`tailwind.config.ts`에서 `darkMode: 'class'` 추가)
  - [x] 1.4 TypeScript strict 모드 설정 (`tsconfig.json` 업데이트)
  - [x] 1.5 ESLint 및 Prettier 설정 (코드 스타일 일관성)
  - [x] 1.6 환경 변수 설정 (`.env.example` 파일 생성, `ADMIN_PASSWORD` 등)
  - [x] 1.7 `.gitignore` 업데이트 (`.env`, `node_modules`, `.next` 등)
  - [x] 1.8 `package.json` scripts 추가 (`dev`, `build`, `start`, `lint`, `test`)
  - [x] 1.9 Jest 및 Testing Library 설정 (단위 테스트 환경)

### 2.0 인증 및 세션 관리 구현
- [x] 2.0 인증 및 세션 관리 구현
  - [x] 2.1 타입 정의 생성 (`app/types/api.ts`에 LoginRequest, LoginResponse, Session 타입)
  - [x] 2.2 세션 관리 유틸리티 구현 (`app/lib/auth.ts`: createSession, validateSession, deleteSession)
  - [x] 2.3 인증 유틸리티 단위 테스트 작성 (`app/lib/auth.test.ts`)
  - [x] 2.4 로그인 API 엔드포인트 구현 (`app/api/auth/login/route.ts`: POST, username/password 검증, 세션 생성)
  - [x] 2.5 로그아웃 API 엔드포인트 구현 (`app/api/auth/logout/route.ts`: POST, 세션 삭제)
  - [x] 2.6 인증 미들웨어 구현 (`app/middleware.ts`: protected routes 보호, 세션 검증)
  - [x] 2.7 로그인 페이지 UI 구현 (`app/login/page.tsx`: 로그인 폼, 에러 메시지)
  - [x] 2.8 로그인 API 통합 테스트 (Postman 또는 curl로 수동 테스트)

### 3.0 포트 모니터링 코어 기능 및 API 구현
- [ ] 3.0 포트 모니터링 코어 기능 및 API 구현
  - [x] 3.1 타입 정의 생성 (`app/types/port.ts`: PortInfo, ProcessInfo, ConnectionState 타입)
  - [x] 3.2 시스템 명령어 실행 유틸리티 구현 (`app/lib/systemCommands.ts`: execAsync wrapper, 에러 처리)
  - [x] 3.3 시스템 명령어 유틸리티 단위 테스트 (`app/lib/systemCommands.test.ts`)
  - [x] 3.4 포트 정보 수집 로직 구현 (`app/lib/ports.ts`: getListeningPorts, parsePortOutput)
  - [x] 3.5 iptables 상태 확인 로직 구현 (`app/lib/ports.ts`: getBlockedPorts)
  - [x] 3.6 systemd 서비스 감지 로직 구현 (`app/lib/ports.ts`: isSystemdService)
  - [x] 3.7 포트 모니터링 로직 단위 테스트 (`app/lib/ports.test.ts`)
  - [ ] 3.8 포트 목록 조회 API 구현 (`app/api/ports/route.ts`: GET, 포트 정보 + 차단 상태 반환)
  - [ ] 3.9 프로세스 종료 API 구현 (`app/api/ports/kill/route.ts`: POST, PID 검증, kill -9 실행)
  - [ ] 3.10 서비스 재시작 API 구현 (`app/api/ports/restart/route.ts`: POST, systemctl restart 실행)
  - [ ] 3.11 포트 차단 API 구현 (`app/api/ports/block/route.ts`: POST, iptables 규칙 추가)
  - [ ] 3.12 포트 차단 해제 API 구현 (`app/api/ports/unblock/route.ts`: POST, iptables 규칙 제거)
  - [ ] 3.13 모든 API 엔드포인트 통합 테스트 (Postman 또는 curl)

### 4.0 UI 컴포넌트 및 페이지 개발
- [ ] 4.0 UI 컴포넌트 및 페이지 개발
  - [ ] 4.1 글로벌 스타일 설정 (`app/globals.css`: TailwindCSS imports, 커스텀 스타일)
  - [ ] 4.2 테마 관리 유틸리티 구현 (`app/lib/theme.ts`: getTheme, setTheme, localStorage 연동)
  - [ ] 4.3 테마 관리 단위 테스트 (`app/lib/theme.test.ts`)
  - [ ] 4.4 테마 컨텍스트 구현 (`app/context/ThemeContext.tsx`: theme state, toggleTheme)
  - [ ] 4.5 테마 전환 버튼 컴포넌트 (`app/components/ThemeToggle.tsx`: 해/달 아이콘, 클릭 시 전환)
  - [ ] 4.6 로딩 스피너 컴포넌트 (`app/components/LoadingSpinner.tsx`: 간단한 회전 애니메이션)
  - [ ] 4.7 토스트 알림 컴포넌트 (`app/components/Toast.tsx`: 성공/에러 메시지 표시)
  - [ ] 4.8 확인 다이얼로그 컴포넌트 (`app/components/ConfirmDialog.tsx`: 제목, 메시지, 확인/취소)
  - [ ] 4.9 헤더 컴포넌트 구현 (`app/components/Header.tsx`: 앱 제목, 테마 전환, 로그아웃)
  - [ ] 4.10 검색 바 컴포넌트 구현 (`app/components/SearchBar.tsx`: 검색 입력, 프로토콜 필터)
  - [ ] 4.11 새로고침 컨트롤 컴포넌트 (`app/components/RefreshControl.tsx`: 자동 ON/OFF, 간격 선택, 수동 버튼)
  - [ ] 4.12 포트 데이터 fetching 커스텀 훅 (`app/hooks/usePortData.ts`: fetch /api/ports, 에러 처리)
  - [ ] 4.13 자동 새로고침 커스텀 훅 (`app/hooks/useAutoRefresh.ts`: interval 관리, localStorage 저장)
  - [ ] 4.14 포트 테이블 컴포넌트 구현 (`app/components/PortTable.tsx`: 테이블 렌더링, 액션 버튼)
  - [ ] 4.15 Root layout 구현 (`app/layout.tsx`: 테마 provider, HTML 기본 구조)
  - [ ] 4.16 Root page 구현 (`app/page.tsx`: 세션 확인 후 로그인/대시보드 리다이렉트)
  - [ ] 4.17 대시보드 페이지 구현 (`app/dashboard/page.tsx`: 모든 컴포넌트 통합)
  - [ ] 4.18 UI 전체 통합 테스트 (브라우저에서 수동 테스트)

### 5.0 Docker 컨테이너화 및 배포 설정
- [ ] 5.0 Docker 컨테이너화 및 배포 설정
  - [ ] 5.1 `.dockerignore` 파일 생성 (`node_modules`, `.next`, `.git` 등 제외)
  - [ ] 5.2 Dockerfile 작성 (multi-stage build, Node.js 20 alpine, production dependencies)
  - [ ] 5.3 docker-compose.yml 작성 (host network, privileged, 환경 변수, restart policy)
  - [ ] 5.4 Docker 이미지 빌드 및 테스트 (`docker build`, `docker run`)
  - [ ] 5.5 Docker Compose 실행 테스트 (`docker-compose up -d`)
  - [ ] 5.6 README.md 작성 (프로젝트 소개, 설치 방법, 실행 방법, 환경 변수 설명)
  - [ ] 5.7 배포 가이드 작성 (Ubuntu 서버에서 실행하는 방법, 권한 설정)
  - [ ] 5.8 최종 통합 테스트 (Docker 컨테이너에서 모든 기능 검증)

---

**Instructions:**
- 각 sub-task를 하나씩 완료합니다
- sub-task 완료 후 `[x]`로 표시합니다
- 모든 sub-task 완료 시 parent task도 `[x]`로 표시합니다
- parent task 완료 시 테스트 실행 → git add → git commit을 수행합니다
- 다음 sub-task 시작 전 사용자에게 허가를 요청합니다