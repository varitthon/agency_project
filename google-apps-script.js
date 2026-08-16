/**
 * ===================================================================
 * TRIANGLE AGENCY - GOOGLE SHEETS DATABASE BACKEND (GOOGLE APPS SCRIPT)
 * ===================================================================
 * 
 * 📌 คำแนะนำวิธีติดตั้งใน Google Sheet:
 * 1. เปิด Google Sheet: https://docs.google.com/spreadsheets/d/1vzmWRsqqpFkf7nMKp5CdsZGVqHHDdNtxCaCItAbnKhM/edit
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดในไฟล์ Code.gs แล้ววางโค้ดชุดนี้ลงไป
 * 4. กดปุ่ม "บันทึก" (Save / ไอคอนแผ่นดิสก์)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การปรับใช้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: Triangle Agency DB API
 *    - ดำเนินการในฐานะ: "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone)   <-- สำคัญมาก! เพื่อให้เว็บเข้าถึงได้
 * 8. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL เว็บแอป" (Web app URL)
 * 9. นำ URL ที่ได้มาใส่ในโปรเจกต์เว็บ Triangle Agency
 * ===================================================================
 */

const SHEET_NAME = 'Agents_Database';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Headers Definition
  const headers = [
    'Username',
    'Password',
    'Role',
    'Agent_ID',
    'Agent_Name',
    'Title',
    'Standing',
    'Anomaly',
    'Reality',
    'Competency',
    'Commendations',
    'Demerits',
    'Burnout',
    'Created_At',
    'Updated_At',
    'Full_Character_JSON'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // Format Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0d0522');
    headerRange.setFontColor('#ffd700');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Space Mono');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 🟢 GET Request: อ่านข้อมูลทั้งหมด
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const accounts = {};

    if (data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const username = String(row[0]).trim();
        if (!username) continue;

        let charData = {};
        try {
          if (row[15]) {
            charData = JSON.parse(row[15]);
          }
        } catch (err) {
          charData = {};
        }

        accounts[username] = {
          username: username,
          password: String(row[1]),
          role: String(row[2]) || 'agent',
          createdAt: String(row[13]) || new Date().toISOString(),
          updatedAt: String(row[14]) || new Date().toISOString(),
          character: Object.keys(charData).length > 0 ? charData : {
            id: String(row[3]) || 'ID-001',
            name: String(row[4]) || username,
            title: String(row[5]) || 'Trainee Field Agent',
            standing: String(row[6]) || 'Good Standing',
            commendations: Number(row[10]) || 0,
            demerits: Number(row[11]) || 0,
            burnout: Number(row[12]) || 0,
            arc: {
              anomaly: String(row[7]) || '',
              reality: String(row[8]) || '',
              competency: String(row[9]) || ''
            }
          }
        };
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      count: Object.keys(accounts).length,
      data: accounts
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 🔵 POST Request: บันทึก / อัปเดต / ลบ ข้อมูล
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const contents = e.postData ? e.postData.contents : '';
    const payload = JSON.parse(contents || '{}');
    const action = payload.action;

    // 1. บันทึกหรืออัปเดตตัวละคร (Save / Update Account)
    if (action === 'saveAccount') {
      const acc = payload.account || {};
      const username = String(acc.username || payload.username || '').trim();
      if (!username) {
        return createResponse('error', 'Username is required');
      }

      const char = acc.character || {};
      const arc = char.arc || {};
      const password = String(acc.password || char.password || '');
      const role = String(acc.role || 'agent');
      const now = new Date().toISOString();
      const jsonStr = JSON.stringify(char);

      const rowValues = [
        username,
        password,
        role,
        char.id || 'ID-001',
        char.name || username,
        char.title || 'Trainee Field Agent',
        char.standing || 'Good Standing',
        arc.anomaly || '',
        arc.reality || '',
        arc.competency || '',
        Number(char.commendations) || 0,
        Number(char.demerits) || 0,
        Number(char.burnout) || 0,
        acc.createdAt || now,
        now,
        jsonStr
      ];

      // ค้นหาแถวเดิมถ้ามีอยู่แล้ว
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === username) {
          rowIndex = i + 1; // 1-indexed
          break;
        }
      }

      if (rowIndex > 0) {
        // รักษา CreatedAt เดิมไว้
        rowValues[13] = data[rowIndex - 1][13] || now;
        sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }

      return createResponse('success', `Saved account ${username} successfully`);
    }

    // 2. ลบบัญชีตัวละคร (Delete Account)
    if (action === 'deleteAccount') {
      const username = String(payload.username || '').trim();
      if (!username) return createResponse('error', 'Username is required');

      const data = sheet.getDataRange().getValues();
      let deleted = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === username) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      return createResponse('success', deleted ? `Deleted ${username}` : `Username ${username} not found`);
    }

    // 3. ซิงค์ข้อมูลทั้งหมด (Bulk Sync All Accounts)
    if (action === 'syncAll') {
      const accounts = payload.accounts || {};
      const keys = Object.keys(accounts);

      // เคลียร์แถวเดิมทั้งหมด (ยกเว้น Header)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      const rowsToAdd = [];
      const now = new Date().toISOString();

      keys.forEach(k => {
        const acc = accounts[k];
        const char = acc.character || {};
        const arc = char.arc || {};
        rowsToAdd.push([
          k,
          String(acc.password || char.password || ''),
          String(acc.role || 'agent'),
          char.id || 'ID-001',
          char.name || k,
          char.title || 'Trainee Field Agent',
          char.standing || 'Good Standing',
          arc.anomaly || '',
          arc.reality || '',
          arc.competency || '',
          Number(char.commendations) || 0,
          Number(char.demerits) || 0,
          Number(char.burnout) || 0,
          acc.createdAt || now,
          now,
          JSON.stringify(char)
        ]);
      });

      if (rowsToAdd.length > 0) {
        sheet.getRange(2, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
      }

      return createResponse('success', `Synced ${rowsToAdd.length} accounts to database`);
    }

    return createResponse('error', `Unknown action: ${action}`);

  } catch (error) {
    return createResponse('error', error.toString());
  }
}

function createResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: status,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}
