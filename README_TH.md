# ECI → eNodeB Finder v3.2 (PWA) — ใช้ได้ทั้ง Online / Offline

Develop by napatm@ais.co.th

## v3.2 — ระบบ Login ปิดอยู่ (ค่าเริ่มต้น)
- เปิดแอปแล้วใช้งานได้ทันที ไม่ต้อง Login · ซิงค์ DB จาก Google Drive ได้ทุกเครื่อง
- **อัปโหลด DB ขึ้น Drive (ผู้ดูแล)**: ⚙️ ในการ์ด DB → ใส่ **รหัสผู้ดูแล** (UPLOAD_KEY ที่ได้ตอนสร้าง Apps Script v2.1) → การ์ด 👑 จะแสดง → กดอัปโหลด
- สร้างไฟล์: `python ECI_to_eNodeB_PWA_v3.2.py --gas-url <URL /exec>` (ไม่ต้องใช้ Client ID)
- **เปิด Login คืน**: สร้างแอปด้วย `--auth --client-id …` และตั้ง `AUTH_ENABLED = true` ใน Apps Script (ต้องตรงกันทั้ง 2 ฝั่ง) — รายชื่อผู้ใช้เดิมยังเก็บไว้ ใช้ต่อได้ทันที

## (เมื่อเปิด Login) เข้าสู่ระบบด้วย Google · ใช้ได้เฉพาะผู้ได้รับอนุญาต
| บทบาท | ทำอะไรได้ |
|---|---|
| 👑 ผู้ดูแล `napat.gpt@gmail.com` | ทุกอย่าง + **เพิ่ม/ลบผู้ใช้** + **อัปโหลด DB ขึ้น Google Drive** (การ์ด 👑 ผู้ดูแลระบบ) |
| ผู้ใช้ที่ได้รับอนุญาต | ค้นหา, ซิงค์ DB จาก Drive, Load ไฟล์ในเครื่อง, แผนที่, เข็มทิศ, ความสูง |
| คนอื่น | เห็นแค่หน้า Login → ขึ้น "ไม่ได้รับอนุญาต" |

- **Offline 7 วัน**: หลังยืนยันตัวตนออนไลน์ล่าสุด ใช้ Offline ได้ 7 วัน (ทุกครั้งที่เปิดแอปตอนออนไลน์จะต่ออายุให้เอง) · ครบ 7 วัน → ต้องต่อเน็ตแล้ว Login ใหม่ (DB ยังอยู่)
- **ถอนสิทธิ์**: ผู้ดูแลกด "ลบ" → ครั้งถัดไปที่เครื่องนั้นออนไลน์ แอปจะ **ล็อกและลบ DB / ประวัติ / ตำแหน่ง / ภาพแผนที่ในเครื่องทั้งหมด**
- **ออกจากระบบ**: ปุ่ม ⇥ ข้างอีเมลมุมขวาบน (DB ในเครื่องยังเก็บไว้)
- ต้องใช้คู่กับ **Apps Script v2.0** (`ECI_to_eNodeB_GAS_v2.0.py`) — Backend ตรวจสิทธิ์ทุกคำสั่ง

## ไฟล์ที่ได้ (อัปโหลดทุกไฟล์ไว้ในโฟลเดอร์เดียวกัน)
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | ตัวโปรแกรม (ฝัง URL Apps Script + Client ID ไว้แล้ว) |
| `sw.js` | Service Worker — เก็บโปรแกรมไว้ในเครื่อง ทำให้เปิดได้แม้ไม่มีอินเทอร์เน็ต |
| `manifest.webmanifest` + `icon-*.png` + `apple-touch-icon.png` | ข้อมูลและไอคอนสำหรับติดตั้งเป็นแอป |

> ⚠️ PWA ต้องเปิดผ่าน **HTTPS** เท่านั้น · Sign in with Google ทำงานเฉพาะ URL ที่ลงทะเบียนใน Google Cloud (Authorized JavaScript origins)

