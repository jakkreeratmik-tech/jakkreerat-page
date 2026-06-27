# 📍 ระบบเช็คอินผ่านโลเคชั่น
# Location-Based Check-in System (Free)

ระบบเช็คอินฟรีที่ใช้ GPS เพื่อตรวจสอบตำแหน่งของผู้ใช้ ผู้ใช้สามารถเช็คอินได้เฉพาะเมื่ออยู่ในพื้นที่ที่กำหนดเท่านั้น

## 🎯 คุณสมบัติหลัก

✅ **เช็คอินผ่านตำแหน่ง GPS**
- ใช้ Geolocation API ของเบราว์เซอร์
- ตรวจสอบระยะห่างจากสถานที่อัตโนมัติ
- ความแม่นยำระบุได้

✅ **ประวัติเช็คอิน**
- บันทึกประวัติการเช็คอินทั้งหมด
- แสดงเวลา สถานที่ และระยะห่าง
- ล้างประวัติได้

✅ **สถิติและวิเคราะห์**
- จำนวนเช็คอินทั้งหมด
- เช็คอินในสัปดาห์นี้
- เช็คอินวันนี้
- สถานที่ที่เข้าชุมชนมากที่สุด

✅ **ตั้งค่าผู้ใช้**
- เสียงแจ้งเตือน
- การแจ้งเตือนเบราว์เซอร์
- อัปเดตตำแหน่งอัตโนมัติ
- ปรับรัศมีการตรวจจับ (10-500 เมตร)

✅ **ส่วนติดต่อ Frontend**
- UI ที่สวยงามและเป็นมิตร
- Responsive Design (มือถือ, แท็บเล็ต, เดสก์ท็อป)
- Real-time Location Display
- Interactive Location Cards

## 📁 โครงสร้างไฟล์

```
├── checkin.html              # หน้าเช็คอินหลัก
├── js/
│   └── checkin.js           # ลอจิก JavaScript หลัก
├── css/
│   └── checkin-styles.css   # สไตล์ CSS
├── backend.py               # API Backend (Flask)
├── locations.json           # ข้อมูลสถานที่
├── checkins.json            # บันทึกเช็คอิน
└── index.html               # หน้าแรก (อัปเดตแล้ว)
```

## 🚀 วิธีใช้งาน

### Frontend (Client-Side)

1. **เปิดหน้าเช็คอิน**
   - ไปที่ `checkin.html` หรือคลิก "📍 เช็คอิน" ในเมนู

2. **ดึงข้อมูลตำแหน่ง**
   - คลิกปุ่ม "🔍 ดึงข้อมูลตำแหน่ง"
   - อนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่ง

3. **เช็คอิน**
   - เมื่ออยู่ในพื้นที่ของสถานที่ คลิกปุ่ม "✓ เช็คอิน"
   - ระบบจะแสดงข้อความยืนยัน

4. **ตรวจสอบประวัติและสถิติ**
   - ดูประวัติการเช็คอินในการ์ด "📋 ประวัติเช็คอิน"
   - ดูสถิติในการ์ด "📊 สถิติ"

5. **ปรับตั้งค่า**
   - เลือกการตั้งค่าในการ์ด "⚙️ ตั้งค่า"
   - ปรับรัศมีการตรวจจับตามต้องการ

### Backend (Optional - Server-Side)

#### ติดตั้ง Dependencies

```bash
pip install flask flask-cors
```

#### เรียกใช้ Backend

```bash
python backend.py
```

เซิร์ฟเวอร์จะทำงานที่ `http://localhost:5000`

## 🔗 API Endpoints

### 1. ดึงข้อมูลสถานที่
```
GET /api/locations
```

### 2. เพิ่มสถานที่ใหม่
```
POST /api/locations
Content-Type: application/json

{
  "name": "ชื่อสถานที่",
  "latitude": 13.7245,
  "longitude": 100.5384,
  "description": "รายละเอียด",
  "radius": 100
}
```

### 3. ทำการเช็คอิน
```
POST /api/checkin
Content-Type: application/json

{
  "latitude": 13.7245,
  "longitude": 100.5384,
  "location_id": 1,
  "device_info": "iPhone 12"
}
```

### 4. ดึงข้อมูลเช็คอิน
```
GET /api/checkins           # ทั้งหมด
GET /api/checkins/1         # ตามสถานที่ (ID=1)
GET /api/checkins?limit=50  # จำกัดจำนวน
```

### 5. ดึงสถิติ
```
GET /api/stats
```

### 6. ตรวจสอบสถานะ
```
GET /api/health
```

## 📋 สถานที่เริ่มต้น

ระบบมาพร้อมกับสถานที่ 5 แห่งในกรุงเทพมหานคร:

