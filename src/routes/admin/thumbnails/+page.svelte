<script lang="ts">
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import html2canvas from 'html2canvas';
    
    let L: any;

    export let data;
    export let form; 
    let mapContainer: HTMLElement;
    let mapInstance: any;
    let tileLayer: any;
    let inputName = "";
    let inputUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
    let imageData = ""; 
    let isProcessing = false;

    onMount(async () => {
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
        await import('leaflet/dist/leaflet.css');
        if (mapContainer) {
            mapInstance = L.map(mapContainer, {
                center: [10.7769, 106.7009], 
                zoom: 13,
                zoomControl: false, 
                attributionControl: false 
            });

            loadLayer(); 
        }
    });

    function loadLayer() {
        if (mapInstance) {
            if (tileLayer) mapInstance.removeLayer(tileLayer);
            try {
                tileLayer = L.tileLayer(inputUrl, {
                    maxZoom: 19,
                    crossOrigin: 'anonymous'
                }).addTo(mapInstance);
            } catch (e) {
                alert("URL bản đồ không hợp lệ!");
            }
        }
    }

    async function captureMap() {
        if (!inputName) {
            alert("Vui lòng nhập tên Thumbnail trước!");
            return;
        }
        
        isProcessing = true;
        
        try {
            const canvas = await html2canvas(mapContainer, {
                useCORS: true,       
                allowTaint: false,   
                logging: false,      
                backgroundColor: '#f0f0f0',
                scale: 1
            });
            
            imageData = canvas.toDataURL("image/jpeg", 0.8);
            document.getElementById('uploadBtn')?.click();
            
        } catch (error) {
            console.error("Lỗi chụp ảnh:", error);
            alert("Lỗi chụp ảnh!");
            isProcessing = false; 
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        alert("Đã copy link: " + text);
    }

    const handleUpload = () => {
        return async ({ update }) => {
            await update();
            isProcessing = false;
        };
    };
</script>

<svelte:head>
    <title>Quản lý Thumbnail</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary"><i class="fas fa-images me-2"></i>Quản Lý Thumbnail</h2>
        <a href="/admin" class="btn btn-outline-secondary"> <i class="fas fa-arrow-left"></i></a>
    </div>

    {#if form?.success}
        <div class="alert alert-success alert-dismissible fade show">
            <i class="fas fa-check-circle me-2"></i> {form.message}
            <button type="button" class="btn-close" on:click={() => form = null}></button>
        </div>
    {/if}

    <div class="row g-4">
        <div class="col-lg-5">
            <div class="card shadow-sm">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0"><i class="fas fa-camera me-2"></i>Tạo Thumbnail </h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Tên Thumbnail:</label>
                        <input type="text" class="form-control" bind:value={inputName} placeholder="vd: osm">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">URL Bản đồ nền:</label>
                        <div class="input-group">
                            <input type="text" class="form-control" bind:value={inputUrl}>
                            <button class="btn btn-outline-secondary" on:click={loadLayer}>Run</button>
                        </div>
                        <div class="form-text">Nhập URL dạng <code>https://.../{'{z}'}/{'{x}'}/{'{y}'}.png</code></div>
                    </div>

                    <label class="form-label fw-bold">Xem & Chụp:</label>
                    <div class="map-preview-container border rounded mb-3" style="height: 250px; position: relative;">
                        <div bind:this={mapContainer} style="width: 100%; height: 100%;"></div>
                        <div class="position-absolute top-50 start-50 translate-middle text-white bg-dark bg-opacity-50 px-3 py-1 rounded pointer-events-none" style="z-index: 1000; pointer-events: none;">
                            <small>Kéo & Zoom để chọn góc chụp</small>
                        </div>
                    </div>
                    
                    <div class=" w-100 d-flex justify-content-center align-items-center">
                        <button class="btn btn-primary w-40" on:click={captureMap} disabled={isProcessing}>
                            {#if isProcessing}
                                <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
                            {:else}
                                <i class="fas fa-camera"></i> Chụp
                            {/if}
                        </button>
                    </div>

                    <form method="POST" action="?/upload" use:enhance={handleUpload} class="d-none">
                        <input type="hidden" name="name" value={inputName}>
                        <input type="hidden" name="image" value={imageData}>
                        <button id="uploadBtn" type="submit"></button>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card shadow-sm">
                <div class="card-header bg-light">
                    <h5 class="mb-0"><i class="fas fa-list me-2"></i>Thư viện ảnh</h5>
                </div>
                <div class="card-body p-0" style="max-height: 600px; overflow-y: auto;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th class="ps-3">Ảnh</th>
                                <th>Tên / Link</th>
                                <th class="text-end pe-3">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if data.thumbnails.length === 0}
                                <tr><td colspan="3" class="text-center py-4 text-muted">Chưa có ảnh nào.</td></tr>
                            {:else}
                                {#each data.thumbnails as thumb}
                                    <tr>
                                        <td class="ps-3">
                                            <img src={thumb.url} alt={thumb.name} class="rounded border" width="80" height="50" style="object-fit: cover;">
                                        </td>
                                        <td>
                                            <div class="fw-bold text-dark">{thumb.name}</div>
                                            <div class="input-group input-group-sm mt-1" style="max-width: 250px;">
                                                <input type="text" class="form-control bg-white" value={thumb.url} readonly>
                                                <button class="btn btn-outline-secondary" on:click={() => copyToClipboard(thumb.url)}>
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="text-end pe-3">
                                            <form action="?/delete" method="POST" use:enhance>
                                                <input type="hidden" name="fullPath" value={thumb.fullPath}>
                                                <button 
                                                    type="submit" 
                                                    class="btn btn-sm btn-outline-danger border-0" 
                                                    on:click={(e) => { if (!confirm('Bạn có chắc muốn xóa ảnh này?')) e.preventDefault(); }}
                                                >
                                                    <i class="fas fa-trash-alt"></i>
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