## ขั้นตอนที่ 1 — สร้าง OAuth Client ID (Google Cloud — ทำครั้งเดียว ฟรี)
1. https://console.cloud.google.com → **Select a project → New Project** → ชื่อ `ECI Finder` → Create
2. ☰ → **APIs & Services → OAuth consent screen** (บางบัญชีชื่อ **Google Auth Platform**)
   - **Branding**: App name `ECI Finder`, User support email, Developer contact → Save
   - **Audience**: User type **External** → กด **Publish app** (ขอแค่อีเมล/ชื่อ/รูป ไม่ต้องส่ง verify)
3. **Clients / Credentials → Create client → OAuth client ID**
   - Application type **Web application** · Name `ECI Finder PWA`
   - **Authorized JavaScript origins** → `https://<ชื่อผู้ใช้>.github.io` (ไม่มี / ท้าย ไม่มีชื่อ repo)
   - **Authorized redirect URIs** → URL Apps Script `/exec` (ใช้ตอน Login บน iPhone/iPad ที่ติดตั้งแอป)
   - **Create** → คัดลอก **Client ID** `xxxx.apps.googleusercontent.com`

## ขั้นตอนที่ 2 — Apps Script v2.0
1. `python ECI_to_eNodeB_GAS_v2.0.py --client-id <Client ID> --pwa-url https://<ชื่อผู้ใช้>.github.io/eci-finder/`
2. วาง `Code.gs` + `Index.html` ทับในโปรเจกต์เดิม → Run ฟังก์ชัน **setup** 1 ครั้ง → Authorize
3. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** (URL `/exec` เดิมไม่เปลี่ยน)

## ขั้นตอนที่ 3 — สร้างและวางแอปบน GitHub Pages
1. `python ECI_to_eNodeB_PWA_v3.2.py --gas-url <URL /exec> --client-id <Client ID>`
2. GitHub repository → **Add file → Upload files** → ลากไฟล์ทั้งหมด (ยกเว้น `README_TH.md`) → **Commit changes**
3. (ครั้งแรก) **Settings → Pages** → Branch **main** / **(root)** → Save → ได้ `https://<ชื่อผู้ใช้>.github.io/eci-finder/`

> 🔒 บนเว็บมีเพียงโค้ดโปรแกรม — **ไม่มีข้อมูล DB QGIS** · DB บน Drive ดึงได้เฉพาะ session ที่ผ่านการตรวจสิทธิ์

## ขั้นตอนที่ 4 — ผู้ดูแลตั้งค่าครั้งแรก
1. เปิดแอป → **Sign in with Google** ด้วย `napat.gpt@gmail.com`
2. การ์ด 👑 **ผู้ดูแลระบบ** → (ถ้ายังไม่มี DB บน Drive) Load ไฟล์ DB QGIS → **อัปโหลดไฟล์ในเครื่องขึ้น Drive**
3. ใส่ Gmail ของผู้ใช้ → **+ เพิ่ม** → แจ้งผู้ใช้ให้เปิดลิงก์แอปและ Login → แอปซิงค์ DB ให้เอง

## ติดตั้งเป็นแอป
| อุปกรณ์ | วิธีติดตั้ง |
|---|---|
| **Android (Chrome)** | เปิด URL → ปุ่ม **ติดตั้งแอปลงเครื่อง** หรือเมนู ⋮ → **ติดตั้งแอป** |
| **iPhone / iPad (Safari)** | เปิด URL ด้วย **Safari** → **แชร์ ⬆︎** → **เพิ่มไปยังหน้าจอโฮม** · Login ครั้งแรกจะเปิดหน้า Google → กด **กลับไปที่แอป** |
| **PC (Chrome / Edge)** | ไอคอน ⊕ ที่แถบที่อยู่ หรือปุ่ม **ติดตั้งแอปลงเครื่อง** |

