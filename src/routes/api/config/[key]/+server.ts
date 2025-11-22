
import { json } from '@sveltejs/kit';
import { getConfig } from '$lib/server/minio.server';
export async function GET({ params }) {
    const key = params.key; 
    const config = await getConfig(key);
    if (!config) {
        return json({ error: "Config not found" }, { status: 404 });
    }
    return json(config, {
        headers: { 'Cache-Control': 'public, max-age=60' }
    });
}