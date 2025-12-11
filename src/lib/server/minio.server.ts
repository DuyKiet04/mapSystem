import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from '$env/dynamic/private';
//  CẤU HÌNH 
const S3_BUCKET = env.S3_BUCKET;
const PUBLIC_VIEW_URL = `${env.S3_ENDPOINT}/${S3_BUCKET}`;

const s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION || "us-east-1",
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    requestHandler: { timeout: 30000 }
});

//  ICONS 
export async function listIcons() {
    try {
        const command = new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: "icons/" });
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Size && f.Size > 0 && f.Key?.endsWith('.png'))
            .map(f => ({
                name: f.Key?.replace('icons/', ''),
                fullPath: f.Key,
                url: `${PUBLIC_VIEW_URL}/${f.Key}`,
                lastModified: f.LastModified
            }));
    } catch (error) {
        console.error("Lỗi listIcons:", error);
        return [];
    }
}

export async function uploadIcon(filename: string, buffer: Buffer) {
    const key = `icons/${filename}`;
    console.log(`--- Đang upload Icon: ${filename} ---`);
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: "image/png",
            ACL: 'public-read'
        }));
        return `${PUBLIC_VIEW_URL}/${key}`;
    } catch (e) {
        console.error("--- LỖI UPLOAD ICON ---", e);
        throw e;
    }
}


//  API

export async function getConfig(key: string) {
    try {
        const fullKey = `configs/${key}.json`;
        const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: fullKey });
        const response = await s3Client.send(command);
        const str = await response.Body?.transformToString();
        return str ? JSON.parse(str) : null;
    } catch (error) {
        console.error(`Lỗi đọc config ${key}:`, error);
        return null;
    }
}

//  lưu  khi  chỉnh sửa JSON
export async function saveConfig(key: string, data: any) {
    try {
        const fullKey = `configs/${key}.json`;
        const buffer = Buffer.from(JSON.stringify(data, null, 2));
        await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: fullKey,
            Body: buffer,
            ContentType: "application/json",
            ACL: 'public-read'
        }));
        return true;
    } catch (error) {
        console.error("Lỗi lưu config:", error);
        throw error;
    }
}

export async function listConfigs() { 
    try {
        const command = new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: "configs/" });
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Key?.endsWith('.json'))
            .map(f => ({
                key: f.Key?.replace('configs/', '').replace('.json', ''), 
                fullPath: f.Key,
                url: `${PUBLIC_VIEW_URL}/${f.Key}`, 
                lastModified: f.LastModified
            }));
    } catch (error) {
        console.error("Lỗi listConfigs:", error);
        return [];
    }
}

// THUMBNAILS
export async function listThumbnails() { 
    try {
        const command = new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: "thumbnails/" });
        const response = await s3Client.send(command);
        return (response.Contents || [])
            .filter(f => f.Size && f.Size > 0 && f.Key?.endsWith('.jpg'))
            .map(f => ({
                name: f.Key?.replace('thumbnails/', ''),
                fullPath: f.Key,
                url: `${PUBLIC_VIEW_URL}/${f.Key}`,
                lastModified: f.LastModified
            }));
    } catch (error) {
        console.error("Lỗi listThumbnails:", error);
        return [];
    }
}

export async function uploadThumbnail(filename: string, buffer: Buffer) {
    const key = `thumbnails/${filename}`;
    await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
        ACL: 'public-read'
    }));
    return `${PUBLIC_VIEW_URL}/${key}`;
}

// PROXY 

export async function getUrlData(targetUrl: string) {
    try {
        const response = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        if (!response.ok) throw new Error('Không tải được ảnh từ URL gốc.');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';
        return { buffer, contentType };
    } catch (err) {
        throw new Error(`Lỗi Server Proxy: ${err}`);
    }
}

export async function deleteFile(fullPath: string) {
    try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: fullPath }));
    } catch (error) {
        console.error("Lỗi xóa file:", error);
        throw error;
    }
}