## ค้นหาด้วย PCI 4G / PCI 5G (v3.1)
- เลือกปุ่ม **PCI 4G** (0–503) หรือ **PCI 5G** (0–1007) แล้วป้อนเลข PCI · โหมด **อัตโนมัติ**: ค่า 0–1007 = ค้นหา PCI ทั้ง 4G และ 5G
- PCI ซ้ำได้หลาย Cell → **ผลหลัก = Cell ที่ใกล้ตำแหน่งปัจจุบันที่สุด** แสดงเหมือนเดิมทุกอย่าง (ไซต์, ระยะ/มุม, เข็มทิศ, ความสูง, แผนที่)
- **ตาราง Cell อื่นที่ใช้ PCI เดียวกัน** ลำดับที่ 2 เป็นต้นไป: Cellname · SITE_NAME · ระยะทาง (· ทิศ บน PC) เรียงใกล้ → ไกล
  แตะแถว (หรือหมุดสีส้มบนแผนที่) เพื่อดู Cell นั้นเป็นผลหลัก · ย้ายตำแหน่ง / กด GPS ใหม่ → เรียงลำดับใหม่ให้เอง
- ต้องใช้ DB ที่มีคอลัมน์ `PCI4G`, `PCI5G` (และ `System`) → **Load ไฟล์ DB QGIS ใหม่** หรือผู้ดูแล **อัปโหลดขึ้น Drive ใหม่** ด้วยแอป v3.1
  (ค่า 0 นับเป็น PCI จริงเฉพาะ Cell ที่ System ตรงเทคโนโลยี เพราะ DB ใช้ 0 แทน "ไม่มีค่า" ในแถว 2G/3G)

## Load DB ในเครื่อง (ไม่ผ่าน Drive)
- กด **Import ไฟล์ DB QGIS (.csv)** → ดึงเฉพาะคอลัมน์ที่ใช้ แล้วเก็บใน IndexedDB ของเครื่อง (ต้อง Login ก่อน)
- ปุ่ม **ลบ DB ในเครื่อง** สำหรับล้างข้อมูล

## ใช้งาน Online / Offline
| ฟีเจอร์ | Online | Offline |
|---|---|---|
| แปลง ECI → eNodeB / ค้นหา Cellname / Cell ใน eNodeB เดียวกัน | ✅ | ✅ |
| GPS ตำแหน่งปัจจุบัน | ✅ | ✅ (ไม่มีเน็ตอาจหาตำแหน่งช้าลง) |
| ระยะทาง (Vincenty WGS84) · มุม Azimuth · ทิศ 16 ทิศ | ✅ | ✅ |
| เข็มทิศ Live + เสียงนำทาง + สั่น | ✅ | ✅ |
| ความสูงจากระดับน้ำทะเล + Terrain Profile / LOS | ✅ | ✅ เฉพาะเส้นทางที่เคยดูแล้ว (เก็บในเครื่อง) |
| นำทางด้วย Google Maps | ✅ | ❌ |

มุมขวาบนแสดงสถานะ **Online / Offline** ตลอดเวลา

## แผนที่บนมือถือ / แท็บเล็ต + ชื่อไซต์ (v2.6)
- ความสูงแผนที่ปรับตามจอ: PC 440 px · แท็บเล็ต ~62% ของจอ · มือถือ ~58% ของจอ (เต็มความกว้าง) · มือถือแนวนอน ~78%
- ปุ่ม ⤢ เต็มจอรองรับจอมีรอยบาก (safe-area) · หมุนจอแล้วแผนที่ปรับขนาดเอง
- ป้าย Cell ที่ค้นหา: Cellname + ชื่อไซต์ · ไซต์ใกล้เคียง: ป้ายรหัสไซต์เมื่อซูม ≥ 13 และชื่อไซต์เมื่อซูม ≥ 15

