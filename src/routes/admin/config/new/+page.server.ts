import { saveConfig, getConfig } from '$lib/server/minio.server';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const key = formData.get('key') as string;
        const configString = formData.get('config') as string;

        if (!key || !configString) {
            return fail(400, { error: "Thiếu Key hoặc Config", key, configString });
        }

        const existing = await getConfig(key);
        if (existing && Object.keys(existing).length > 0) {
            return fail(400, { error: `Key "${key}" đã tồn tại! Vui lòng chọn tên khác.`, key, configString });
        }

        try {
            const json = JSON.parse(configString);
            
            json.updatedAt = new Date().toISOString();
            
            await saveConfig(key, json);
        } catch (e) {
            return fail(400, { error: "JSON không hợp lệ", key, configString });
        }

        throw redirect(303, '/admin');
    }
};