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
        
        const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `${name.replace(/\s/g, '-')}-${Date.now()}.jpg`;

        try {
            //  MinIO/S3
            const uploadedUrl = await uploadThumbnail(filename, buffer);

            return { 
                success: true, 
                message: `Tạo Thumbnail "${name}" thành công!`,
                url: uploadedUrl
            };
        } catch (error) {
            console.error("Upload Thumbnail Error:", error);
            return fail(500, { message: 'Lỗi server khi upload Thumbnail.' });
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