## ข้อมูลไซต์ + Sector สายอากาศ (v2.5)
- Import เพิ่ม: `Sitename, SITE_NAME, Location, DIR, AntType, TowerType, SectorSize, SectorOmni` (ต้อง Load ไฟล์ใหม่ / Import ใหม่ที่ Apps Script v1.6 แล้วซิงค์)
- การ์ด **ข้อมูลไซต์**: ชื่อไซต์ (รหัส · ชื่อไทย · ชื่ออังกฤษ), DIR, ANT Height, ANT Type, Tower Type, SECTOR/OMNI + Beam
- บอกตำแหน่งคุณเทียบแนวสายอากาศ: ✓ main lobe / ⚠ ด้านข้าง / ✕ ด้านหลัง (beam จากชื่อรุ่นสายอากาศ เช่น /65/ = ±32.5°, ไม่พบ = 65°)
- แผนที่: พัด Sector ของ Cell ที่ค้นหา (เด่น) + เส้นแนวสายอากาศ, Sector อื่นในไซต์เดียวกัน (จาง), ซูม ≥ 15 เห็น Sector ไซต์ใกล้เคียง
  รัศมีพัดตาม SectorSize (km) ใน DB · ตาราง Cell ในไซต์มีคอลัมน์ DIR

## แผนที่ในแอป (v2.4)
แสดงอัตโนมัติใต้ผลการค้นหา Cell
- หมุดสีฟ้า = ตำแหน่งของคุณ (+ วงความแม่นยำ GPS) · หมุดเขียว/ม่วง = Cell ที่ค้นหา (4G/5G) พร้อมชื่อ
- เส้นประเขียว = เส้นทางตรงไปยัง Cell พร้อมป้าย ระยะทาง · มุม · ทิศ (ลูกศรชี้ทิศ)
- เปิด **เข็มทิศ Live** → มีเส้นทิศที่โทรศัพท์หันอยู่ (ส้ม → เขียวเมื่อหันตรง Cell)
- Layer: **Google Map / Google Terrain / Google Satellite / Google Hybrid / OpenStreetMap / Esri ดาวเทียม / OpenTopoMap** (จำค่าที่เลือก)
- ตัวเลือก: เส้นทิศทาง · **Cell ใกล้เคียง** (จุดสีเทา แตะดูรายชื่อ Cell ในไซต์, ซูม ≥ 12) · วงระยะ 1/3/5 km
- ปุ่ม ⤢ เต็มจอ · ◎ แสดงคุณและ Cell · 📍 ไปที่ตำแหน่งฉัน
- Offline: ตัวแผนที่ หมุด เส้น ทำงานได้ทั้งหมด · ภาพแผนที่แสดงเฉพาะพื้นที่ที่เคยเปิดดู (เก็บล่าสุด ~1,500 ภาพ)
> ภาพแผนที่ Google ใช้ URL ภาพโดยตรง (ไม่ผ่าน Google Maps API) — ใช้งานภายในทีมได้ แต่ถ้าจะใช้เชิงพาณิชย์/สาธารณะควรใช้ Google Maps API key ตามเงื่อนไขของ Google

## DB 2 ชุดในเครื่อง: 📁 ไฟล์ในเครื่อง / ☁️ Google Drive (v2.3)
| สถานการณ์ | ทำอย่างไร |
|---|---|
| ไม่มีเน็ต / ยังไม่ได้ตั้ง Apps Script | กด **Import ไฟล์ DB QGIS** (หรือการ์ด **📁 ไฟล์ในเครื่อง**) → เก็บในเครื่องแล้วใช้งานได้ทันที |
| มีเน็ต | แอปซิงค์ชุด **☁️ Google Drive** ให้เองเมื่อมีฉบับใหม่ / กดปุ่ม **ซิงค์จาก Google Drive** เพื่อดึงและใช้ทันที |
| สลับชุดที่ใช้ | แตะการ์ด 📁 หรือ ☁️ — สลับได้ทันทีแม้ Offline (ทั้ง 2 ชุดอยู่ในเครื่อง) |
| กำลังใช้ไฟล์ในเครื่อง แล้ว Drive มีฉบับใหม่ | แอปดาวน์โหลดเก็บไว้ แต่ **ไม่เขียนทับ** ไฟล์ของคุณ — ขึ้นป้าย "มีฉบับใหม่" ให้แตะเลือกเอง |

