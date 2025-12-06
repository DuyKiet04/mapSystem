// import { listIcons, uploadIcon, deleteFile } from '$lib/server/minio.server';
// import type { PageServerLoad, Actions } from './$types';
// import { fail } from '@sveltejs/kit';

// export const load: PageServerLoad = async () => {
//     const icons = await listIcons();
//     return { icons: icons || [] };
// };

// export const actions: Actions = {
//     upload: async ({ request }) => {
//         const formData = await request.formData();
//         const file = formData.get('file') as File;
        
//         if (!file || file.size === 0) {
//             return fail(400, { error: "Vui lòng chọn file ảnh!" });
//         }

//         const originalName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase();
//         const filename = `${originalName}-${Date.now()}.png`;

//         try {
//             const arrayBuffer = await file.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
//             await uploadIcon(filename, buffer);
//             return { success: true, message: "Upload icon thành công!" };
//         } catch (e) {
//             console.error(e);
//             return fail(500, { error: "Lỗi upload lên Server" });
//         }
//     },
//     delete: async ({ request }) => {
//         const formData = await request.formData();
//         const fullPath = formData.get('fullPath') as string;
//         if (!fullPath) return fail(400, { error: "Thiếu đường dẫn file" });
//         await deleteFile(fullPath);
//         return { success: true, message: "Đã xóa icon" };
//     }
// };


import { fail } from '@sveltejs/kit';
import { listIcons, uploadIcon, deleteFile } from '$lib/server/minio.server';

export const load = async () => {
    const icons = await listIcons();
    return { icons };
};

export const actions = {
    // Action Upload (Giữ nguyên nếu đang chạy ổn)
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return fail(400, { message: 'Chưa chọn file hoặc file rỗng' });
        }

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            // Tạo tên file unique để tránh trùng
            const fileName = `icon-url-${Date.now()}.png`; 
            
            await uploadIcon(fileName, buffer);
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { message: 'Lỗi upload file' });
        }
    },

    // Action Delete (ĐÃ FIX LỖI CRASH 500)
    delete: async ({ request }) => {
        const formData = await request.formData();
        const fileName = formData.get('fileName');

        // 1. Kiểm tra kỹ xem có nhận được tên file không
        if (!fileName || typeof fileName !== 'string') {
            console.error("LỖI: Client không gửi fileName lên!");
            return fail(400, { message: 'Thiếu tên file cần xóa' });
        }

        console.log("--> Server nhận yêu cầu xóa file:", fileName);

        try {
            // 2. Gọi hàm xóa an toàn (đã bọc try-catch bên minio.server.ts)
            await deleteFile(fileName);
            return { success: true };
        } catch (error) {
            console.error("Lỗi xóa file:", error);
            return fail(500, { message: 'Không thể xóa file' });
        }
    }
};