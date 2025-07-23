
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import AuthPage from '@/components/AuthPage';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 사용자 역할을 조회하는 함수
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for userId:', userId);
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'employee'; // 기본값으로 employee 설정
      }
      
      console.log('User role data:', roleData);
      return roleData?.role || 'employee';
    } catch (error) {
      console.error('Exception while fetching user role:', error);
      return 'employee';
    }
  };

  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    // 현재 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session, error });
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          console.log('User role set to:', role);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // 인증 상태 변경 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, session });
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          console.log('Auth change - User role set to:', role);
          setLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // 초기 인증 상태 확인
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    navigate('/auth');
  };

  console.log('Current state:', { loading, user: !!user, userRole });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    console.log('No user or session, showing AuthPage');
    return <AuthPage />;
  }

  if (userRole === 'admin') {
    console.log('Rendering AdminDashboard');
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  console.log('Rendering EmployeeDashboard');
  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
};

export default Index;
