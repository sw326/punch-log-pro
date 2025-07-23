export default function TestDataGuide() {
  return (
    <div className="bg-muted/50 p-6 rounded-lg border-2 border-dashed border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">📋 시스템 테스트 가이드</h3>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-foreground mb-2">1️⃣ 테스트 계정 생성</h4>
          <p className="text-muted-foreground">아래 정보로 회원가입을 먼저 진행해주세요:</p>
          <div className="bg-background p-3 rounded mt-2 space-y-1">
            <p><strong>관리자 계정:</strong> admin@test.com / password123</p>
            <p><strong>직원 계정:</strong> employee@test.com / password123</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">2️⃣ 기능 테스트 순서</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>직원 계정으로 로그인 → 출근/퇴근 기능 테스트</li>
            <li>관리자 계정으로 로그인 → 전체 직원 관리 기능 확인</li>
            <li>필터링, 정렬, 검색 기능 테스트</li>
          </ol>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">3️⃣ 주요 기능</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>직원:</strong> 출퇴근 기록, 개인 기록 조회, 근무 시간 확인</li>
            <li><strong>관리자:</strong> 전체 직원 관리, 출퇴근 현황 통계, 필터링/정렬</li>
            <li><strong>공통:</strong> 반응형 디자인, 실시간 알림, 보안 로그인</li>
          </ul>
        </div>

        <div className="bg-success-light p-3 rounded mt-4">
          <p className="text-success font-medium">✅ 시스템이 준비되었습니다!</p>
          <p className="text-success text-xs mt-1">위 계정으로 회원가입 후 모든 기능을 테스트해보세요.</p>
        </div>
      </div>
    </div>
  );
}