import { fail, redirect } from '@sveltejs/kit';
import { listThumbnails, uploadThumbnail, deleteFile, setPublicBucket } from '$lib/server/minio.server';


export const load = async () => {
    try {
        await setPublicBucket();
        const thumbnails = await listThumbnails(); 
        return { thumbnails };
    } catch (e) {
        console.error("Error loading thumbnails:", e);
        return { thumbnails: [] }; 
    }
};

export const actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const imageData = formData.get('image') as string; 

        if (!name || !imageData) {
            return fail(400, { message: 'Thiếu tên hoặc dữ liệu ảnh.' });
        }
        
        try {
            const base64Parts = imageData.split(';base64,');
            const base64Data = base64Parts.pop();
            if (!base64Data) throw new Error("Dữ liệu ảnh không hợp lệ");
            
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${name.replace(/\s/g, '-')}-${Date.now()}.jpg`;

            // Gọi hàm upload
            const uploadedUrl = await uploadThumbnail(name, buffer);

            return { 
                success: true, 
                message: `Tạo Thumbnail "${name}" thành công!`,
                url: uploadedUrl
            };
        } catch (error: any) {
            console.error("--- LỖI UPLOAD CHI TIẾT ---");
    
    if (error.$response && error.$response.body) {
        try {
            const reader = error.$response.body;
            console.log("Mã lỗi HTTP:", error.$metadata?.httpStatusCode);
        } catch (e) {
            console.log("Không thể đọc nội dung lỗi từ server.");
        }
    }
    
    return fail(500, { message: 'Server MinIO từ chối nhận file. Có thể do dung lượng ảnh vệ tinh quá lớn.' });
}
        
    },

    //  xóa Thumbnail
    delete: async ({ request }) => {
        const formData = await request.formData();
        const fullPath = formData.get('fullPath') as string; 

        if (!fullPath) {
            return fail(400, { message: 'Thiếu đường dẫn file để xóa.' });
        }

        try {
            // Xóa  khỏi S3/MinIO
            await deleteFile(fullPath);
            return { success: true, message: 'Xóa Thumbnail thành công!' };
        } catch (error) {
            console.error("Delete Thumbnail Error:", error);
            return fail(500, { message: 'Lỗi server khi xóa file.' });
        }
    }
};