# 배포 가이드

Port Monitoring Web Application을 Ubuntu 서버에 배포하는 상세 가이드입니다.

## 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [사전 준비](#사전-준비)
3. [Docker 설치](#docker-설치)
4. [애플리케이션 배포](#애플리케이션-배포)
5. [방화벽 설정](#방화벽-설정)
6. [HTTPS 설정 (선택)](#https-설정-선택)
7. [문제 해결](#문제-해결)
8. [유지보수](#유지보수)

---

## 시스템 요구사항

### 최소 사양
- **OS**: Ubuntu 20.04 LTS 이상 (또는 다른 Linux 배포판)
- **CPU**: 1 Core
- **RAM**: 512MB
- **Storage**: 1GB 여유 공간
- **Network**: 인터넷 연결 (초기 설치 시)

### 권장 사양
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 2 Cores
- **RAM**: 2GB
- **Storage**: 5GB 여유 공간

### 필수 권한
- Root 또는 sudo 권한
- Docker 실행 권한
- iptables 관리 권한

---

## 사전 준비

### 1. 시스템 업데이트

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. 필수 패키지 설치

```bash
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git
```

### 3. 방화벽 확인

UFW를 사용하는 경우:
```bash
sudo ufw status
```

iptables를 사용하는 경우:
```bash
sudo iptables -L -n -v
```

---

## Docker 설치

### Ubuntu에 Docker 설치

1. **Docker GPG 키 추가**
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

2. **Docker 저장소 추가**
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

3. **Docker Engine 설치**
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

4. **Docker 서비스 시작 및 자동 시작 설정**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

5. **설치 확인**
```bash
sudo docker --version
sudo docker compose version
```

6. **현재 사용자를 docker 그룹에 추가 (선택)**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 애플리케이션 배포

### 방법 1: Docker Compose 사용 (권장)

#### 1. 프로젝트 클론

```bash
cd /opt
sudo git clone https://github.com/ghdquddnr/port_monitoring.git
cd port_monitoring
```

#### 2. 환경 변수 설정

`.env` 파일 생성:
```bash
sudo nano .env
```

다음 내용 입력:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=your-long-random-secret-key-here
PORT=8080
NODE_ENV=production
```

**중요**:
- `ADMIN_PASSWORD`: 강력한 비밀번호로 변경
- `SESSION_SECRET`: 최소 32자 이상의 무작위 문자열

무작위 문자열 생성:
```bash
openssl rand -base64 32
```

#### 3. Docker Compose 실행

```bash
sudo docker compose up -d
```

#### 4. 로그 확인

```bash
sudo docker compose logs -f port-monitoring
```

정상 실행 시 다음과 같은 로그가 출력됩니다:
```
port-monitoring-webapp  | ▲ Next.js 15.0.0
port-monitoring-webapp  | - Local:        http://0.0.0.0:8080
port-monitoring-webapp  | ✓ Ready in 2s
```

#### 5. 애플리케이션 접속

브라우저에서 `http://서버IP:8080` 접속

---

### 방법 2: Docker 명령어로 직접 실행

#### 1. 프로젝트 클론 및 빌드

```bash
cd /opt
sudo git clone https://github.com/ghdquddnr/port_monitoring.git
cd port_monitoring
sudo docker build -t port-monitoring-webapp .
```

#### 2. 컨테이너 실행

```bash
sudo docker run -d \
  --name port-monitoring \
  --network host \
  --privileged \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_ADMIN \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  -e SESSION_SECRET=your-session-secret-key \
  -e PORT=8080 \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  --restart unless-stopped \
  port-monitoring-webapp
```

#### 3. 컨테이너 상태 확인

```bash
sudo docker ps
sudo docker logs port-monitoring
```

---

## 방화벽 설정

### UFW 사용 시

#### 8080 포트 허용
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
sudo ufw status
```

#### 특정 IP만 허용 (보안 강화)
```bash
# 기존 규칙 제거
sudo ufw delete allow 8080/tcp

# 특정 IP에서만 접근 허용
sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp
sudo ufw reload
```

### iptables 직접 사용 시

#### 8080 포트 허용
```bash
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

#### 특정 IP만 허용
```bash
sudo iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 8080 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

---

## HTTPS 설정 (선택)

프로덕션 환경에서는 HTTPS 사용을 강력히 권장합니다.

### Nginx 리버스 프록시 설정

#### 1. Nginx 설치

```bash
sudo apt install -y nginx
```

#### 2. Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/port-monitoring
```

다음 내용 입력:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 설정 활성화

```bash
sudo ln -s /etc/nginx/sites-available/port-monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Let's Encrypt SSL 인증서 설치

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot이 자동으로 HTTPS 리다이렉트를 설정합니다.

#### 5. 자동 갱신 확인

```bash
sudo certbot renew --dry-run
```

---

## 문제 해결

### 컨테이너가 시작되지 않음

1. **로그 확인**
```bash
sudo docker compose logs port-monitoring
```

2. **권한 문제**
```bash
sudo docker compose down
sudo docker compose up -d
```

3. **포트 충돌 확인**
```bash
sudo lsof -i :8080
```

### 포트 정보가 표시되지 않음

1. **네트워크 모드 확인**
```bash
sudo docker inspect port-monitoring | grep NetworkMode
```
`host` 모드여야 합니다.

2. **권한 확인**
```bash
sudo docker inspect port-monitoring | grep Privileged
```
`true`여야 합니다.

### iptables 명령어 실패

1. **Capabilities 확인**
```bash
sudo docker inspect port-monitoring | grep CapAdd
```
`NET_ADMIN`이 포함되어야 합니다.

2. **컨테이너 재시작**
```bash
sudo docker compose restart port-monitoring
```

### 로그인 실패

1. **환경 변수 확인**
```bash
sudo docker compose exec port-monitoring env | grep ADMIN
```

2. **비밀번호 재설정**
```bash
sudo docker compose down
# .env 파일 수정
sudo docker compose up -d
```

---

## 유지보수

### 애플리케이션 업데이트

```bash
cd /opt/port_monitoring
sudo git pull origin main
sudo docker compose down
sudo docker compose build --no-cache
sudo docker compose up -d
```

### 로그 확인

```bash
# 실시간 로그
sudo docker compose logs -f port-monitoring

# 최근 100줄
sudo docker compose logs --tail=100 port-monitoring
```

### 컨테이너 재시작

```bash
sudo docker compose restart port-monitoring
```

### 컨테이너 중지 및 제거

```bash
sudo docker compose down

# 볼륨까지 제거
sudo docker compose down -v
```

### 디스크 공간 정리

```bash
# 사용하지 않는 Docker 리소스 정리
sudo docker system prune -a

# 로그 파일 정리
sudo docker compose logs --tail=0 port-monitoring
```

### 백업

중요 데이터 백업:
```bash
# .env 파일 백업
sudo cp .env .env.backup

# Docker Compose 설정 백업
sudo cp docker-compose.yml docker-compose.yml.backup
```

### 모니터링

시스템 리소스 사용량 확인:
```bash
sudo docker stats port-monitoring
```

---

## 보안 체크리스트

- [ ] 강력한 `ADMIN_PASSWORD` 설정
- [ ] 무작위 `SESSION_SECRET` 생성 및 설정
- [ ] 방화벽 규칙 설정 (특정 IP만 허용)
- [ ] HTTPS 설정 (프로덕션 환경)
- [ ] 정기적인 시스템 업데이트
- [ ] Docker 및 애플리케이션 업데이트
- [ ] 로그 모니터링 및 이상 징후 확인
- [ ] `.env` 파일 권한 설정 (600)

```bash
sudo chmod 600 .env
sudo chown root:root .env
```

---

## 추가 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Nginx 리버스 프록시 설정](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Let's Encrypt 인증서 발급](https://letsencrypt.org/getting-started/)

---

**문의 및 이슈**

문제가 발생하면 GitHub Issues에 등록해주세요.
