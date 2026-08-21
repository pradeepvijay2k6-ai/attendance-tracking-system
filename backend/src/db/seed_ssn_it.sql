-- ============================================================
-- SEED DATA: SSN IT 2025 BATCH (141 STUDENTS) & DR. ARIGE SUMANTH TIMETABLE
-- ============================================================

-- 1. Insert Department: Information Technology
INSERT INTO public.departments (id, name, code)
VALUES ('11111111-2222-3333-4444-555555555555', 'Information Technology', 'IT')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. Insert Class: B.Tech IT - 2025 Batch
INSERT INTO public.classes (id, department_id, name, code, year, semester)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-2222-3333-4444-555555555555', 'B.Tech IT - 2025 Batch', 'IT-2025', 1, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 3. Insert Sections: IT A and IT B
INSERT INTO public.sections (id, class_id, name)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'IT A'),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'IT B')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Insert Subject: Introduction to Digital Communications
INSERT INTO public.subjects (id, name, code, department_id, semester)
VALUES ('33333333-cccc-cccc-cccc-cccccccccccc', 'Introduction to Digital Communications', 'IDC101', '11111111-2222-3333-4444-555555555555', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 5. Link Timetables to the Teacher Profile (Dr. Arige Sumanth or first active teacher)
DO $$
DECLARE
  v_teacher_id UUID;
BEGIN
  -- Find Dr. Sumanth or any logged-in teacher profile
  SELECT id INTO v_teacher_id FROM public.profiles WHERE role IN ('teacher', 'admin') LIMIT 1;

  IF v_teacher_id IS NULL THEN
    -- Create placeholder profile if none exists yet
    v_teacher_id := '77777777-7777-7777-7777-777777777777';
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (v_teacher_id, 'sumanth.arige@ssn.edu.in', 'Dr. Arige Sumanth', 'teacher', 'Information Technology')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  ELSE
    -- Update existing profile name to Dr. Arige Sumanth
    UPDATE public.profiles
    SET full_name = 'Dr. Arige Sumanth', department = 'Information Technology'
    WHERE id = v_teacher_id;
  END IF;

  -- Remove old demo timetables
  DELETE FROM public.timetables WHERE subject_id = '33333333-cccc-cccc-cccc-cccccccccccc';

  -- ------------------------------------------------------------
  -- DR. ARIGE SUMANTH'S TIMETABLE:
  -- IT A:
  --   Tuesday (day 2)  - 5th hr (14:00 - 15:00)
  --   Thursday (day 4) - 2nd hr (10:00 - 11:00)
  --   Friday (day 5)   - 2nd hr (10:00 - 11:00)
  -- IT B:
  --   Monday (day 1)   - 1st hr (09:00 - 10:00)
  --   Tuesday (day 2)  - 3rd hr (11:30 - 12:30)
  --   Friday (day 5)   - 6th hr (15:00 - 16:00)
  -- ------------------------------------------------------------
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

-- 6. Insert All 141 Students (IT A: 001 to 071 | IT B: 072 to 141)
-- Clear previous sample students
DELETE FROM public.students WHERE class_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- IT A (Roll 001 to 071)
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
  ('3122255002071', '071', 'Mohana Prasath S', 'mohanaprasath2510700@ssn.edu.in', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (register_no) DO UPDATE SET full_name = EXCLUDED.full_name;

-- IT B (Roll 072 to 141)
INSERT INTO public.students (register_no, roll_no, full_name, email, class_id, section_id)
VALUES
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
