import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, LogIn, LogOut, Calendar, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// DemoDataCreator import 제거

interface Profile {
  id: string;
  name: string;
  email: string;
  employee_id: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

interface Props {
  user: any;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchProfile();
    fetchAttendanceRecords();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAttendanceRecords(data);
      
      // 오늘 기록 찾기
      const today_record = data.find(record => record.date === today);
      setTodayRecord(today_record || null);
    } catch (error) {
      console.error('출근 기록 조회 오류:', error);
    }
  };

  const handleCheckIn = async () => {
    if (todayRecord && todayRecord.check_in_time) {
      toast({
        title: "이미 출근 처리됨",
        description: "오늘 이미 출근 처리가 완료되었습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (todayRecord) {
        // 기존 기록 업데이트
        const { error } = await supabase
          .from('attendance_records')
          .update({ check_in_time: now })
          .eq('id', todayRecord.id);

        if (error) throw error;
      } else {
        // 새 기록 생성
        const { error } = await supabase
          .from('attendance_records')
          .insert({
            user_id: user.id,
            date: today,
            check_in_time: now,
          });

        if (error) throw error;
      }

      toast({
        title: "출근 완료",
        description: `${format(new Date(), 'HH:mm')}에 출근 처리되었습니다.`,
      });
      
      fetchAttendanceRecords();
    } catch (error) {
      console.error('출근 처리 오류:', error);
      toast({
        title: "출근 처리 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord || !todayRecord.check_in_time) {
      toast({
        title: "출근 기록 없음",
        description: "먼저 출근 처리를 해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (todayRecord.check_out_time) {
      toast({
        title: "이미 퇴근 처리됨",
        description: "오늘 이미 퇴근 처리가 완료되었습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('attendance_records')
        .update({ check_out_time: now })
        .eq('id', todayRecord.id);

      if (error) throw error;

      toast({
        title: "퇴근 완료",
        description: `${format(new Date(), 'HH:mm')}에 퇴근 처리되었습니다.`,
      });
      
      fetchAttendanceRecords();
    } catch (error) {
      console.error('퇴근 처리 오류:', error);
      toast({
        title: "퇴근 처리 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'HH:mm');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.check_in_time && record.check_out_time) {
      return <Badge variant="secondary" className="bg-success-light text-success">완료</Badge>;
    } else if (record.check_in_time) {
      return <Badge variant="outline" className="border-warning text-warning">출근</Badge>;
    } else {
      return <Badge variant="outline" className="border-muted text-muted-foreground">미출근</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="text-primary-foreground">
                <h1 className="text-2xl font-bold">직원 대시보드</h1>
                <p className="opacity-90">
                  {profile?.name} ({profile?.employee_id})
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* DemoDataCreator 제거됨 */}
        
        {/* Today's Status */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                오늘의 출퇴근
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-primary mb-2">
                  {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE', { locale: ko })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">출근 시간</p>
                  <p className="text-xl font-semibold">
                    {todayRecord?.check_in_time ? formatTime(todayRecord.check_in_time) : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">퇴근 시간</p>
                  <p className="text-xl font-semibold">
                    {todayRecord?.check_out_time ? formatTime(todayRecord.check_out_time) : '-'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleCheckIn}
                  disabled={isLoading || (todayRecord && !!todayRecord.check_in_time)}
                  className="w-full"
                  variant={todayRecord && todayRecord.check_in_time ? "secondary" : "gradient-success"}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {todayRecord && todayRecord.check_in_time ? '출근 완료' : '출근 하기'}
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={isLoading || !todayRecord?.check_in_time || !!todayRecord?.check_out_time}
                  className="w-full"
                  variant={todayRecord && todayRecord.check_out_time ? "secondary" : "gradient"}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {todayRecord && todayRecord.check_out_time ? '퇴근 완료' : '퇴근 하기'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                이번 주 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">총 출근 일수</span>
                  <span className="font-semibold">{attendanceRecords.filter(r => r.check_in_time).length}일</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">완료된 근무</span>
                  <span className="font-semibold">{attendanceRecords.filter(r => r.check_in_time && r.check_out_time).length}일</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">진행 중인 근무</span>
                  <span className="font-semibold">{attendanceRecords.filter(r => r.check_in_time && !r.check_out_time).length}일</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Records */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              최근 출퇴근 기록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>출근 시간</TableHead>
                    <TableHead>퇴근 시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>근무 시간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => {
                    const workingHours = record.check_in_time && record.check_out_time 
                      ? ((new Date(record.check_out_time).getTime() - new Date(record.check_in_time).getTime()) / (1000 * 60 * 60)).toFixed(1)
                      : null;

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell>{formatTime(record.check_in_time)}</TableCell>
                        <TableCell>{formatTime(record.check_out_time)}</TableCell>
                        <TableCell>{getStatusBadge(record)}</TableCell>
                        <TableCell>
                          {workingHours ? `${workingHours}시간` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}