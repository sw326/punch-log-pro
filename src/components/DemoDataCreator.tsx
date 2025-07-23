import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';

interface Props {
  user: any;
  onDataAdded: () => void;
}

export default function DemoDataCreator({ user, onDataAdded }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateDemoData = async () => {
    setIsCreating(true);
    
    try {
      // 지난 2주간의 더미 출근 기록 생성
      const records = [];
      const today = new Date();
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // 주말 제외
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dateStr = date.toISOString().split('T')[0];
        
        // 출근 시간 (8:30-9:30 사이 랜덤)
        const checkInHour = 8 + Math.random() * 1;
        const checkInMinute = Math.random() * 60;
        const checkInTime = new Date(date);
        checkInTime.setHours(Math.floor(checkInHour), Math.floor(checkInMinute));
        
        // 퇴근 시간 (17:30-18:30 사이 랜덤, 단 오늘은 50% 확률로 미퇴근)
        let checkOutTime = null;
        if (i > 0 || Math.random() > 0.5) {
          const checkOutHour = 17 + Math.random() * 1;
          const checkOutMinute = 30 + Math.random() * 60;
          checkOutTime = new Date(date);
          checkOutTime.setHours(Math.floor(checkOutHour), Math.floor(checkOutMinute));
        }
        
        records.push({
          user_id: user.id,
          date: dateStr,
          check_in_time: checkInTime.toISOString(),
          check_out_time: checkOutTime?.toISOString() || null
        });
      }
      
      // 데이터베이스에 삽입
      const { error } = await supabase
        .from('attendance_records')
        .insert(records);
      
      if (error) throw error;
      
      toast({
        title: "더미 데이터 생성 완료",
        description: `${records.length}개의 출근 기록이 생성되었습니다.`,
      });
      
      onDataAdded();
      
    } catch (error) {
      console.error('더미 데이터 생성 오류:', error);
      toast({
        title: "데이터 생성 실패",
        description: "오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mb-6 border-dashed border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Database className="h-5 w-5 mr-2" />
          더미 데이터 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            테스트를 위한 지난 2주간의 가상 출근 기록을 생성합니다.
          </p>
          <Button
            onClick={generateDemoData}
            disabled={isCreating}
            variant="outline"
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                더미 데이터 생성하기
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}