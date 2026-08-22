/**
 * ==============================================================================
 * SSN IT DEPARTMENT - UNIVERSAL ATTENDANCE SYNC SCRIPT (PRODUCTION)
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
  lock.tryLock(20000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Update Matrix Register Tab (Guaranteed Immediate First-Time Write)
    updateAttendanceMatrixTab(ss, payload);

    // 2. Update Session Log Tab
    updateSessionLogTab(ss, payload);

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Attendance recorded on first submission successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function updateAttendanceMatrixTab(ss, payload) {
  const sectionName = payload.section_name || payload.section || 'IT A';
  const subjectCode = payload.subject_code || 'IDC101';
  const tabName = sectionName + ' - ' + subjectCode;

  const isItB = sectionName.indexOf('IT B') !== -1 || sectionName.indexOf('B') !== -1;
  const roster = isItB ? ROSTER_IT_B : ROSTER_IT_A;
  const expectedStudentCount = roster.length; // 71 for IT A, 70 for IT B

  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = createFormattedMatrixSheet(ss, tabName, sectionName, payload, roster);
    SpreadsheetApp.flush();
  }

  // Double-check roster exists
  const currentLastRow = sheet.getLastRow();
  if (currentLastRow < (expectedStudentCount + 3)) {
    populateRoster(sheet, roster);
    SpreadsheetApp.flush();
  }

  const dateStr = payload.date || payload.attendance_date || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  const periodLabel = payload.period || ('Period ' + (payload.period_number || 1));
  const columnHeader = formatDateHeader(dateStr) + '\n' + periodLabel;

  // Find or create date column
  const lastCol = Math.max(sheet.getLastColumn(), 3);
  const headers = sheet.getRange(3, 1, 1, Math.max(lastCol, 4)).getValues()[0];
  let dateColIndex = -1;

  for (let c = 3; c < headers.length; c++) {
    if (headers[c] && headers[c].toString().trim() === columnHeader.trim()) {
      dateColIndex = c + 1;
      break;
    }
  }

  if (dateColIndex === -1) {
    dateColIndex = lastCol + 1;
    sheet.getRange(3, dateColIndex).setValue(columnHeader)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center')
      .setWrap(true);
    sheet.setColumnWidth(dateColIndex, 95);
  }

  // Parse absentees
  const records = payload.records || [];
  const absentSet = new Set();
  if (payload.absent_students && Array.isArray(payload.absent_students)) {
    payload.absent_students.forEach(function(s) {
      absentSet.add(s.roll_no.toString().trim());
      absentSet.add(s.roll_no.toString().trim().padStart(3, '0'));
    });
  }

  // Build matrix values for ALL students in roster
  const attendanceValues = [];
  const backgroundColors = [];
  const fontColors = [];

  for (let i = 0; i < roster.length; i++) {
    const rollNo = roster[i][0].toString().trim();
    const rollPadded = rollNo.padStart(3, '0');

    const rec = records.find(function(item) {
      const r = (item.roll_no || '').toString().trim();
      return r === rollNo || r === rollPadded;
    });

    const isAbsent = absentSet.has(rollNo) || absentSet.has(rollPadded) || (rec && (rec.status === 'ABSENT' || rec.status === 'absent'));

    if (isAbsent) {
      attendanceValues.push(['A']);
      backgroundColors.push(['#fee2e2']); // Red background
      fontColors.push(['#b91c1c']);       // Dark red text
    } else {
      attendanceValues.push(['P']);
      backgroundColors.push(['#dcfce7']); // Green background
      fontColors.push(['#15803d']);       // Dark green text
    }
  }

  // Apply immediately to the date column
  const targetRange = sheet.getRange(4, dateColIndex, roster.length, 1);
  targetRange.setValues(attendanceValues);
  targetRange.setBackgrounds(backgroundColors);
  targetRange.setFontColors(fontColors);
  targetRange.setFontWeight('bold');
  targetRange.setHorizontalAlignment('center');

  SpreadsheetApp.flush();
}

function populateRoster(sheet, roster) {
  sheet.getRange(4, 1, roster.length, 3).setValues(roster);
  sheet.getRange(4, 1, roster.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
  sheet.getRange(4, 2, roster.length, 1).setHorizontalAlignment('center');
}

function createFormattedMatrixSheet(ss, tabName, sectionName, payload, roster) {
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

  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(3);

  populateRoster(sheet, roster);

  return sheet;
}

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
    if (parts.length === 3) return parts[2] + '/' + parts[1];
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}
