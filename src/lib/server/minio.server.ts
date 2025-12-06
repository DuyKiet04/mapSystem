
// import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { env } from '$env/dynamic/private';

// const S3_BUCKET = env.S3_BUCKET;
// const s3Client = new S3Client({
//     endpoint: env.S3_ENDPOINT,
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: env.S3_ACCESS_KEY,
//         secretAccessKey: env.S3_SECRET_KEY,
//     },
//     forcePathStyle: true,
// });

// export async function listConfigs() {
//     const command = new ListObjectsV2Command({
//         Bucket: S3_BUCKET,
//         Prefix: "configs/"
//     });
//     try {
//         const response = await s3Client.send(command);
        
//         return (response.Contents || [])
//             .filter(f => f.Key?.endsWith('.json'))
//             .map(f => ({
//                 key: f.Key?.replace('configs/', '').replace('.json', ''),
//                 fullPath: f.Key,
//                 lastModified: f.LastModified
//             }));
//     } catch (error) {
//         console.error("Error listing configs:", error);
//         return [];
//     }
// }

// export async function getConfig(key: string) {
//     try {
//         const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: `configs/${key}.json` });
//         const response = await s3Client.send(command);
//         const str = await response.Body?.transformToString();
//         return JSON.parse(str || "{}");
//     } catch (e) { return null; }
// }

// export async function saveConfig(key: string, json: object) {
//     const command = new PutObjectCommand({
//         Bucket: S3_BUCKET,
//         Key: `configs/${key}.json`,
//         Body: JSON.stringify(json, null, 2),
//         ContentType: "application/json"
//     });
//     await s3Client.send(command);
// }

// export async function listThumbnails() {
//     const command = new ListObjectsV2Command({
//         Bucket: S3_BUCKET,
//         Prefix: "thumbnails/"
//     });
//     try {
//         const response = await s3Client.send(command);
//         return (response.Contents || [])
//             .filter(f => f.Size && f.Size > 0) 
//             .map(f => ({
//                 name: f.Key?.replace('thumbnails/', ''),
//                 fullPath: f.Key,
                
//                 url: `${env.S3_ENDPOINT}/${S3_BUCKET}/${f.Key}`, 
//                 lastModified: f.LastModified
//             }));
//     } catch (error) {
//         return [];
//     }
// }

// export async function uploadThumbnail(filename: string, base64Data: string) {
   
//     const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    
//     const command = new PutObjectCommand({
//         Bucket: S3_BUCKET,
//         Key: `thumbnails/${filename}`,
//         Body: buffer,
//         ContentType: "image/jpeg",
//     });
//     await s3Client.send(command);
//     return `${env.S3_ENDPOINT}/${S3_BUCKET}/thumbnails/${filename}`;
// }

// export async function deleteFile(fullPath: string) {
//     const command = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: fullPath });
//     await s3Client.send(command);
// }

// export async function listIcons() {
//     const command = new ListObjectsV2Command({
//         Bucket: S3_BUCKET,
//         Prefix: "icons/" 
//     });
//     try {
//         const response = await s3Client.send(command);
//         return (response.Contents || [])
//             .filter(f => f.Size && f.Size > 0) 
//             .map(f => ({
//                 name: f.Key?.replace('icons/', ''), 
//                 fullPath: f.Key, 
//                 url: `${env.S3_ENDPOINT}/${S3_BUCKET}/${f.Key}`,
//                 lastModified: f.LastModified
//             }));
//     } catch (error) {
//         console.error("Lỗi liệt kê icons:", error);
//         return [];
//     }
// }

// export async function uploadIcon(filename: string, buffer: Buffer) {
//     const command = new PutObjectCommand({
//         Bucket: S3_BUCKET,
//         Key: `icons/${filename}`,
//         Body: buffer,
//         ContentType: "image/png", 
//         ACL: 'public-read' 
//     });
//     await s3Client.send(command);
//     return `${env.S3_ENDPOINT}/${S3_BUCKET}/icons/${filename}`;
// }


import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from '$env/dynamic/private';

// --- CẤU HÌNH ---
const S3_BUCKET = env.S3_BUCKET;

