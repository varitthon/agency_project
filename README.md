# Triangle Agency Web Application

เว็บแอปพลิเคชันและระบบจัดการตัวละครสำหรับเกมสวมบทบาท **Triangle Agency TTRPG**

## 📂 โครงสร้างโปรเจกต์
- `main/` — โฟลเดอร์หน้าเว็บหลักของระบบ
  - [index.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/index.html) — หน้าแรก (Home) พอร์ทัลของหน่วยงาน Triangle Agency, รายละเอียดองค์กร, ภาพ Lobby, และระบบ Login / Authentication
  - [create-character.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/create-character.html) — ระบบ Onboarding & สร้างตัวละครตัวแทนภาคสนาม (Field Agent Dossier) ตามเอกสาร Character Organization Sheets
  - [profile.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/profile.html) — หน้าระบบแฟ้มประวัติและจัดการข้อมูลตัวละคร (Agent Profile Dossier)
  - [admin.html](file:///C:/Users/user/OneDrive/Desktop/Triangle%20Agency/main/admin.html) — หน้าพอร์ทัลผู้ดูแลระบบ (Central Directorate Management Portal)
- `asset/` — เอกสารคู่มือ, กฎกติกา, และแผ่นชีททางการ (Official Rulebooks, Spreads, Singles & Fillable Sheets PDF)
- `images/` — รูปภาพและโลโก้องค์กรความละเอียดสูง (Logos, Lobby Background, SVG Assets)

## 🚀 ฟีเจอร์หลัก
1. **ธีม Dark Mysteriously Corporate**: ดีไซน์สไตล์หน่วยงานสืบสวนสิ่งเหนือธรรมชาติ
2. **ระบบสร้างตัวละครครบวงจร**:
   - บัญชี & รหัสผ่านความปลอดภัย พร้อมรูปประจำตัว (Agent Photo Upload & Preview)
   - โครงสร้าง ARC (Anomaly, Reality, Competency 9 สายงานตามคู่มือทางการ)
   - Quality Assurances (QA) Matrix คุณสมบัติทั้ง 9 ด้าน
   - แบบสอบถามรับเข้าทำงาน (Welcome, Agent! Questionnaire ทั้ง 7 ข้อ)
   - บันทึกความสามารถ Anomaly Abilities (Success, Special Success, Failure)
   - บันทึกสายสัมพันธ์และเครือข่ายความสัมพันธ์ (Relationships)
   - ลิงก์เปิดอ่านคู่มือ PDF ในตัว
3. **ระบบจัดเก็บข้อมูล**: บันทึกข้อมูลตัวละครลง `localStorage` สำหรับใช้งานเข้าสู่ระบบอัตโนมัติ

---
*Created for Triangle Agency Field Agents.*
