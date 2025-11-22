<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData, SubmitFunction } from './$types';

   
	export let data: PageData;
	export let form: ActionData;

	let editorContainer: HTMLElement;
	let editorInstance: any;
	let jsonString = JSON.stringify(data.config);
	let jsonOutputText = JSON.stringify(data.config, null, 2);
    let showToast = false;
	let toastTimeout: any;

	$: if (form?.success) {
		showToast = true;
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => { showToast = false; }, 3000);
	}

	
	let lineNumbers = "";
	let textareaRef: HTMLTextAreaElement;
	let lineNumbersRef: HTMLDivElement;
	
	$: {
		const lines = jsonOutputText.split('\n').length;
		lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
	}

	function handleScroll() {
		if (lineNumbersRef && textareaRef) {
			lineNumbersRef.scrollTop = textareaRef.scrollTop;
		}
	}

	const submitHandler: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
		};
	};

	const schema = {
		title: "Cấu Hình Bản Đồ",
		type: "object",
		properties: {
			title: { type: "string", title: "Tiêu đề bản đồ", default: "Bản đồ quy hoạch" },
			logoUrl: { type: "string", title: "Link Logo", format: "url" },
			zoom: { type: "integer", title: "Zoom", default: 13, minimum: 1, maximum: 20 },
			center: {
				type: "array", title: "Tọa độ trung tâm [Lat, Lng]", format: "table",
				items: { type: "number" }, minItems: 2, maxItems: 2, default: [10.7769, 106.7009]
			},
			baseLayers: {
				type: "array", title: "Bản đồ nền",
				items: {
					type: "object", title: "Bản đồ", headerTemplate: "{{ self.name }}",
					properties: {
						name: { type: "string", title: "Tên bản đồ " },
						layerUrl: { type: "string", title: "URL bản đồ" },
						thumbnailUrl: { type: "string", title: "Ảnh thumbnail" }
					}
				}
			},
			overlays: {
				type: "array", title: "Lớp dữ liệu",
				items: {
					type: "object", title: "Dữ liệu", headerTemplate: "{{ self.name }}",
					properties: {
						name: { type: "string", title: "Tên lớp" },
						wmsUrl: { type: "string", title: "WMS URL" },
						layers: { type: "string", title: "Tên layer" },
						iconUrl: { type: "string", title: "Icon URL" },
						active: { type: "boolean", title: "Bật mặc định", format: "checkbox" }
					}
				}
			}
		}
	};

	function updateFormFromJSON() {
		try {
			const val = JSON.parse(jsonOutputText);
			editorInstance.setValue(val);
			alert("Đã cập nhật Form thành công!");
		} catch (err) {
			alert("Lỗi JSON: " + err);
		}
	}

	onMount(async () => {
		if (editorContainer) {
			const module = await import('@json-editor/json-editor');
			const JSONEditor = module.JSONEditor;

			editorInstance = new JSONEditor(editorContainer, {
				schema: schema,
				startval: data.config, 
				theme: 'bootstrap5',
				iconlib: 'fontawesome5',
				disable_edit_json: true,
				disable_properties: true,
				disable_collapse: false,
				object_layout: 'grid',
				disable_array_delete_all_rows: true,
				disable_array_delete_last_row: true,
				disable_array_reorder: true,
				array_controls_top: false
			});

			editorInstance.on('change', () => {
				const value = editorInstance.getValue();
				jsonString = JSON.stringify(value);
				jsonOutputText = JSON.stringify(value, null, 2);
			});
		}
	});

	onDestroy(() => {
		if (editorInstance) {
			editorInstance.destroy();
		}
	});
</script>

<svelte:head>
	<title>Sửa: {data.key}</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</svelte:head>

