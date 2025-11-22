import { saveConfig, getConfig } from '$lib/server/minio.server';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const key = params.key;
    const config = await getConfig(key);
    
    if (!config || Object.keys(config).length === 0) {
        throw redirect(307, '/admin'); 
    }
    return { key, config };
};

export const actions = {
    update: async ({ request, params }) => {
        const key = params.key;
        const formData = await request.formData();
        const configString = formData.get('config') as string;

        try {
            const json = JSON.parse(configString);
            json.updatedAt = new Date().toISOString(); 
            await saveConfig(key, json);
        } catch (e) {
            return fail(400, { error: "Lỗi lưu file", success: false });
        }

        return { success: true, message: "Cập nhật thành công!" };
    }
};