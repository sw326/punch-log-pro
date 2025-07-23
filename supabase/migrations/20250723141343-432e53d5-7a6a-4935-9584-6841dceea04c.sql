-- 관리자 계정 자동 할당을 위한 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, employee_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@test.com' THEN 'ADMIN001'
      ELSE 'EMP' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0')
    END
  );
  
  -- 관리자 이메일이면 admin 역할, 그 외에는 employee 역할 부여
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'admin@test.com' THEN 'admin'::app_role
      ELSE 'employee'::app_role
    END
  );
  
  RETURN NEW;
END;
$function$;