1. 🏛️ โครงการสถาบันเทคโนโลยี (13.7245, 100.5384)
2. 🏢 ศูนย์ประชุมสิรินธร (13.6927, 100.7522)
3. 📚 ห้องสมุดแห่งชาติ (13.7367, 100.5648)
4. 🛍️ ศูนย์การค้า CentralWorld (13.7463, 100.5382)
5. 🌳 สวนลุมพินี (13.7307, 100.5549)

## 🔐 ความปลอดภัยและความเป็นส่วนตัว

- ✅ ข้อมูลตำแหน่งเก็บไว้ในเบราว์เซอร์เท่านั้น (localStorage)
- ✅ ไม่มีการส่งข้อมูลส่วนตัวไปยังเซิร์ฟเวอร์นอกเว็บไซต์
- ✅ ผู้ใช้สามารถลบประวัติได้ตลอดเวลา
- ✅ รองรับ HTTPS

## ⚙️ เทคโนโลยี

### Frontend
- HTML5
- CSS3 (Gradient, Flex, Grid)
- Vanilla JavaScript (ES6+)
- Geolocation API
- Web Audio API
- Notification API
- LocalStorage API

### Backend
- Python 3
- Flask
- Flask-CORS

## 📱 Responsive Design

- ✅ สมาร์ทโฟน (320px+)
- ✅ แท็บเล็ต (768px+)
- ✅ เดสก์ท็อป (1024px+)

## 🎨 สีและธีม

- **Primary Color**: #667eea (Indigo)
- **Secondary Color**: #764ba2 (Purple)
- **Success Color**: #84fab0 (Green)
- **Error Color**: #f87171 (Red)
- **Background**: Gradient (Light to Dark Blue)

## 📊 ฟังก์ชันการคำนวณ

### Haversine Formula
ใช้สำหรับคำนวณระยะห่างระหว่างจุดสองจุดบนทรงกลม:

```
d = 2R * arcsin(√(sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)))
```

โดยที่:
- R = รัศมีโลก (6,371 กม.)
- φ = ละติจูด (latitude)
- λ = ลองจิจูด (longitude)
- Δ = ความแตกต่าง

## 🐛 การแก้ไขปัญหา

### 1. เบราว์เซอร์ไม่ให้ความสำคัญกับตำแหน่ง
**วิธีแก้ไข**:
- ตรวจสอบการตั้งค่าเบราว์เซอร์
- ยินยอมให้เข้าถึงตำแหน่ง
- บางเบราว์เซอร์ต้อง HTTPS

### 2. ความแม่นยำของตำแหน่งต่ำ
**วิธีแก้ไข**:
- ปรับรัศมีการตรวจจับให้มากขึ้น
- เปิด GPS ในอุปกรณ์
- ลองในพื้นที่เปิดมากขึ้น

### 3. ไม่ได้รับการแจ้งเตือน
**วิธีแก้ไข**:
- ตรวจสอบการตั้งค่าการแจ้งเตือน
- ยินยอมให้แสดงการแจ้งเตือน
- ตรวจสอบว่าเปิด Notification Toggle

## 📝 บันทึกการเปลี่ยนแปลง

### Version 1.0
- ✅ ระบบเช็คอินพื้นฐาน
- ✅ ประวัติเช็คอิน
- ✅ สถิติการเช็คอิน
- ✅ ตั้งค่าผู้ใช้
- ✅ Backend API (Flask)
- ✅ Responsive Design

## 🎓 การเรียนรู้และการพัฒนาเพิ่มเติม

### ปรับปรุงที่เป็นไปได้
1. **Database Integration**: เก็บข้อมูลใน MongoDB, PostgreSQL
2. **Authentication**: เพิ่มการเข้าสู่ระบบ (Login/Register)
3. **Real-time Updates**: ใช้ WebSocket สำหรับการอัปเดตแบบ Real-time
4. **Map Integration**: เพิ่ม Google Maps หรือ Leaflet
5. **Admin Dashboard**: แดชบอร์ดสำหรับจัดการสถานที่
6. **Mobile App**: React Native / Flutter app
7. **Analytics**: รายงานและวิเคราะห์ข้อมูล
8. **Gamification**: Badge, Points, Leaderboard

## 👨‍💻 ผู้พัฒนา

**Jakkreerat Gawebua** - Web Developer

## 📄 ใบอนุญาต

Free to use for personal and educational purposes.

## 📞 การติดต่อ

สำหรับคำถามและข้อเสนอแนะ กรุณาติดต่อ:
- Email: jakkreerat@example.com
- GitHub: @jakkreerat-page
- Website: jakkreerat-page.github.io

---

**Happy Check-in! 🎉**
