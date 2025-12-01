# Bài 6: Quản Lý Icon

Hệ thống cho phép upload và quản lý icon cho bản đồ.

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

- Thời gian hoàn thành: 4/12/2025

### Chức năng:

- **Resize ảnh Client-side:** Sử dụng thư viện **Pica** để giảm dung lượng và kích thước ảnh (mặc định 48x48px) ngay trên trình duyệt trước khi upload.
- **Hỗ trợ đa nguồn:** Upload từ máy tính hoặc dán Link ảnh (URL).
- **Lưu trữ:** Icon được lưu tại thư mục `icons/` trên MinIO.

### Hướng dẫn sử dụng:

1.  Truy cập Dashboard -> Bấm **"Quản lý Icon"**.
2.  Chọn ảnh hoặc dán link ảnh gốc.
3.  Chỉnh kích thước (Width/Height) nếu muốn.
4.  Bấm **"Resize & Upload"**.
5.  Copy link icon ở danh sách bên phải.
6.  Vào trang **Sửa bản đồ** -> Dán link vào ô **Icon URL** của các lớp dữ liệu.

### Link demo

- **Trang Quản Trị :** [https://mapsystem.onrender.com/admin](https://mapsystem.onrender.com/admin)
- **Quản Lý Thumbnail:** [https://mapsystem.onrender.com/admin/thumbnails](https://mapsystem.onrender.com/admin/thumbnails)
- **Trang Quản Lý Icon:** [https://mapsystem.onrender.com/admin/icons](https://mapsystem.onrender.com/admin/icons)
- **API :** [https://mapsystem.onrender.com/api/config/hcm](https://mapsystem.onrender.com/api/config/hcm)

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
