<script lang="ts">
    import { enhance } from '$app/forms';

    export let data;
    export let form; 
    
    $: icons = data?.icons || [];

    //  CẤU HÌNH 
    let width = 48; 
    let height = 48;
    let uploadMode = 'file'; 
    let imageUrlInput = '';
    let previewSrc = ''; 
    let selectedFile: File | null = null;
    let isProcessing = false;
    let blobToSend: Blob | null = null; 

    $: if (form) { isProcessing = false; }
    $: if (form?.success) { 
        imageUrlInput = '';
        selectedFile = null;
        previewSrc = '';
        blobToSend = null;
    }

    //  PREVIEW 
    async function updateLivePreview() {
        if (uploadMode === 'file' && !selectedFile) return;
        if (uploadMode === 'url' && !imageUrlInput) return;

        try {
            const picaModule = await import('pica'); 
            const pica = picaModule.default || picaModule; 
            let imgSourceUrl = '';
            if (uploadMode === 'file' && selectedFile) {
                imgSourceUrl = URL.createObjectURL(selectedFile);
            } else if (uploadMode === 'url' && imageUrlInput) {
                imgSourceUrl = `/api/proxy?url=${encodeURIComponent(imageUrlInput)}`;
            }

            const img = new Image();
            img.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject("Không tải được ảnh từ URL này");
                img.src = imgSourceUrl;
            });

            const fromCanvas = document.createElement('canvas');
            fromCanvas.width = img.width;
            fromCanvas.height = img.height;
            const ctx = fromCanvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0);
            const toCanvas = document.createElement('canvas');
            toCanvas.width = width;  
            toCanvas.height = height;
            const picaResizer = pica();
            await picaResizer.resize(fromCanvas, toCanvas, { unsharpAmount: 80, unsharpRadius: 0.6 });
            const blob = await picaResizer.toBlob(toCanvas, 'image/png', 0.90);
            blobToSend = blob; 
            previewSrc = URL.createObjectURL(blob); 

        } catch (error) {
            console.error("Lỗi Preview:", error);
        }
    }

    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            selectedFile = target.files[0];
            updateLivePreview(); 
        }
    }
    
    function handleSizeChange() {
        if (previewSrc) updateLivePreview();
    }

    //   UPLOAD 
    async function handleUploadClick() {
        // Nếu chưa có blob (do chưa preview), thử tạo lại lần cuối
        if (!blobToSend) {
            await updateLivePreview();
            if (!blobToSend) return alert("Vui lòng chọn ảnh hợp lệ hoặc kiểm tra URL!");
        }
        isProcessing = true;
        let finalName = '';

        // TIMESTAMP 
        if (uploadMode === 'file' && selectedFile) {
            const originalName = selectedFile.name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            finalName = `${nameWithoutExt}-${Date.now()}.png`;
            
        } else {
            let tempName = 'icon-url';
            try {
                const urlObj = new URL(imageUrlInput);
                tempName = urlObj.pathname.split('/').pop() || 'icon-url';
                if (imageUrlInput.includes('gstatic.com') || tempName === 'images' || tempName.length < 3) {
                    tempName = 'google-image';
                }
            } catch (e) {}
            tempName = tempName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const cleanName = tempName.replace(/\.[^/.]+$/, "") || "icon";
            finalName = `${cleanName}-${Date.now()}.png`;
        }
        const fileToSend = new File([blobToSend], finalName, { type: 'image/png' });
        const dt = new DataTransfer();
        dt.items.add(fileToSend);

        const hiddenInput = document.getElementById('hidden-upload') as HTMLInputElement;
        const hiddenFilename = document.getElementById('hidden-filename') as HTMLInputElement;
        hiddenInput.files = dt.files;
        hiddenFilename.value = finalName;
        document.getElementById('real-submit-btn')?.click();
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
        <h2 class="text-primary fw-bold"><i class="fas fa-icons me-2"></i>Quản Lý Icon</h2>
        <a href="/admin" class="btn btn-outline-secondary"><i class="fas fa-arrow-left"></i></a>
    </div>

    {#if form?.success}
        <div class="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3 shadow" style="z-index: 9999;">
            <i class="fas fa-check-circle me-2"></i> {form.message || 'Upload thành công!'}
            <button type="button" class="btn-close" on:click={() => form = null}></button>
        </div>
    {/if}

    <div class="row g-4">
        <div class="col-lg-4">
            <div class="card shadow-sm border-primary">
                <div class="card-header bg-primary text-white"><h5 class="mb-0">Tạo Icon Mới</h5></div>
                <div class="card-body">
                    <div class="btn-group w-100 mb-3">
                        <button class="btn btn-outline-primary" class:active={uploadMode==='file'} 
                            on:click={()=>{uploadMode='file'; previewSrc=''; selectedFile=null;}}>Upload File</button>
                        <button class="btn btn-outline-primary" class:active={uploadMode==='url'} 
                            on:click={()=>{uploadMode='url'; previewSrc=''; selectedFile=null;}}>Nhập URL</button>
                    </div>

                    {#if uploadMode === 'file'}
                        <input type="file" class="form-control mb-3" accept="image/*" on:change={handleFileSelect}>
                    {:else}
                        <input type="text" class="form-control mb-3" placeholder="Dán link ảnh..." 
                            bind:value={imageUrlInput} 
                            on:change={updateLivePreview} 
                            on:blur={updateLivePreview}
                            on:keydown={(e) => e.key === 'Enter' && updateLivePreview()}>
                    {/if}

                    <div class="d-flex gap-2 mb-3">
                        <div class="w-50"><label class="small fw-bold">Rộng</label>
                            <input type="number" class="form-control" bind:value={width} on:change={handleSizeChange}>
                        </div>
                        <div class="w-50"><label class="small fw-bold">Cao</label>
                            <input type="number" class="form-control" bind:value={height} on:change={handleSizeChange}>
                        </div>
                    </div>

                    <div class="text-center bg-light p-3 rounded mb-3 border d-flex flex-column align-items-center justify-content-center" style="min-height: 120px;">
                        {#if previewSrc}
                            <img src={previewSrc} alt="Preview" class="shadow-sm bg-white border mb-2">
                            <small class="text-success fw-bold"><i class="fas fa-check"></i> Đã Resize ({width}x{height})</small>
                        {:else}
                            <span class="text-muted small btn ">Click vào đây để xem ảnh Preview</span>
                        {/if}
                    </div>

                    <button class="btn btn-primary w-100" on:click={handleUploadClick} disabled={isProcessing || (uploadMode === 'file' && !selectedFile && !imageUrlInput)}>
                        {#if isProcessing}
                            <i class="fas fa-spinner fa-spin"></i> Đang Upload...
                        {:else}
                            <i class="fas fa-save"></i> Lưu Icon
                        {/if}
                    </button>

                    <form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance class="d-none">
                        <input type="file" name="file" id="hidden-upload">
                        <input type="hidden" name="filename" id="hidden-filename">
                        <button type="submit" id="real-submit-btn"></button>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-header bg-white"><h5 class="mb-0">Danh sách Icon</h5></div>
                <div class="card-body p-0 table-responsive" style="max-height: 600px;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Icon</th>
                                <th>Tên Icon</th>
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
                                            <div class="p-1 border rounded bg-light d-inline-block">
                                                <img src={icon.url} alt="icon" style="max-height: 50px; width: auto;">
                                            </div>
                                        </td>
                                        <td>
                                            <div class="text-truncate fw-bold" style="max-width: 250px;">{icon.name}</div>
                                            <small class="text-muted">
                                                {icon.lastModified ? new Date(icon.lastModified).toLocaleString() : ''}
                                            </small>
                                        </td>
                                        <td class="text-end pe-4">
                                            <div class="d-flex justify-content-end gap-2">
                                                <button class="btn btn-sm btn-outline-secondary" on:click={() => copyLink(icon.url)} title="Copy Link">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                                <form action="?/delete" method="POST" use:enhance>
                                                    <input type="hidden" name="fullPath" value={icon.fullPath} />
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