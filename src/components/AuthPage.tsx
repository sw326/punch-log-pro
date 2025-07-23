import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Shield, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import TestDataGuide from './TestDataGuide';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "로그인 실패",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          });
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name,
            },
          },
        });

        if (error) {
          toast({
            title: "회원가입 실패",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "회원가입 성공",
            description: "계정이 생성되었습니다.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      toast({
        title: "테스트 로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "테스트 로그인 성공",
        description: "환영합니다!",
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-primary overflow-hidden">
        <img 
          src={heroImage} 
          alt="Professional Office Building" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl font-bold mb-4">출퇴근 관리 시스템</h1>
            <p className="text-xl opacity-90">효율적인 근무 시간 관리를 위한 전문 솔루션</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">정확한 시간 관리</h3>
              <p className="text-muted-foreground">출근 및 퇴근 시간을 정확히 기록하고 관리합니다.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">직원 관리</h3>
              <p className="text-muted-foreground">관리자는 모든 직원의 출퇴근 현황을 한눈에 확인할 수 있습니다.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">안전한 보안</h3>
              <p className="text-muted-foreground">개인 정보와 출퇴근 기록을 안전하게 보호합니다.</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    {isLogin ? '로그인' : '회원가입'}
                  </CardTitle>
                  <CardDescription>
                    {isLogin ? '계정에 로그인하세요' : '새 계정을 생성하세요'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="홍길동"
                          required={!isLogin}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      variant="gradient"
                    >
                      {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm"
                    >
                      {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        테스트 계정으로 빠른 체험
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleTestLogin('admin@test.com', 'password123')}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        관리자 계정으로 로그인
                      </Button>
                      <Button
                        onClick={() => handleTestLogin('employee@test.com', 'password123')}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        직원 계정으로 로그인
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-center space-y-2">
                      <p className="font-medium">🔑 테스트 계정 정보:</p>
                      <div className="bg-muted/50 p-3 rounded-md text-left space-y-1">
                        <p><span className="font-medium">관리자:</span> admin@test.com / password123</p>
                        <p><span className="font-medium">직원:</span> employee@test.com / password123</p>
                      </div>
                      <p className="text-primary">⚠️ 테스트 계정이 없다면 먼저 위 정보로 회원가입을 해주세요!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Test Data Guide */}
              <div className="mt-8">
                <TestDataGuide />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}