/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR ATTENDANCE TRACKING SYSTEM
 * Subject: Introduction to Digital Communications
 * Teacher: Dr. Arige Sumanth
 * Sections: IT A and IT B
 * ==============================================================================
 * 
 * HOW TO SET THIS UP (Takes 1 minute):
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Rename sheet to "IT Attendance - Dr. Arige Sumanth".
 * 3. Go to "Extensions" -> "Apps Script".
 * 4. Delete existing code, paste ALL the code below, and click "Save" (disk icon).
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Select Type: "Web app".
 *    - Description: "Attendance Sync Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy" and Authorize access.
 * 8. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 9. Paste it in your backend/.env:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * ==============================================================================
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Tab name based on Section (e.g. "IT A" or "IT B")
    var sheetName = data.section_name || "Attendance";
    var sheet = ss.getSheetByName(sheetName);
    
    // If tab doesn't exist, create it with student roster headers
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Roll No", "Register No", "Student Name", "Email"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
      sheet.setFrozenRows(1);
      sheet.setFrozenColumns(3);
    }
    
    // Ensure all students exist in the rows
    var existingData = sheet.getDataRange().getValues();
    var studentRowMap = {}; // roll_no -> row index
    
    for (var i = 1; i < existingData.length; i++) {
      var rNo = String(existingData[i][0]).trim();
      if (rNo) {
        studentRowMap[rNo] = i + 1; // 1-indexed row in sheet
      }
    }
    
    // Add any missing students to the roster
    var records = data.records || [];
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no).trim();
      if (!studentRowMap[rNo]) {
        sheet.appendRow([rec.roll_no, rec.register_no, rec.full_name, rec.email]);
        studentRowMap[rNo] = sheet.getLastRow();
      }
    });
    
    // Create new Column for this Date & Period in the Section Tab
    var newCol = sheet.getLastColumn() + 1;
    var columnHeader = data.date + " (" + data.period + ")";
    var headerCell = sheet.getRange(1, newCol);
    headerCell.setValue(columnHeader).setFontWeight("bold").setBackground("#dbeafe").setHorizontalAlignment("center");
    
    // Add Topics Covered as Header Cell Note / Comment
    var topics = (data.topics_covered || "").trim();
    var noteText = "Period: " + data.period +
      "\nSubject: " + (data.subject_name || "Subject") + " (" + (data.subject_code || "") + ")" +
      "\nFaculty: " + (data.teacher_name || "Faculty") +
      "\nTopics Covered: " + (topics || "None entered") +
      "\nPresent: " + data.present_count + " | Absent: " + data.absent_count;
    headerCell.setNote(noteText);
    
    // Mark P (Present) or A (Absent) for each student
    records.forEach(function(rec) {
      var rNo = String(rec.roll_no).trim();
      var targetRow = studentRowMap[rNo];
      if (targetRow) {
        var cell = sheet.getRange(targetRow, newCol);
        var isPresent = (rec.status === "PRESENT");
        
        cell.setValue(isPresent ? "P" : "A");
        cell.setHorizontalAlignment("center");
        cell.setFontWeight("bold");
        
        if (isPresent) {
          cell.setBackground("#dcfce7"); // Green for Present
          cell.setFontColor("#15803d");
        } else {
          cell.setBackground("#fee2e2"); // Red for Absent
          cell.setFontColor("#b91c1c");
        }
      }
    });
    
    // Auto resize column
    sheet.autoResizeColumn(newCol);
    
    // --------------------------------------------------------------------------
    // DEDICATED "Topics & Syllabus Log" EXCEL TAB
    // --------------------------------------------------------------------------
    var topicsSheet = ss.getSheetByName("Topics & Syllabus Log");
    if (!topicsSheet) {
      topicsSheet = ss.insertSheet("Topics & Syllabus Log");
      topicsSheet.appendRow([
        "Timestamp",
        "Attendance Date",
        "Period",
        "Class & Section",
        "Course Code",
        "Subject Name",
        "Faculty Member",
        "Topics Covered in Period",
        "Total Enrolled",
        "Present Count",
        "Absent Count",
        "Attendance %"
      ]);
      topicsSheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#dbeafe").setHorizontalAlignment("center");
      topicsSheet.setFrozenRows(1);
      topicsSheet.setFrozenColumns(4);
    }
    
    var totalStd = Number(data.total_students) || records.length || 0;
    var presCount = Number(data.present_count) || 0;
    var absCount = Number(data.absent_count) || (totalStd - presCount);
    var attPct = totalStd > 0 ? ((presCount / totalStd) * 100).toFixed(2) + "%" : "100.00%";
    
    topicsSheet.appendRow([
      new Date(),
      data.date,
      data.period,
      (data.class_name || "B.Tech IT") + " - " + sheetName,
      data.subject_code || "—",
      data.subject_name || "—",
      data.teacher_name || "—",
      topics || "Standard Curriculum / Lab Session",
      totalStd,
      presCount,
      absCount,
      attPct
    ]);
    
    var lastLogRow = topicsSheet.getLastRow();
    topicsSheet.getRange(lastLogRow, 1, 1, 12).setVerticalAlignment("middle");
    topicsSheet.getRange(lastLogRow, 8).setWrap(true); // Wrap Topics Covered column
    topicsSheet.autoResizeColumns(1, 12);
    topicsSheet.setColumnWidth(8, 300); // Generous width for topics covered text
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Attendance and Topics Covered recorded in " + sheetName + " and Topics & Syllabus Log for " + columnHeader,
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
    message: "Google Sheet Attendance & Topics Covered Sync Webhook is active and running."
  })).setMimeType(ContentService.MimeType.JSON);
}
