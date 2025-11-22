import { listThumbnails, uploadThumbnail, deleteFile } from '$lib/server/minio.server';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const thumbnails = await listThumbnails();
    return { thumbnails };
};

export const actions: Actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const imageBase64 = formData.get('image') as string;

        if (!name || !imageBase64) {
            return fail(400, { error: "Thiếu tên hoặc dữ liệu ảnh" });
        }

        // Tạo tên file
        const filename = `${name}-${Date.now()}.jpg`;
        try {
            await uploadThumbnail(filename, imageBase64);
            return { success: true, message: "Đã tạo thumbnail thành công!" };
        } catch (e) {
            return fail(500, { error: "Lỗi upload lên minio" });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const fullPath = formData.get('fullPath') as string;
        if (!fullPath) return fail(400, { error: "Thiếu đường dẫn file" });
        await deleteFile(fullPath);
        return { success: true, message: "Đã xóa thumbnail" };
    }
};