import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ url }) => {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) return new Response('Missing URL', { status: 400 });
    try {
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        return new Response(blob, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response('Proxy Error', { status: 500 });
    }
};