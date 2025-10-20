# **App Name**: EduQuest

## Core Features:

- 역할 기반 인증: Firebase Authentication과 사용자 정의 역할 클레임('admin', 'teacher', 'student')을 사용하여 사용자 접근을 관리하는 이메일/비밀번호 로그인 구현
- React Router 기반 네비게이션: 로그인 후 역할에 따라 다른 페이지로 사용자를 안내하는 React Router 설정 (admin → /dashboard, teacher → /students, student → /problems)
- Firestore 데이터 구조: 사용자, 문제, 결과를 저장하기 위한 Firestore 데이터 구조 정의로 효율적인 데이터 관리 보장
- Firestore 보안 규칙: 사용자 역할에 따라 Firestore 보안 규칙 자동 생성으로 데이터 보안 및 접근 제어 보장
- 문제 생성 도구: AI를 활용하여 지정된 난이도 및 주제에 따라 새로운 영어 교육 문제 자동 생성. LLM이 어떤 정보를 출력에 포함할지 결정하는 도구로 활용됩니다.
- 진행 상황 추적: 해결된 문제, 정확도 및 최근 문제 기록을 모니터링하여 학생 진행 상황 추적
- TailwindCSS 및 shadcn/ui를 사용한 UI: 일관성 있고 시각적으로 매력적인 디자인을 위해 TailwindCSS 및 shadcn/ui로 UI 설정

## Style Guidelines:

- 기본 색상: 신뢰와 지식을 전달하기 위해 짙은 파란색 (#3B82F6)
- 배경 색상: 깨끗하고 집중된 학습 환경을 위해 밝은 회색 (#F9FAFB)
- 강조 색상: 하이라이트 및 대화형 요소를 위해 청록색 (#14B8A6)
- 본문 글꼴: 현대적이고 중립적인 읽기 환경을 위해 'Inter' sans-serif; 제목 글꼴: 'Space Grotesk', 역시 sans-serif
- 코드 글꼴: 코드 스니펫을 표시하기 위해 'Source Code Pro'
- 'Font Awesome' 또는 'Material Icons'와 같은 라이브러리에서 명확하고 현대적인 아이콘 사용
- 쉬운 탐색을 위해 명확한 섹션이 있는 반응형 레이아웃 디자인