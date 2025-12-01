import { listIcons, uploadIcon, deleteFile } from '$lib/server/minio.server';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const icons = await listIcons();
    return { icons: icons || [] };
};

export const actions: Actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file || file.size === 0) {
            return fail(400, { error: "Vui lòng chọn file ảnh!" });
        }

        const originalName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const filename = `${originalName}-${Date.now()}.png`;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await uploadIcon(filename, buffer);
            return { success: true, message: "Upload icon thành công!" };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Lỗi upload lên Server" });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const fullPath = formData.get('fullPath') as string;
        if (!fullPath) return fail(400, { error: "Thiếu đường dẫn file" });
        await deleteFile(fullPath);
        return { success: true, message: "Đã xóa icon" };
    }
};