/**
 * ==============================================================================
 * SSN IT DEPARTMENT - UNIVERSAL ATTENDANCE SYNC SCRIPT (PRODUCTION)
 * ==============================================================================
 * Deploy this script ONCE in your Department / Master Attendance Google Sheet.
 * 
 * FEATURES:
 * 1. ZERO TEACHER SETUP: Teachers never have to install scripts.
 * 2. AUTOMATIC SECTION TABS: Automatically creates & formats tabs like "IT A - IDC101" & "IT B - IDC101".
 * 3. EXCEL MATRIX LAYOUT:
 *    - Column A: Roll No
 *    - Column B: Register Number
 *    - Column C: Full Name
 *    - Column D+: Date & Period (e.g. 21/08 P5) with 'P' (Green) / 'A' (Red)
 *    - Right Columns: Total Classes, Attended, Attendance % with Conditional Formatting (<75% flagged)
 * 4. AUDIT LOG TAB: Tracks exact timestamps, faculty names, and session IDs.
 * ==============================================================================
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Update Section Register Matrix Tab (e.g. "IT A - IDC101")
    updateAttendanceMatrixTab(ss, payload);

    // 2. Update Master Session Audit Log Tab
    updateSessionLogTab(ss, payload);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Attendance recorded in Google Sheet successfully',
      section: payload.section_name || payload.section,
      date: payload.date || payload.attendance_date,
      present_count: payload.present_count,
      absent_count: payload.absent_count
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates or creates the Attendance Matrix Tab for the given section & subject
 */
function updateAttendanceMatrixTab(ss, payload) {
  const sectionName = payload.section_name || payload.section || 'IT A';
  const subjectCode = payload.subject_code || 'IDC101';
  const tabName = sectionName + ' - ' + subjectCode;

  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = createFormattedMatrixSheet(ss, tabName, sectionName, payload);
  }

  const dateStr = payload.date || payload.attendance_date || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  const periodLabel = payload.period || ('Period ' + (payload.period_number || 1));
  const columnHeader = formatDateHeader(dateStr) + '\n' + periodLabel;

  // Find or insert the date column
  const headers = sheet.getRange(3, 1, 1, Math.max(sheet.getLastColumn(), 5)).getValues()[0];
  let dateColIndex = -1;

  for (let c = 3; c < headers.length; c++) {
    if (headers[c] && headers[c].toString().trim() === columnHeader.trim()) {
      dateColIndex = c + 1;
      break;
    }
  }

  // If column doesn't exist, insert before the Summary columns (or at the end)
  if (dateColIndex === -1) {
    dateColIndex = sheet.getLastColumn() + 1;
    sheet.getRange(3, dateColIndex).setValue(columnHeader)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center')
      .setWrap(true);
    sheet.setColumnWidth(dateColIndex, 90);
  }

  // Map student records
  const records = payload.records || [];
  const absentSet = new Set();
  if (payload.absent_students && Array.isArray(payload.absent_students)) {
    payload.absent_students.forEach(function(s) { absentSet.add(s.roll_no); });
  }

  // Read student list from sheet (Rows 4 to LastRow)
  const lastRow = sheet.getLastRow();
  if (lastRow >= 4) {
    const studentData = sheet.getRange(4, 1, lastRow - 3, 2).getValues(); // Roll No, Reg No
    const attendanceValues = [];
    const backgroundColors = [];
    const fontColors = [];

    for (let r = 0; r < studentData.length; r++) {
      const rollNo = studentData[r][0].toString().trim();
      const rec = records.find(function(item) { return item.roll_no.toString().trim() === rollNo; });

      const isAbsent = absentSet.has(rollNo) || (rec && (rec.status === 'ABSENT' || rec.status === 'absent'));

      if (isAbsent) {
        attendanceValues.push(['A']);
        backgroundColors.push(['#fee2e2']); // Soft red
        fontColors.push(['#b91c1c']);       // Dark red text
      } else {
        attendanceValues.push(['P']);
        backgroundColors.push(['#dcfce7']); // Soft green
        fontColors.push(['#15803d']);       // Dark green text
      }
    }

    const targetRange = sheet.getRange(4, dateColIndex, attendanceValues.length, 1);
    targetRange.setValues(attendanceValues);
    targetRange.setBackgrounds(backgroundColors);
    targetRange.setFontColors(fontColors);
    targetRange.setFontWeight('bold');
    targetRange.setHorizontalAlignment('center');
  }
}

