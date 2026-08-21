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
    
    // Create new Column for this Date & Period
    var newCol = sheet.getLastColumn() + 1;
    var columnHeader = data.date + " (" + data.period + ")";
    sheet.getRange(1, newCol).setValue(columnHeader).setFontWeight("bold").setBackground("#dbeafe").setHorizontalAlignment("center");
    
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
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Attendance recorded in " + sheetName + " for " + columnHeader,
      total: data.total_students,
      present: data.present_count,
      absent: data.absent_count
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
    message: "Google Sheet Attendance Sync Webhook is running and ready to receive attendance."
  })).setMimeType(ContentService.MimeType.JSON);
}
