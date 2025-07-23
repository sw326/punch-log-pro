# 🕒 Punch Log Pro

**간편한 출퇴근 기록 웹 서비스**

### [👉 배포된 서비스 바로가기](https://punch-log-pro.lovable.app)

---

## 프로젝트 소개

Punch Log Pro는 **React**와 **Supabase**를 활용하여 만든,  
누구나 쉽게 사용할 수 있는 출퇴근 기록 웹 서비스입니다.

- **일반 사원**: 오늘의 출근/퇴근 기록, 내역 확인
- **관리자**: 모든 직원의 출퇴근 내역을 이름/날짜별로 관리 및 정렬

**주요 기술 스택**
- Vite
- React
- TypeScript
- shadcn-ui
- Tailwind CSS
- Supabase

**사용한 AI 툴**
- Lovable AI
- Cursor AI

---

## 주요 기능

### 1. 로그인 및 간편 테스트 계정
- 이메일/비밀번호로 로그인
- 로그인 창 하단에 **테스트 계정** 버튼 제공 (클릭만으로 바로 체험 가능)

### 2. 사원 기능
- 오늘 날짜의 출근/퇴근 시간 기록
- 내 출퇴근 내역 리스트 확인

### 3. 관리자 기능
- 출근/퇴근 기록 입력 불가(관리자 본인은 기록 X)
- 모든 사원의 출퇴근 내역을 **이름/날짜별로 정렬**하여 확인 가능

---

## 실행 방법 (비전공자도 쉽게!)

### 설치 없이 바로 사용하기
- 👉 [배포된 서비스 바로가기](https://punch-log-pro.lovable.app)

---

### 직접 실행하고 싶다면

#### 1. 준비물
- [Node.js](https://nodejs.org/ko/) 설치 (최신 LTS 권장)
- [Git](https://git-scm.com/downloads) 설치

#### 2. 프로젝트 다운로드

아래 명령어를 차례대로 복사해서 **명령 프롬프트(cmd)**에 붙여넣으세요.

```bash
# 1. 원하는 폴더로 이동 (예시: 바탕화면)
cd %USERPROFILE%\Desktop

# 2. 프로젝트 클론
git clone https://github.com/sw326/punch-log-pro.git
cd punch-log-pro
```

#### 3. 의존성 설치

```bash
npm install
```

#### 4. 개발 서버 실행

```bash
npm run dev
```

#### 5. 브라우저에서 접속

터미널에 표시되는 주소(기본: http://localhost:5173)를 복사해서  
브라우저 주소창에 붙여넣으면 서비스가 실행됩니다.

> ⚠️ **포트 안내:**  
> 기본적으로 Vite는 5173 포트를 사용합니다.  
> 만약 5173 포트가 이미 사용 중이면, 터미널에 표시되는 다른 포트(예: 5174 등)로 자동 실행될 수 있으니,  
> 반드시 터미널에 안내되는 실제 주소를 확인해 주세요!

---

## 배포 및 커스텀 도메인 연결

- [Lovable](https://lovable.dev/projects/577236fe-113c-449a-b2dc-fbc72f9ad6c8)에서 "Share → Publish"로 배포 가능
- 커스텀 도메인 연결은 [공식 가이드](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide) 참고

---

## 보안 관련 안내

- `supabase/config.toml` 파일의 `project_id`는 공개되어도 큰 문제가 없는 **프로젝트 식별자**입니다.
- 하지만, **API 키**(anon/public, service 등)나 **비밀번호** 등 민감 정보는 절대 노출되면 안 됩니다.
- 현재 config.toml에는 project_id만 있으므로, 이 정보만으로는 보안상 큰 위험이 없습니다.
- 만약 `.env` 파일이나 supabase의 키 정보가 코드에 포함되어 있다면 반드시 .gitignore에 추가하고, 외부에 노출되지 않도록 주의하세요.

---

## 라이선스

MIT License

---

## 문의 및 피드백

- 궁금한 점이나 개선사항은 이슈로 남겨주세요!

---

### 요약

- **배포 링크**: https://punch-log-pro.lovable.app
- **테스트 계정**: 로그인 창 하단에서 간편하게 체험 가능
- **실행 방법**: Node.js, Git 설치 → 클론 → npm install → npm run dev
