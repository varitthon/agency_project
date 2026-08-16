# Triangle Agency Web Application

เว็บแอปพลิเคชันและระบบจัดการตัวละครสำหรับเกมสวมบทบาท **Triangle Agency TTRPG**

## 📂 โครงสร้างโปรเจกต์
- [index.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/index.html) — หน้าแรก (Home) พอร์ทัลของหน่วยงาน Triangle Agency, รายละเอียดองค์กร, ภาพ Lobby, และระบบ Login / Authentication
- `main/` — โฟลเดอร์ระบบปฏิบัติการภายใน
  - [create-character.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/create-character.html) — ระบบ Onboarding & สร้างตัวละครตัวแทนภาคสนาม (Field Agent Dossier) ตามเอกสาร Character Organization Sheets
  - [profile.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/profile.html) — หน้าระบบแฟ้มประวัติและจัดการข้อมูลตัวละคร (Agent Profile Dossier)
  - [admin.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/admin.html) — หน้าพอร์ทัลผู้ดูแลระบบ (Central Directorate Management Portal)
  - [db.js](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/db.js) — ระบบจัดการฐานข้อมูล Dual-Layer (Local Storage + Google Sheets Cloud Database)
- [google-apps-script.js](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/google-apps-script.js) — สคริปต์ Backend สำหรับติดตั้งใน Google Apps Script เพื่อเชื่อมต่อ Google Sheets
- `asset/` — เอกสารคู่มือ, กฎกติกา, และแผ่นชีททางการ (Official Rulebooks, Spreads, Singles & Fillable Sheets PDF)
- `images/` — รูปภาพและโลโก้องค์กรความละเอียดสูง (Logos, Lobby Background, SVG Assets)

## 📊 ฐานข้อมูล Google Sheets (Central Database)
- **Google Spreadsheet:** [Triangle Agency Characters Database](https://docs.google.com/spreadsheets/d/1vzmWRsqqpFkf7nMKp5CdsZGVqHHDdNtxCaCItAbnKhM/edit)
- **วิธีเชื่อมต่อ:**
  1. เปิด Google Sheet ด้านบน ➔ ไปที่ **ส่วนขยาย (Extensions)** ➔ **Apps Script**
  2. คัดลอกโค้ดจาก [`google-apps-script.js`](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/google-apps-script.js) ไปวางใน `Code.gs` แล้วกด Save
  3. กด **ทำให้ใช้งานได้ (Deploy)** ➔ **การปรับใช้รายการใหม่ (New deployment)** ➔ เลือก **เว็บแอป (Web app)**
  4. ตั้งค่า **ผู้ที่มีสิทธิ์เข้าถึง (Who has access)** เป็น **ทุกคน (Anyone)** แล้วกด Deploy
  5. นำ Web App URL ที่ได้ไปวางในหน้า [admin.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/admin.html) (ปุ่ม `📊 Google Sheets DB`)

## 🚀 ฟีเจอร์หลัก
1. **ธีม Dark Mysteriously Corporate**: ดีไซน์สไตล์หน่วยงานสืบสวนสิ่งเหนือธรรมชาติ
2. **ระบบสร้างตัวละครครบวงจร**:
   - บัญชี & รหัสผ่านความปลอดภัย พร้อมรูปประจำตัว (Agent Photo Upload & Auto-Compress)
   - โครงสร้าง ARC (Anomaly, Reality, Competency 9 สายงานตามคู่มือทางการ)
   - Quality Assurances (QA) Matrix คุณสมบัติทั้ง 9 ด้าน
   - แบบสอบถามรับเข้าทำงาน (Welcome, Agent! Questionnaire ทั้ง 7 ข้อ)
   - บันทึกความสามารถ Anomaly Abilities (Success, Special Success, Failure)
   - บันทึกสายสัมพันธ์และเครือข่ายความสัมพันธ์ (Relationships)
   - ลิงก์เปิดอ่านคู่มือ PDF ในตัว
3. **ระบบฐานข้อมูลแบบ 2 ชั้น (Dual-Layer Database)**:
   - **Local Storage**: ใช้งานได้รวดเร็วทันทีและรองรับโหมดออฟไลน์
   - **Google Sheets Cloud DB**: ซิงค์ข้อมูลขึ้น Google Spreadsheet กลางได้แบบ Real-time

---
*Created for Triangle Agency Field Agents.*
