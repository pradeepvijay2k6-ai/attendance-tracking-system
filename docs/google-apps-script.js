/**
 * ==============================================================================
 * SSN IT DEPARTMENT - UNIVERSAL MULTI-FACULTY ATTENDANCE SYNC SCRIPT
 * ==============================================================================
 */

const ROSTER_IT_A = [
  ['001', '3122255002001', 'Aaditya B M'],
  ['002', '3122255002002', 'Adhiti Sudhakar'],
  ['003', '3122255002003', 'Adithya Kumaresan'],
  ['004', '3122255002004', 'Adithya M'],
  ['005', '3122255002005', 'Afsheen S'],
  ['006', '3122255002006', 'Agalya S'],
  ['007', '3122255002007', 'Ajay A'],
  ['008', '3122255002008', 'Akshaya R'],
  ['009', '3122255002009', 'Akshaya R'],
  ['010', '3122255002010', 'Alden B L'],
  ['011', '3122255002011', 'Anas Ahamed S'],
  ['012', '3122255002012', 'Anfara Shyma A'],
  ['013', '3122255002013', 'Anirudh Badri Narayanan'],
  ['014', '3122255002014', 'Aradhana P'],
  ['015', '3122255002015', 'Aravind S'],
  ['016', '3122255002016', 'Architha R'],
  ['017', '3122255002017', 'Arunachalam S'],
  ['018', '3122255002018', 'Arvindh Vijay G'],
  ['019', '3122255002019', 'Ashwin K B'],
  ['020', '3122255002020', 'Bavadharani S'],
  ['021', '3122255002021', 'Benita Mary Alwin'],
  ['022', '3122255002022', 'Charan V'],
  ['023', '3122255002023', 'Chris Bastian Roy'],
  ['024', '3122255002024', 'Dafna Delvis'],
  ['025', '3122255002025', 'Deepika Senthilnathan'],
  ['026', '3122255002026', 'Dhanvanth J M'],
  ['027', '3122255002027', 'Dharanidharan J'],
  ['028', '3122255002028', 'Dharshan R'],
  ['029', '3122255002029', 'Dharshan Sathish Kumar'],
  ['030', '3122255002030', 'Dharshini P K'],
  ['031', '3122255002031', 'Dhesh Sarvajith R'],
  ['032', '3122255002032', 'Divasundar S'],
  ['033', '3122255002033', 'Elamathi B'],
  ['034', '3122255002034', 'Eniya Sree K'],
  ['035', '3122255002035', 'Faizal I'],
  ['036', '3122255002036', 'Gokul Prasanth A'],
  ['037', '3122255002037', 'Gokula Hari Rajan R'],
  ['038', '3122255002038', 'Guru K'],
  ['039', '3122255002039', 'Guru Prasath N'],
  ['040', '3122255002040', 'Haridass C'],
  ['041', '3122255002041', 'Hariharan G'],
  ['042', '3122255002042', 'Harini Bharadwaj'],
  ['043', '3122255002043', 'Harini Devi B'],
  ['044', '3122255002044', 'Harini V'],
  ['045', '3122255002045', 'Harish S'],
  ['046', '3122255002046', 'Harishraam R'],
  ['047', '3122255002047', 'Harshini A'],
  ['048', '3122255002048', 'Harshini N T'],
  ['049', '3122255002049', 'Hemanya D'],
  ['050', '3122255002050', 'Hrishikesh G'],
  ['051', '3122255002051', 'Hubert Bala Joshwin D'],
  ['052', '3122255002052', 'Jeeva K'],
  ['053', '3122255002053', 'Kathir V'],
  ['054', '3122255002054', 'Kewinsanjai M'],
  ['055', '3122255002055', 'Kishore S B'],
  ['056', '3122255002056', 'Kruthika C D'],
  ['057', '3122255002057', 'Lakchitha A'],
  ['058', '3122255002058', 'Ligitha S'],
  ['059', '3122255002059', 'Madhu Mitha S'],
  ['060', '3122255002060', 'Madhuvarshini S'],
  ['061', '3122255002061', 'Madumika R P'],
  ['062', '3122255002062', 'Malavi V'],
  ['063', '3122255002063', 'Maria Rotric Loran L'],
  ['064', '3122255002064', 'Mathesh S'],
  ['065', '3122255002065', 'Menaga M'],
  ['066', '3122255002066', 'Mirthula S Fernando'],
  ['067', '3122255002067', 'Mithin Krishna P S'],
  ['068', '3122255002068', 'Mohamed Rafith A'],
  ['069', '3122255002069', 'Mohammed Aadhil J'],
  ['070', '3122255002070', 'Mohammed Noorul Islam V P'],
  ['071', '3122255002071', 'Mohana Prasath S']
];

