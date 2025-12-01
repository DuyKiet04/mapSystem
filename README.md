# Hệ Thống Quản Lý Cấu Hình Bản Đồ

> **Bài 5**

Đây là hệ thống được xây dựng bằng **SvelteKit**, cho phép quản trị viên quản lý các cấu hình bản đồ động và kho ảnh thumbnail. Hệ thống cung cấp API để các ứng dụng bản đồ (Client) có thể tải cấu hình từ xa mà không cần sửa code.

---

## Link demo

- **Trang Quản Trị :** [https://mapsystem.onrender.com/admin](https://mapsystem.onrender.com/admin)
- **Quản Lý Thumbnail:** [https://mapsystem.onrender.com/admin/thumbnails](https://mapsystem.onrender.com/admin/thumbnails)
- **API :** [https://mapsystem.onrender.com/api/config/hcm](https://mapsystem.onrender.com/api/config/hcm)

---

## Cấu hình MinIO

Project này được cấu hình để chạy với MinIO Playground. Bạn cần tạo một file `.env` ở thư mục gốc và điền các thông tin sau:

```ini

S3_ENDPOINT="[https://play.min.io](https://play.min.io)"

S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"


S3_BUCKET="kiet-map-system"
S3_KEY="configs/map-config.json"
```

---

## 🛠️ Công Nghệ Sử Dụng

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

---

## Hướng Dẫn Cài Đặt (Local)

```bash
git clone https://github.com/DuyKiet04/mapSystem.git
cd mapSystem
npm install
```
