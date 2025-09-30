# Port Monitoring Web Application

Ubuntu 개발 서버의 리스닝 포트를 모니터링하고 관리할 수 있는 웹 기반 도구입니다.

## 📋 주요 기능

- **포트 모니터링**: 리스닝 중인 모든 포트의 상세 정보 확인 (포트 번호, 프로세스, PID, 프로토콜, 연결 상태)
- **프로세스 관리**: 웹 UI에서 프로세스 종료 및 서비스 재시작
- **포트 제어**: iptables 기반 포트 차단/해제 기능
- **검색 및 필터링**: 포트 번호, 프로세스 이름, 프로토콜로 검색
- **자동 새로고침**: 설정 가능한 간격(5/10/30/60초)으로 자동 업데이트
- **다크 모드**: 라이트/다크 테마 전환 지원
- **간편한 인증**: admin 계정 기반 로그인

## 🚀 기술 스택

- **Frontend**: Next.js 15 (App Router) + React 18 + TypeScript
- **Styling**: TailwindCSS 3 (다크 모드 지원)
- **Testing**: Jest + Testing Library
- **Deployment**: Docker + Docker Compose

## 📦 설치 방법

### 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- Docker (프로덕션 배포 시)

### 로컬 개발 환경

1. **저장소 클론**
```bash
git clone https://github.com/ghdquddnr/port_monitoring.git
cd port_monitoring
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일을 열어서 다음 값들을 설정하세요:
```env
ADMIN_PASSWORD=your-secure-password
NODE_ENV=development
PORT=8080
SESSION_SECRET=your-session-secret-key
```

4. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 `http://localhost:8080` 접속

## 🐳 Docker 배포

### Docker로 실행

1. **Docker 이미지 빌드**
```bash
docker build -t port-monitor .
```

2. **컨테이너 실행**
```bash
docker run -d \
  --name port-monitor \
  --network host \
  --privileged \
  -e ADMIN_PASSWORD=your-secure-password \
  --restart unless-stopped \
  port-monitor
```

### Docker Compose로 실행

1. **docker-compose.yml 파일 확인**

2. **환경 변수 설정**
```bash
export ADMIN_PASSWORD=your-secure-password
```

3. **컨테이너 실행**
```bash
docker-compose up -d
```

4. **로그 확인**
```bash
docker-compose logs -f
```

### 중요 사항

⚠️ **Docker 실행 시 필요한 권한**:
- `--network host`: 호스트의 네트워크 스택에 직접 접근하여 포트 정보 조회
- `--privileged`: 프로세스 종료, iptables 조작 등 권한이 필요한 작업 수행

⚠️ **보안 주의사항**:
- 프로덕션 환경에서는 강력한 비밀번호 사용 필수
- 가능하면 최소 권한 원칙에 따라 필요한 capabilities만 부여 (추후 개선 예정)

## 📝 사용 방법

### 로그인

1. 브라우저에서 `http://서버주소:8080` 접속
2. Username: `admin`
3. Password: 환경 변수에 설정한 비밀번호 입력

### 포트 모니터링

- 대시보드에서 모든 리스닝 포트를 테이블 형태로 확인
- 검색창에서 포트 번호 또는 프로세스 이름으로 검색
- 프로토콜 필터(TCP/UDP/All) 적용

### 프로세스 관리

- **종료**: 각 포트 항목의 "종료" 버튼 클릭 → 확인 다이얼로그에서 확인
- **재시작**: systemd 서비스의 경우 "재시작" 버튼 활성화 → 클릭하여 서비스 재시작

### 포트 차단/해제

- **차단**: "차단" 버튼 클릭 → iptables 규칙 추가하여 포트 차단
- **해제**: "해제" 버튼 클릭 → iptables 규칙 제거하여 포트 활성화

### 자동 새로고침

- 헤더의 자동 새로고침 토글 스위치 활성화
- 새로고침 간격 선택 (5초/10초/30초/60초)
- 설정은 브라우저에 저장되어 다음 방문 시에도 유지됨

### 테마 전환

- 헤더의 해/달 아이콘 클릭하여 라이트/다크 모드 전환

## 🛠️ 개발

### 프로젝트 구조

```
port_monitoring/
├── app/
│   ├── api/              # API 엔드포인트
│   │   ├── auth/         # 인증 관련 API
│   │   └── ports/        # 포트 관리 API
│   ├── components/       # React 컴포넌트
│   ├── context/          # React Context
│   ├── hooks/            # 커스텀 훅
│   ├── lib/              # 유틸리티 함수
│   ├── types/            # TypeScript 타입
│   ├── login/            # 로그인 페이지
│   └── dashboard/        # 대시보드 페이지
├── tasks/                # PRD 및 작업 목록
├── Dockerfile            # Docker 이미지 설정
└── docker-compose.yml    # Docker Compose 설정
```

### 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 실행 (포트 8080)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npm run format       # Prettier로 코드 포맷팅
npm test             # Jest 테스트 실행
npm run test:watch   # Jest watch 모드
```

### 테스트

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트
npm run test:watch

# 커버리지 포함
npm test -- --coverage
```

### 코드 포맷팅

```bash
# 코드 포맷팅
npm run format

# 포맷 검사만 (변경하지 않음)
npm run format -- --check
```

## 📚 API 엔드포인트

### 인증

- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 포트 관리

- `GET /api/ports` - 모든 리스닝 포트 조회
- `POST /api/ports/kill` - 프로세스 종료 (body: `{pid: number}`)
- `POST /api/ports/restart` - 서비스 재시작 (body: `{service: string}`)
- `POST /api/ports/block` - 포트 차단 (body: `{port: number, protocol: string}`)
- `POST /api/ports/unblock` - 포트 차단 해제 (body: `{port: number, protocol: string}`)

## 🔒 보안

- 환경 변수로 비밀번호 관리 (코드에 하드코딩하지 않음)
- HttpOnly 쿠키로 세션 관리
- 로그인 실패 시 3초 딜레이 (brute force 공격 방지)
- 모든 API 엔드포인트는 인증 필요 (로그인 API 제외)

## 🐛 알려진 제한사항

1. **포트 차단 영구 저장**: 현재 iptables 규칙은 런타임에만 적용되며 서버 재부팅 시 사라짐
2. **단일 사용자**: admin 계정 하나만 지원 (다중 사용자 관리 없음)
3. **감사 로그**: 작업 이력 추적 기능 없음
4. **모바일 최적화**: 기본 조회는 가능하나 관리 기능은 데스크톱 우선

## 🗺️ 로드맵

- [ ] 최소 권한으로 Docker 실행 (specific capabilities만 부여)
- [ ] iptables 규칙 영구 저장 옵션
- [ ] 작업 이력 및 감사 로그
- [ ] 다중 서버 관리 기능
- [ ] 포트 사용 통계 및 그래프
- [ ] 알림 기능 (이메일/Slack)

## 📄 라이선스

MIT License

## 👥 기여

이슈와 풀 리퀘스트를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항은 GitHub Issues를 이용해주세요.

---

**Made with ❤️ for DevOps Engineers**