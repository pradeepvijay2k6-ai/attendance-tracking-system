-- ==============================================================================
-- MASTER SETUP: COMPLETE ATTENDANCE TRACKING SYSTEM + 141 SSN IT STUDENTS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. DROP EXISTING APPLICATION TABLES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;
DROP TABLE IF EXISTS public.timetables CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher',
  department TEXT DEFAULT 'Information Technology',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Information Technology';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Auto-handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Dr. Arige Sumanth'),
    NEW.raw_user_meta_data->>'avatar_url',
    'teacher',
    'Information Technology'
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

-- ------------------------------------------------------------------------------
-- 3. RECREATE APPLICATION TABLES
-- ------------------------------------------------------------------------------
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
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_no TEXT DEFAULT 'IT Hall 201',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, section_id, day_of_week, period_number)
);

CREATE TABLE public.attendance_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timetable_id UUID REFERENCES public.timetables(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'od')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attendance_session_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY & POLICIES (Allow full access for API & Authenticated Users)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
CREATE POLICY "profiles_policy" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "departments_policy" ON public.departments;
CREATE POLICY "departments_policy" ON public.departments FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "classes_policy" ON public.classes;
CREATE POLICY "classes_policy" ON public.classes FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sections_policy" ON public.sections;
CREATE POLICY "sections_policy" ON public.sections FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "subjects_policy" ON public.subjects;
CREATE POLICY "subjects_policy" ON public.subjects FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "students_policy" ON public.students;
CREATE POLICY "students_policy" ON public.students FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "timetables_policy" ON public.timetables;
CREATE POLICY "timetables_policy" ON public.timetables FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "attendance_sessions_policy" ON public.attendance_sessions;
CREATE POLICY "attendance_sessions_policy" ON public.attendance_sessions FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "attendance_records_policy" ON public.attendance_records;
CREATE POLICY "attendance_records_policy" ON public.attendance_records FOR ALL TO public USING (true) WITH CHECK (true);

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ------------------------------------------------------------------------------
-- 5. STORED PROCEDURE: submit_attendance
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. SEED DATA: MASTER DATA + DR. ARIGE SUMANTH TIMETABLE
-- ------------------------------------------------------------------------------
INSERT INTO public.departments (id, name, code)
VALUES ('11111111-2222-3333-4444-555555555555', 'Information Technology', 'IT')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO public.classes (id, department_id, name, code, year, semester)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-2222-3333-4444-555555555555', 'B.Tech IT - 2025 Batch', 'IT-2025', 1, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

INSERT INTO public.sections (id, class_id, name)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'IT A'),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'IT B')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.subjects (id, name, code, department_id, semester)
VALUES ('33333333-cccc-cccc-cccc-cccccccccccc', 'Introduction to Digital Communications', 'IDC101', '11111111-2222-3333-4444-555555555555', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- Ensure teacher profile exists and link timetables
DO $$
DECLARE
  v_teacher_id UUID;
BEGIN
  -- Grab first authenticated user if exists
  SELECT id INTO v_teacher_id FROM public.profiles LIMIT 1;

  IF v_teacher_id IS NULL THEN
    SELECT id INTO v_teacher_id FROM auth.users LIMIT 1;
  END IF;

  -- Create / Update profile for Dr. Arige Sumanth
  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (v_teacher_id, 'sumanth.arige@ssn.edu.in', 'Dr. Arige Sumanth', 'teacher', 'Information Technology')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Dr. Arige Sumanth', role = 'teacher', department = 'Information Technology';
  END IF;

  -- Insert Dr. Sumanth's 6 Periods:
  -- IT A: Tue P5, Thu P2, Fri P2
  -- IT B: Mon P1, Tue P3, Fri P6
  INSERT INTO public.timetables (class_id, section_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time, room_no)
  VALUES
    -- IT A
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 2, 5, '14:00:00', '15:00:00', 'IT Hall 201'),
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 4, 2, '10:00:00', '11:00:00', 'IT Hall 201'),
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 5, 2, '10:00:00', '11:00:00', 'IT Hall 201'),
    -- IT B
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 1, 1, '09:00:00', '10:00:00', 'IT Hall 202'),
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 2, 3, '11:30:00', '12:30:00', 'IT Hall 202'),
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-cccc-cccc-cccc-cccccccccccc', v_teacher_id, 5, 6, '15:00:00', '16:00:00', 'IT Hall 202');
END $$;

