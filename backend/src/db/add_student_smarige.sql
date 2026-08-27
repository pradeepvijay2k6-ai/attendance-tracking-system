-- ============================================================
-- ADD STUDENT: smarige@gmail.com
-- Class  : B.Tech IT - 2025 Batch  (IT-2025)
-- Section: IT B
-- Subject: Introduction to Digital Communications (IDC101)
--          taught by Dr. Arige Sumanth
-- Timetable (IT B):
--   Monday    Period 1  09:00–10:00  IT Hall 202
--   Tuesday   Period 3  11:30–12:30  IT Hall 202
--   Friday    Period 6  15:00–16:00  IT Hall 202
-- ============================================================

INSERT INTO public.students (
  register_no,
  roll_no,
  full_name,
  email,
  class_id,
  section_id,
  is_active
)
VALUES (
  '3122255002142',                              -- Register No (next after 141 existing students)
  '142',                                        -- Roll No
  'S. Arige',                                   -- Full name derived from smarige
  'smarige@gmail.com',                          -- Email
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',      -- class_id: B.Tech IT - 2025 Batch
  '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',      -- section_id: IT B
  TRUE
)
ON CONFLICT (email) DO UPDATE
  SET
    full_name   = EXCLUDED.full_name,
    register_no = EXCLUDED.register_no,
    roll_no     = EXCLUDED.roll_no,
    class_id    = EXCLUDED.class_id,
    section_id  = EXCLUDED.section_id,
    is_active   = TRUE;

-- -----------------------------------------------------------------------
-- Optional: link the student row to the Supabase auth profile if the
-- user already signed up via Google OAuth with smarige@gmail.com.
-- This sets profile_id so attendance lookups can use auth user ID.
-- -----------------------------------------------------------------------
UPDATE public.students s
SET    profile_id = p.id
FROM   public.profiles p
WHERE  p.email = 'smarige@gmail.com'
  AND  s.email = 'smarige@gmail.com'
  AND  s.profile_id IS NULL;

-- Verify the insert
SELECT
  s.register_no,
  s.roll_no,
  s.full_name,
  s.email,
  c.name  AS class_name,
  sc.name AS section_name,
  s.is_active,
  s.profile_id
FROM   public.students s
JOIN   public.classes   c  ON c.id  = s.class_id
JOIN   public.sections  sc ON sc.id = s.section_id
WHERE  s.email = 'smarige@gmail.com';
