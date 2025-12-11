import { listIcons, uploadIcon, deleteFile } from '$lib/server/minio.server';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    const icons = await listIcons();
    //   ICON MỚI NHẤT LÊN ĐẦU DANH SÁCH
    const sortedIcons = icons.sort((a, b) => {
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
        return dateB - dateA; 
    });

    return { icons: sortedIcons };
};

export const actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File; 
        const filename = formData.get('filename') as string;

        if (!file || file.size === 0) {
            return fail(400, { message: 'Không nhận được file đã resize.' });
        }
        
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            // Upload lên S3/MinIO
            const uploadedUrl = await uploadIcon(filename, buffer);
            return { success: true, url: uploadedUrl, message: 'Upload icon thành công!' };
        } catch (error) {
            console.error("Upload Error:", error);
            return fail(500, { message: 'Lỗi server khi upload lên Storage.' });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const fullPath = formData.get('fullPath') as string;
        
        if (!fullPath) {
            return fail(400, { message: 'Thiếu đường dẫn file để xóa.' });
        }

        try {
            await deleteFile(fullPath);
            return { success: true, message: 'Xóa icon thành công!' };
        } catch (error) {
            console.error("Delete Error:", error);
            return fail(500, { message: 'Lỗi server khi xóa file.' });
        }
    }
};