const ROSTER_IT_B = [
  ['072', '3122255002072', 'Mohith Priyan Balasubramanian'],
  ['073', '3122255002073', 'Mukesh K'],
  ['074', '3122255002074', 'Mukundhan K'],
  ['075', '3122255002075', 'Nagammai A'],
  ['076', '3122255002076', 'Namish Kadiyala'],
  ['077', '3122255002077', 'Nehaa M S'],
  ['078', '3122255002078', 'Nihitha S'],
  ['079', '3122255002079', 'Nikila G'],
  ['080', '3122255002080', 'Nishanth S'],
  ['081', '3122255002081', 'Nithilaa R'],
  ['082', '3122255002082', 'Nitinraj S'],
  ['083', '3122255002083', 'Parvathi P R'],
  ['084', '3122255002084', 'Pavithra S S M'],
  ['085', '3122255002085', 'Pradeep V'],
  ['086', '3122255002086', 'Pranaya Shree S'],
  ['087', '3122255002087', 'Preetha A'],
  ['088', '3122255002088', 'Prithivi S K'],
  ['089', '3122255002089', 'Priya V'],
  ['090', '3122255002090', 'Priyadharshni S'],
  ['091', '3122255002091', 'Rachel Jacob'],
  ['092', '3122255002092', 'Raghav Karthick'],
  ['093', '3122255002093', 'Ranjitha P'],
  ['094', '3122255002094', 'Ravivarman M'],
  ['095', '3122255002095', 'Renuka Varshini K'],
  ['096', '3122255002096', 'Ritheeshkumar S'],
  ['097', '3122255002097', 'Rithishsaran T K'],
  ['098', '3122255002098', 'Rohit Ram B'],
  ['099', '3122255002099', 'Rohit S'],
  ['100', '3122255002100', 'Rufhus Christopher R'],
  ['101', '3122255002101', 'Rupak K'],
  ['102', '3122255002102', 'Ruthvika V'],
  ['103', '3122255002103', 'Sachit Ram M'],
  ['104', '3122255002104', 'Sahana S'],
  ['105', '3122255002105', 'Saketh Ram Srinivasan'],
  ['106', '3122255002106', 'Sakthi V'],
  ['107', '3122255002107', 'Sanjay S'],
  ['108', '3122255002108', 'Santhosh P S'],
  ['109', '3122255002109', 'Sasikumar R'],
  ['110', '3122255002110', 'Shaahir Meeran Mohaideen M I'],
  ['111', '3122255002111', 'Shafrin Sahaana S'],
  ['112', '3122255002112', 'Shivani K S'],
  ['113', '3122255002113', 'Shivani V'],
  ['114', '3122255002114', 'Shravan Rao'],
  ['115', '3122255002115', 'Shreshta A'],
  ['116', '3122255002116', 'Shweta Mary John'],
  ['117', '3122255002117', 'Siva S'],
  ['118', '3122255002118', 'Sivaprabhu S'],
  ['119', '3122255002119', 'Soumiya S'],
  ['120', '3122255002120', 'Sri Dhanvanth P'],
  ['121', '3122255002121', 'Srinivetha V'],
  ['122', '3122255002122', 'Stefania E'],
  ['123', '3122255002123', 'Steve Winston G'],
  ['124', '3122255002124', 'Subha Shree R K'],
  ['125', '3122255002125', 'Subhasaravanan G'],
  ['126', '3122255002126', 'Sujeetha S'],
  ['127', '3122255002127', 'Sushil P'],
  ['128', '3122255002128', 'Susidharan S'],
  ['129', '3122255002129', 'Tarrun M'],
  ['130', '3122255002130', 'Tejaavarshini E'],
  ['131', '3122255002131', 'Tharika S'],
  ['132', '3122255002132', 'Thejesh J'],
  ['133', '3122255002133', 'Vaibhav Ramesh'],
  ['134', '3122255002134', 'Varshana M'],
  ['135', '3122255002135', 'Vidya Varuni R'],
  ['136', '3122255002136', 'Vignesh M'],
  ['137', '3122255002137', 'Vinu Shreshta Ganesan'],
  ['138', '3122255002138', 'Vishwa R'],
  ['139', '3122255002139', 'Yanush Jayakumar'],
  ['140', '3122255002140', 'Yashwanth A'],
  ['141', '3122255002141', 'Yazhini K']
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Record Matrix Attendance (Dynamic Subject & Faculty Binding)
    recordMatrixAttendance(ss, payload);

    // 2. Record Session Audit Log with Exact Teacher Name
    recordSessionLog(ss, payload);

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Attendance successfully recorded for ' + (payload.teacher_name || 'Faculty Member')
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function recordMatrixAttendance(ss, payload) {
  const sectionName = payload.section_name || payload.section || 'IT A';
  const subjectCode = payload.subject_code || 'IDC101';
  const facultyName = payload.teacher_name || 'Faculty Member';
  const tabName = sectionName + ' - ' + subjectCode;

  const isItB = sectionName.indexOf('IT B') !== -1 || sectionName.indexOf('B') !== -1;
  const roster = isItB ? ROSTER_IT_B : ROSTER_IT_A;

  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);

    // Header Title: Merged across exactly the 3 frozen columns (A1:C1)
    sheet.getRange('A1:C1').merge()
      .setValue('SSN COLLEGE OF ENGINEERING — IT DEPT')
      .setFontWeight('bold')
      .setFontSize(11)
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');

    sheet.getRange('A2:C2').merge()
      .setValue('Course: ' + subjectCode + ' | Section: ' + sectionName + ' | Faculty: ' + facultyName)
      .setFontWeight('bold')
      .setFontSize(9)
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

    // Populate Roster
    sheet.getRange(4, 1, roster.length, 3).setValues(roster);
    sheet.getRange(4, 1, roster.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
    sheet.getRange(4, 2, roster.length, 1).setHorizontalAlignment('center');

    // Freeze exactly 3 rows and 3 columns
    sheet.setFrozenRows(3);
    sheet.setFrozenColumns(3);

    SpreadsheetApp.flush();
  } else {
    // Keep banner updated with actual active subject and faculty
    sheet.getRange('A2:C2').setValue('Course: ' + subjectCode + ' | Section: ' + sectionName + ' | Faculty: ' + facultyName);
  }

  const dateStr = payload.date || payload.attendance_date || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  const periodLabel = payload.period || ('Period ' + (payload.period_number || 1));
  const columnHeader = formatDateHeader(dateStr) + '\n' + periodLabel;

  // Search for date column starting at Column 4 (Col D)
  const lastCol = sheet.getLastColumn();
  let dateColIndex = -1;

  if (lastCol >= 4) {
    const headerRowValues = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
    for (let c = 3; c < headerRowValues.length; c++) {
      if (headerRowValues[c] && String(headerRowValues[c]).trim() === columnHeader.trim()) {
        dateColIndex = c + 1;
        break;
      }
    }
  }

  // If column doesn't exist, create it in next empty column
  if (dateColIndex === -1) {
    dateColIndex = Math.max(lastCol + 1, 4);
    sheet.getRange(3, dateColIndex).setValue(columnHeader)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center')
      .setWrap(true);
    sheet.setColumnWidth(dateColIndex, 95);
  }

  // Parse absent students
  const absentMap = {};
  if (payload.absent_students && Array.isArray(payload.absent_students)) {
    for (let a = 0; a < payload.absent_students.length; a++) {
      const r = String(payload.absent_students[a].roll_no).trim();
      absentMap[r] = true;
      absentMap[padRoll(r)] = true;
    }
  }

  if (payload.records && Array.isArray(payload.records)) {
    for (let b = 0; b < payload.records.length; b++) {
      const rec = payload.records[b];
      const r = String(rec.roll_no).trim();
      const st = String(rec.status).toUpperCase();
      if (st === 'ABSENT') {
        absentMap[r] = true;
        absentMap[padRoll(r)] = true;
      }
    }
  }

  // Generate column data for exact roster count
  const attendanceValues = [];
  const backgroundColors = [];
  const fontColors = [];

  for (let i = 0; i < roster.length; i++) {
    const rollNo = String(roster[i][0]).trim();
    const rollPadded = padRoll(rollNo);

    if (absentMap[rollNo] || absentMap[rollPadded]) {
      attendanceValues.push(['A']);
      backgroundColors.push(['#fee2e2']);
      fontColors.push(['#b91c1c']);
    } else {
      attendanceValues.push(['P']);
      backgroundColors.push(['#dcfce7']);
      fontColors.push(['#15803d']);
    }
  }

  // Write all rows immediately
  const targetRange = sheet.getRange(4, dateColIndex, roster.length, 1);
  targetRange.setValues(attendanceValues);
  targetRange.setBackgrounds(backgroundColors);
  targetRange.setFontColors(fontColors);
  targetRange.setFontWeight('bold');
  targetRange.setHorizontalAlignment('center');
}

