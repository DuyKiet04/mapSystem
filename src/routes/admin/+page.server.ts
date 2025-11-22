import { listConfigs, deleteFile } from '$lib/server/minio.server';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
// Lấy danh sách bản đồ từ minio
export const load: PageServerLoad = async () => {
    const configs = await listConfigs();
    return { configs };
};
// Xóa bản đồ
export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const key = formData.get('key') as string;
        if (!key) return fail(400, { error: "Missing key" });
        // Xóa file trên minio
        await deleteFile(`configs/${key}.json`);
        return { success: true, message: `Đã xóa bản đồ: ${key}` };
    }
};