{#if showToast}
	<div class="toast-container">
		<div class="alert shadow-lg d-flex align-items-center alert-success" role="alert">
			<i class="fas fa-check-circle me-3 fs-4"></i>
			<div>
				<h6 class="alert-heading fw-bold mb-0">Cập nhật thành công!</h6>
				<small>{form?.message}</small>
			</div>
			<button type="button" class="btn-close ms-3" on:click={() => showToast = false}></button>
		</div>
	</div>
{/if}

<div class="container-fluid p-4">
	<div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
            <a href="/admin" class="btn btn-outline-secondary"><i class="fas fa-arrow-left"></i></a>
            <h2 class="text-primary m-0"><i class="fas fa-edit me-2"></i>Chỉnh Sửa</h2>
        </div>
		<div>
            <button type="submit" form="configForm" class="btn btn-primary btn-lg shadow">
				<i class="fas fa-save me-2"></i> Lưu Chỉnh Sửa
			</button>
		</div>
	</div>

    {#if form?.error}
        <div class="alert alert-danger shadow-sm mb-4">
            <i class="fas fa-exclamation-triangle me-2"></i> {form.error}
        </div>
    {/if}

	<div class="row g-4">
		<div class="col-lg-6">
			<div class="card shadow-sm h-100">
				<div class="card-header bg-white border-bottom">
					<h5 class="mb-0 text-success"><i class="fas fa-edit me-2"></i>Form Chỉnh Sửa</h5>
				</div>
				<div class="card-body scrollable-card">
					<form method="POST" action="?/update" use:enhance={submitHandler} id="configForm">
                        
                        <div class="mb-4 p-3 bg-light border rounded d-flex justify-content-between align-items-center">
                            <div>
                                <label class="form-label fw-bold text-muted m-0">KEY :</label>
                                <span class="fw-bold text-dark fs-5 ms-2">{data.key}</span>
                            </div>
                            <span class="badge bg-secondary">Chỉ xem</span>
                        </div>

						<div bind:this={editorContainer}></div>
						<input type="hidden" name="config" bind:value={jsonString} />
					</form>
				</div>
			</div>
		</div>

		<div class="col-lg-6">
			<div class="card shadow-sm h-100 border-primary">
				<div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
					<h5 class="mb-0"><i class="fas fa-code me-2"></i>JSON</h5>
					<button class="btn btn-sm btn-light text-primary fw-bold" on:click={updateFormFromJSON}>
						<i class="fas fa-sync-alt me-1"></i> Cập nhật
					</button>
				</div>
				<div class="card-body p-0 code-editor-wrapper scrollable-card">
					<div class="line-numbers" bind:this={lineNumbersRef}>
						{lineNumbers}
					</div>
					<textarea
						class="code-textarea"
						spellcheck="false"
						bind:this={textareaRef}
						bind:value={jsonOutputText}
						on:scroll={handleScroll}
					></textarea>

				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f0f2f5;
		height: 100vh;
		overflow-y: auto;
	}
	.scrollable-card {
		max-height: calc(100vh - 150px);
		overflow-y: auto;
	}
	.font-monospace {
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 0.9rem;
	}
	.code-editor-wrapper {
		display: flex;
		height: 100%;
		background-color: #fafafa;
		font-family: 'Consolas', 'Monaco', monospace;
		font-size: 14px;
		line-height: 1.5;
	}
	.line-numbers {
		min-width: 40px;
		background-color: #eee;
		color: #999;
		text-align: right;
		padding: 15px 10px;
		border-right: 1px solid #ddd;
		user-select: none;
		white-space: pre-line;
		overflow: hidden;
	}
	.code-textarea {
		flex: 1;
		border: none;
		outline: none;
		background-color: transparent;
		padding: 15px;
		resize: none;
		white-space: pre;
		color: #333;
		overflow-y: auto;
	}
	:global(.card-header) {
		display: flex !important;
		justify-content: space-between !important;
		align-items: center !important;
		padding: 10px 15px;
		background-color: #ffffff;
		border-bottom: 1px solid #eee;
	}
	:global(.card-header .btn-group) {
		margin-left: auto;
	}
	
	:global(.btn-group-vertical) {
		display: flex !important;
		flex-direction: row !important;
		gap: 20px !important;
		width: 100% !important;
		align-items: center;
		margin-top: 15px;
	}

	:global(.btn-group-vertical > .btn) {
		flex: 1;
		width: auto !important;
		border-radius: 5px !important;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}
	:global(.json-editor-btn-add) { margin-top: 5px; }
	.toast-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		min-width: 300px;
		animation: slideInRight 0.5s ease-out;
	}
	@keyframes slideInRight {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
</style>