function recordSessionLog(ss, payload) {
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
    SpreadsheetApp.flush();
  }

  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  const dateStr = payload.date || payload.attendance_date || '';
  const period = payload.period || ('Period ' + (payload.period_number || 1));
  const section = payload.section_name || payload.section || 'IT A';
  const subject = (payload.subject_name || 'Subject') + ' (' + (payload.subject_code || 'CODE') + ')';
  const faculty = payload.teacher_name || 'Faculty Member';
  const total = payload.total_students || 71;
  const present = payload.present_count || 0;
  const absent = payload.absent_count || 0;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '100%';

  let absentRolls = '';
  if (payload.records && Array.isArray(payload.records)) {
    const absList = [];
    for (let i = 0; i < payload.records.length; i++) {
      if (String(payload.records[i].status).toUpperCase() === 'ABSENT') {
        absList.push(payload.records[i].roll_no);
      }
    }
    absentRolls = absList.join(', ');
  } else if (payload.absent_students && Array.isArray(payload.absent_students)) {
    const absList = [];
    for (let j = 0; j < payload.absent_students.length; j++) {
      absList.push(payload.absent_students[j].roll_no);
    }
    absentRolls = absList.join(', ');
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

/**
 * Utility Function: Run this function directly inside Apps Script Editor to fix all existing tab banners!
 */
function updateAllExistingSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const name = sheet.getName();

    if (name.indexOf('IDC21') !== -1) {
      const section = name.indexOf('IT B') !== -1 ? 'IT B' : 'IT A';
      sheet.getRange('A2:C2').setValue('Course: IDC21 | Section: ' + section + ' | Faculty: Kumaresan Kathirvelu');
    } else if (name.indexOf('IDC101') !== -1) {
      const section = name.indexOf('IT B') !== -1 ? 'IT B' : 'IT A';
      sheet.getRange('A2:C2').setValue('Course: IDC101 | Section: ' + section + ' | Faculty: Dr. Arige Sumanth');
    }
  }
  SpreadsheetApp.flush();
}

function padRoll(numStr) {
  const s = String(numStr);
  if (s.length === 1) return '00' + s;
  if (s.length === 2) return '0' + s;
  return s;
}

function formatDateHeader(dateStr) {
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1];
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}
