<script lang="ts">
    import { enhance } from '$app/forms';
    export let data;
    export let form; 
    
    $: icons = data?.icons || [];

    // --- CẤU HÌNH ---
    let width = 48; 
    let height = 48;
    let uploadMode = 'file'; 
    let imageUrlInput = '';
    let previewSrc = '';
    let selectedFile: File | null = null;
    let isProcessing = false;
    let showSuccess = false;

    $: if (form?.success) { 
        showSuccess = true; 
        isProcessing = false; 
        setTimeout(() => showSuccess = false, 3000); 
        previewSrc = '';
        selectedFile = null;
        imageUrlInput = '';
    }
    $: if (form && !form.success) { isProcessing = false; }

    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            selectedFile = target.files[0];
            previewSrc = URL.createObjectURL(selectedFile);
        }
    }

    function handleUrlInput() {
        if (!imageUrlInput) return;
        previewSrc = `/api/proxy?url=${encodeURIComponent(imageUrlInput)}`; 
    }

    async function processAndUpload() {
        if (!previewSrc) return alert("Chưa có ảnh!");
        isProcessing = true;

        try {
            const picaModule = await import('pica'); 
            const pica = picaModule.default || picaModule; 

            const img = new Image();
            img.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject("Không tải được ảnh gốc");
                img.src = previewSrc;
            });

            const fromCanvas = document.createElement('canvas');
            fromCanvas.width = img.width;
            fromCanvas.height = img.height;
            const ctx = fromCanvas.getContext('2d');
            if (!ctx) throw new Error("Lỗi Canvas");
            ctx.drawImage(img, 0, 0);

            const toCanvas = document.createElement('canvas');
            toCanvas.width = width;  
            toCanvas.height = height;

            const picaResizer = pica();
            await picaResizer.resize(fromCanvas, toCanvas, {
                unsharpAmount: 80,
                unsharpRadius: 0.6,
                unsharpThreshold: 2
            });

            const blob = await picaResizer.toBlob(toCanvas, 'image/png', 0.90);
            if (!blob) throw new Error("Lỗi tạo blob pica");

            let baseName = "icon-url";
            if (uploadMode === 'file' && selectedFile) {
                baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
            }
            const finalName = `${baseName}-${Date.now()}.png`;

            const fileToSend = new File([blob], finalName, { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(fileToSend);
            
            const hiddenInput = document.getElementById('hidden-upload') as HTMLInputElement;
            hiddenInput.files = dt.files;

            document.getElementById('real-submit-btn')?.click();

        } catch (error) {
            console.error(error);
            alert("Lỗi xử lý ảnh: " + error);
            isProcessing = false;
        }
    }

    function copyLink(url: string) { 
        navigator.clipboard.writeText(url); 
        alert("Đã copy link ảnh!"); 
    }
</script>

<svelte:head>
    <title>Quản Lý Icon</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<div class="container py-5">
     <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary"><i class="fas fa-icons me-2"></i>Quản Lý Icons</h2>
        <a href="/admin" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left"></i> 
        </a>
    </div>

    {#if showSuccess}
        <div class="alert alert-success position-fixed top-0 end-0 m-3 shadow" style="z-index: 9999;">
            <i class="fas fa-check-circle me-2"></i> Thành công!
        </div>
    {/if}

    <div class="row g-4">
        <div class="col-lg-4">
            <div class="card shadow-sm border-primary">
                <div class="card-header bg-primary text-white"><h5 class="mb-0">Tạo Icon Mới</h5></div>
                <div class="card-body">
                    <div class="btn-group w-100 mb-3">
                        <button class="btn btn-outline-primary" class:active={uploadMode==='file'} 
                            on:click={()=>{uploadMode='file'; previewSrc='';}}>Upload File</button>
                        <button class="btn btn-outline-primary" class:active={uploadMode==='url'} 
                            on:click={()=>{uploadMode='url'; previewSrc='';}}>Nhập URL</button>
                    </div>

                    {#if uploadMode === 'file'}
                        <input type="file" class="form-control mb-3" accept="image/*" on:change={handleFileSelect}>
                    {:else}
                        <input type="text" class="form-control mb-3" placeholder="Dán link ảnh..." 
                            bind:value={imageUrlInput} on:change={handleUrlInput}>
                    {/if}

                    <div class="d-flex gap-2 mb-3">
                        <div class="w-50"><label class="small fw-bold">Rộng</label><input type="number" class="form-control" bind:value={width}></div>
                        <div class="w-50"><label class="small fw-bold">Cao</label><input type="number" class="form-control" bind:value={height}></div>
                    </div>

                    <div class="text-center bg-light p-3 rounded mb-3 border d-flex align-items-center justify-content-center" style="min-height: 100px;">
                        {#if previewSrc}
                            <img src={previewSrc} alt="" style="max-height: 80px;" class="shadow-sm bg-white border">
                        {:else}
                            <span class="text-muted small">Preview ảnh gốc</span>
                        {/if}
                    </div>

                    <button class="btn btn-primary w-100" on:click={processAndUpload} disabled={isProcessing}>
                        {#if isProcessing}
                            <i class="fas fa-spinner fa-spin"></i> Đang tải...
                        {:else}
                            <i class="fas fa-save"></i> Lưu Ngay
                        {/if}
                    </button>

                    <form method="POST" action="?/upload" use:enhance enctype="multipart/form-data" class="d-none">
                        <input type="file" name="file" id="hidden-upload">
                        <button type="submit" id="real-submit-btn"></button>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-header bg-white"><h5 class="mb-0">Danh sách ({icons.length})</h5></div>
                <div class="card-body p-0 table-responsive" style="max-height: 600px;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Icon</th>
                                <th>Tên File</th>
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if icons.length === 0}
                                <tr><td colspan="3" class="text-center py-4 text-muted">Chưa có icon nào</td></tr>
                            {:else}
                                {#each icons as icon}
                                    <tr>
                                        <td class="ps-4">
                                            <div class="border rounded bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                                <img src={icon.url} alt="icon" width="48" height="48" style="object-fit: contain;">
                                            </div>
                                        </td>
                                        <td>
                                            <div class="text-truncate fw-bold" style="max-width: 250px;">{icon.name}</div>
                                            <small class="text-muted">
                                                {icon.lastModified ? new Date(icon.lastModified).toLocaleDateString() : ''}
                                            </small>
                                        </td>
                                        <td class="text-end pe-4">
                                            <div class="d-flex justify-content-end gap-2">
                                                <button class="btn btn-sm btn-outline-secondary" on:click={() => copyLink(icon.url)} title="Copy Link">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                                <form action="?/delete" method="POST" use:enhance>
                                                    <input type="hidden" name="fileName" value={icon.name} />
                                                    <button type="submit" class="btn btn-danger btn-sm" 
                                                        on:click={(e) => !confirm('Bạn chắc chắn muốn xóa?') && e.preventDefault()} title="Xóa">
                                                        <i class="fa fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>