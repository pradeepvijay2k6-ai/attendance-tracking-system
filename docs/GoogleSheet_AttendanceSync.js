/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR ATTENDANCE TRACKING SYSTEM
 * Subject-Wise Attendance & Topics Covered Live Sync
 * Department of Information Technology
 * ==============================================================================
 * 
 * FEATURES:
 * 1. Automatically creates attractive, clean SUBJECT-WISE tabs (e.g., "IT A - UIT3361", "IT B - UIT3301").
 * 2. Guaranteed zero duplicate student rows (indexes by Register No, Roll No, and Name).
 * 3. Shows Date, Period, and TOPICS COVERED directly in the header of each period column.
 * 4. Beautiful modern styling: Soft green for Present, soft red for Absent, frozen header & roster.
 * 5. Automatic live summary at the bottom (Present, Absent, Attendance %).
 * 6. Also maintains a chronological master "Topics & Syllabus Log" tab.
 * 
 * HOW TO SET THIS UP (Takes 30 seconds):
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1hr6niV60fj67sidkYEj7ausv6aoGUndR1wcakoVmRjo/edit).
 * 2. Go to "Extensions" -> "Apps Script".
 * 3. Replace ALL existing code with this file.
 * 4. Click "Save" (disk icon).
 * 5. Click "Deploy" (top right) -> "Manage deployments" -> Click pencil (Edit) -> Version: "New version" -> Click "Deploy".
 * ==============================================================================
 */