-- ------------------------------------------------------------------------------
-- 7. INSERT ALL 141 STUDENTS (IT A: 001 to 071 | IT B: 072 to 141)
-- ------------------------------------------------------------------------------
INSERT INTO public.students (register_no, roll_no, full_name, email, class_id, section_id)
VALUES
  ('3122255002001', '001', 'Aaditya B M', 'aaditya2510444@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002002', '002', 'Adhiti Sudhakar', 'adhiti2510024@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002003', '003', 'Adithya Kumaresan', 'adithya2510014@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002004', '004', 'Adithya M', 'adithya2510949@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002005', '005', 'Afsheen S', 'afsheen2510149@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002006', '006', 'Agalya S', 'agalya2510415@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002007', '007', 'Ajay A', 'ajay2510941@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002008', '008', 'Akshaya R', 'akshaya2510131@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002009', '009', 'Akshaya R', 'akshaya2510928@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002010', '010', 'Alden B L', 'alden2510129@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002011', '011', 'Anas Ahamed S', 'anasahamed2510598@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002012', '012', 'Anfara Shyma A', 'anfarashyma2510580@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002013', '013', 'Anirudh Badri Narayanan', 'anirudhbadri2510039@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002014', '014', 'Aradhana P', 'aradhana2510137@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002015', '015', 'Aravind S', 'aravind2510777@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002016', '016', 'Architha R', 'architha2510159@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002017', '017', 'Arunachalam S', 'arunachalam2510988@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002018', '018', 'Arvindh Vijay G', 'arvindhvijay2510174@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002019', '019', 'Ashwin K B', 'ashwin2510852@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002020', '020', 'Bavadharani S', 'bavadharani2510664@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002021', '021', 'Benita Mary Alwin', 'benitamary2510020@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002022', '022', 'Charan V', 'charan2510151@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002023', '023', 'Chris Bastian Roy', 'chris2510063@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002024', '024', 'Dafna Delvis', 'dafna2510001@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002025', '025', 'Deepika Senthilnathan', 'deepika2510041@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002026', '026', 'Dhanvanth J M', 'dhanvanth2510550@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002027', '027', 'Dharanidharan J', 'dharanidharan2510630@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002028', '028', 'Dharshan R', 'dharshan2510163@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002029', '029', 'Dharshan Sathish Kumar', 'dharshan2510406@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002030', '030', 'Dharshini P K', 'dharshini2510905@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002031', '031', 'Dhesh Sarvajith R', 'dheshsarvajith2510414@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002032', '032', 'Divasundar S', 'divasundar2510422@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002033', '033', 'Elamathi B', 'elamathi2510921@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002034', '034', 'Eniya Sree K', 'eniyasree2510134@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002035', '035', 'Faizal I', 'faizal2510834@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002036', '036', 'Gokul Prasanth A', 'gokulprasanth2510740@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002037', '037', 'Gokula Hari Rajan R', 'gokulaharirajan2510160@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002038', '038', 'Guru K', 'guru2510817@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002039', '039', 'Guru Prasath N', 'guruprasath2510871@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002040', '040', 'Haridass C', 'haridass2510845@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002041', '041', 'Hariharan G', 'hariharan2510689@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002042', '042', 'Harini Bharadwaj', 'harini2510402@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002043', '043', 'Harini Devi B', 'harinidevi2510156@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002044', '044', 'Harini V', 'harini2510128@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002045', '045', 'Harish S', 'harish2510140@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002046', '046', 'Harishraam R', 'harishraam2510230@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002047', '047', 'Harshini A', 'harshini2510438@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002048', '048', 'Harshini N T', 'harshini2510712@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002049', '049', 'Hemanya D', 'hemanya2510408@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002050', '050', 'Hrishikesh G', 'hrishikesh2510359@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002051', '051', 'Hubert Bala Joshwin D', 'hubertbalajoshwin2510407@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002052', '052', 'Jeeva K', 'jeeva2510573@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002053', '053', 'Kathir V', 'kathir2510910@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002054', '054', 'Kewinsanjai M', 'kewinsanjai2510982@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002055', '055', 'Kishore S B', 'kishore2510759@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002056', '056', 'Kruthika C D', 'kruthika2510123@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002057', '057', 'Lakchitha A', 'lakchitha2510591@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002058', '058', 'Ligitha S', 'ligitha2510956@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002059', '059', 'Madhu Mitha S', 'madhumitha2510447@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002060', '060', 'Madhuvarshini S', 'madhuvarshini2510934@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002061', '061', 'Madumika R P', 'madumika2510572@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002062', '062', 'Malavi V', 'malavi2510044@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002063', '063', 'Maria Rotric Loran L', 'mariarotricloran2510813@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002064', '064', 'Mathesh S', 'mathesh2510855@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002065', '065', 'Menaga M', 'menaga2510932@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002066', '066', 'Mirthula S Fernando', 'mirthula2510171@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002067', '067', 'Mithin Krishna P S', 'mithinkrishna2510417@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002068', '068', 'Mohamed Rafith A', 'mohamedrafith2510714@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002069', '069', 'Mohammed Aadhil J', 'mohammedaadhil2510844@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002070', '070', 'Mohammed Noorul Islam V P', 'mohammednoorulislam2510850@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002071', '071', 'Mohana Prasath S', 'mohanaprasath2510700@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('3122255002072', '072', 'Mohith Priyan Balasubramanian', 'mohithpriyan2511072@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002073', '073', 'Mukesh K', 'mukesh2510969@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002074', '074', 'Mukundhan K', 'mukundhan2510147@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002075', '075', 'Nagammai A', 'nagammai2510771@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002076', '076', 'Namish Kadiyala', 'namish2510037@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002077', '077', 'Nehaa M S', 'nehaa2510894@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002078', '078', 'Nihitha S', 'nihitha2510860@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002079', '079', 'Nikila G', 'nikila2510627@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002080', '080', 'Nishanth S', 'nishanth2510830@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002081', '081', 'Nithilaa R', 'nithilaa2510862@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002082', '082', 'Nitinraj S', 'nitinraj2510127@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002083', '083', 'Parvathi P R', 'parvathi2510843@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002084', '084', 'Pavithra S S M', 'pavithra2510428@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002085', '085', 'Pradeep V', 'pradeep2510436@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002086', '086', 'Pranaya Shree S', 'pranayashree2510432@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002087', '087', 'Preetha A', 'preetha2510861@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002088', '088', 'Prithivi S K', 'prithivi2510441@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002089', '089', 'Priya V', 'priya2510781@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002090', '090', 'Priyadharshni S', 'priyadharshni2510933@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002091', '091', 'Rachel Jacob', 'rachel2510004@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002092', '092', 'Raghav Karthick', 'raghav2510162@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002093', '093', 'Ranjitha P', 'ranjitha2510175@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002094', '094', 'Ravivarman M', 'ravivarman2510681@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002095', '095', 'Renuka Varshini K', 'renukavarshini2510620@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002096', '096', 'Ritheeshkumar S', 'ritheeshkumar2510148@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002097', '097', 'Rithishsaran T K', 'rithishsaran2510907@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002098', '098', 'Rohit Ram B', 'rohitram2510448@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002099', '099', 'Rohit S', 'rohit2510076@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002100', '100', 'Rufhus Christopher R', 'rufhuschristopher2510875@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002101', '101', 'Rupak K', 'rupak2510141@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002102', '102', 'Ruthvika V', 'ruthvika2510138@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002103', '103', 'Sachit Ram M', 'sachit2510791@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002104', '104', 'Sahana S', 'sahana2510145@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002105', '105', 'Saketh Ram Srinivasan', 'sakethram2510196@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002106', '106', 'Sakthi V', 'sakthi2510959@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002107', '107', 'Sanjay S', 'sanjay2510208@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002108', '108', 'Santhosh P S', 'santhosh2510662@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002109', '109', 'Sasikumar R', 'sasikumar2510766@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002110', '110', 'Shaahir Meeran Mohaideen M I', 'shaahirmeeranmohaideen2510883@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002111', '111', 'Shafrin Sahaana S', 'shafrinsahaana2510204@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002112', '112', 'Shivani K S', 'shivani2510142@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002113', '113', 'Shivani V', 'shivani2510892@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002114', '114', 'Shravan Rao', 'shravan2510064@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002115', '115', 'Shreshta A', 'shreshta2510430@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002116', '116', 'Shweta Mary John', 'shwetamary2510132@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002117', '117', 'Siva S', 'siva2510575@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002118', '118', 'Sivaprabhu S', 'sivaprabhu2510193@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002119', '119', 'Soumiya S', 'soumiya2510812@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002120', '120', 'Sri Dhanvanth P', 'sridhanvanth2510715@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002121', '121', 'Srinivetha V', 'srinivetha2510400@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002122', '122', 'Stefania E', 'stefania2510161@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002123', '123', 'Steve Winston G', 'stevewinston2510016@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002124', '124', 'Subha Shree R K', 'subhashree2510442@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002125', '125', 'Subhasaravanan G', 'subhasaravanan2510758@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002126', '126', 'Sujeetha S', 'sujeetha2510757@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002127', '127', 'Sushil P', 'sushil2510122@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002128', '128', 'Susidharan S', 'susidharan2510746@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002129', '129', 'Tarrun M', 'tarrun2510155@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002130', '130', 'Tejaavarshini E', 'tejaavarshini2510619@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002131', '131', 'Tharika S', 'tharika2510117@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002132', '132', 'Thejesh J', 'thejesh2510699@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002133', '133', 'Vaibhav Ramesh', 'vaibhav2510150@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002134', '134', 'Varshana M', 'varshana2510767@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002135', '135', 'Vidya Varuni R', 'vidyavaruni2570011@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002136', '136', 'Vignesh M', 'vignesh2510990@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002137', '137', 'Vinu Shreshta Ganesan', 'vinushreshta2510567@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002138', '138', 'Vishwa R', 'vishwa2510808@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002139', '139', 'Yanush Jayakumar', 'yanush2510067@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002140', '140', 'Yashwanth A', 'yashwanth2510445@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('3122255002141', '141', 'Yazhini K', 'yazhini2510809@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (register_no) DO UPDATE SET full_name = EXCLUDED.full_name, roll_no = EXCLUDED.roll_no;
