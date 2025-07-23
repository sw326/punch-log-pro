import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Calendar, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  employee_id: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  user_id: string;
  profiles: Profile;
}

interface Props {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: Props) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [attendanceRecords, searchTerm, sortBy, sortOrder, filterEmployee, filterDate]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data);
    } catch (error) {
      console.error('직원 목록 조회 오류:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const recordsWithProfiles = records.map(record => ({
        ...record,
        profiles: profiles.find(p => p.user_id === record.user_id) || {
          id: '',
          user_id: record.user_id,
          name: '알 수 없음',
          email: '',
          employee_id: ''
        }
      }));

      setAttendanceRecords(recordsWithProfiles);
    } catch (error) {
      console.error('출근 기록 조회 오류:', error);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = [...attendanceRecords];

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.profiles.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 직원 필터
    if (filterEmployee !== 'all') {
      filtered = filtered.filter(record => record.user_id === filterEmployee);
    }

    // 날짜 필터
    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.profiles.name;
          bValue = b.profiles.name;
          break;
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'check_in_time':
          aValue = a.check_in_time || '';
          bValue = b.check_in_time || '';
          break;
        case 'check_out_time':
          aValue = a.check_out_time || '';
          bValue = b.check_out_time || '';
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredRecords(filtered);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return format(new Date(timeString), 'HH:mm');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd (EEE)', { locale: ko });
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

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    return {
      total: employees.length,
      checkedIn: todayRecords.filter(r => r.check_in_time).length,
      completed: todayRecords.filter(r => r.check_in_time && r.check_out_time).length,
      pending: todayRecords.filter(r => r.check_in_time && !r.check_out_time).length,
    };
  };

  const stats = getTodayStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-primary-foreground">
                <h1 className="text-2xl font-bold">관리자 대시보드</h1>
                <p className="opacity-90">전체 직원 출퇴근 관리</p>
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
        {/* Today's Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2" />
                총 직원 수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">명</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                오늘 출근
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.checkedIn}</div>
              <p className="text-sm text-muted-foreground">명</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                근무 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">명</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2" />
                진행 중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">명</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              필터 및 정렬
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="직원 이름 또는 사번 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="직원 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 직원</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.user_id}>
                      {employee.name} ({employee.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="날짜 선택"
              />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">날짜</SelectItem>
                  <SelectItem value="name">직원 이름</SelectItem>
                  <SelectItem value="check_in_time">출근 시간</SelectItem>
                  <SelectItem value="check_out_time">퇴근 시간</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 순서" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">내림차순</SelectItem>
                  <SelectItem value="asc">오름차순</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterEmployee('all');
                  setFilterDate('');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
              >
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              출퇴근 기록 ({filteredRecords.length}건)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>직원명</TableHead>
                    <TableHead>사번</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>출근 시간</TableHead>
                    <TableHead>퇴근 시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>근무 시간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const workingHours = record.check_in_time && record.check_out_time 
                      ? ((new Date(record.check_out_time).getTime() - new Date(record.check_in_time).getTime()) / (1000 * 60 * 60)).toFixed(1)
                      : null;

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.profiles.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.profiles.employee_id}
                        </TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
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