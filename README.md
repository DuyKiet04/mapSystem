# Bài 5: HỆ THỐNG QUẢN LÝ NHIỀU CẤU HÌNH BẢN ĐỒ & QUẢN LÝ THUMBNAIL

Xây dựng hệ thống quản lý đa cấu hình bản đồ, cho phép tạo / sửa / xóa cấu hình bản đồ, quản lý thumbnail của bản đồ nền, và đảm bảo trang bản đồ (bài 1–3) có thể sử dụng cấu hình động từ API mới.

## Công Nghệ Sử Dụng

- **Framework:** SvelteKit (SSR + API Routes)
- **Ngôn ngữ:** TypeScript
- **Giao diện:** Bootstrap 5, FontAwesome
- **Libraries:**
  - `@json-editor/json-editor`: Tạo form nhập liệu từ Schema.
  - `leaflet`: Hiển thị bản đồ xem trước.
  - `html2canvas`: Chụp ảnh màn hình.
  - `@aws-sdk/client-s3`: Kết nối MinIO/S3.
- **Storage:** MinIO Playground (S3 Compatible).
- **Deploy:** render.

## Deadline dự kiến

- Thời gian hoàn thành: 25/11/2025

## Link Demo

- **Trang cấu hình bản đồ:** [https://mapsystem.onrender.com/admin](https://mapsystem.onrender.com/admin)
- **Quản lý thumbnail:** [https://mapsystem.onrender.com/admin/thumbnails](https://mapsystem.onrender.com/admin/thumbnails)
- **API** [https://mapsystem.onrender.com/api/config/hcm](https://mapsystem.onrender.com/api/config/hcm)

---

## Cách Cài Đặt và Chạy

### 1. Cài đặt

Clone repository và cài đặt dependencies:

```bash
git clone https://github.com/DuyKiet04/mapSystem.git
cd mapSystem
npm install
```

### 2. Cấu hình MinIO (Environment)

Project này được cấu hình để chạy với MinIO Playground. Bạn cần tạo một file `.env` ở thư mục gốc và điền các thông tin sau:

```ini
# .env
# API Endpoint (no port 9443)
S3_ENDPOINT="https://play.min.io"

S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"


S3_BUCKET="kiet-map-system"
S3_KEY="configs/map-config.json"
```

### 3. Chạy Local

Sau khi cài đặt và cấu hình `.env`, chạy server dev:

```bash
npm run dev
```

- Truy cập trang Admin: `http://localhost:5173/admin`
- Bấm theo các mục trong admin
