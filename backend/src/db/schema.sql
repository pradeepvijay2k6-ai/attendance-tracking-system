-- ============================================================
-- ATTENDANCE TRACKING SYSTEM — COMPLETE CLEAN DATABASE SETUP
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES TABLE (Associated with auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher',
  department TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Trigger to auto-create profile on Google OAuth / Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 2. DROP OLD APPLICATION TABLES (Clean slate without conflicting old columns)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;
DROP TABLE IF EXISTS public.timetables CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- ------------------------------------------------------------
-- 3. RECREATE APPLICATION TABLES
-- ------------------------------------------------------------
CREATE TABLE public.departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  year INT DEFAULT 1,
  semester INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  semester INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  register_no TEXT NOT NULL UNIQUE,
  roll_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  class_id UUID REFERENCES public.classes(id) ON DELETE RESTRICT NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE RESTRICT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.timetables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_no TEXT DEFAULT 'Room 101',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, section_id, day_of_week, period_number)
);

CREATE TABLE public.attendance_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timetable_id UUID REFERENCES public.timetables(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_number INT NOT NULL,
  total_students INT DEFAULT 0,
  present_count INT DEFAULT 0,
  absent_count INT DEFAULT 0,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, section_id, attendance_date, period_number)
);

CREATE TABLE public.attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attendance_session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attendance_session_id, student_id)
);

-- Indexes
CREATE INDEX idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_sessions_date ON public.attendance_sessions(attendance_date);
CREATE INDEX idx_students_class_section ON public.students(class_id, section_id);
CREATE INDEX idx_timetables_teacher ON public.timetables(teacher_id, day_of_week);

-- ------------------------------------------------------------
-- 4. STORED PROCEDURE: submit_attendance
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.submit_attendance(UUID, DATE, UUID, UUID[]);
DROP FUNCTION IF EXISTS public.submit_attendance(UUID, DATE, UUID, TEXT[]);
DROP FUNCTION IF EXISTS public.submit_attendance;

CREATE OR REPLACE FUNCTION public.submit_attendance(
  p_timetable_id UUID,
  p_attendance_date DATE,
  p_teacher_id UUID,
  p_absent_student_ids UUID[] DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_timetable RECORD;
  v_session_id UUID;
  v_student RECORD;
  v_status TEXT;
  v_total_students INT := 0;
  v_absent_count INT := 0;
  v_present_count INT := 0;
BEGIN
  SELECT id, class_id, section_id, subject_id, period_number
  INTO v_timetable
  FROM public.timetables
  WHERE id = p_timetable_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Timetable record not found for ID: %', p_timetable_id;
  END IF;

  INSERT INTO public.attendance_sessions (
    timetable_id,
    class_id,
    section_id,
    subject_id,
    teacher_id,
    attendance_date,
    period_number,
    status,
    updated_at
  )
  VALUES (
    v_timetable.id,
    v_timetable.class_id,
    v_timetable.section_id,
    v_timetable.subject_id,
    p_teacher_id,
    p_attendance_date,
    v_timetable.period_number,
    'submitted',
    NOW()
  )
  ON CONFLICT (class_id, section_id, attendance_date, period_number)
  DO UPDATE SET
    teacher_id = EXCLUDED.teacher_id,
    updated_at = NOW()
  RETURNING id INTO v_session_id;

  DELETE FROM public.attendance_records WHERE attendance_session_id = v_session_id;

  FOR v_student IN
    SELECT id FROM public.students
    WHERE class_id = v_timetable.class_id
      AND section_id = v_timetable.section_id
      AND is_active = TRUE
    ORDER BY roll_no ASC
  LOOP
    v_total_students := v_total_students + 1;

    IF v_student.id = ANY(p_absent_student_ids) THEN
      v_status := 'absent';
      v_absent_count := v_absent_count + 1;
    ELSE
      v_status := 'present';
      v_present_count := v_present_count + 1;
    END IF;

    INSERT INTO public.attendance_records (
      attendance_session_id,
      student_id,
      status
    )
    VALUES (
      v_session_id,
      v_student.id,
      v_status
    );
  END LOOP;

  UPDATE public.attendance_sessions
  SET total_students = v_total_students,
      present_count = v_present_count,
      absent_count = v_absent_count
  WHERE id = v_session_id;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'attendance_date', p_attendance_date,
    'period_number', v_timetable.period_number,
    'total_students', v_total_students,
    'present_count', v_present_count,
    'absent_count', v_absent_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 5. SEED DATA
-- ------------------------------------------------------------
INSERT INTO public.departments (id, name, code)
VALUES ('11111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'CSE');

INSERT INTO public.classes (id, department_id, name, code, year, semester)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'B.Tech CSE - 3rd Year', 'CSE-3A', 3, 5);

INSERT INTO public.sections (id, class_id, name)
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Section A');

INSERT INTO public.subjects (id, name, code, department_id, semester)
VALUES ('44444444-4444-4444-4444-444444444444', 'Web Application Development', 'CS502', '11111111-1111-1111-1111-111111111111', 5);

INSERT INTO public.students (id, register_no, roll_no, full_name, email, class_id, section_id)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'REG2024001', 'CSE-01', 'Aarav Sharma', 'aarav.sharma@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a2222222-2222-2222-2222-222222222222', 'REG2024002', 'CSE-02', 'Ananya Iyer', 'ananya.iyer@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a3333333-3333-3333-3333-333333333333', 'REG2024003', 'CSE-03', 'Dev Patel', 'dev.patel@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a4444444-4444-4444-4444-444444444444', 'REG2024004', 'CSE-04', 'Diya Menon', 'diya.menon@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a5555555-5555-5555-5555-555555555555', 'REG2024005', 'CSE-05', 'Ishaan Gupta', 'ishaan.gupta@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a6666666-6666-6666-6666-666666666666', 'REG2024006', 'CSE-06', 'Kavya Nair', 'kavya.nair@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a7777777-7777-7777-7777-777777777777', 'REG2024007', 'CSE-07', 'Manish Reddy', 'manish.reddy@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a8888888-8888-8888-8888-888888888888', 'REG2024008', 'CSE-08', 'Pooja Verma', 'pooja.verma@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a9999999-9999-9999-9999-999999999999', 'REG2024009', 'CSE-09', 'Rohan Deshmukh', 'rohan.deshmukh@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a0000000-0000-0000-0000-000000000000', 'REG2024010', 'CSE-10', 'Sneha Kulkarni', 'sneha.kulkarni@example.com', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
