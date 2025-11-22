
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from '$env/dynamic/private';

const S3_BUCKET = env.S3_BUCKET;

const s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});




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
                
                url: `${env.S3_ENDPOINT}/${S3_BUCKET}/${f.Key}`, 
                lastModified: f.LastModified
            }));
    } catch (error) {
        return [];
    }
}


export async function uploadThumbnail(filename: string, base64Data: string) {
   
    const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `thumbnails/${filename}`,
        Body: buffer,
        ContentType: "image/jpeg",
    });
    await s3Client.send(command);
    return `${env.S3_ENDPOINT}/${S3_BUCKET}/thumbnails/${filename}`;
}




export async function deleteFile(fullPath: string) {
    const command = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: fullPath });
    await s3Client.send(command);
}