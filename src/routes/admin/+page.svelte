<script lang="ts">
    import { enhance } from '$app/forms';
    export let data;
    export let form; 
</script>

<svelte:head>
    <title>Admin Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="text-primary"><i class="fas fa-layer-group me-2"></i>Quản Lý Cấu Hình Bản Đồ</h1>
        <a href="/admin/config/new" class="btn btn-success btn-lg">
            <i class="fas fa-plus-circle me-2"></i> Tạo Mới
        </a>
    </div>

    {#if form?.success}
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i> {form.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    {/if}

    <div class="card shadow">
        <div class="card-body p-0">
            <table class="table table-hover table-striped mb-0">
                <thead class="table-dark">
                    <tr>
                        <th class="ps-4">KEY</th>
                        <th>API URL</th>
                        <th>Ngày cập nhật</th>
                        <th class="text-end pe-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {#if data.configs.length === 0}
                        <tr>
                            <td colspan="4" class="text-center py-5 text-muted">
                                <i class="fas fa-folder-open fa-3x mb-3"></i><br>
                                Chưa có cấu hình nào. Hãy tạo mới!
                            </td>
                        </tr>
                    {:else}
                        {#each data.configs as conf}
                            <tr>
                                <td class="ps-4 fw-bold text-primary">{conf.key}</td>
                                <td>
                                    <small class="bg-light border rounded px-2 py-1 font-monospace">
                                        /api/config/{conf.key}
                                    </small>
                                    <a href="/api/config/{conf.key}" target="_blank" class="ms-2 text-secondary">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </td>
                                <td>{new Date(conf.lastModified).toLocaleString()}</td>
                                <td class="text-end pe-4">
                                    <a href="/admin/config/{conf.key}" class="btn btn-sm btn-outline-primary me-2">
                                        <i class="fas fa-edit"></i> Sửa
                                    </a>

                                    <form action="?/delete" method="POST" class="d-inline" use:enhance>
                                        <input type="hidden" name="key" value={conf.key}>
                                        <button type="submit" class="btn btn-sm btn-outline-danger" 
                                            on:click={(e) => { if (!confirm('Bạn có chắc muốn xóa bản đồ này?')) e.preventDefault(); }}>
                                            <i class="fas fa-trash-alt"></i> Xóa
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="mt-4 text-center">
        <a href="/admin/thumbnails" class="btn btn-secondary">
            <i class="fas fa-images me-2"></i> Quản lý Thumbnails
        </a>
        <a href="/admin/icons" class="btn btn-info text-white">
            <i class="fas fa-icons me-2"></i> Quản lý Icons
        </a>
    </div>
</div>