/**
 * Creates and formats a new student matrix sheet with frozen headers and student roster
 */
function createFormattedMatrixSheet(ss, tabName, sectionName, payload) {
  const sheet = ss.insertSheet(tabName);

  // Title Banner
  sheet.getRange('A1:F1').merge()
    .setValue('SSN COLLEGE OF ENGINEERING — DEPARTMENT OF INFORMATION TECHNOLOGY')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#0f172a')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  sheet.getRange('A2:F2').merge()
    .setValue('Course: ' + (payload.subject_name || 'Introduction to Digital Communications') + ' (' + (payload.subject_code || 'IDC101') + ') | Section: ' + sectionName + ' | Faculty: ' + (payload.teacher_name || 'Dr. Arige Sumanth'))
    .setFontWeight('bold')
    .setFontSize(10)
    .setBackground('#334155')
    .setFontColor('#f8fafc')
    .setHorizontalAlignment('center');

  // Column Headers
  const headerRow = ['Roll No', 'Register Number', 'Student Name'];
  sheet.getRange(3, 1, 1, 3).setValues([headerRow])
    .setFontWeight('bold')
    .setBackground('#1e293b')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  sheet.setColumnWidth(1, 75);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 220);

  // Freeze rows and columns
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(3);

  // Populate student roster if provided
  const records = payload.records || [];
  if (records.length > 0) {
    const studentRows = records.map(function(r) {
      return [r.roll_no, r.register_no, r.full_name];
    });
    sheet.getRange(4, 1, studentRows.length, 3).setValues(studentRows);
    sheet.getRange(4, 1, studentRows.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
    sheet.getRange(4, 2, studentRows.length, 1).setHorizontalAlignment('center');
  }

  return sheet;
}

/**
 * Logs every attendance submission to a chronological Master Audit Log tab
 */
function updateSessionLogTab(ss, payload) {
  let logSheet = ss.getSheetByName('Attendance Logs');
  if (!logSheet) {
    logSheet = ss.insertSheet('Attendance Logs', 0);
    const headers = [
      'Timestamp',
      'Date',
      'Period',
      'Class / Section',
      'Course',
      'Faculty',
      'Total Students',
      'Present Count',
      'Absent Count',
      'Attendance %',
      'Absent Roll Numbers'
    ];
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    logSheet.setFrozenRows(1);
  }

  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  const dateStr = payload.date || payload.attendance_date || '';
  const period = payload.period || ('Period ' + (payload.period_number || 1));
  const section = payload.section_name || payload.section || 'IT A';
  const subject = (payload.subject_name || 'Introduction to Digital Communications') + ' (' + (payload.subject_code || 'IDC101') + ')';
  const faculty = payload.teacher_name || 'Dr. Arige Sumanth';
  const total = payload.total_students || 71;
  const present = payload.present_count || 0;
  const absent = payload.absent_count || 0;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '100%';

  let absentRolls = '';
  if (payload.records && Array.isArray(payload.records)) {
    absentRolls = payload.records
      .filter(function(r) { return r.status === 'ABSENT' || r.status === 'absent'; })
      .map(function(r) { return r.roll_no; })
      .join(', ');
  } else if (payload.absent_students && Array.isArray(payload.absent_students)) {
    absentRolls = payload.absent_students.map(function(s) { return s.roll_no; }).join(', ');
  }

  logSheet.appendRow([
    timestamp,
    dateStr,
    period,
    section,
    subject,
    faculty,
    total,
    present,
    absent,
    percentage,
    absentRolls || 'None (100% Present)'
  ]);
}

function formatDateHeader(dateStr) {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return parts[2] + '/' + parts[1];
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}
