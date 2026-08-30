/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR ATTENDANCE TRACKING SYSTEM
 * Section + Subject-Wise Attendance with Live % Sum & Clean Headings
 * Department of Information Technology
 * ==============================================================================
 * 
 * COLUMN STRUCTURE:
 * - Col A: Roll No (e.g. 1, 2, 3)
 * - Col B: Register No (e.g. 3122255002001)
 * - Col C: Student Name (e.g. Aaditya B M)
 * - Col D: Attended (P) (Live sum formula: =COUNTIF(G3:ZZ3, "P"))
 * - Col E: Total Classes (Live sum formula: =COUNTIF(G3:ZZ3, "P") + COUNTIF(G3:ZZ3, "A"))
 * - Col F: Attendance % (Live percentage formula: =IF(E3>0, D3/E3, 1))
 * - Col G, H, I, ...: Period Attendance Columns (Date on Row 1, Topics Covered on Row 2)
 * ==============================================================================
 */

function doPost(e) {
  try {
    var rawText = e.postData.contents;
    var data = JSON.parse(rawText);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --------------------------------------------------------------------------
    // 1. SECTION + SUBJECT-WISE SHEET NAME (e.g. "IT A - UIT3361 - OOP Java")
    // --------------------------------------------------------------------------
    var secName = (data.section_name || "IT A").trim();
    var subjCode = (data.subject_code || "").trim();
    var subjName = (data.subject_name || "General").trim();
    
    var shortTitle = subjName
      .replace("Object-Oriented Programming Using Java", "OOP Java")
      .replace("Mathematical Foundations for Computing Technology", "Maths")
      .replace("Principles of Software Engineering and Practices", "Software Engg")
      .replace("Universal Human Values 2: Understanding Harmony", "UHV")
      .replace("Design Thinking, Innovation and Entrepreneurship", "Design Thinking")
      .replace("Digital Systems and Microprocessors Design", "Digital Systems")
      .replace("Introduction to Digital Communication", "Dig Comm")
      .replace("Environmental Science and Engineering", "EVS");
      
    var tabLabel = subjCode ? (subjCode + " - " + shortTitle.substring(0, 14)) : shortTitle.substring(0, 20);
    var sheetName = secName + " - " + tabLabel;
    if (sheetName.length > 35) {
      sheetName = sheetName.substring(0, 35);
    }
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // --------------------------------------------------------------------------
    // 2. ALWAYS ENFORCE PROPER FIXED HEADERS (COLUMNS A TO F)
    // --------------------------------------------------------------------------
    // Row 1: Primary Column Headings
    sheet.getRange(1, 1).setValue("Roll No");
    sheet.getRange(1, 2).setValue("Register No");
    sheet.getRange(1, 3).setValue("Student Name");
    sheet.getRange(1, 4).setValue("Attended (P)");
    sheet.getRange(1, 5).setValue("Total Classes");
    sheet.getRange(1, 6).setValue("Attendance %");
    
    // Row 2: Context Sub-Headings
    sheet.getRange(2, 1).setValue(secName);
    sheet.getRange(2, 2).setValue(subjCode || "Course Code");
    sheet.getRange(2, 3).setValue(subjName);
    sheet.getRange(2, 4).setValue(data.teacher_name || "Faculty");
    sheet.getRange(2, 5).setValue("Conducted");
    sheet.getRange(2, 6).setValue("Cumulative %");
    
    // Styling Row 1 (Headers)
    sheet.getRange(1, 1, 1, 3)
      .setFontWeight("bold")
      .setBackground("#1e293b") // Dark Slate
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.getRange(1, 4, 1, 6)
      .setFontWeight("bold")
      .setBackground("#0369a1") // Deep Blue Summary
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    // Styling Row 2 (Sub-Headers)
    sheet.getRange(2, 1, 2, 3)
      .setFontWeight("bold")
      .setBackground("#f1f5f9")
      .setFontColor("#334155")
      .setFontSize(9)
      .setHorizontalAlignment("center");
      
    sheet.getRange(2, 4, 2, 6)
      .setFontWeight("bold")
      .setBackground("#e0f2fe")
      .setFontColor("#0369a1")
      .setFontSize(9)
      .setHorizontalAlignment("center");
      
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(0); // Smooth scrolling with NO freeze line
    
    // --------------------------------------------------------------------------
    // 3. ROBUST STUDENT ROSTER DEDUPLICATION
    // --------------------------------------------------------------------------
    var existingData = sheet.getDataRange().getValues();
    var studentRowMap = {};
    
    for (var i = 2; i < existingData.length; i++) {
      var existingRoll = String(existingData[i][0]).trim();
      var existingReg = String(existingData[i][1]).trim();
      var rowNum = i + 1;
      
      if (existingReg) studentRowMap["reg_" + existingReg] = rowNum;
      if (existingRoll) {
        var cleanRoll = existingRoll.replace(/^0+/, "") || "0";
        studentRowMap["roll_" + cleanRoll] = rowNum;
        studentRowMap["rawroll_" + existingRoll] = rowNum;
      }
    }
    
    var records = data.records || [];
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no || "").trim();
      var regNo = String(rec.register_no || "").trim();
      var cleanR = rNo.replace(/^0+/, "") || "0";
      
      var hasRow = (regNo && studentRowMap["reg_" + regNo]) ||
                   (rNo && studentRowMap["roll_" + cleanR]) ||
                   (rNo && studentRowMap["rawroll_" + rNo]);
      
      if (!hasRow && (rNo || regNo)) {
        sheet.appendRow([rec.roll_no, rec.register_no, rec.full_name, 0, 0, "100.0%"]);
        var newRowIdx = sheet.getLastRow();
        if (regNo) studentRowMap["reg_" + regNo] = newRowIdx;
        if (rNo) {
          studentRowMap["roll_" + cleanR] = newRowIdx;
          studentRowMap["rawroll_" + rNo] = newRowIdx;
        }
      }
    });
    
    // Refresh student map after insertions
    existingData = sheet.getDataRange().getValues();
    studentRowMap = {};
    for (var j = 2; j < existingData.length; j++) {
      var eRoll = String(existingData[j][0]).trim();
      var eReg = String(existingData[j][1]).trim();
      var rIdx = j + 1;
      if (eReg) studentRowMap["reg_" + eReg] = rIdx;
      if (eRoll) {
        studentRowMap["roll_" + (eRoll.replace(/^0+/, "") || "0")] = rIdx;
        studentRowMap["rawroll_" + eRoll] = rIdx;
      }
    }
    
    // --------------------------------------------------------------------------
    // 4. FIND OR CREATE PERIOD COLUMN (Starts from Column G / Column 7)
    // --------------------------------------------------------------------------
    var periodLabel = data.date + "\n(" + data.period + ")";
    var topics = (data.topics_covered || "").trim();
    
    var targetCol = 0;
    var maxCols = sheet.getLastColumn();
    
    // Check if this date + period column already exists (from Column G onwards)
    if (maxCols >= 7 && existingData[0]) {
      for (var c = 6; c < maxCols; c++) {
        if (String(existingData[0][c]).replace(/\s+/g, '') === periodLabel.replace(/\s+/g, '')) {
          targetCol = c + 1; // 1-indexed column
          break;
        }
      }
    }
    
    // If not found, append a new period column
    if (targetCol === 0) {
      targetCol = Math.max(maxCols + 1, 7);
    }
    
    // Row 1: Date & Period Header
    var headerCell = sheet.getRange(1, targetCol);
    headerCell.setValue(periodLabel)
      .setFontWeight("bold")
      .setBackground("#2563eb") // Royal Blue
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center")
      .setWrap(true);
      
    // Row 2: Topics Covered Sub-Header
    var topicCell = sheet.getRange(2, targetCol);
    topicCell.setValue(topics ? "📖 " + topics : "—")
      .setFontSize(9)
      .setFontColor("#1e293b")
      .setBackground("#e0e7ff") // Soft Lavender
      .setHorizontalAlignment("center")
      .setWrap(true);
      
    var noteText = "Date: " + data.date + " (" + data.period + ")" +
      "\nSubject: " + subjName + " (" + subjCode + ")" +
      "\nSection: " + secName +
      "\nFaculty: " + (data.teacher_name || "Faculty") +
      "\nTopics Covered: " + (topics || "Standard Curriculum") +
      "\nTotal: " + data.total_students + " | Present: " + data.present_count + " | Absent: " + data.absent_count;
    headerCell.setNote(noteText);
    
    // --------------------------------------------------------------------------
    // 5. MARK PRESENT (P) / ABSENT (A)
    // --------------------------------------------------------------------------
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no || "").trim();
      var regNo = String(rec.register_no || "").trim();
      var cleanR = rNo.replace(/^0+/, "") || "0";
      
      var targetRow = (regNo && studentRowMap["reg_" + regNo]) ||
                      (rNo && studentRowMap["roll_" + cleanR]) ||
                      (rNo && studentRowMap["rawroll_" + rNo]);
                      
      if (targetRow) {
        var cell = sheet.getRange(targetRow, targetCol);
        var isPresent = (String(rec.status).toUpperCase() === "PRESENT");
        
        cell.setValue(isPresent ? "P" : "A");
        cell.setHorizontalAlignment("center");
        cell.setFontWeight("bold");
        
        if (isPresent) {
          cell.setBackground("#dcfce7"); // Soft green
          cell.setFontColor("#15803d");
        } else {
          cell.setBackground("#fee2e2"); // Soft red
          cell.setFontColor("#b91c1c");
        }
      }
    });
    
    // --------------------------------------------------------------------------
    // 6. UPDATE ATTENDANCE TOTALS & PERCENTAGE FORMULAS (COLUMNS D, E, F)
    // --------------------------------------------------------------------------
    var totalStudentRows = sheet.getLastRow();
    if (totalStudentRows >= 3) {
      for (var r = 3; r <= totalStudentRows; r++) {
        // Col D: Attended Count (=COUNTIF(G3:ZZ3, "P"))
        sheet.getRange(r, 4).setFormula('=COUNTIF(G' + r + ':ZZ' + r + ', "P")')
          .setHorizontalAlignment("center")
          .setFontWeight("bold")
          .setFontColor("#15803d");
          
        // Col E: Total Conducted (=COUNTIF(G3:ZZ3, "P") + COUNTIF(G3:ZZ3, "A"))
        sheet.getRange(r, 5).setFormula('=(COUNTIF(G' + r + ':ZZ' + r + ', "P") + COUNTIF(G' + r + ':ZZ' + r + ', "A"))')
          .setHorizontalAlignment("center")
          .setFontWeight("bold")
          .setFontColor("#334155");
          
        // Col F: Attendance % (=IF(E3>0, D3/E3, 1))
        sheet.getRange(r, 6).setFormula('=IF(E' + r + '>0, D' + r + '/E' + r + ', 1)')
          .setHorizontalAlignment("center")
          .setFontWeight("bold")
          .setNumberFormat("0.0%");
      }
    }
    
    // Set Clean Standard Column Widths
    sheet.setColumnWidth(1, 65);  // Roll No
    sheet.setColumnWidth(2, 120); // Register No
    sheet.setColumnWidth(3, 180); // Student Name
    sheet.setColumnWidth(4, 95);  // Attended (P)
    sheet.setColumnWidth(5, 95);  // Total Classes
    sheet.setColumnWidth(6, 105); // Attendance %
    sheet.setColumnWidth(targetCol, 125); // Period Column
    sheet.setRowHeight(1, 38);
    sheet.setRowHeight(2, 38);
    
    // --------------------------------------------------------------------------
    // 7. SYNCHRONIZE WITH "Topics & Syllabus Log" AUDIT TAB
    // --------------------------------------------------------------------------
    var topicsSheet = ss.getSheetByName("Topics & Syllabus Log");
    if (!topicsSheet) {
      topicsSheet = ss.insertSheet("Topics & Syllabus Log");
      topicsSheet.appendRow([
        "Timestamp", "Attendance Date", "Period", "Section & Subject Sheet",
        "Subject Code", "Subject Name", "Faculty Member", "Topics Covered in Period",
        "Total Enrolled", "Present Count", "Absent Count", "Attendance %"
      ]);
      topicsSheet.getRange(1, 1, 1, 12)
        .setFontWeight("bold")
        .setBackground("#1e293b")
        .setFontColor("#ffffff")
        .setHorizontalAlignment("center");
      topicsSheet.setFrozenRows(1);
    }
    
    var totalStd = Number(data.total_students) || records.length || 0;
    var presCount = Number(data.present_count) || 0;
    var absCount = Number(data.absent_count) || (totalStd - presCount);
    var attPct = totalStd > 0 ? ((presCount / totalStd) * 100).toFixed(2) + "%" : "100.00%";
    
    topicsSheet.appendRow([
      new Date(), data.date, data.period, sheetName,
      subjCode || "—", subjName || "—", data.teacher_name || "—",
      topics || "Standard Curriculum / Lab Session",
      totalStd, presCount, absCount, attPct
    ]);
    
    var lastLogRow = topicsSheet.getLastRow();
    topicsSheet.getRange(lastLogRow, 1, 1, 12).setVerticalAlignment("middle");
    topicsSheet.getRange(lastLogRow, 8).setWrap(true);
    topicsSheet.setColumnWidth(8, 280);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheet_name: sheetName,
      message: "Attendance recorded in " + sheetName,
      topics_covered: topics,
      total: totalStd,
      present: presCount,
      absent: absCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Utility Function: Run this function once from the Apps Script editor to clean and fix all headers across every sheet tab!
 */
function fixAllSheetHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (name === "Topics & Syllabus Log") return;
    
    sheet.getRange(1, 1).setValue("Roll No");
    sheet.getRange(1, 2).setValue("Register No");
    sheet.getRange(1, 3).setValue("Student Name");
    sheet.getRange(1, 4).setValue("Attended (P)");
    sheet.getRange(1, 5).setValue("Total Classes");
    sheet.getRange(1, 6).setValue("Attendance %");
    
    sheet.getRange(1, 1, 1, 3)
      .setFontWeight("bold")
      .setBackground("#1e293b")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.getRange(1, 4, 1, 6)
      .setFontWeight("bold")
      .setBackground("#0369a1")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(0);
    
    var lastRow = sheet.getLastRow();
    if (lastRow >= 3) {
      for (var r = 3; r <= lastRow; r++) {
        sheet.getRange(r, 4).setFormula('=COUNTIF(G' + r + ':ZZ' + r + ', "P")');
        sheet.getRange(r, 5).setFormula('=(COUNTIF(G' + r + ':ZZ' + r + ', "P") + COUNTIF(G' + r + ':ZZ' + r + ', "A"))');
        sheet.getRange(r, 6).setFormula('=IF(E' + r + '>0, D' + r + '/E' + r + ', 1)').setNumberFormat("0.0%");
      }
    }
  });
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Sheet Section-Specific Subject-Wise Webhook is running."
  })).setMimeType(ContentService.MimeType.JSON);
}