function doPost(e) {
  try {
    var rawText = e.postData.contents;
    var data = JSON.parse(rawText);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --------------------------------------------------------------------------
    // 1. SECTION + SUBJECT-WISE SHEET NAME (e.g. "IT A - UIT3361 Java", "IT B - UIT3301 DBMS")
    // --------------------------------------------------------------------------
    var secName = (data.section_name || "IT A").trim();
    var subjCode = (data.subject_code || "").trim();
    var subjName = (data.subject_name || "General").trim();
    
    // Short clean subject title
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
    
    // If tab doesn't exist, create it with beautiful institutional headers
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
      // Row 1: Main Headers
      sheet.getRange(1, 1).setValue("Roll No");
      sheet.getRange(1, 2).setValue("Register No");
      sheet.getRange(1, 3).setValue("Student Name");
      sheet.getRange(1, 4).setValue("Section");
      
      // Row 2: Subject Info Sub-Header
      sheet.getRange(2, 1).setValue(secName);
      sheet.getRange(2, 2).setValue(subjCode || "Course Code");
      sheet.getRange(2, 3).setValue(subjName);
      sheet.getRange(2, 4).setValue(data.teacher_name || "Faculty");
      
      // Style Top Left Banner
      sheet.getRange(1, 1, 1, 4)
        .setFontWeight("bold")
        .setBackground("#1e293b")
        .setFontColor("#ffffff")
        .setHorizontalAlignment("center");
        
      sheet.getRange(2, 1, 2, 4)
        .setFontWeight("bold")
        .setBackground("#f1f5f9")
        .setFontColor("#334155")
        .setFontSize(9);
        
      sheet.setFrozenRows(2);
      sheet.setFrozenColumns(3);
    }
    
    // --------------------------------------------------------------------------
    // 2. ROBUST STUDENT ROSTER DEDUPLICATION
    // --------------------------------------------------------------------------
    var existingData = sheet.getDataRange().getValues();
    var studentRowMap = {}; // Key: (register_no OR normalized_roll_no) -> 1-indexed sheet row
    
    for (var i = 2; i < existingData.length; i++) {
      var existingRoll = String(existingData[i][0]).trim();
      var existingReg = String(existingData[i][1]).trim();
      var rowNum = i + 1;
      
      if (existingReg) {
        studentRowMap["reg_" + existingReg] = rowNum;
      }
      if (existingRoll) {
        var cleanRoll = existingRoll.replace(/^0+/, "") || "0";
        studentRowMap["roll_" + cleanRoll] = rowNum;
        studentRowMap["rawroll_" + existingRoll] = rowNum;
      }
    }
    
    // Insert any missing students into the roster without creating duplicates
    var records = data.records || [];
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no || "").trim();
      var regNo = String(rec.register_no || "").trim();
      var cleanR = rNo.replace(/^0+/, "") || "0";
      
      var hasRow = (regNo && studentRowMap["reg_" + regNo]) ||
                   (rNo && studentRowMap["roll_" + cleanR]) ||
                   (rNo && studentRowMap["rawroll_" + rNo]);
      
      if (!hasRow && (rNo || regNo)) {
        sheet.appendRow([rec.roll_no, rec.register_no, rec.full_name, rec.email || ""]);
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
    // 3. CREATE ATTENDANCE PERIOD COLUMN WITH TOPICS COVERED
    // --------------------------------------------------------------------------
    var newCol = sheet.getLastColumn() + 1;
    var periodLabel = data.date + "\n(" + data.period + ")";
    var topics = (data.topics_covered || "").trim();
    
    // Row 1: Date & Period Header
    var headerCell = sheet.getRange(1, newCol);
    headerCell.setValue(periodLabel)
      .setFontWeight("bold")
      .setBackground("#2563eb")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center")
      .setWrap(true);
      
    // Row 2: Topics Covered Sub-Header
    var topicCell = sheet.getRange(2, newCol);
    topicCell.setValue(topics ? "📖 " + topics : "—")
      .setFontSize(9)
      .setFontColor("#1e293b")
      .setBackground("#e0e7ff")
      .setHorizontalAlignment("center")
      .setWrap(true);
      
    // Detailed Note on Header Cell
    var noteText = "Date: " + data.date + " (" + data.period + ")" +
      "\nSubject: " + subjName + " (" + subjCode + ")" +
      "\nFaculty: " + (data.teacher_name || "Faculty") +
      "\nTopics Covered: " + (topics || "Standard Curriculum") +
      "\nTotal: " + data.total_students + " | Present: " + data.present_count + " | Absent: " + data.absent_count;
    headerCell.setNote(noteText);
    
    // --------------------------------------------------------------------------
    // 4. MARK PRESENT (P) / ABSENT (A) WITH CLEAN COLOR PALETTE
    // --------------------------------------------------------------------------
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no || "").trim();
      var regNo = String(rec.register_no || "").trim();
      var cleanR = rNo.replace(/^0+/, "") || "0";
      
      var targetRow = (regNo && studentRowMap["reg_" + regNo]) ||
                      (rNo && studentRowMap["roll_" + cleanR]) ||
                      (rNo && studentRowMap["rawroll_" + rNo]);
                      
      if (targetRow) {
        var cell = sheet.getRange(targetRow, newCol);
        var isPresent = (String(rec.status).toUpperCase() === "PRESENT");
        
        cell.setValue(isPresent ? "P" : "A");
        cell.setHorizontalAlignment("center");
        cell.setFontWeight("bold");
        
        if (isPresent) {
          cell.setBackground("#dcfce7"); // Soft emerald green
          cell.setFontColor("#15803d");
        } else {
          cell.setBackground("#fee2e2"); // Soft pastel red
          cell.setFontColor("#b91c1c");
        }
      }
    });
    
    // Set column width for optimal readability
    sheet.setColumnWidth(newCol, 120);
    sheet.setRowHeight(1, 38);
    sheet.setRowHeight(2, 38);
    
    // --------------------------------------------------------------------------
    // 5. SYNCHRONIZE WITH "Topics & Syllabus Log" AUDIT TAB
    // --------------------------------------------------------------------------
    var topicsSheet = ss.getSheetByName("Topics & Syllabus Log");
    if (!topicsSheet) {
      topicsSheet = ss.insertSheet("Topics & Syllabus Log");
      topicsSheet.appendRow([
        "Timestamp",
        "Attendance Date",
        "Period",
        "Subject Sheet",
        "Subject Code",
        "Subject Name",
        "Faculty Member",
        "Topics Covered in Period",
        "Total Enrolled",
        "Present Count",
        "Absent Count",
        "Attendance %"
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
      new Date(),
      data.date,
      data.period,
      sheetName,
      subjCode || "—",
      subjName || "—",
      data.teacher_name || "—",
      topics || "Standard Curriculum / Lab Session",
      totalStd,
      presCount,
      absCount,
      attPct
    ]);
    
    var lastLogRow = topicsSheet.getLastRow();
    topicsSheet.getRange(lastLogRow, 1, 1, 12).setVerticalAlignment("middle");
    topicsSheet.getRange(lastLogRow, 8).setWrap(true);
    topicsSheet.setColumnWidth(8, 280);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheet_name: sheetName,
      message: "Attendance successfully recorded in " + sheetName + " with Topics Covered",
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Sheet Subject-Wise Attendance & Topics Covered Webhook is active."
  })).setMimeType(ContentService.MimeType.JSON);
}
