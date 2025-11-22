import { json } from '@sveltejs/kit';
import { getConfig } from '$lib/server/minio.server';

export async function GET({ params }) {
    const key = params.key;
    const config = await getConfig(key);

    if (!config) {
        return json({ error: "Config not found" }, { status: 404 });
    }
    return json(config, {
        headers: {
            'Cache-Control': 'public, max-age=60',
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
export async function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}