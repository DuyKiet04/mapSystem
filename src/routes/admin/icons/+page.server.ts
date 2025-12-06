import { fail } from '@sveltejs/kit';
import { listIcons, uploadIcon, deleteFile } from '$lib/server/minio.server';

export const load = async () => {
    const icons = await listIcons();
    return { icons };
};

export const actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return fail(400, { message: 'Chưa chọn file hoặc file rỗng' });
        }

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `icon-url-${Date.now()}.png`; 
            
            await uploadIcon(fileName, buffer);
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { message: 'Lỗi upload file' });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const fileName = formData.get('fileName');
        if (!fileName || typeof fileName !== 'string') {
            console.error("LỖI: Client không gửi fileName lên!");
            return fail(400, { message: 'Thiếu tên file cần xóa' });
        }

        console.log("--> Server nhận yêu cầu xóa file:", fileName);

        try {
            await deleteFile(fileName);
            return { success: true };
        } catch (error) {
            console.error("Lỗi xóa file:", error);
            return fail(500, { message: 'Không thể xóa file' });
        }
    }
};