> อัปเกรดจาก v2.2: ข้อมูลเดิมถูกย้ายเข้าชุดที่ตรงกับแหล่งที่มาให้อัตโนมัติ ไม่ต้อง Import ใหม่

## ซิงค์ DB จาก Google Drive
- ผู้ดูแลอัปโหลดที่การ์ด 👑 ครั้งเดียว → ทุกเครื่องที่ Login ได้รับอัตโนมัติเมื่อเปิดแอปตอนออนไลน์ (⚙️ ปิดซิงค์อัตโนมัติได้)
- ปุ่ม **ซิงค์จาก Google Drive** สำหรับดึงทันที

## แหล่งข้อมูลความสูง (⚙️ ในการ์ด DB)
1. **Open-Meteo · Copernicus DEM 90 m** (ค่าเริ่มต้น) — *การใช้งานเชิงพาณิชย์ควรตรวจสอบเงื่อนไขของ Open-Meteo*
2. **Google Elevation ผ่าน Apps Script** (~10–30 m) — ใช้ Apps Script v2.0 ของระบบ ไม่ต้องตั้งค่าเพิ่ม

## อัปเดตโปรแกรม
1. แก้/สร้างไฟล์ใหม่ด้วย `python ECI_to_eNodeB_PWA_vX.X.py --gas-url … --client-id …` (หรือใส่ค่า GAS_URL / CLIENT_ID ในไฟล์ .py ครั้งเดียว)
2. อัปโหลดไฟล์ทับใน GitHub (Add file → Upload files → Commit)
3. ผู้ใช้เปิดแอปตอนออนไลน์ → จะขึ้นแถบ **"มีเวอร์ชันใหม่ของแอป → อัปเดตเลย"** (DB ในเครื่องไม่หาย)

## ฟีเจอร์ทั้งหมด
- Convert **4G ECI → eNodeB ID / Cell ID** และ **5G NCI → gNodeB ID / Cell ID** ค้นหา Cellname, CGI, Cell อื่นใน eNodeB/gNodeB เดียวกัน
  - โหมด **อัตโนมัติ**: ค่า > 268,435,455 (เกิน 28 bit) ถือเป็น 5G NCI · เลือก 4G / 5G เองได้
  - 5G ตรวจความยาว gNB ID (22–32 bit) อัตโนมัติจาก DB หรือกำหนดเองได้
- ระยะทาง, มุมจากทิศเหนือ, มุมกลับ Cell → คุณ, นำทาง Google Maps
- เข็มทิศ Live หมุนตามทิศจริง: ตรง ±10° (ปรับได้) → สีเขียว + เสียงต่อเนื่อง + สั่น / ห่าง → เสียงเป็นจังหวะ ยิ่งใกล้ยิ่งถี่
- ความสูง MSL จุดคุณ / Cell / ยอดสายอากาศ, มุมเงย, Terrain Profile + Line-of-Sight (ความโค้งโลก k=4/3)

## หลักการคำนวณ
```
eNodeB ID = ECI ÷ 256  (ปัดเศษทิ้ง)
Cell ID   = ECI mod 256
Search Key = "eNodeB ID" ต่อด้วย "Cell ID"  → เทียบกับส่วนท้ายของ CGI
ตัวอย่าง  ECI 140800869 → eNB 550003, Cell 101 → Key 550003101 → ABHTML1811

5G NR NCI (36 bit), gNB ID ยาว L bit (AIS DB ปัจจุบัน L = 22 → Cell ID 14 bit):
gNodeB ID = NCI ÷ 2^(36−L)  (ปัดเศษทิ้ง)
Cell ID   = NCI mod 2^(36−L)
Search Key = "gNodeB ID" ต่อด้วย "Cell ID" (4 หลัก) → เทียบกับส่วนท้ายของ CGI
ตัวอย่าง  NCI 9066857549 → gNB 553397, Cell 1101 → Key 5533971101 → SUNGMN0711
```

Develop by napatm@ais.co.th
