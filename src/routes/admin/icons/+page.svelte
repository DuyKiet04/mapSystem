<script lang="ts">
    import { enhance } from '$app/forms';
    export let data; 
    export let form; 

    let width = 48;
    let height = 48;
    let uploadMode = 'file';
    let imageUrlInput = '';
    
    let fileInput: HTMLInputElement;
    let previewImg: HTMLImageElement;
    let resultCanvas: HTMLCanvasElement;
    
    let selectedFile: File | null = null;
    let isProcessing = false;
    $: icons = data?.icons || [];

    // ---  CHỌN FILE ---
    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            selectedFile = target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if(previewImg) {
                    previewImg.src = e.target?.result as string;
                    previewImg.onload = () => runPicaPreview();
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    // ---  NHẬP URL ---
    function handleUrlInput() {
        if (imageUrlInput && previewImg) {
            previewImg.crossOrigin = "Anonymous";
            previewImg.src = imageUrlInput;
            previewImg.onload = () => runPicaPreview();
        }
    }

    // ---  PREVIEW ẢNH  ---
    async function runPicaPreview() {
        if (!previewImg || !resultCanvas) return;
        const picaModule = await import('pica');
        const picaInstance = picaModule.default(); 
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = previewImg.naturalWidth;
        sourceCanvas.height = previewImg.naturalHeight;
        const ctx = sourceCanvas.getContext('2d');
        if(ctx) ctx.drawImage(previewImg, 0, 0);

        resultCanvas.width = width;
        resultCanvas.height = height;

        try {
            await picaInstance.resize(sourceCanvas, resultCanvas, {
                quality: 3,
                alpha: true
            });
        } catch (err) {
            console.error("Lỗi preview:", err);
        }
    }

    // --- UPLOAD ---
    async function processAndUpload() {
        if (!previewImg.src || previewImg.src === '') {
            alert("Vui lòng chọn ảnh!");
            return;
        }

        isProcessing = true;
        const picaModule = await import('pica');
        const picaInstance = picaModule.default();

        try {
            await runPicaPreview(); 
            
            const blob = await picaInstance.toBlob(resultCanvas, 'image/png', 0.90);
            const fileName = selectedFile ? selectedFile.name : 'icon-url.png';
            const resizedFile = new File([blob], fileName, { type: 'image/png' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(resizedFile);
            
            const hiddenInput = document.getElementById('hidden-upload') as HTMLInputElement;
            hiddenInput.files = dataTransfer.files;

            document.getElementById('real-submit-btn')?.click();

        } catch (error) {
            console.error(error);
            alert("Lỗi xử lý ảnh.");
            isProcessing = false;
        }
    }
    $: if (width || height) {
        if (previewImg && previewImg.src) setTimeout(() => runPicaPreview(), 100);
    }

    function copyLink(url: string) {
        navigator.clipboard.writeText(url);
        alert("Đã copy link!");
    }
</script>

<svelte:head>
    <title>Quản Lý Icons</title>
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

    {#if form?.success}
        <div class="alert alert-success alert-dismissible fade show">
            <i class="fas fa-check-circle me-2"></i> {form.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    {/if}
    {#if form?.error}
        <div class="alert alert-danger alert-dismissible fade show">
            <i class="fas fa-exclamation-circle me-2"></i> {form.error}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    {/if}

    <div class="row g-4">
        <div class="col-lg-4">
            <div class="card shadow-sm border-success">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">Tạo Icon Mới</h5>
                </div>
                <div class="card-body">
                    <div class="btn-group w-100 mb-3">
                        <button class="btn btn-outline-success" class:active={uploadMode==='file'} on:click={()=>uploadMode='file'}>File</button>
                        <button class="btn btn-outline-success" class:active={uploadMode==='url'} on:click={()=>uploadMode='url'}>URL</button>
                    </div>

                    {#if uploadMode === 'file'}
                        <div class="mb-3">
                            <input type="file" class="form-control" accept="image/*" on:change={handleFileSelect}>
                        </div>
                    {:else}
                        <div class="mb-3">
                            <input type="text" class="form-control" placeholder="Link ảnh..." bind:value={imageUrlInput} on:change={handleUrlInput}>
                        </div>
                    {/if}

                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label small">Rộng</label>
                            <input type="number" class="form-control" bind:value={width}>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Cao</label>
                            <input type="number" class="form-control" bind:value={height}>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded border">
                        <img bind:this={previewImg} alt="" style="max-width: 60px; max-height: 60px;">
                        <i class="fas fa-arrow-right text-muted"></i>
                        <canvas bind:this={resultCanvas} class="border bg-white" style="max-width: 80px; max-height: 80px;"></canvas>
                    </div>

                    <button class="btn btn-primary w-100" on:click={processAndUpload} disabled={isProcessing}>
                        {#if isProcessing} Đang tải... {:else} Lưu {/if}
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
                <div class="card-header bg-light">
                    <h5 class="mb-0">Thư viện ({icons.length})</h5>
                </div>
                <div class="card-body p-0 table-responsive" style="max-height: 600px;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th class="ps-3">Icon</th>
                                <th>Tên File</th>
                                <th class="text-end pe-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if icons.length === 0}
                                <tr><td colspan="3" class="text-center py-4">Chưa có icon nào.</td></tr>
                            {:else}
                                {#each icons as icon}
                                    <tr>
                                        <td class="ps-3">
                                            <img src={icon.url} alt="icon" width="32" height="32" class="border rounded">
                                        </td>
                                        <td>
                                            <div class="text-truncate" style="max-width: 250px;">{icon.name}</div>
                                        </td>
                                        <td class="text-end pe-3">
                                            <button class="btn btn-sm btn-outline-primary me-1" on:click={() => copyLink(icon.url)}>
                                                <i class="fas fa-copy"></i>
                                            </button>
                                            <form action="?/delete" method="POST" use:enhance class="d-inline">
                                                <input type="hidden" name="fullPath" value={icon.fullPath}>
                                                <button class="btn btn-sm btn-outline-danger" on:click={(e) => { if (!confirm('Xóa?')) e.preventDefault(); }}>
                                                    <i class="fas fa-trash"></i>
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
        </div>
    </div>
</div>