// XỬ LÝ URL HIỂN THỊ (QUAN TRỌNG NHẤT)
// Tự động lấy Project ID từ Endpoint để tạo link hiển thị chuẩn "object/public"
// Kết quả sẽ dạng: https://qtnzydtwtnyptuexqqff.supabase.co/storage/v1/object/public/kiet-map-system
const projectId = env.S3_ENDPOINT ? env.S3_ENDPOINT.replace("https://", "").split(".")[0] : "";
const PUBLIC_VIEW_URL = `https://${projectId}.supabase.co/storage/v1/object/public/${S3_BUCKET}`;

const s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION || "ap-southeast-1",
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
    forcePathStyle: true, // Bắt buộc cho Supabase
});

// --- CONFIGS ---
export async function listConfigs() {
    const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: "configs/"
    });
    try {
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Key?.endsWith('.json'))
            .map(f => ({
                key: f.Key?.replace('configs/', '').replace('.json', ''),
                fullPath: f.Key,
                lastModified: f.LastModified
            }));
    } catch (error) {
        console.error("Error listing configs:", error);
        return [];
    }
}

export async function getConfig(key: string) {
    try {
        const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: `configs/${key}.json` });
        const response = await s3Client.send(command);
        const str = await response.Body?.transformToString();
        return JSON.parse(str || "{}");
    } catch (e) { return null; }
}

export async function saveConfig(key: string, json: object) {
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `configs/${key}.json`,
        Body: JSON.stringify(json, null, 2),
        ContentType: "application/json"
    });
    await s3Client.send(command);
}

// --- THUMBNAILS ---
export async function listThumbnails() {
    const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: "thumbnails/"
    });
    try {
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Size && f.Size > 0)
            .map(f => ({
                name: f.Key?.replace('thumbnails/', ''),
                fullPath: f.Key,
                url: `${PUBLIC_VIEW_URL}/${f.Key}`, // Đã sửa link chuẩn
                lastModified: f.LastModified
            }));
    } catch (error) {
        return [];
    }
}

export async function uploadThumbnail(filename: string, base64Data: string) {
    const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const key = `thumbnails/${filename}`;
    
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
    });
    await s3Client.send(command);
    return `${PUBLIC_VIEW_URL}/${key}`;
}

// --- ICONS (ĐÃ FIX LỖI ẢNH VÀ XÓA) ---

export async function listIcons() {
    const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: "icons/" 
    });
    try {
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Size && f.Size > 0) 
            .map(f => ({
                name: f.Key?.replace('icons/', ''), 
                fullPath: f.Key, // Giữ cái này để xóa
                url: `${PUBLIC_VIEW_URL}/${f.Key}`, // FIX: Link này mới hiển thị được trên web
                lastModified: f.LastModified
            }));
    } catch (error) {
        console.error("Lỗi liệt kê icons:", error);
        return [];
    }
}

export async function uploadIcon(filename: string, buffer: Buffer) {
    // Đảm bảo luôn lưu vào thư mục icons/
    const key = filename.startsWith('icons/') ? filename : `icons/${filename}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/png", 
    });
    await s3Client.send(command);
    return `${PUBLIC_VIEW_URL}/${key}`;
}

// FIX QUAN TRỌNG: Hàm xóa "Bất tử" - Không crash 500 kể cả khi file không có
export async function deleteFile(pathOrName: string) {
    // Tự động thêm icons/ nếu người dùng chỉ gửi tên file
    let key = pathOrName;
    if (!key.includes('/') && !key.startsWith('icons/')) {
        key = `icons/${pathOrName}`;
    }

    try {
        const command = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key });
        await s3Client.send(command);
        console.log(`Đã xóa file S3: ${key}`);
    } catch (error: any) {
        // Nếu lỗi là "Không tìm thấy file" (NoSuchKey) -> Coi như xóa thành công, return luôn
        if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
            console.warn(`File ${key} không tồn tại trên S3, bỏ qua.`);
            return; 
        }
        // Lỗi khác thì báo ra
        console.error("Lỗi khi xóa file:", error);
        throw error;
    }
}