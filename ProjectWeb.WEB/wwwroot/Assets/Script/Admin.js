/**
 * Admin Panel Responsive Logic
 */
function toggleSidebar() {
    if (window.innerWidth < 992) {
        document.body.classList.toggle('show-sidebar');
        document.body.classList.remove('sidebar-collapsed');
    } else {
        document.body.classList.toggle('sidebar-collapsed');
        document.body.classList.remove('show-sidebar');
    }
}

$(document).ready(function () {
    // Bind click to hamburger menu
    $(document).on('click', '.sidebar-toggle-box, .nav_overlay', function (e) {
        e.preventDefault();
        toggleSidebar();
    });

    // Close sidebar when clicking a menu item on mobile
    $(document).on('click', '#sidebar a', function () {
        if ($(window).width() < 992 && !$(this).parent().hasClass('sub-menu')) {
            document.body.classList.remove('show-sidebar');
        }
    });

    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    function handleAjaxError(xhr, status, error) {
        let errorMessage = "An error occurred while processing your request.";
        if (xhr.status === 0) {
            errorMessage = "Network error: Unable to connect to the server.";
        } else if (xhr.status === 404) {
            errorMessage = "API endpoint not found (404).";
        } else if (xhr.status === 401) {
            errorMessage = "Unauthorized access. Please login again.";
        } else if (xhr.status === 500) {
            errorMessage = "Internal server error (500).";
        } else if (xhr.responseText) {
            try {
                const res = JSON.parse(xhr.responseText);
                errorMessage = res.response || (res.errorMassage && res.errorMassage.length > 0 ? res.errorMassage.join("<br/>") : errorMessage);
            } catch (e) {
                errorMessage = "Server error occurred.";
            }
        }
        toastr.error(errorMessage, "Error");
        console.error("AJAX Error:", { xhr, status, error });
    }

    if (action_name === "bannercontent") {

        loadBanners();

        $("#btnAddNew").on("click", function () {
            resetModal();
            $("#addBannerModal").modal("show");
        });

        /* ---------- MODAL CLOSE (X + Cancel) ---------- */
        $(".btnModalClose, .btnCancel").on("click", function () {
            $("#addBannerModal").modal("hide");
        });

        /* ---------- BACKGROUND IMAGE PREVIEW ---------- */
        $("#back_img").on("change", function () {
            previewImage(this, "#targetImgback");
        });

        /* ---------- SPLIT IMAGE PREVIEW ---------- */
        $("#split_img").on("change", function () {
            previewImage(this, "#targetImgsplit");
        });

        $("#img_deleteback").click(function (e) {
            e.preventDefault();
            $("#back_img").val("");
            $("#targetImgback").attr("src", "");
        });

        function previewImage(input, target) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(target).attr("src", e.target.result).show();
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        $('#addBannerModal').on('hidden.bs.modal', function () {
            resetModal();
        });

        /* ---------- MODULAR FUNCTIONS ---------- */

        function openEditModal(id) {
            if (!id) {
                toastr.error("Invalid Banner ID.", "Error");
                return;
            }
            loadBannerById(id);
        }

        function loadBannerById(id) {
            const apiUrl = _BaseURL + "/Admin/GetBannerById?id=" + id;
            toastr.info("Fetching banner details...", "Please wait");

            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if (res) {
                        const data = res.Response || res;
                        bindBannerModal(data);
                    } else {
                        toastr.warning("Could not retrieve banner data.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindBannerModal(data) {
            if (!data) return;

            resetModal();

            // Populate fields
            $("#hdn_BannerId").val(data.BannerId || data.bannerId || 0);
            $("#txt_BannerTitle").val(data.Title || data.title || "");
            $("#txt_BannerHeading").val(data.Caption || data.caption || "");
            $("#txt_DisplayPriority").val(data.DisplayOrder || data.displayOrder || 0);
            $("#chk_IsActive").prop("checked", data.IsActive === true || data.isActive === true);

            // Image Preview Fix - Using _ProjectAPI from appsettings
            let imageUrl = data.ImageUrl || data.imageUrl || "";
            if (imageUrl) {
                if (imageUrl.startsWith('/')) {
                    imageUrl = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + imageUrl;
                }
                $("#targetImgback").attr("src", imageUrl).show();
            }

            // Update UI for Update Mode
            $("#addBannerTitle").html('<i class="fa fa-pencil"></i> Update Banner');
            $("#btnSave").addClass("d-none");
            $("#btnUpdate").removeClass("d-none").html('<i class="fa fa-refresh"></i> Update');
            $("#active_mode").removeClass("d-none");

            $("#addBannerModal").modal("show");
            toastr.clear();
        }

        function validateBannerForm() {
            const bannerId = $("#hdn_BannerId").val();
            const isUpdate = bannerId && bannerId !== "0";

            const title = $("#txt_BannerTitle").val().trim();
            const caption = $("#txt_BannerHeading").val().trim();
            const displayOrder = $("#txt_DisplayPriority").val().trim();
            const fileInput = $("#back_img")[0];
            const file = fileInput && fileInput.files ? fileInput.files[0] : null;

            let errors = [];

            if (!title) {
                errors.push("Banner title is required.");
            } else if (title.length > 150) {
                errors.push("Banner title cannot exceed 150 characters.");
            }

            if (!caption) {
                errors.push("Banner caption is required.");
            } else if (caption.length > 500) {
                errors.push("Banner caption cannot exceed 500 characters.");
            }

            if (!displayOrder) {
                errors.push("Display priority is required.");
            } else if (isNaN(displayOrder) || parseInt(displayOrder) <= 0) {
                errors.push("Display priority must be a positive number.");
            }

            // Image validation: Required only for new banners
            if (!isUpdate && !file) {
                errors.push("Background image is required.");
            } else if (file) {
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                if (!allowedTypes.includes(file.type)) {
                    errors.push("Invalid file type. Allowed: JPG, JPEG, PNG, WEBP.");
                }

                const maxSize = 2 * 1024 * 1024; // 2MB
                if (file.size > maxSize) {
                    errors.push("File size exceeds 2MB limit.");
                }
            }

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }

            return true;
        }

        function submitBannerUpdate($btn) {
            const $form = $("#bannar_form");
            const bannerId = $("#hdn_BannerId").val();
            const isUpdate = bannerId && bannerId !== "0";
            const url = isUpdate ? $("#btnUpdate").data("url") : $("#btnSave").data("url");

            const oldPrefix = isUpdate ? "BannerCreateDto." : "BannerUpdateDto.";
            const newPrefix = isUpdate ? "BannerUpdateDto." : "BannerCreateDto.";
            $form.find("input, textarea, select").each(function () {
                const name = $(this).attr("name");
                if (name && name.startsWith(oldPrefix)) {
                    $(this).attr("name", name.replace(oldPrefix, newPrefix));
                }
            });

            if ($btn.prop("disabled")) return;

            $btn.prop("disabled", true).html('<i class="fa fa-spinner fa-spin"></i> Processing...');
            toastr.info("Saving changes...", "Please wait");




            const formData = new FormData($form[0]);
            const isActive = $("#chk_IsActive").is(":checked");
            if (newPrefix == "BannerUpdateDto.") {
                formData.set("BannerUpdateDto.IsActive", isActive);
            }

            showLoader();
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (data) {
                    let res;
                    try {
                        res = typeof data === "string" ? JSON.parse(data) : data;
                    } catch (e) {
                        toastr.error("Invalid server response.", "Error");
                        return;
                    }

                    const isSuccess = res && (res.Success === true || res.success === true || res.Status === true || res.status === true || res.Status === "True" || res.status === "True");

                    if (isSuccess) {
                        toastr.success(res.Response || res.response || "Success!", "Success");
                        setTimeout(() => location.reload(), 1500);
                        $("#addBannerModal").modal('hide');
                    } else {
                        const errorMsg = res.Response || res.response || "Operation failed.";
                        toastr.warning(errorMsg, "API Error");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    const btnText = isUpdate ? '<i class="fa fa-refresh"></i> Update' : '<i class="fa fa-save"></i> Save Banner';
                    $btn.prop("disabled", false).html(btnText);
                    hideLoader();
                }
            });
        }

        function resetModal() {
            $('#bannar_form')[0].reset();
            $("#hdn_BannerId").val(0);
            $('#targetImgback').attr('src', '').hide();
            $('#targetImgsplit').attr('src', '').hide();

            $("#addBannerTitle").html('<i class="fa fa-image"></i> Add Banner');
            $("#btnSave").removeClass("d-none").html('<i class="fa fa-save"></i> Save Banner');
            $("#btnUpdate").addClass("d-none");
            $("#active_mode").addClass("d-none");
            $("#chk_IsActive").prop("checked", true);
        }

        /* ---------- EVENT HANDLERS ---------- */

        $(document).on("click", "#btnSave, #btnUpdate", function (e) {
            e.preventDefault();
            if (validateBannerForm()) {
                submitBannerUpdate($(this));
            }
        });

        $(document).on("click", ".btnEdit", function () {
            openEditModal($(this).data("id"));
        });

        /* ---------- DELETE BUTTON ---------- */
        $(document).on("click", ".btnDelete", function () {
            var bannerId = $(this).data("id");
            if (!bannerId) {
                toastr.error("Invalid Banner ID.", "Error");
                return;
            }
            showConfirmDialog({
                title: 'Delete Banner',
                message: 'If you want this file delete?',
                onYes: function () { deleteBannerById(bannerId); }
            });
        });

        /* ---------- DELETE AJAX ---------- */
        function deleteBannerById(id) {
            if (!id) { toastr.error("Invalid Banner ID.", "Error"); ccConfirmClose(); return; }

            ccConfirmSetLoading(true);

            var token = $("input[name='__RequestVerificationToken']").val() ||
                $('meta[name="__RequestVerificationToken"]').attr('content') || '';

            $.ajax({
                url: _BaseURL + "/Admin/DeleteBannerById",
                type: 'GET',
                data: { id: id },
                dataType: 'json',
                success: function (res) {
                    var ok = res && (res.Success === true || res.success === true ||
                        res.Status === true || res.status === true ||
                        res.Status === 'True' || res.status === 'True');
                    if (ok) {
                        ccConfirmClose();
                        toastr.success(res.Response || res.response || 'Banner deleted successfully.', 'Deleted');
                        loadBanners();
                    } else {
                        ccConfirmSetLoading(false);
                        toastr.warning(res.Response || res.response || 'Delete operation failed.', 'Failed');
                    }
                },
                error: function (xhr, status, error) {
                    ccConfirmSetLoading(false);
                    handleAjaxError(xhr, status, error);
                }
            });
        }




        /* ---------- BANNER DATA OPERATIONS ---------- */

        function loadBanners() {
            const apiUrl = _BaseURL + "/Admin/GetBannerList";

            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    bindBannerTable(res);
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindBannerTable([]);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindBannerTable(data) {

            const $tbody = $("#tab_banner_img tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="8" class="text-center">No banners found</td></tr>');
                return;
            }

            $.each(data, function (index, item) {
                const slNo = index + 1;
                const imageUrl = item.ImageUrl || "";
                const title = item.Title || "N/A";
                const displayOrder = item.DisplayOrder || 0;
                const caption = item.Caption || "";
                const isActive = item.IsActive ? '<span class="label label-success">Active</span>' : '<span class="label label-danger">Inactive</span>';

                const row = `
                <tr>
                    <td>${slNo}</td>
                    <td>
                        <img src="${(imageUrl && imageUrl.startsWith('/') ? (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + imageUrl : imageUrl)}" alt="${title}" style="height: 50px; border-radius: 4px; border: 1px solid #ddd;">
                    </td>
                    <td>${caption}</td>
                    <td>${displayOrder}</td>
                    <td>${title}</td>
                    <td>${isActive}</td>
                    <td>
                        <button class="btn btn-primary btn-xs btnEdit" data-id="${item.BannerId}" title="Edit"><i class="fa fa-pencil"></i></button>
                        <button class="btn btn-danger btn-xs btnDelete" data-id="${item.BannerId}" title="Delete"><i class="fa fa-trash-o"></i></button>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }
    }

    if (action_name === "clubdescription") {
        let quillInstance = null;
        let selectedFiles = [];
        let deletedImageIds = []; // Track IDs of images to be deleted
        let pendingQuillContent = "";
        loadDescription();

        /* ---------- INITIALIZATION ---------- */
        initModalEvents();

        // Fix for Quill Link Tooltip Focus issue in Bootstrap 5 Modal
        $(document).on('focusin', function (e) {
            if ($(e.target).closest(".ql-container, .ql-toolbar, .ql-tooltip").length) {
                e.stopImmediatePropagation();
            }
        });

        // Open Modal - Add Mode
        $("#btnAddNew").on("click", function () {
            resetDescriptionModal();
            $("#addDescriptionModal").modal("show");
            $("#addModalTitle").html('<i class="fa fa-plus"></i> Add Club Description');
            $("#btnSaveDescription").removeClass("d-none");
            $("#btnUpdateDescription").addClass("d-none");
        });

        // Close Modal
        $(".btnModalClose, .btnCancel").on("click", function () {
            $("#addDescriptionModal").modal("hide");
        });

        // File Selection Logic
        $("#fileInput").on("change", function (e) {
            handleFiles(e.target.files);
            $(this).val(''); // Reset input
        });

        $("#btnBrowse").on("click", function () {
            $("#fileInput").click();
        });

        // Drag and Drop
        $("#dropZone").on("dragover", function (e) {
            e.preventDefault();
            $(this).addClass("bg-primary-soft");
        }).on("dragleave", function () {
            $(this).removeClass("bg-primary-soft");
        }).on("drop", function (e) {
            e.preventDefault();
            $(this).removeClass("bg-primary-soft");
            handleFiles(e.originalEvent.dataTransfer.files);
        });

        // Submit Events
        $(document).on("click", "#btnSaveDescription, #btnUpdateDescription", function (e) {
            e.preventDefault();
            if (validateDescriptionForm()) {
                submitDescriptionUpdate($(this));
            }
        });

        /* ---------- CORE FUNCTIONS ---------- */

        function stripHtml(html) {
            if (!html) return "";
            const div = document.createElement("div");
            div.innerHTML = html;
            const text = div.textContent || div.innerText || "";
            return text.replace(/\s+/g, ' ').trim();
        }

        function initQuill() {
            const container = document.getElementById('quillEditorContainer');
            if (container && !quillInstance) {
                quillInstance = new Quill('#quillEditorContainer', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Briefly describe the club...'
                });
            }
        }

        function initModalEvents() {
            $('#addDescriptionModal').on('hidden.bs.modal', function () {
                resetDescriptionModal();
            }).on('shown.bs.modal', function () {
                initQuill();
                if (quillInstance) {
                    quillInstance.update();
                    quillInstance.focus();

                    // If content was waiting for Quill to initialize, set it now
                    if (pendingQuillContent) {
                        quillInstance.root.innerHTML = pendingQuillContent;
                        pendingQuillContent = "";
                    }
                }
            });
        }

        function handleFiles(files) {
            const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            if (newFiles.length > 0) $("#imageError").addClass("d-none");

            newFiles.forEach(file => {
                const isNew = !selectedFiles.some(f => f.name === file.name && f.size === file.size);
                if (isNew) {
                    selectedFiles.push(file);
                    renderPreview(file);
                }
            });
        }

        function renderPreview(file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const html = `
                    <div class="col-4 col-md-3 col-lg-2 preview-item new-upload">
                        <div class="preview-card" title="${file.name}">
                            <button type="button" class="remove-preview" data-name="${file.name}">
                                <i class="fa fa-times"></i>
                            </button>
                            <div class="preview-img-container">
                                <img src="${e.target.result}" alt="Preview">
                            </div>
                            <div class="preview-info">
                                <div class="preview-name">${file.name}</div>
                            </div>
                        </div>
                    </div>`;
                $("#imagePreviewContainer").append(html);
            };
            reader.readAsDataURL(file);
        }

        function renderExistingImagePreview(imageUrl, fileName, id) {
            const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);
            const fullUrl = imageUrl && imageUrl.startsWith('/') ? apiBase + imageUrl : imageUrl;

            const html = `
                <div class="col-4 col-md-3 col-lg-2 preview-item existing-image">
                    <div class="preview-card" title="${fileName || 'Existing Image'}">
                        <button type="button" class="remove-existing" data-id="${id}">
                            <i class="fa fa-times"></i>
                        </button>
                        <div class="preview-img-container">
                            <img src="${fullUrl}" alt="Preview">
                        </div>
                        <div class="preview-info">
                            <div class="preview-name">${fileName || 'Existing Image'}</div>
                        </div>
                    </div>
                </div>`;
            $("#imagePreviewContainer").append(html);
        }

        $(document).on("click", ".remove-preview", function () {
            const fileName = $(this).data("name");
            selectedFiles = selectedFiles.filter(f => f.name !== fileName);
            $(this).closest(".preview-item").remove();
            if (selectedFiles.length === 0 && $("#hdn_DescriptionId").val() === "0") {
                $("#imageError").removeClass("d-none");
            }
        });

        $(document).on("click", ".remove-existing", function () {
            const imageId = $(this).data("id");
            if (imageId) {
                deletedImageIds.push(imageId);
            }
            $(this).closest(".preview-item").remove();
        });

        function validateDescriptionForm() {
            const isUpdate = $("#hdn_DescriptionId").val() !== "0";
            const title = $("#txtTitle").val().trim();
            const quillContent = quillInstance ? quillInstance.root.innerHTML.trim() : "";
            const isQuillEmpty = quillContent === "<p><br></p>" || quillContent === "" || quillInstance.getText().trim().length === 0;

            let errors = [];
            if (!title) errors.push("Title is required.");
            if (isQuillEmpty) errors.push("Description is required.");
            if (!isUpdate && selectedFiles.length === 0) {
                $("#imageError").removeClass("d-none");
                errors.push("At least one image is required.");
            } else {
                $("#imageError").addClass("d-none");
            }

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }

            $("#hdnDescription").val(isQuillEmpty ? "" : quillContent);
            return true;
        }

        function submitDescriptionUpdate($btn) {
            const isUpdate = $("#hdn_DescriptionId").val() !== "0";

            // 1. Environment-safe API URL Resolution
            let rawUrl = $btn.data("url");
            let url = rawUrl;

            if (!url) {
                // Fallback routing if data-url is missing
                const basePath = typeof _BaseURL !== 'undefined' ? _BaseURL : window.location.origin;
                url = basePath + (isUpdate ? "/Admin/UpdateClubDescription" : "/Admin/CreateClubDescription");
                console.warn("[submitDescriptionUpdate] data-url missing on button. Falling back to:", url);
            } else if (url.startsWith("/")) {
                // Ensure absolute URL if it is a rooted relative path, avoiding tricky relative base tag issues in live env
                const origin = window.location.origin;
                url = origin + url;
            }

            // 2. Prevent duplicate submission
            if ($btn.prop("disabled")) {
                console.warn("[submitDescriptionUpdate] Duplicate submission prevented. Request is already in progress.");
                return;
            }

            $btn.prop("disabled", true).find(".spinner-border").removeClass("d-none");
            toastr.info(isUpdate ? "Updating..." : "Saving...", "Please wait");

            // 3. Prepare FormData
            const formData = new FormData();
            const prefix = isUpdate ? "UpdateClubDescriptionDto." : "CreateClubDescriptionDto.";

            if (isUpdate) {
                formData.append(prefix + "ClubDescriptionId", $("#hdn_DescriptionId").val());
            }

            formData.append(prefix + "Title", $("#txtTitle").val().trim());
            formData.append(prefix + "Description", $("#hdnDescription").val());
            formData.append(prefix + "DisplayOrder", $("#numDisplayOrder").val());
            formData.append(prefix + "IsActive", $("#chkIsActive").is(":checked"));

            if (isUpdate) {
                // IDs of existing images to delete (Repeated Fields)
                if (Array.isArray(deletedImageIds)) {
                    deletedImageIds.forEach(id => {
                        formData.append(prefix + "DeletedImageIds", id);
                    });
                }

                // New images to add (List<IFormFile>)
                if (Array.isArray(selectedFiles)) {
                    selectedFiles.forEach(file => {
                        formData.append(prefix + "NewImages", file);
                    });
                }
            } else {
                // For Create, DTO property is 'Files'
                if (Array.isArray(selectedFiles)) {
                    selectedFiles.forEach(file => {
                        formData.append(prefix + "Files", file);
                    });
                }
            }

            // 4. Debug Logging - Payload Summary
            console.group("[submitDescriptionUpdate] Payload Summary");
            console.log("Final Request URL:", url);
            console.log("Is Update Mode:", isUpdate);
            console.log("Selected Files Count:", selectedFiles ? selectedFiles.length : 0);
            if (isUpdate) {
                console.log("Deleted Image IDs:", deletedImageIds);
            }
            console.log("FormData Keys:");
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`  ${pair[0]}: File [name=${pair[1].name}, size=${pair[1].size}, type=${pair[1].type}]`);
                } else {
                    console.log(`  ${pair[0]}: ${pair[1]}`);
                }
            }
            console.groupEnd();

            // 5. Antiforgery token — append to BOTH header AND FormData body.
            // Header alone can be stripped by Nginx/IIS reverse proxies (Bug 6 fix).
            // ASP.NET Core will accept the token from either location.
            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) {
                formData.append("__RequestVerificationToken", antiforgeryToken);
            }

            showLoader();

            // 6. AJAX Call setup & robust handlers
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,  // REQUIRED for multipart/form-data
                processData: false,  // REQUIRED for multipart/form-data
                cache: false,
                timeout: 300000,     // 5 minutes — matches server HttpClient timeout for large uploads
                headers: {
                    // Keep header for non-proxy environments
                    "RequestVerificationToken": antiforgeryToken
                },
                success: function (data, textStatus, xhr) {
                    console.log("[submitDescriptionUpdate] Success response status:", xhr.status);

                    let res;
                    if (typeof data === "string") {
                        try {
                            res = JSON.parse(data);
                        } catch (e) {
                            console.error("[submitDescriptionUpdate] JSON parse error in success callback:", e);
                            toastr.error("Received malformed JSON from server.", "Parsing Error");
                            return;
                        }
                    } else {
                        res = data;
                    }

                    const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);

                    if (isSuccess) {
                        toastr.success(res.Response || res.response || "Success!", "Success");
                        setTimeout(() => location.reload(), 1500);
                        $("#addDescriptionModal").modal('hide');
                    } else {
                        const errorMsg = res.Response || res.response || res.Message || res.message || "Operation failed.";
                        toastr.warning(errorMsg, "Warning");
                        console.warn("[submitDescriptionUpdate] API returned success=false:", res);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("[submitDescriptionUpdate] AJAX Error Details:", {
                        status: xhr.status,
                        readyState: xhr.readyState,
                        responseText: xhr.responseText,
                        textStatus: status,
                        errorThrown: error,
                        finalUrl: url
                    });

                    let errorMessage = "An error occurred while uploading. Please try again.";

                    if (status === 'timeout') {
                        errorMessage = "Request timed out. The file might be too large or your connection is slow.";
                    } else if (status === 'abort') {
                        errorMessage = "Request was aborted.";
                    } else if (xhr.status === 0) {
                        errorMessage = "Network error: API unreachable, blocked by CORS, or connection dropped. URL: " + url;
                    } else if (xhr.status === 400) {
                        errorMessage = "Bad Request (400): Validation failed or invalid data.";
                    } else if (xhr.status === 401) {
                        errorMessage = "Unauthorized (401): Your session may have expired.";
                    } else if (xhr.status === 403) {
                        errorMessage = "Forbidden (403): You do not have permission.";
                    } else if (xhr.status === 404) {
                        errorMessage = "Not Found (404): The API endpoint could not be found. Checked URL: " + url;
                    } else if (xhr.status === 405) {
                        errorMessage = "Method Not Allowed (405): Server configuration rejected POST request.";
                    } else if (xhr.status === 413) {
                        errorMessage = "Payload Too Large (413): The uploaded files exceed the server limit.";
                    } else if (xhr.status === 500) {
                        errorMessage = "Server Error (500): Something went wrong on the server.";
                    }

                    // Attempt to parse validation errors or detailed messages from JSON response
                    if (xhr.responseText) {
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            const parsedMsg = errorData.message || errorData.title || errorData.Response || errorData.response || errorData.detail;

                            if (parsedMsg) {
                                errorMessage += "<br/><strong>Details:</strong> " + parsedMsg;
                            }

                            if (errorData.errors) {
                                // Extract ASP.NET core validation errors dictionary
                                const errorList = Object.values(errorData.errors).flat().join("<br/>");
                                errorMessage += "<br/><strong>Validation:</strong><br/>" + errorList;
                            }
                        } catch (e) {
                            console.warn("[submitDescriptionUpdate] Could not parse error response text as JSON.", e);
                            if (xhr.status >= 400 && xhr.status < 500 && xhr.responseText.length < 150) {
                                // Strip basic HTML to avoid massive HTML error screens and dump text snippet
                                errorMessage += "<br/>" + xhr.responseText.replace(/<[^>]*>?/gm, '');
                            }
                        }
                    }

                    toastr.error(errorMessage, "Upload Failed");
                },
                complete: function () {
                    // 10. Restore button state in cleanup logic
                    $btn.prop("disabled", false).find(".spinner-border").addClass("d-none");
                    hideLoader();
                    console.log("[submitDescriptionUpdate] Request complete.");
                }
            });
        }

        function resetDescriptionModal() {
            $("#addDescriptionForm")[0].reset();
            $("#hdn_DescriptionId").val(0);
            if (quillInstance) {
                quillInstance.setContents([]);
            }
            pendingQuillContent = "";
            selectedFiles = [];
            deletedImageIds = []; // Clear deleted tracker
            $("#imagePreviewContainer").empty();
            $("#imageError").addClass("d-none");
            $(".is-invalid").removeClass("is-invalid");

            // Reset UI state
            $("#addModalTitle").html('<i class="fa fa-plus"></i> Add Club Description');
            $("#btnSaveDescription").removeClass("d-none");
            $("#btnUpdateDescription").addClass("d-none");
        }

        function loadDescription() {
            const apiUrl = _BaseURL + "/Admin/GetDescriptionList";
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    if (data != null) {
                        const res = typeof data === "string" ? JSON.parse(data) : data;
                        const finalData = res.Response || res;

                        if (Array.isArray(finalData)) {
                            bindDescriptionTable(finalData);
                        } else {
                            console.error("Expected array but got:", finalData);
                            bindDescriptionTable([]);
                        }
                    }
                    else {
                        bindDescriptionTable([]);
                    }

                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindDescriptionTable([]);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindDescriptionTable(data) {
            const $tbody = $("#tab_description_img tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="7" class="text-center text-muted py-4">No descriptions found</td></tr>');
                return;
            }

            const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);

            $.each(data, function (index, item) {
                const slNo = index + 1;
                const title = item.Title || "N/A";
                const displayOrder = item.DisplayOrder || 0;

                // Scrub HTML for table preview
                const plainDescription = stripHtml(item.Description);

                const isActive = item.IsActive ?
                    '<span class="label label-success">Active</span>' :
                    '<span class="label label-danger">Inactive</span>';

                // Image Gallery Logic
                const images = item.Images || [];
                let galleryHtml = "";
                let popoverHtml = "";

                if (images.length > 0) {
                    const primaryImg = images[0].ImageUrl;
                    const primaryFullUrl = primaryImg && primaryImg.startsWith('/') ? apiBase + primaryImg : primaryImg;

                    galleryHtml = `<div class="img-gallery-stack">`;
                    for (let i = 0; i < Math.min(images.length, 3); i++) {
                        const imgUrl = images[i].ImageUrl;
                        const fullUrl = imgUrl && imgUrl.startsWith('/') ? apiBase + imgUrl : imgUrl;
                        galleryHtml += `<img src="${fullUrl}" class="img-stack-item">`;
                    }

                    if (images.length > 1) {
                        galleryHtml += `<div class="img-count-badge">+${images.length - 1}</div>`;
                    }

                    popoverHtml = `<div class="img-hover-popover">`;
                    images.forEach(img => {
                        const fullUrl = img.ImageUrl && img.ImageUrl.startsWith('/') ? apiBase + img.ImageUrl : img.ImageUrl;
                        popoverHtml += `<img src="${fullUrl}" class="popover-img" alt="Gallery">`;
                    });
                    popoverHtml += `</div>`;
                    galleryHtml += popoverHtml + `</div>`;
                } else {
                    galleryHtml = '<span class="text-muted small">No Image</span>';
                }

                const row = `
                <tr class="align-middle">
                    <td class="fw-bold text-muted">${slNo}</td>
                    <td>${galleryHtml}</td>
                    <td><div class="caption-preview-text" title="${plainDescription}">${plainDescription}</div></td>
                    <td><span class="badge bg-light text-dark border">${displayOrder}</span></td>
                    <td><span class="fw-semibold text-primary">${title}</span></td>
                    <td>${isActive}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-primary btn-xs btnEditDescription" data-id="${item.ClubDescriptionId}" title="Edit"><i class="fa fa-pencil"></i></button>
                            <button class="btn btn-danger btn-xs btnDeleteDescription" data-id="${item.ClubDescriptionId}" title="Delete"><i class="fa fa-trash-o"></i></button>
                        </div>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }

        /* ---------- ACTION HANDLERS ---------- */

        $(document).on("click", ".btnEditDescription", function () {
            const id = $(this).data("id");
            loadDescriptionById(id);
        });

        $(document).on("click", ".btnDeleteDescription", function () {
            const id = $(this).data("id");
            showConfirmDialog({
                title: 'Delete Description',
                message: 'Are you sure you want to delete this club description?',
                onYes: function () { deleteDescriptionById(id); }
            });
        });

        function loadDescriptionById(id) {
            
            const apiUrl = _BaseURL + "/Admin/GetDescriptionById?id=" + id;
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                
                success: function (res) {
                    if (res) {
                        const data = res.Response || res;
                        bindDescriptionToModal(data);
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindDescriptionToModal(data) {
            resetDescriptionModal(); // Start clean

            $("#hdn_DescriptionId").val(data.ClubDescriptionId || 0);
            $("#txtTitle").val(data.Title || "");
            $("#numDisplayOrder").val(data.DisplayOrder || 0);
            $("#chkIsActive").prop("checked", data.IsActive === true);

            // Handle Quill HTML Injection
            if (data.Description) {
                if (quillInstance) {
                    quillInstance.root.innerHTML = data.Description;
                } else {
                    // Store it to be applied once 'shown.bs.modal' triggers initQuill
                    pendingQuillContent = data.Description;
                }
            }

            // Bind Existing Images
            const images = data.Images || [];
            if (images.length > 0) {
                images.forEach(img => {
                    renderExistingImagePreview(img.ImageUrl, img.ImageName, img.ClubDescriptionImageId);
                });
            }

            $("#addModalTitle").html('<i class="fa fa-pencil"></i> Update Club Description');
            $("#btnSaveDescription").addClass("d-none");
            $("#btnUpdateDescription").removeClass("d-none");
            $("#addDescriptionModal").modal("show");
        }

        function deleteDescriptionById(id) {
            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) {
                formData.append("__RequestVerificationToken", antiforgeryToken);
            }
            ccConfirmSetLoading(true);
            $.ajax({
                url: _BaseURL + "/Admin/DeleteDescriptionById",
                type: 'POST',
                dataType: 'json',
                data: { id: id },
                headers: {
                    // Keep header for non-proxy environments
                    "RequestVerificationToken": antiforgeryToken
                },
                success: function (res) {
                    const ok = res && (res.Success || res.Status || res.status === "True");
                    if (ok) {
                        ccConfirmClose();
                        toastr.success("Description deleted successfully.");
                        loadDescription();
                    } else {
                        ccConfirmSetLoading(false);
                        toastr.warning(res.Response || "Delete failed.");
                    }
                },
                error: function (xhr, status, error) {
                    ccConfirmSetLoading(false);
                    handleAjaxError(xhr, status, error);
                }
            });
        }
    }
});