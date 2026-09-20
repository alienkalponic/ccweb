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

    function stripHtml(html) {
        if (!html) return "";
        const div = document.createElement("div");
        div.innerHTML = html;
        const text = div.textContent || div.innerText || "";
        return text.replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderPagination(containerSelector, currentPage, totalRecords, pageSize, onPageClick) {
        const $container = $(containerSelector);
        $container.empty();

        if (totalRecords <= 0 || pageSize <= 0) {
            return;
        }

        const totalPages = Math.ceil(totalRecords / pageSize);
        if (totalPages <= 1) {
            return;
        }

        const prevDisabled = currentPage === 1 ? "disabled" : "";
        let html = `<li class="page-item ${prevDisabled}"><a class="page-link prev-page" href="#" data-page="${currentPage - 1}">Previous</a></li>`;

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? "active" : "";
            html += `<li class="page-item ${activeClass}"><a class="page-link page-number" href="#" data-page="${i}">${i}</a></li>`;
        }

        const nextDisabled = currentPage === totalPages ? "disabled" : "";
        html += `<li class="page-item ${nextDisabled}"><a class="page-link next-page" href="#" data-page="${currentPage + 1}">Next</a></li>`;

        $container.html(html);

        $container.off("click", "a.page-link").on("click", "a.page-link", function (e) {
            e.preventDefault();
            const $parent = $(this).parent();
            if ($parent.hasClass("disabled") || $parent.hasClass("active")) {
                return;
            }
            const targetPage = parseInt($(this).data("page"));
            if (targetPage >= 1 && targetPage <= totalPages) {
                onPageClick(targetPage);
            }
        });
    }


    const myBtn = document.getElementById('myBtn');
    function clickHandler() {
        const toggler = document.getElementById('toggler');
        console.log(toggler.style.display)
        if (toggler.style.display === "block") {
            toggler.style.display = "none";
        }
        else {
            toggler.style.display = "block";
        }
    }
    if (myBtn != null) {
        myBtn.addEventListener('click', clickHandler);
    }
    




    if (action_name === "bannercontent") {
        let currentPage = 1;
        const pageSize = 10;

        loadBanners(currentPage);

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
                cache: false,  // Always fetch fresh data for edit modal
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
                        $("#addBannerModal").modal('hide');
                        loadBanners(currentPage); // Reload table data via AJAX — no page reload needed
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
                cache: false,
                success: function (res) {
                    var ok = res && (res.Success === true || res.success === true ||
                        res.Status === true || res.status === true ||
                        res.Status === 'True' || res.status === 'True');
                    if (ok) {
                        ccConfirmClose();
                        toastr.success(res.Response || res.response || 'Banner deleted successfully.', 'Deleted');
                        loadBanners(currentPage);
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

        function loadBanners(pageNumber = 1) {
            currentPage = pageNumber;
            const apiUrl = _BaseURL + `/Admin/GetBannerList?pageNumber=${pageNumber}&pageSize=${pageSize}`;

            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindBannerTable(data);
                    renderPagination("#bannerPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadBanners(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindBannerTable([]);
                    renderPagination("#bannerPagination", 1, 0, pageSize, function() {});
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
                const slNo = (currentPage - 1) * pageSize + (index + 1);
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
        let currentPage = 1;
        const pageSize = 10;
        let quillInstance = null;
        let selectedFiles = [];
        let deletedImageIds = []; // Track IDs of images to be deleted
        let pendingQuillContent = "";
        loadDescription(currentPage);

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

        function loadDescription(pageNumber = 1) {
            currentPage = pageNumber;
            const apiUrl = _BaseURL + `/Admin/GetDescriptionList?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindDescriptionTable(data);
                    renderPagination("#descriptionPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadDescription(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindDescriptionTable([]);
                    renderPagination("#descriptionPagination", 1, 0, pageSize, function() {});
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
                const slNo = (currentPage - 1) * pageSize + (index + 1);
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
                cache: false,  // Always fetch fresh data for edit modal
                
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
            ccConfirmSetLoading(true);
            $.ajax({
                url: _BaseURL + "/Admin/DeleteDescriptionById",
                type: 'GET',
                data: { id: id },
                dataType: 'json',
                cache: false,
                success: function (res) {
                    const ok = res && (res.Success || res.Status || res.status === "True");
                    if (ok) {
                        ccConfirmClose();
                        toastr.success("Description deleted successfully.");
                        loadDescription(currentPage);
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

    if (action_name === "clubactivities") {
        let currentPage = 1;
        let selectedActivityFile = null;

        loadActivities(currentPage);

        // Events
        $("#btnAddNewActivity").on("click", function () {
            resetActivityModal();
            $("#addActivityModal").modal("show");
        });

        $(".btnCancelActivity").on("click", function () {
            $("#addActivityModal").modal("hide");
        });

        $("#txtSearchActivity").on("keyup", function (e) {
            if (e.key === "Enter" || $(this).val().length === 0 || $(this).val().length > 2) {
                currentPage = 1;
                loadActivities(currentPage);
            }
        });

        $("#btnSearchActivity").on("click", function () {
            currentPage = 1;
            loadActivities(currentPage);
        });

        // File logic
        $("#activityDropZone").on("click", function (e) {
            // Prevent recursive loop when clicking the hidden input
            if (e.target.id === "activityFileInput") return;
            $("#activityFileInput").click();
        });

        // Drag and Drop
        $("#activityDropZone").on("dragover", function (e) {
            e.preventDefault();
            $(this).addClass("bg-primary-soft");
        }).on("dragleave", function () {
            $(this).removeClass("bg-primary-soft");
        }).on("drop", function (e) {
            e.preventDefault();
            $(this).removeClass("bg-primary-soft");
            const files = e.originalEvent.dataTransfer.files;
            handleActivityFiles(files);
        });

        $("#activityFileInput").on("change", function (e) {
            handleActivityFiles(e.target.files);
        });

        function handleActivityFiles(files) {
            if (files && files.length > 0) {
                // Ensure only one file is taken
                selectedActivityFile = files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    $("#activityImgPreview").attr("src", e.target.result);
                    $("#activityImagePreviewContainer").show();
                    $("#activityDropZone").hide();
                    $("#activityImageError").addClass("d-none");
                }
                reader.readAsDataURL(selectedActivityFile);
            }
        }

        $("#btnRemoveActivityImg").on("click", function () {
            selectedActivityFile = null;
            $("#activityFileInput").val("");
            $("#activityImgPreview").attr("src", "");
            $("#activityImagePreviewContainer").hide();
            $("#activityDropZone").show();
        });

        $("#btnSaveActivity").on("click", function () {
            createActivity($(this));
        });

        $("#btnUpdateActivity").on("click", function () {
            updateActivity($(this));
        });

        $(document).on("click", ".btnEditActivity", function () {
            getActivityById($(this).data("id"));
        });

        $(document).on("click", ".btnDeleteActivity", function () {
            const id = $(this).data("id");
            showConfirmDialog({
                title: 'Delete Activity',
                message: 'Are you sure you want to delete this activity?',
                onYes: function () { deleteActivity(id); }
            });
        });

        // AJAX Functions
        function loadActivities(pageNumber) {
            currentPage = pageNumber;
            const search = $("#txtSearchActivity").val() || "";
            const pageSize = 10;
            const url = _BaseURL + `/Admin/GetAllActivities?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;

            showLoader();
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindActivityTable(data);
                    renderPagination("#activityPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadActivities(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindActivityTable([]);
                    renderPagination("#activityPagination", 1, 0, pageSize, function() {});
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindActivityTable(data) {
            const $tbody = $("#tab_activities tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="7" class="text-center">No activities found</td></tr>');
                return;
            }

            $.each(data, function (index, item) {
                const slNo = (currentPage - 1) * 10 + (index + 1);
                const imageUrl = item.ImageUrl || item.Image || "";
                const title = item.Title || "N/A";
                const subTitle = item.SubTitle || "";
                const displayOrder = item.DisplayOrder || 0;
                const isActiveHtml = item.IsActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>';

                const apiBase = typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL;
                const fullImageUrl = (imageUrl && imageUrl.startsWith('/')) ? apiBase + imageUrl : imageUrl;

                const row = `
                <tr>
                    <td>${slNo}</td>
                    <td><img src="${fullImageUrl}" alt="Thumbnail" style="height: 50px; border-radius: 4px; border: 1px solid #ddd;"></td>
                    <td class="fw-semibold">${title}</td>
                    <td>${subTitle}</td>
                    <td>${displayOrder}</td>
                    <td>${isActiveHtml}</td>
                    <td>
                        <button class="btn btn-primary btn-xs btnEditActivity" data-id="${item.ActivityId || item.Id}" title="Edit"><i class="fa fa-pencil"></i></button>
                        <button class="btn btn-danger btn-xs btnDeleteActivity" data-id="${item.ActivityId || item.Id}" title="Delete"><i class="fa fa-trash-o"></i></button>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }

        function createActivity($btn) {
            if (!validateActivityForm(false)) return;

            const formData = new FormData();
            formData.append("CreateClubActivityDto.Title", $("#txtActivityTitle").val().trim());
            formData.append("CreateClubActivityDto.SubTitle", $("#txtActivitySubTitle").val().trim());
            formData.append("CreateClubActivityDto.Description", $("#txtActivityDescription").val().trim());
            formData.append("CreateClubActivityDto.RedirectUrl", $("#txtRedirectUrl").val().trim());
            formData.append("CreateClubActivityDto.DisplayOrder", $("#numActivityDisplayOrder").val());
            formData.append("CreateClubActivityDto.IsActive", $("#chkActivityIsActive").is(":checked"));

            if (selectedActivityFile) {
                formData.append("CreateClubActivityDto.Image", selectedActivityFile);
            }

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) formData.append("__RequestVerificationToken", antiforgeryToken);

            submitActivityAjax(_BaseURL + "/Admin/CreateActivity", formData, $btn, false);
        }

        function updateActivity($btn) {
            if (!validateActivityForm(true)) return;

            const formData = new FormData();
            formData.append("UpdateClubActivityDto.ActivityId", $("#hdn_ActivityId").val());
            formData.append("UpdateClubActivityDto.Title", $("#txtActivityTitle").val().trim());
            formData.append("UpdateClubActivityDto.SubTitle", $("#txtActivitySubTitle").val().trim());
            formData.append("UpdateClubActivityDto.Description", $("#txtActivityDescription").val().trim());
            formData.append("UpdateClubActivityDto.RedirectUrl", $("#txtRedirectUrl").val().trim());
            formData.append("UpdateClubActivityDto.DisplayOrder", $("#numActivityDisplayOrder").val());
            formData.append("UpdateClubActivityDto.IsActive", $("#chkActivityIsActive").is(":checked"));

            if (selectedActivityFile) {
                formData.append("UpdateClubActivityDto.Image", selectedActivityFile);
            }

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) formData.append("__RequestVerificationToken", antiforgeryToken);

            submitActivityAjax(_BaseURL + "/Admin/UpdateActivity", formData, $btn, true);
        }

        function submitActivityAjax(url, formData, $btn, isUpdate) {
            if ($btn.prop("disabled")) return;
            $btn.prop("disabled", true).find(".btnSpin").removeClass("d-none");
            toastr.info("Saving...", "Please wait");
            showLoader();

            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                headers: { "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val() || "" },
                success: function (data) {
                    const res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.success === true || res.Status === true || res.Status === "True");
                    
                    if (isSuccess) {
                        toastr.success(res.Response || res.message || "Successfully saved.", "Success");
                        $("#addActivityModal").modal('hide');
                        loadActivities(currentPage);
                    } else {
                        toastr.warning(res.Response || res.message || "Failed to save.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    $btn.prop("disabled", false).find(".btnSpin").addClass("d-none");
                    hideLoader();
                }
            });
        }

        function deleteActivity(id) {
            ccConfirmSetLoading(true);
            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";

            $.ajax({
                url: _BaseURL + "/Admin/DeleteActivity",
                type: 'POST',
                data: { id: id, __RequestVerificationToken: antiforgeryToken },
                success: function (data) {
                    const res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.success === true || res.Status === true || res.Status === "True");
                    if (isSuccess) {
                        ccConfirmClose();
                        toastr.success(res.Response || res.message || "Deleted successfully.", "Deleted");
                        loadActivities(currentPage);
                    } else {
                        ccConfirmSetLoading(false);
                        toastr.warning(res.Response || res.message || "Failed to delete.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    ccConfirmSetLoading(false);
                    handleAjaxError(xhr, status, error);
                }
            });
        }

        function getActivityById(id) {
            showLoader();
            $.ajax({
                url: _BaseURL + "/Admin/GetActivityById?id=" + id,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Always fetch fresh data for edit modal
                success: function (res) {
                    const data = res.Data || res.data || res.Response || res;
                    const actualData = typeof data === "string" ? JSON.parse(data) : data;
                    const mappedData = Array.isArray(actualData) ? actualData[0] : actualData;
                    
                    bindActivityModal(mappedData);
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindActivityModal(data) {
            resetActivityModal();
            if (!data) return;

            $("#hdn_ActivityId").val(data.ActivityId || data.Id);
            $("#txtActivityTitle").val(data.Title);
            $("#txtActivitySubTitle").val(data.SubTitle);
            $("#txtActivityDescription").val(data.Description);
            $("#txtRedirectUrl").val(data.RedirectUrl);
            $("#numActivityDisplayOrder").val(data.DisplayOrder);
            $("#chkActivityIsActive").prop("checked", data.IsActive === true);

            const img = data.ImageUrl || data.Image;
            if (img) {
                const apiBase = typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL;
                const imgUrl = img.startsWith('/') ? apiBase + img : img;
                $("#activityImgPreview").attr("src", imgUrl);
                $("#activityImagePreviewContainer").show();
                $("#activityDropZone").hide();
            }

            $("#addActivityModalTitle").html('<i class="fa fa-pencil"></i> Update Club Activity');
            $("#btnSaveActivity").addClass("d-none");
            $("#btnUpdateActivity").removeClass("d-none");
            $("#divActivityStatus").removeClass("d-none");
            $("#addActivityModal").modal("show");
        }

        function validateActivityForm(isUpdate) {
            let errors = [];
            const title = $("#txtActivityTitle").val().trim();

            if (!title) errors.push("Title is required.");

            if (!isUpdate && !selectedActivityFile) {
                $("#activityImageError").removeClass("d-none");
                errors.push("Image is required.");
            } else {
                $("#activityImageError").addClass("d-none");
            }

            if (selectedActivityFile) {
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                if (!allowedTypes.includes(selectedActivityFile.type)) {
                    errors.push("Invalid file type. Allowed: JPG, PNG, WEBP.");
                }
                //if (selectedActivityFile.size > 2 * 1024 * 1024) {
                //    errors.push("Image size must be less than 2MB.");
                //}
            }

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }
            return true;
        }

        function resetActivityModal() {
            $("#activityForm")[0].reset();
            $("#hdn_ActivityId").val("0");
            selectedActivityFile = null;
            
            $("#activityFileInput").val("");
            $("#activityImgPreview").attr("src", "");
            $("#activityImagePreviewContainer").hide();
            $("#activityDropZone").show();
            $("#activityImageError").addClass("d-none");
            
            $("#addActivityModalTitle").html('<i class="fa fa-tasks"></i> Add Club Activity');
            $("#btnSaveActivity").removeClass("d-none");
            $("#btnUpdateActivity").addClass("d-none");
            $("#divActivityStatus").addClass("d-none"); 
            $("#chkActivityIsActive").prop("checked", true);
        }
    }
    
    if (action_name === "gallerycontent" || $("#tab_gallery").length > 0) {
        let currentPage = 1;
        let selectedGalleryFile = null;

        loadGallery(currentPage);

        // Events
        $("#btnAddNewGallery").on("click", function () {
            resetGalleryModal();
            $("#addGalleryModal").modal("show");
        });

        $(".btnCancelGallery").on("click", function () {
            $("#addGalleryModal").modal("hide");
        });

        $("#txtSearchGallery").on("keyup", function (e) {
            if (e.key === "Enter" || $(this).val().length === 0 || $(this).val().length > 2) {
                currentPage = 1;
                loadGallery(currentPage);
            }
        });

        $("#btnSearchGallery").on("click", function () {
            currentPage = 1;
            loadGallery(currentPage);
        });

        // File logic
        $("#galleryDropZone").on("click", function (e) {
            if (e.target.id === "galleryFileInput") return;
            $("#galleryFileInput").click();
        });

        // Drag and Drop
        $("#galleryDropZone").on("dragover", function (e) {
            e.preventDefault();
            $(this).addClass("bg-primary-soft");
        }).on("dragleave", function () {
            $(this).removeClass("bg-primary-soft");
        }).on("drop", function (e) {
            e.preventDefault();
            $(this).removeClass("bg-primary-soft");
            const files = e.originalEvent.dataTransfer.files;
            handleGalleryFiles(files);
        });

        $("#galleryFileInput").on("change", function (e) {
            handleGalleryFiles(e.target.files);
        });

        function handleGalleryFiles(files) {
            if (files && files.length > 0) {
                selectedGalleryFile = files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    $("#galleryImgPreview").attr("src", e.target.result);
                    $("#galleryImagePreviewContainer").show();
                    $("#galleryDropZone").hide();
                    $("#galleryImageError").addClass("d-none");
                }
                reader.readAsDataURL(selectedGalleryFile);
            }
        }

        $("#btnRemoveGalleryImg").on("click", function () {
            selectedGalleryFile = null;
            $("#galleryFileInput").val("");
            $("#galleryImgPreview").attr("src", "");
            $("#galleryImagePreviewContainer").hide();
            $("#galleryDropZone").show();
        });

        $("#btnSaveGallery").on("click", function () {
            createGallery($(this));
        });

        $("#btnUpdateGallery").on("click", function () {
            updateGallery($(this));
        });

        $(document).on("click", ".btnEditGallery", function () {
            getGalleryById($(this).data("id"));
        });

        $(document).on("click", ".btnDeleteGallery", function () {
            const id = $(this).data("id");
            showConfirmDialog({
                title: 'Delete Gallery',
                message: 'Are you sure you want to delete this gallery item?',
                onYes: function () { deleteGallery(id); }
            });
        });

        // AJAX Functions
        function loadGallery(pageNumber) {
            currentPage = pageNumber;
            const search = $("#txtSearchGallery").val() || "";
            const pageSize = 12;
            const url = _BaseURL + `/Admin/GetGalleryList?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;

            showLoader();
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindGalleryTable(data);
                    renderPagination("#galleryPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadGallery(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindGalleryTable([]);
                    renderPagination("#galleryPagination", 1, 0, pageSize, function() {});
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindGalleryTable(data) {
            const $tbody = $("#tab_gallery tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="8" class="text-center">No gallery items found</td></tr>');
                return;
            }

            $.each(data, function (index, item) {
                const slNo = (currentPage - 1) * 12 + (index + 1);
                const galleryId = item.GalleryItemsId || item.Id || item.id || 0;
                const imageUrl = item.ImageUrl || item.imageUrl || "";
                const title = item.Title || item.title || "N/A";
                const subTitle = item.SubTitle || item.subtitle || "";
                const expYear = item.ExpeditionYear || item.expeditionYear || "";
                const displayOrder = item.DisplayOrder || item.displayOrder || 0;
                const isActiveHtml = (item.IsActive || item.isActive) ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>';

                const apiBase = typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL;
                const fullImageUrl = (imageUrl && imageUrl.startsWith('/')) ? apiBase + imageUrl : imageUrl;

                const row = `
                <tr>
                    <td>${slNo}</td>
                    <td><img src="${fullImageUrl}" alt="Thumbnail" style="height: 50px; border-radius: 4px; border: 1px solid #ddd;"></td>
                    <td class="fw-semibold">${title}</td>
                    <td>${subTitle}</td>
                    <td>${expYear}</td>
                    <td>${displayOrder}</td>
                    <td>${isActiveHtml}</td>
                    <td>
                        <button class="btn btn-primary btn-xs btnEditGallery" data-id="${galleryId}" title="Edit"><i class="fa fa-pencil"></i></button>
                        <button class="btn btn-danger btn-xs btnDeleteGallery" data-id="${galleryId}" title="Delete"><i class="fa fa-trash-o"></i></button>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }

        function createGallery($btn) {
            if (!validateGalleryForm(false)) return;

            const formData = new FormData();
            formData.append("CreateGalleryDto.Title", $("#txtGalleryTitle").val().trim());
            formData.append("CreateGalleryDto.SubTitle", $("#txtGallerySubTitle").val().trim());
            formData.append("CreateGalleryDto.ExpeditionYear", $("#txtExpeditionYear").val().trim());
            formData.append("CreateGalleryDto.DisplayOrder", $("#numGalleryDisplayOrder").val());
            formData.append("CreateGalleryDto.IsActive", $("#chkGalleryIsActive").is(":checked"));

            if (selectedGalleryFile) {
                formData.append("CreateGalleryDto.File", selectedGalleryFile);
            }

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) formData.append("__RequestVerificationToken", antiforgeryToken);

            submitGalleryAjax(_BaseURL + "/Admin/CreateGallery", formData, $btn, false);
        }

        function updateGallery($btn) {
            if (!validateGalleryForm(true)) return;

            const formData = new FormData();
            formData.append("UpdateGalleryDto.GalleryItemsId", $("#hdn_GalleryId").val());
            formData.append("UpdateGalleryDto.Title", $("#txtGalleryTitle").val().trim());
            formData.append("UpdateGalleryDto.SubTitle", $("#txtGallerySubTitle").val().trim());
            formData.append("UpdateGalleryDto.ExpeditionYear", $("#txtExpeditionYear").val().trim());
            formData.append("UpdateGalleryDto.DisplayOrder", $("#numGalleryDisplayOrder").val());
            formData.append("UpdateGalleryDto.IsActive", $("#chkGalleryIsActive").is(":checked"));

            if (selectedGalleryFile) {
                formData.append("UpdateGalleryDto.File", selectedGalleryFile);
            }

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) formData.append("__RequestVerificationToken", antiforgeryToken);

            submitGalleryAjax(_BaseURL + "/Admin/UpdateGallery", formData, $btn, true);
        }

        function submitGalleryAjax(url, formData, $btn, isUpdate) {
            if ($btn.prop("disabled")) return;
            $btn.prop("disabled", true).find(".btnSpin").removeClass("d-none");
            toastr.info("Saving...", "Please wait");
            showLoader();

            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                headers: { "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val() || "" },
                success: function (data) {
                    const res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.success === true || res.Status === true || res.Status === "True");
                    
                    if (isSuccess) {
                        toastr.success(res.Response || res.message || "Successfully saved.", "Success");
                        $("#addGalleryModal").modal('hide');
                        loadGallery(currentPage);
                    } else {
                        toastr.warning(res.Response || res.message || "Failed to save.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    $btn.prop("disabled", false).find(".btnSpin").addClass("d-none");
                    hideLoader();
                }
            });
        }

        function deleteGallery(id) {
            ccConfirmSetLoading(true);
            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";

            $.ajax({
                url: _BaseURL + "/Admin/DeleteGallery",
                type: 'POST',
                data: { id: id, __RequestVerificationToken: antiforgeryToken },
                success: function (data) {
                    const res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.success === true || res.Status === true || res.Status === "True");
                    if (isSuccess) {
                        ccConfirmClose();
                        toastr.success(res.Response || res.message || "Deleted successfully.", "Deleted");
                        loadGallery(currentPage);
                    } else {
                        ccConfirmSetLoading(false);
                        toastr.warning(res.Response || res.message || "Failed to delete.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    ccConfirmSetLoading(false);
                    handleAjaxError(xhr, status, error);
                }
            });
        }

        function getGalleryById(id) {
            showLoader();
            $.ajax({
                url: _BaseURL + "/Admin/GetGalleryById?id=" + id,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Always fetch fresh data for edit modal
                success: function (res) {
                    const data = res.Data || res.data || res.Response || res;
                    const actualData = typeof data === "string" ? JSON.parse(data) : data;
                    const mappedData = Array.isArray(actualData) ? actualData[0] : actualData;
                    
                    bindGalleryModal(mappedData);
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindGalleryModal(data) {
            resetGalleryModal();
            if (!data) return;

            $("#hdn_GalleryId").val(data.GalleryItemsId || data.Id || data.id || "0");
            $("#txtGalleryTitle").val(data.Title || data.title || "");
            $("#txtGallerySubTitle").val(data.SubTitle || data.subtitle || "");
            $("#txtExpeditionYear").val(data.ExpeditionYear || data.expeditionYear || "");
            $("#numGalleryDisplayOrder").val(data.DisplayOrder || data.displayOrder || 0);
            $("#chkGalleryIsActive").prop("checked", (data.IsActive === true || data.isActive === true));

            const img = data.ImageUrl || data.imageUrl || data.Image || data.image;
            if (img) {
                const apiBase = typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL;
                const imgUrl = img.startsWith('/') ? apiBase + img : img;
                $("#galleryImgPreview").attr("src", imgUrl);
                $("#galleryImagePreviewContainer").show();
                $("#galleryDropZone").hide();
            }

            $("#addGalleryModalTitle").html('<i class="fa fa-pencil"></i> Update Gallery');
            $("#btnSaveGallery").addClass("d-none");
            $("#btnUpdateGallery").removeClass("d-none");
            $("#divGalleryStatus").removeClass("d-none");
            $("#addGalleryModal").modal("show");
        }

        function validateGalleryForm(isUpdate) {
            let errors = [];
            const title = $("#txtGalleryTitle").val().trim();
            const year = $("#txtExpeditionYear").val().trim();

            if (!title) errors.push("Title is required.");
            if (!year) errors.push("Expedition Year is required.");

            if (!isUpdate && !selectedGalleryFile) {
                $("#galleryImageError").removeClass("d-none");
                errors.push("Image is required.");
            } else {
                $("#galleryImageError").addClass("d-none");
            }

            if (selectedGalleryFile) {
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                if (!allowedTypes.includes(selectedGalleryFile.type)) {
                    errors.push("Invalid file type. Allowed: JPG, PNG, WEBP.");
                }
                //if (selectedGalleryFile.size > 2 * 1024 * 1024) {
                //    errors.push("Image size must be less than 2MB.");
                //}
            }

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }
            return true;
        }

        function resetGalleryModal() {
            $("#galleryForm")[0].reset();
            $("#hdn_GalleryId").val("0");
            selectedGalleryFile = null;
            
            $("#galleryFileInput").val("");
            $("#galleryImgPreview").attr("src", "");
            $("#galleryImagePreviewContainer").hide();
            $("#galleryDropZone").show();
            $("#galleryImageError").addClass("d-none");
            
            $("#addGalleryModalTitle").html('<i class="fa fa-image"></i> Add Gallery');
            $("#btnSaveGallery").removeClass("d-none");
            $("#btnUpdateGallery").addClass("d-none");
            $("#divGalleryStatus").addClass("d-none"); 
            $("#chkGalleryIsActive").prop("checked", true);
        }
    }

    if (action_name === "activitydetails") {
        let currentPage = 1;
        const pageSize = 10;
        let quillInstance = null;
        let selectedFiles = [];
        let deletedImageIds = []; // Track IDs of images to be deleted
        let pendingQuillContent = "";

        const startPicker = flatpickr("#txtSDate", {
            dateFormat: "Y-m-d",
        });

        const endPicker = flatpickr("#txtEDate", {
            dateFormat: "Y-m-d",
            minDate: "today"
        });

        initModalEvents();

        loadActivityDetails(currentPage);

        $(document).on('focusin', function (e) {
            if ($(e.target).closest(".ql-container, .ql-toolbar, .ql-tooltip").length) {
                e.stopImmediatePropagation();
            }
        });

        // Open Modal - Add Mode
        $("#btnAddNew").on("click", function () {
            resetActivityDetailsModal();
            $("#addActivitydetailsModal").modal("show");
            $("#addModalTitle").html('<i class="fa fa-plus"></i> Add Activity Details');
            $("#btnSaveDescription").removeClass("d-none");
            $("#btnUpdateDescription").addClass("d-none");
        });

        // Close Modal
        $(".btnModalClose, .btnCancel").on("click", function () {
            $("#addActivitydetailsModal").modal("hide");
        });

        $(document).on("click", ".btnEditActivityDetails", function () {
            const id = $(this).data("id");
            loadActivityDetailsById(id);
        });

        // File Selection Logic
        $("#fileInput").on("change", function (e) {
            handleFiles(e.target.files);
            $(this).val(''); 
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

        $(document).on("click", "#btnSaveactivitydetails, #btnUpdateactivitydetails", function (e) {
            e.preventDefault();
            if (validateActivityDetailsForm()) {
                submitActivityDetailsUpdate($(this));
            }
        });

        $(document).on("click", ".btnDeleteActivityDetails", function () {
            const id = $(this).data("id");
            showConfirmDialog({
                title: 'Delete Description',
                message: 'Are you sure you want to delete this club description?',
                onYes: function () { deleteActivityDetailsById(id); }
            });
        });


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
            $('#addActivitydetailsModal').on('hidden.bs.modal', function () {
                resetActivityDetailsModal();
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

        function resetActivityDetailsModal() {
            $("#addactivitydetailsForm")[0].reset();
            $("#hdn_activitydetailsId").val(0);
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
            $("#addModalTitle").html('<i class="fa fa-plus"></i> Add Activity Details');
            $("#btnSaveDescription").removeClass("d-none");
            $("#btnUpdateDescription").addClass("d-none");
        }

        function loadActivityDetails(pageNumber = 1) {
            currentPage = pageNumber;
            const apiUrl = _BaseURL + `/Admin/GetActivityDetailsList?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindActivityDetailsTable(data);
                    renderPagination("#activityDetailsPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadActivityDetails(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindActivityDetailsTable([]);
                    renderPagination("#activityDetailsPagination", 1, 0, pageSize, function() {});
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindActivityDetailsTable(data) {
            const $tbody = $("#tab_activitydetails_img tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="8" class="text-center text-muted py-4">No Activity Details found</td></tr>');
                return;
            }

            const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);

            $.each(data, function (index, item) {
                const slNo = (currentPage - 1) * pageSize + (index + 1);
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
                        const imgUrl = images[i].ImagePath1;
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
                    <td><span class="fw-semibold text-primary">${item.SectionName}</span></td>
                    <td>${isActive}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-primary btn-xs btnEditActivityDetails" data-id="${item.ActivitieDetailsId}" title="Edit"><i class="fa fa-pencil"></i></button>
                            <button class="btn btn-danger btn-xs btnDeleteActivityDetails" data-id="${item.ActivitieDetailsId}" title="Delete"><i class="fa fa-trash-o"></i></button>
                        </div>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }

        function loadActivityDetailsById(id) {

            const apiUrl = _BaseURL + "/Admin/GetActivityDetailsById?id=" + id;
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Always fetch fresh data for edit modal

                success: function (res) {
                    if (res) {
                        const data = res.Response || res;
                        bindActivityDetailsToModal(data);
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

        function bindActivityDetailsToModal(data) {
            resetActivityDetailsModal(); // Start clean

            $("#hdn_activitydetailsId").val(data.ActivitieDetailsId || 0);
            $("#txtTitle").val(data.Title || "");
            $("#numDisplayOrder").val(data.DisplayOrder || 0);
            $("#chkIsActive").prop("checked", data.IsActive === true);
            //$("#ddlSection option:selected").val(data.ActivityId);
            $("#ddlSection").val(data.ActivityId).trigger("change");
            startPicker.setDate(data.StartDate);
            endPicker.setDate(data.EndDate);
            $("#txtLocation").val(data.Location);
            $("#txtDuration").val(data.Duration);
            $("#txtFee").val(data.Fee);
            $("#txtSubTitle").val(data.SubTitle);

            //startPicker.set("minDate", "today");
            //endPicker.set("minDate", data.StartDate || "today");

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
                    renderExistingImagePreview(img.ImagePath1, img.ImageName, img.ActivitieDetailsImageId);
                });
            }

            $("#addModalTitle").html('<i class="fa fa-pencil"></i> Update Activity Details');
            $("#btnSaveactivitydetails").addClass("d-none");
            $("#btnUpdateactivitydetails").removeClass("d-none");
            $("#addActivitydetailsModal").modal("show");
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

        function validateActivityDetailsForm() {
            const isUpdate = $("#hdn_activitydetailsId").val() !== "0";
            const title = $("#txtTitle").val().trim();
            const quillContent = quillInstance ? quillInstance.root.innerHTML.trim() : "";
            const isQuillEmpty = quillContent === "<p><br></p>" || quillContent === "" || quillInstance.getText().trim().length === 0;
            const StartDate = $("#txtSDate").val().trim();
            const EndDate = $("#txtEDate").val().trim();
            const location = $("#txtLocation").val().trim();
            const duration = $("#txtDuration").val().trim();
            const Fee = $("#txtFee").val().trim();

            let errors = [];
            if (!title) errors.push("Title is required.");
            if (!StartDate) errors.push("Start Date is required.");
            if (!EndDate) errors.push("End Date is required.")
            if (!location) errors.push("Location is required.")
            if (!duration) errors.push("Duration is required.")
            if (!Fee) errors.push("Fee is required.")
            if (isQuillEmpty) errors.push("Activity Details is required.");
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

            $("#hdn_activitydetails_Description").val(isQuillEmpty ? "" : quillContent);
            return true;
        }

        function submitActivityDetailsUpdate($btn) {
            const isUpdate = $("#hdn_activitydetailsId").val() !== "0";

            // 1. Environment-safe API URL Resolution
            let rawUrl = $btn.data("url");
            let url = rawUrl;

            if (!url) {
                // Fallback routing if data-url is missing
                const basePath = typeof _BaseURL !== 'undefined' ? _BaseURL : window.location.origin;
                url = basePath + (isUpdate ? "/Admin/UpdateActivityDetails" : "/Admin/CreateActivityDetails");
                console.warn("[submitDescriptionUpdate] data-url missing on button. Falling back to:", url);
            } else if (url.startsWith("/")) {
                // Ensure absolute URL if it is a rooted relative path, avoiding tricky relative base tag issues in live env
                const origin = window.location.origin;
                url = origin + url;
            }

            // 2. Prevent duplicate submission
            if ($btn.prop("disabled")) {
                console.warn("[submitActivityDetailsUpdate] Duplicate submission prevented. Request is already in progress.");
                return;
            }

            $btn.prop("disabled", true).find(".spinner-border").removeClass("d-none");
            toastr.info(isUpdate ? "Updating..." : "Saving...", "Please wait");

            // 3. Prepare FormData
            const formData = new FormData();
            const prefix = isUpdate ? "UpdateActivityDetailsDto." : "CreateActivityDetailsDto.";

            if (isUpdate) {
                formData.append(prefix + "ActivitieDetailsId", $("#hdn_activitydetailsId").val());
            }

            

            formData.append(prefix + "Title", $("#txtTitle").val().trim());
            formData.append(prefix + "Description", $("#hdn_activitydetails_Description").val());
            formData.append(prefix + "DisplayOrder", $("#numDisplayOrder").val());
            formData.append(prefix + "IsActive", $("#chkIsActive").is(":checked"));
            formData.append(prefix + "StartDate", $("#txtSDate").val());
            formData.append(prefix + "EndDate", $("#txtEDate").val());
            formData.append(prefix + "Location", $("#txtLocation").val());
            formData.append(prefix + "Duration", $("#txtDuration").val());
            formData.append(prefix + "Fee", $("#txtFee").val());
            formData.append(prefix + "ActivityId", $("#ddlSection option:selected").val());
            formData.append(prefix + "SubTitle", $("#txtSubTitle").val());

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
                        formData.append(prefix + "Images", file);
                    });
                }
            }

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
                    console.log("[submitActivityDetailsUpdate] Success response status:", xhr.status);

                    let res;
                    if (typeof data === "string") {
                        try {
                            res = JSON.parse(data);
                        } catch (e) {
                            console.error("[submitActivityDetailsUpdate] JSON parse error in success callback:", e);
                            toastr.error("Received malformed JSON from server.", "Parsing Error");
                            return;
                        }
                    } else {
                        res = data;
                    }

                    const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);

                    if (isSuccess) {
                        toastr.success(res.Response || res.response || "Success!", "Success");
                        $("#addActivitydetailsModal").modal('hide');
                        loadActivityDetails(currentPage); // Reload table data via AJAX — no page reload needed
                    } else {
                        const errorMsg = res.Response || res.response || res.Message || res.message || "Operation failed.";
                        toastr.warning(errorMsg, "Warning");
                        console.warn("[submitActivityDetailsUpdate] API returned success=false:", res);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("[submitActivityDetailsUpdate] AJAX Error Details:", {
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
                            console.warn("[submitActivityDetailsUpdate] Could not parse error response text as JSON.", e);
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
                    console.log("[submitActivityDetailsUpdate] Request complete.");
                }
            });
        }

        function deleteActivityDetailsById(id) {
            ccConfirmSetLoading(true);
            $.ajax({
                url: _BaseURL + "/Admin/DeleteActivityDetailsById",
                type: 'GET',
                data: { id: id },
                dataType: 'json',
                cache: false,
                success: function (res) {
                    const ok = res && (res.Success || res.Status || res.status === "True");
                    if (ok) {
                        ccConfirmClose();
                        toastr.success("Description deleted successfully.");
                        loadActivityDetails(currentPage);
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

    if (action_name === "achievementdetails") {
        let currentPage = 1;
        const pageSize = 10;

        let quillInstance = null;
        let quillGallery = null;
        let selectedFiles = [];
        let deletedImageIds = []; // Track IDs of images to be deleted
        let pendingQuillContent = "";

        loadAchievementDetails(currentPage);

        // Initialize Quill for gallery
        if ($("#quillGalleryEditorContainer").length > 0) {
            quillGallery = new Quill('#quillGalleryEditorContainer', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['link', 'blockquote', 'code-block'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                    ]
                }
            });
        }

        // Image file preview helper
        $("#fileGalleryImage").on("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    $("#imgGalleryPreview").attr("src", e.target.result);
                    $("#galleryImagePreviewContainer").removeClass("d-none");
                };
                reader.readAsDataURL(file);
            } else {
                $("#imgGalleryPreview").attr("src", "");
                $("#galleryImagePreviewContainer").addClass("d-none");
            }
        });

        $("#btnAddNew").on("click", function () {
            resetAchievementDetailsModal();
            $("#addAchievementDetailsModal").modal("show");
            $("#addModalTitle").html('<i class="fa fa-plus"></i> Add Achievement Details');
            $("#btnSaveachievementdetails").removeClass("d-none");
            $("#btnUpdateachievementdetails").addClass("d-none");
        });

        $(".btnModalClose, .btnCancel").on("click", function () {
            $("#addAchievementDetailsModal").modal("hide");
            $("#addAchievementDetailsGalleryModal").modal("hide");
        });

        

        $(document).on("click", "#btnSaveachievementdetails, #btnUpdateachievementdetails", function (e) {
            e.preventDefault();
            if (validateAchievementDetailsForm()) {
                submitAchievementDetailsUpdate($(this));
            }
        });

        $(document).on("click", ".btnToggleChild", function () {

            const id = $(this).data("id");

            const childRow = $("#child_" + id);

            childRow.toggleClass("d-none");

            const icon = $(this).find("i");

            if (childRow.hasClass("d-none")) {

                icon.removeClass("fa-minus")
                    .addClass("fa-plus");

            } else {

                icon.removeClass("fa-plus")
                    .addClass("fa-minus");

                loadGalleryItems(id);
            }
        });

        $(document).on("click", ".btnAddChild", function () {
            const parentId = $(this).data("id");
            resetAchievementDetailsGalleryModal();
            $("#hdn_gallery_achievementdetailsId").val(parentId);
            $("#addAchievementDetailsGalleryModal").modal("show");
            $("#addGalleryModalTitle").html('<i class="fa fa-plus"></i> Add Achievement Gallery Details');
            $("#btnSaveachievementdetailsgallery").removeClass("d-none");
            $("#btnUpdateachievementdetailsgallery").addClass("d-none");
        });



        $(document).on("click", "#btnSaveachievementdetailsgallery, #btnUpdateachievementdetailsgallery", function (e) {
            e.preventDefault();
            const $btn = $(this);
            const isUpdate = $btn.attr("id") === "btnUpdateachievementdetailsgallery";

            const title = ($("#txtGalleryTitle").val() || "").trim();
            if (!title) {
                toastr.warning("Title is required.", "Validation Error");
                return;
            }
            if (!isUpdate && !$("#fileGalleryImage")[0].files[0]) {
                toastr.warning("Image is required.", "Validation Error");
                return;
            }

            if ($btn.prop("disabled")) return;
            $btn.prop("disabled", true).find(".spinner-border").removeClass("d-none");
            toastr.info(isUpdate ? "Updating..." : "Saving...", "Please wait");

            const formData = new FormData();
            const prefix = isUpdate ? "achievementDetailsGalleryUpdateDto." : "achievementDetailsGalleryCreateDto.";

            if (isUpdate) {
                formData.append(prefix + "AchievementDetailsGalleryId", $("#hdn_achievementdetailsgalleryId").val());
            }
            formData.append(prefix + "AchievementDetailsId", $("#hdn_gallery_achievementdetailsId").val());
            formData.append(prefix + "Title", title);
            formData.append(prefix + "DisplayOrder", $("#txtGalleryDisplayOrder").val() || "0");
            formData.append(prefix + "IsActive", $("#chkGalleryIsActive").is(":checked"));

            let desc = "";
            if (quillGallery) {
                desc = quillGallery.root.innerHTML;
                if (desc === "<p><br></p>") desc = "";
            }
            formData.append(prefix + "Description", desc);

            const fileInput = $("#fileGalleryImage")[0];
            if (fileInput && fileInput.files[0]) {
                formData.append(prefix + "Image", fileInput.files[0]);
            }

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || "";
            if (antiforgeryToken) {
                formData.append("__RequestVerificationToken", antiforgeryToken);
            }

            showLoader();

            let url = $btn.data("url");
            if (!url) {
                const basePath = window.location.origin;
                url = basePath + (isUpdate ? "/Admin/UpdateAchievementDetailsGallery" : "/Admin/CreateAchievementDetailsGallery");
            } else if (url.startsWith("/")) {
                url = window.location.origin + url;
            }

            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (data) {
                    let res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);

                    if (isSuccess) {
                        toastr.success(res.Response || "Success!", "Success");
                        $("#addAchievementDetailsGalleryModal").modal('hide');
                        loadGalleryItems($("#hdn_gallery_achievementdetailsId").val());
                    } else {
                        toastr.warning(res.Response || "Operation failed.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("An error occurred during submission.", "Error");
                    console.error(xhr.responseText);
                },
                complete: function () {
                    $btn.prop("disabled", false).find(".spinner-border").addClass("d-none");
                    hideLoader();
                }
            });
        });

        $(document).on("click", ".btnEditGalleryItem", function () {
            const id = $(this).data("id");
            const parentId = $(this).data("parent-id");
            const title = $(this).data("title");
            const displayOrder = $(this).data("displayorder");
            const isActive = $(this).data("isactive") === true || $(this).data("isactive") === "true";
            const image = $(this).data("image");
            const desc = $(this).data("description");

            resetAchievementDetailsGalleryModal();

            $("#hdn_achievementdetailsgalleryId").val(id);
            $("#hdn_gallery_achievementdetailsId").val(parentId);
            $("#txtGalleryTitle").val(title);
            $("#txtGalleryDisplayOrder").val(displayOrder);
            $("#chkGalleryIsActive").prop("checked", isActive);

            $("#fileGalleryImage").prop("required", false);

            if (image) {
                const apiBase = typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : window.location.origin;
                const previewUrl = image.startsWith('http') ? image : apiBase + image;
                $("#imgGalleryPreview").attr("src", previewUrl);
                $("#galleryImagePreviewContainer").removeClass("d-none");
            }

            if (quillGallery && desc) {
                quillGallery.root.innerHTML = desc;
            }

            $("#addAchievementDetailsGalleryModal").modal("show");
            $("#addGalleryModalTitle").html('<i class="fa fa-pencil"></i> Edit Achievement Gallery Details');
            $("#btnSaveachievementdetailsgallery").addClass("d-none");
            $("#btnUpdateachievementdetailsgallery").removeClass("d-none");
        });

        $(document).on("click", ".btnDeleteGalleryItem", function () {
            const id = $(this).data("id");
            const parentId = $(this).data("parent-id");

            showConfirmDialog({
                title: 'Delete Gallery Details',
                message: 'Are you sure you want to delete this gallery item?',
                onYes: function () { DeleteAchievementDetailsGallery(id, parentId); }
            });

           
        });

        // Edit parent Achievement Details
        $(document).on("click", ".btnEditAchievementDetails", function () {
            const id = $(this).data("id");
            const title = $(this).data("title");
            const subtitle = $(this).data("subtitle");
            const galleryItemsId = $(this).data("galleryitemsid");

            resetAchievementDetailsModal();

            $("#hdn_achievementdetailsId").val(id);
            $("#txtTitle").val(title);
            $("#txtSubTitle").val(subtitle);
            if (galleryItemsId) {
                $("#ddlSection").val(galleryItemsId);
            }

            $("#addAchievementDetailsModal").modal("show");
            $("#addModalTitle").html('<i class="fa fa-pencil"></i> Edit Achievement Details');
            $("#btnSaveachievementdetails").addClass("d-none");
            $("#btnUpdateachievementdetails").removeClass("d-none");
        });

        // Delete parent Achievement Details
        $(document).on("click", ".btnDeleteAchievementDetails", function () {
            const id = $(this).data("id");

            if (confirm("Are you sure you want to delete this Achievement Detail? This will also delete all child gallery items.")) {
                const url = window.location.origin + "/Admin/DeleteAchievementDetails";
                const token = $('input[name="__RequestVerificationToken"]').val() || "";

                showLoader();
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: {
                        id: id,
                        __RequestVerificationToken: token
                    },
                    success: function (data) {
                        let res = typeof data === "string" ? JSON.parse(data) : data;
                        const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);
                        if (isSuccess) {
                            toastr.success(res.Response || "Deleted successfully.", "Success");
                            loadAchievementDetails(currentPage);
                        } else {
                            toastr.warning(res.Response || "Failed to delete.", "Warning");
                        }
                    },
                    error: function (xhr, status, error) {
                        toastr.error("An error occurred while deleting.", "Error");
                    },
                    complete: function () {
                        hideLoader();
                    }
                });
            }
        });


        function DeleteAchievementDetailsGallery(id, parentId) {
            ccConfirmSetLoading(true);
            const url = window.location.origin + "/Admin/DeleteAchievementDetailsGallery";
            const token = $('input[name="__RequestVerificationToken"]').val() || "";

            showLoader();
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    id: id,
                    __RequestVerificationToken: token
                },
                success: function (data) {
                    let res = typeof data === "string" ? JSON.parse(data) : data;
                    const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);
                    if (isSuccess) {
                        ccConfirmClose();
                        toastr.success(res.Response || "Deleted successfully.", "Success");
                        loadGalleryItems(parentId);
                    } else {
                        ccConfirmSetLoading(false);
                        toastr.warning(res.Response || "Failed to delete.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    ccConfirmSetLoading(false);
                    toastr.error("An error occurred.", "Error");
                },
                complete: function () {
                    hideLoader();
                }
            });
        }
        function escapeHtml(text) {
            if (!text) return "";
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function loadGalleryItems(achievementId) {
            // Guard: only check if the child accordion row itself exists,
            // NOT .text-muted (that placeholder gets removed after the first load)
            const childRow = $("#child_" + achievementId);
            if (childRow.length === 0) return;

            const url = _BaseURL + "/Admin/GetAchievementDetailsGalleryList?id=" + achievementId;
            
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Always fetch fresh child data
                success: function (data) {
                    if (data && data.length > 0) {
                        let tableHtml = `
                        <table class="table table-bordered table-striped table-sm bg-white m-0">
                            <thead>
                                <tr>
                                    <th width="60">Sl. No</th>
                                    <th width="100">Image</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th width="120">Display Order</th>
                                    <th width="100">Status</th>
                                    <th width="100">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                        `;
                        
                        $.each(data, function (i, item) {
                            const sl = i + 1;
                            const imagePath = item.ImagePath1 || '';
                            const previewUrl = imagePath.startsWith('http') ? imagePath : (_ProjectAPI || _BaseURL) + imagePath;
                            const isActiveLabel = item.IsActive ? '<span class="label label-success">Active</span>' : '<span class="label label-danger">Inactive</span>';
                            const rawDesc = item.Description || '';
                            
                            tableHtml += `
                            <tr class="align-middle">
                                <td>${sl}</td>
                                <td>
                                    ${imagePath ? `<img src="${previewUrl}" style="max-height: 40px; border-radius: 4px; border: 1px solid #ddd;" />` : 'N/A'}
                                </td>
                                <td><strong>${item.Title || 'N/A'}</strong></td>
                                <td>${rawDesc}</td>
                                <td>${item.DisplayOrder || 0}</td>
                                <td>${isActiveLabel}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-primary btn-xs btnEditGalleryItem" 
                                                data-id="${item.AchievementDetailsGalleryId}" 
                                                data-parent-id="${achievementId}"
                                                data-title="${escapeHtml(item.Title || '')}"
                                                data-displayorder="${item.DisplayOrder || 0}"
                                                data-isactive="${item.IsActive}"
                                                data-image="${item.ImagePath1 || ''}"
                                                data-description="${escapeHtml(rawDesc)}"
                                                title="Edit">
                                            <i class="fa fa-pencil"></i>
                                        </button>
                                        <button class="btn btn-danger btn-xs btnDeleteGalleryItem" 
                                                data-id="${item.AchievementDetailsGalleryId}" 
                                                data-parent-id="${achievementId}"
                                                title="Delete">
                                            <i class="fa fa-trash-o"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `;
                        });
                        
                        tableHtml += `
                            </tbody>
                        </table>
                        `;
                        
                        $("#child_" + achievementId + " .p-3").find(".table-responsive-child, .text-muted, table").remove();
                        $("#child_" + achievementId + " hr").after(`<div class="table-responsive-child mt-3">${tableHtml}</div>`);
                    } else {
                        $("#child_" + achievementId + " .p-3").find(".table-responsive-child, .text-muted, table").remove();
                        $("#child_" + achievementId + " hr").after('<div class="text-muted mt-3">No child data found.</div>');
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error loading gallery items:", error);
                }
            });
        }

        function resetAchievementDetailsGalleryModal() {
            $("#hdn_achievementdetailsgalleryId").val("0");
            $("#hdn_gallery_achievementdetailsId").val("0");
            $("#txtGalleryTitle").val("");
            $("#txtGalleryDisplayOrder").val("0");
            $("#chkGalleryIsActive").prop("checked", true);
            $("#fileGalleryImage").val("").prop("required", true);
            $("#galleryImagePreviewContainer").addClass("d-none");
            $("#imgGalleryPreview").attr("src", "");
            if (quillGallery) {
                quillGallery.setContents([]);
            }
        }

        function validateAchievementDetailsForm() {
            const hdnVal = $("#hdn_achievementdetailsId").val() || "";
            const isUpdate = hdnVal !== "0" && hdnVal !== "";
            const title = ($("#txtTitle").val() || "").trim();
            const Subtitle = ($("#txtSubTitle").val() || "").trim();
            const AName = ($("#ddlSection option:selected").val() || "").trim();
            let errors = [];
            if (!AName) errors.push("Achievement Name is required.");
            if (!title) errors.push("Title is required.");
            if (!Subtitle) errors.push("Sub Title is required.");

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }
            return true;
        }

        function submitAchievementDetailsUpdate($btn) {
            const hdnVal = $("#hdn_achievementdetailsId").val() || "";
            const isUpdate = hdnVal !== "0" && hdnVal !== "";

            let rawUrl = $btn.data("url");
            let url = rawUrl;

            if (!url) {
                // Fallback routing if data-url is missing
                const basePath = typeof _BaseURL !== 'undefined' ? _BaseURL : window.location.origin;
                url = basePath + (isUpdate ? "/Admin/UpdateAchievementDetails" : "/Admin/CreateAchievementDetails");
                console.warn("[submitAchievementDetailsUpdate] data-url missing on button. Falling back to:", url);
            } else if (url.startsWith("/")) {
                // Ensure absolute URL if it is a rooted relative path, avoiding tricky relative base tag issues in live env
                const origin = window.location.origin;
                url = origin + url;
            }
            // 2. Prevent duplicate submission
            if ($btn.prop("disabled")) {
                console.warn("[submitAchievementDetailsUpdate] Duplicate submission prevented. Request is already in progress.");
                return;
            }

            $btn.prop("disabled", true).find(".spinner-border").removeClass("d-none");
            toastr.info(isUpdate ? "Updating..." : "Saving...", "Please wait");

            // 3. Prepare FormData
            const formData = new FormData();
            const prefix = isUpdate ? "AchievementDetailsUpdateDto." : "AchievementDetailsCreateDto.";

            if (isUpdate) {
                formData.append(prefix + "AchievementDetailsId", hdnVal);
            }

            formData.append(prefix + "GalleryItemsId", ($("#ddlSection option:selected").val() || "").trim());
            formData.append(prefix + "Title", ($("#txtTitle").val() || "").trim());
            formData.append(prefix + "SubTitle", ($("#txtSubTitle").val() || "").trim());

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
                contentType: false,   // REQUIRED: Prevent jQuery from setting default Content-Type header to allow browser boundary generation
                processData: false,   // REQUIRED: Prevent jQuery from attempting to serialize FormData object into a query string
                cache: false,
                timeout: 300000,      // 5 minutes — matches server HttpClient timeout for large uploads
                headers: {
                    // Keep header for non-proxy environments
                    "RequestVerificationToken": antiforgeryToken
                },
                success: function (data, textStatus, xhr) {
                    console.log("[submitAchievementDetailsUpdate] Success response status:", xhr.status);

                    let res;
                    if (typeof data === "string") {
                        try {
                            res = JSON.parse(data);
                        } catch (e) {
                            console.error("[submitAchievementDetailsUpdate] JSON parse error in success callback:", e);
                            toastr.error("Received malformed JSON from server.", "Parsing Error");
                            return;
                        }
                    } else {
                        res = data;
                    }

                    const isSuccess = res && (res.Success === true || res.Status === true || res.status === "True" || res.success === true);

                    if (isSuccess) {
                        toastr.success(res.Response || res.response || "Success!", "Success");
                        $("#addAchievementDetailsModal").modal('hide');
                        loadAchievementDetails(currentPage); // Reload table data via AJAX — no page reload needed
                    } else {
                        const errorMsg = res.Response || res.response || res.Message || res.message || "Operation failed.";
                        toastr.warning(errorMsg, "Warning");
                        console.warn("[submitAchievementDetailsUpdate] API returned success=false:", res);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("[submitAchievementDetailsUpdate] AJAX Error Details:", {
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
                            console.warn("[submitAchievementDetailsUpdate] Could not parse error response text as JSON.", e);
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
                    console.log("[submitAchievementDetailsUpdate] Request complete.");
                }
            });
        }

        function loadAchievementDetails(pageNumber = 1) {
            currentPage = pageNumber;
            const apiUrl = _BaseURL + `/Admin/GetAchievementDetailsList?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,  // Prevent browser/proxy caching of list data
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindAchievementDetailsTable(data);
                    renderPagination("#achievementDetailsPagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadAchievementDetails(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindAchievementDetailsTable([]);
                    renderPagination("#achievementDetailsPagination", 1, 0, pageSize, function() {});
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindAchievementDetailsTable(data) {
            const $tbody = $("#tab_Achievementdetails tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="7" class="text-center text-muted py-4">No Activity Details found</td></tr>');
                return;
            }

            const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);

            $.each(data, function (index, item) {
                const slNo = (currentPage - 1) * pageSize + (index + 1);
                const title = item.Title || "N/A";
                const displayOrder = item.DisplayOrder || 0;

                // Scrub HTML for table preview
                const plainDescription = stripHtml(item.Description);

                const isActive = item.IsActive ?
                    '<span class="label label-success">Active</span>' :
                    '<span class="label label-danger">Inactive</span>';

                

                const row = `
                <tr class="align-middleparent-row" data-id="${item.AchievementDetailsId}">
                    <td>
                        <button class="btn btn-sm btn-outline-primary btnToggleChild"
                                data-id="${item.AchievementDetailsId}">
                            <i class="fa fa-plus"></i>
                        </button>
                    </td>
                    <td class="fw-bold text-muted">${slNo}</td>
                    <td><span class="fw-semibold text-primary">${title}</span></td>
                    <td><span class="fw-semibold text-primary">${item.SubTitle || item.subtitle || 'N/A'}</span></td>
                    <td>${isActive}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-primary btn-xs btnEditAchievementDetails"
                                    data-id="${item.AchievementDetailsId}"
                                    data-title="${escapeHtml(item.Title || '')}"
                                    data-subtitle="${escapeHtml(item.SubTitle || item.subtitle || '')}"
                                    data-galleryitemsid="${item.GalleryItemsId || ''}"
                                    title="Edit"><i class="fa fa-pencil"></i></button>
                            <button class="btn btn-danger btn-xs btnDeleteAchievementDetails"
                                    data-id="${item.AchievementDetailsId}"
                                    title="Delete"><i class="fa fa-trash-o"></i></button>
                        </div>
                    </td>
                </tr>
                <tr class="child-row d-none"
                    id="child_${item.AchievementDetailsId}">
                    <td colspan="9">
                        <div class="p-3 bg-light rounded">

                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    Child Achievement Details
                                </h6>

                                <button class="btn btn-success btn-sm btnAddChild"
                                        data-id="${item.AchievementDetailsId}">
                                    <i class="fa fa-plus"></i> Add
                                </button>
                            </div>

                            <hr>

                            <div class="text-muted">
                                No child data found.
                            </div>

                        </div>
                    </td>
                </tr>
                `;
                $tbody.append(row);
            });
        }

        function resetAchievementDetailsModal() {
            $("#hdn_achievementdetailsId").val("0");
            $("#txtTitle").val("");
            $("#txtSubTitle").val("");
            $("#ddlSection").val("");
        }
    }

    if (action_name === "aboutus" || action_name === "about" || window.location.pathname.toLowerCase().indexOf("about") !== -1) {
        let currentPage = 1;
        const pageSize = 10;
        let currentSearch = "";
        let quillHistoryInstance = null;

        loadAboutPages(currentPage);

        /* ---------- EVENT HANDLERS & SEARCH ---------- */
        $("#btnAddNew").on("click", function () {
            resetAboutPageForm();
            $("#addAboutPageModal").modal("show");
            $("#addAboutPageTitle").html('<i class="fa fa-plus"></i> Add About Page');
            $("#btnSaveAboutPage").removeClass("d-none");
            $("#btnUpdateAboutPage").addClass("d-none");
        });

        $(".btnModalClose, .btnCancel").on("click", function () {
            $("#addAboutPageModal").modal("hide");
        });

        $("#btnSearchAboutPage").on("click", function () {
            currentSearch = $("#txtSearchAboutPage").val() ? $("#txtSearchAboutPage").val().trim() : "";
            loadAboutPages(1);
        });

        $("#txtSearchAboutPage").on("keypress", function (e) {
            if (e.which === 13) {
                e.preventDefault();
                currentSearch = $(this).val() ? $(this).val().trim() : "";
                loadAboutPages(1);
            }
        });

        $("#btnRefreshAboutPage").on("click", function () {
            $("#txtSearchAboutPage").val("");
            currentSearch = "";
            loadAboutPages(1);
        });

        /* ---------- QUILL INITIALIZATION ---------- */
        function initQuillHistory() {
            const container = document.getElementById('quillHistoryEditor');
            if (container && !quillHistoryInstance) {
                quillHistoryInstance = new Quill('#quillHistoryEditor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Write history & legacy details...'
                });
            }
        }

        $('#addAboutPageModal').on('shown.bs.modal', function () {
            initQuillHistory();
        }).on('hidden.bs.modal', function () {
            resetAboutPageForm();
        });

        /* ---------- BANNER PREVIEW ---------- */
        $("#fileBannerImage").on("change", function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    $("#imgBannerPreview").attr("src", e.target.result);
                    $("#bannerImagePreviewContainer").show();
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        /* ---------- REPEATER ROW ADDITIONS ---------- */
        $("#btnAddSectionRow").on("click", function () {
            addSectionRow();
        });

        $("#btnAddDetailsRow").on("click", function () {
            addDetailsRow();
        });

        $("#btnAddPersonRow").on("click", function () {
            addPersonRow();
        });

        $(document).on("click", ".btnRemoveRepeaterItem", function () {
            $(this).closest(".repeater-card").remove();
            updateCountBadges();
        });

        function updateCountBadges() {
            $("#sectionCountBadge").text($("#sectionRepeaterContainer .repeater-card").length);
            $("#detailsCountBadge").text($("#detailsRepeaterContainer .repeater-card").length);
            $("#peopleCountBadge").text($("#peopleRepeaterContainer .repeater-card").length);
        }

        function addSectionRow(data = null) {
            const id = data ? (data.AboutPageSectionId || data.aboutPageSectionId || 0) : 0;
            const title = data ? (data.SectionTitle || data.sectionTitle || "") : "";
            const subtitle = data ? (data.SectionSubtitle || data.sectionSubtitle || "") : "";
            const content = data ? (data.Content || data.content || "") : "";
            const order = data ? (data.DisplayOrder || data.displayOrder || 0) : 0;
            const isActive = data ? (data.IsActive === true || data.isActive === true) : true;

            const html = `
                <div class="repeater-card">
                    <div class="repeater-header">
                        <h6><i class="fa fa-list-alt mr-1"></i> Section Item</h6>
                        <button type="button" class="btn btn-sm btn-outline-danger btnRemoveRepeaterItem"><i class="fa fa-trash"></i> Remove</button>
                    </div>
                    <input type="hidden" class="sec-id" value="${id}" />
                    <div class="row g-2">
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Section Title</label>
                            <input type="text" class="form-control form-control-sm sec-title" value="${escapeHtml(title)}" placeholder="Title..." />
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Section Subtitle</label>
                            <input type="text" class="form-control form-control-sm sec-subtitle" value="${escapeHtml(subtitle)}" placeholder="Subtitle..." />
                        </div>
                        <div class="col-md-12 mb-2">
                            <label class="form-label small font-weight-bold">Content</label>
                            <textarea class="form-control form-control-sm sec-content" rows="2" placeholder="Section content...">${escapeHtml(content)}</textarea>
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Display Order</label>
                            <input type="number" class="form-control form-control-sm sec-order" value="${order}" min="0" />
                        </div>
                        <div class="col-md-6 mb-2 d-flex align-items-end">
                            <div class="form-check">
                                <input class="form-check-input sec-active" type="checkbox" ${isActive ? 'checked' : ''} />
                                <label class="form-check-label small font-weight-bold">Is Active</label>
                            </div>
                        </div>
                    </div>
                </div>`;
            $("#sectionRepeaterContainer").append(html);
            updateCountBadges();
        }

        function addDetailsRow(data = null) {
            const id = data ? (data.AboutDetailsId || data.aboutDetailsId || 0) : 0;
            const title = data ? (data.Title || data.title || "") : "";
            const description = data ? (data.Description || data.description || "") : "";
            const imageUrl = data ? (data.ImageUrl || data.imageUrl || "") : "";
            const order = data ? (data.DisplayOrder || data.displayOrder || 0) : 0;
            const isActive = data ? (data.IsActive === true || data.isActive === true) : true;

            let fullUrl = imageUrl;
            if (fullUrl && fullUrl.startsWith('/')) {
                fullUrl = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + fullUrl;
            }

            const html = `
                <div class="repeater-card">
                    <div class="repeater-header">
                        <h6><i class="fa fa-th-list mr-1"></i> Detail Item</h6>
                        <button type="button" class="btn btn-sm btn-outline-danger btnRemoveRepeaterItem"><i class="fa fa-trash"></i> Remove</button>
                    </div>
                    <input type="hidden" class="det-id" value="${id}" />
                    <input type="hidden" class="det-imageurl" value="${escapeHtml(imageUrl)}" />
                    <div class="row g-2">
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Title</label>
                            <input type="text" class="form-control form-control-sm det-title" value="${escapeHtml(title)}" placeholder="Title..." />
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Display Order</label>
                            <input type="number" class="form-control form-control-sm det-order" value="${order}" min="0" />
                        </div>
                        <div class="col-md-12 mb-2">
                            <label class="form-label small font-weight-bold">Description</label>
                            <textarea class="form-control form-control-sm det-desc" rows="2" placeholder="Description...">${escapeHtml(description)}</textarea>
                        </div>
                        <div class="col-md-8 mb-2">
                            <label class="form-label small font-weight-bold">Image File</label>
                            <input type="file" class="form-control form-control-sm det-file" accept="image/*" />
                        </div>
                        <div class="col-md-4 mb-2 d-flex align-items-center">
                            <div class="det-preview-container">
                                ${fullUrl ? `<img src="${fullUrl}" class="preview-box det-preview-img" alt="Preview" />` : '<div class="preview-box bg-light text-muted d-flex align-items-center justify-content-center det-preview-img" style="font-size:10px;">No Image</div>'}
                            </div>
                        </div>
                        <div class="col-md-12 mb-2">
                            <div class="form-check">
                                <input class="form-check-input det-active" type="checkbox" ${isActive ? 'checked' : ''} />
                                <label class="form-check-label small font-weight-bold">Is Active</label>
                            </div>
                        </div>
                    </div>
                </div>`;

            const $row = $(html);
            $row.find(".det-file").on("change", function () {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        $row.find(".det-preview-container").html(`<img src="${e.target.result}" class="preview-box det-preview-img" alt="Preview" />`);
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
            $("#detailsRepeaterContainer").append($row);
            updateCountBadges();
        }

        function addPersonRow(data = null) {
            const id = data ? (data.PersonId || data.personId || 0) : 0;
            const name = data ? (data.PersonName || data.personName || "") : "";
            const fullDesc = data ? (data.FullDescription || data.fullDescription || "") : "";
            const imageUrl = data ? (data.ImageUrl || data.imageUrl || "") : "";
            const order = data ? (data.DisplayOrder || data.displayOrder || 0) : 0;
            const isActive = data ? (data.IsActive === true || data.isActive === true) : true;

            let fullUrl = imageUrl;
            if (fullUrl && fullUrl.startsWith('/')) {
                fullUrl = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + fullUrl;
            }

            const html = `
                <div class="repeater-card">
                    <div class="repeater-header">
                        <h6><i class="fa fa-user mr-1"></i> Person Item</h6>
                        <button type="button" class="btn btn-sm btn-outline-danger btnRemoveRepeaterItem"><i class="fa fa-trash"></i> Remove</button>
                    </div>
                    <input type="hidden" class="per-id" value="${id}" />
                    <input type="hidden" class="per-imageurl" value="${escapeHtml(imageUrl)}" />
                    <div class="row g-2">
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Person Name</label>
                            <input type="text" class="form-control form-control-sm per-name" value="${escapeHtml(name)}" placeholder="Person Name..." />
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label small font-weight-bold">Display Order</label>
                            <input type="number" class="form-control form-control-sm per-order" value="${order}" min="0" />
                        </div>
                        <div class="col-md-12 mb-2">
                            <label class="form-label small font-weight-bold">Full Description</label>
                            <textarea class="form-control form-control-sm per-desc" rows="2" placeholder="Full Description...">${escapeHtml(fullDesc)}</textarea>
                        </div>
                        <div class="col-md-8 mb-2">
                            <label class="form-label small font-weight-bold">Image File</label>
                            <input type="file" class="form-control form-control-sm per-file" accept="image/*" />
                        </div>
                        <div class="col-md-4 mb-2 d-flex align-items-center">
                            <div class="per-preview-container">
                                ${fullUrl ? `<img src="${fullUrl}" class="preview-box per-preview-img" alt="Preview" />` : '<div class="preview-box bg-light text-muted d-flex align-items-center justify-content-center per-preview-img" style="font-size:10px;">No Image</div>'}
                            </div>
                        </div>
                        <div class="col-md-12 mb-2">
                            <div class="form-check">
                                <input class="form-check-input per-active" type="checkbox" ${isActive ? 'checked' : ''} />
                                <label class="form-check-label small font-weight-bold">Is Active</label>
                            </div>
                        </div>
                    </div>
                </div>`;

            const $row = $(html);
            $row.find(".per-file").on("change", function () {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        $row.find(".per-preview-container").html(`<img src="${e.target.result}" class="preview-box per-preview-img" alt="Preview" />`);
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
            $("#peopleRepeaterContainer").append($row);
            updateCountBadges();
        }

        /* ---------- DYNAMIC FORM DATA BUILDER ---------- */
        function buildAboutPageFormData() {
            const formData = new FormData();
            const aboutPageId = $("#hdn_AboutPageId").val() || "0";
            const isUpdate = aboutPageId && aboutPageId !== "0";
            const modelPrefix = isUpdate ? "UpdateAboutPageDto" : "CreateAboutPageDto";

            if (isUpdate) {
                formData.append("AboutPageId", aboutPageId);
                formData.append(`${modelPrefix}.AboutPageId`, aboutPageId);
                formData.append("AboutPage.AboutPageId", aboutPageId);
                formData.append(`${modelPrefix}.AboutPage.AboutPageId`, aboutPageId);
            }

            const pageTitle = ($("#txtPageTitle").val() || "").trim();
            const pageSlug = ($("#txtPageSlug").val() || "").trim();
            const heroTitle = ($("#txtHeroTitle").val() || "").trim();
            const heroSubtitle = ($("#txtHeroSubtitle").val() || "").trim();
            const historyTitle = ($("#txtHistoryTitle").val() || "").trim();
            
            let historyContent = "";
            if (typeof quillHistoryInstance !== 'undefined' && quillHistoryInstance && quillHistoryInstance.root) {
                historyContent = quillHistoryInstance.root.innerHTML;
            } else {
                historyContent = ($("#hdnHistoryDescription").val() || "").trim();
            }

            const mapTitle = ($("#txtMapTitle").val() || "").trim();
            const mapAddress = ($("#txtMapAddress").val() || "").trim();
            const latitude = $("#txtLatitude").val() || "";
            const longitude = $("#txtLongitude").val() || "";
            const isActive = $("#chkAboutPageActive").is(":checked");
            const bannerImageUrl = $("#hdnBannerImageUrl").val() || "";

            // 1. Model prefix keys for MultipleModel model binding
            formData.append(`${modelPrefix}.PageTitle`, pageTitle);
            formData.append(`${modelPrefix}.PageSlug`, pageSlug);
            formData.append(`${modelPrefix}.HeroTitle`, heroTitle);
            formData.append(`${modelPrefix}.HeroSubtitle`, heroSubtitle);
            formData.append(`${modelPrefix}.HistoryTitle`, historyTitle);
            formData.append(`${modelPrefix}.HistoryDescription`, historyContent);
            formData.append(`${modelPrefix}.MapTitle`, mapTitle);
            formData.append(`${modelPrefix}.MapAddress`, mapAddress);
            formData.append(`${modelPrefix}.Latitude`, latitude);
            formData.append(`${modelPrefix}.Longitude`, longitude);
            formData.append(`${modelPrefix}.IsActive`, isActive);
            formData.append(`${modelPrefix}.BannerImageUrl`, bannerImageUrl);

            // 2. Model prefix + Nested AboutPage object properties
            formData.append(`${modelPrefix}.AboutPage.PageTitle`, pageTitle);
            formData.append(`${modelPrefix}.AboutPage.PageSlug`, pageSlug);
            formData.append(`${modelPrefix}.AboutPage.HeroTitle`, heroTitle);
            formData.append(`${modelPrefix}.AboutPage.HeroSubtitle`, heroSubtitle);
            formData.append(`${modelPrefix}.AboutPage.HistoryTitle`, historyTitle);
            formData.append(`${modelPrefix}.AboutPage.HistoryDescription`, historyContent);
            formData.append(`${modelPrefix}.AboutPage.MapTitle`, mapTitle);
            formData.append(`${modelPrefix}.AboutPage.MapAddress`, mapAddress);
            formData.append(`${modelPrefix}.AboutPage.Latitude`, latitude);
            formData.append(`${modelPrefix}.AboutPage.Longitude`, longitude);
            formData.append(`${modelPrefix}.AboutPage.IsActive`, isActive);
            formData.append(`${modelPrefix}.AboutPage.BannerImageUrl`, bannerImageUrl);

            // 3. Nested AboutPage object properties for API_ai
            formData.append("AboutPage.PageTitle", pageTitle);
            formData.append("AboutPage.PageSlug", pageSlug);
            formData.append("AboutPage.HeroTitle", heroTitle);
            formData.append("AboutPage.HeroSubtitle", heroSubtitle);
            formData.append("AboutPage.HistoryTitle", historyTitle);
            formData.append("AboutPage.HistoryDescription", historyContent);
            formData.append("AboutPage.MapTitle", mapTitle);
            formData.append("AboutPage.MapAddress", mapAddress);
            formData.append("AboutPage.Latitude", latitude);
            formData.append("AboutPage.Longitude", longitude);
            formData.append("AboutPage.BannerImageUrl", bannerImageUrl);
            formData.append("AboutPage.IsActive", isActive);

            // 4. Flat properties for fallback
            formData.append("PageTitle", pageTitle);
            formData.append("PageSlug", pageSlug);
            formData.append("HeroTitle", heroTitle);
            formData.append("HeroSubtitle", heroSubtitle);
            formData.append("HistoryTitle", historyTitle);
            formData.append("HistoryDescription", historyContent);
            formData.append("MapTitle", mapTitle);
            formData.append("MapAddress", mapAddress);
            formData.append("Latitude", latitude);
            formData.append("Longitude", longitude);
            formData.append("IsActive", isActive);
            formData.append("BannerImageUrl", bannerImageUrl);

            // Antiforgery token
            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() ||
                                     $('meta[name="__RequestVerificationToken"]').attr('content') || '';
            if (antiforgeryToken) {
                formData.append("__RequestVerificationToken", antiforgeryToken);
            }

            // Banner File (Single append)
            const bannerFileInput = $("#fileBannerImage")[0];
            if (bannerFileInput && bannerFileInput.files && bannerFileInput.files[0]) {
                const bFile = bannerFileInput.files[0];
                formData.append(`${modelPrefix}.BannerFile`, bFile);
            }

            // 5. Serialize AboutPageSection
            $("#sectionRepeaterContainer .repeater-card").each(function (i) {
                const secId = $(this).find(".sec-id").val();
                const secTitle = ($(this).find(".sec-title").val() || "").trim();
                const secSubtitle = ($(this).find(".sec-subtitle").val() || "").trim();
                const secContent = ($(this).find(".sec-content").val() || "").trim();
                const secOrder = $(this).find(".sec-order").val() || 0;
                const secActive = $(this).find(".sec-active").is(":checked");

                if (secId && secId !== "0") {
                    formData.append(`${modelPrefix}.AboutPageSection[${i}].AboutPageSectionId`, secId);
                    formData.append(`AboutPageSection[${i}].AboutPageSectionId`, secId);
                }

                formData.append(`${modelPrefix}.AboutPageSection[${i}].SectionTitle`, secTitle);
                formData.append(`AboutPageSection[${i}].SectionTitle`, secTitle);

                formData.append(`${modelPrefix}.AboutPageSection[${i}].SectionSubtitle`, secSubtitle);
                formData.append(`AboutPageSection[${i}].SectionSubtitle`, secSubtitle);

                formData.append(`${modelPrefix}.AboutPageSection[${i}].SectionDescription`, secContent);
                formData.append(`${modelPrefix}.AboutPageSection[${i}].Content`, secContent);
                formData.append(`AboutPageSection[${i}].SectionDescription`, secContent);
                formData.append(`AboutPageSection[${i}].Content`, secContent);

                formData.append(`${modelPrefix}.AboutPageSection[${i}].DisplayOrder`, secOrder);
                formData.append(`AboutPageSection[${i}].DisplayOrder`, secOrder);

                formData.append(`${modelPrefix}.AboutPageSection[${i}].IsVisible`, secActive);
                formData.append(`${modelPrefix}.AboutPageSection[${i}].IsActive`, secActive);
                formData.append(`AboutPageSection[${i}].IsVisible`, secActive);
                formData.append(`AboutPageSection[${i}].IsActive`, secActive);
            });

            // 6. Serialize AboutDetails
            $("#detailsRepeaterContainer .repeater-card").each(function (i) {
                const detId = $(this).find(".det-id").val();
                const detTitle = ($(this).find(".det-title").val() || "").trim();
                const detDesc = ($(this).find(".det-desc").val() || "").trim();
                const detOrder = $(this).find(".det-order").val() || 0;
                const detActive = $(this).find(".det-active").is(":checked");
                const detImgUrl = $(this).find(".det-imageurl").val() || "";

                if (detId && detId !== "0") {
                    formData.append(`${modelPrefix}.AboutDetails[${i}].AboutDetailsId`, detId);
                    formData.append(`AboutDetails[${i}].AboutDetailsId`, detId);
                }
                formData.append(`${modelPrefix}.AboutDetails[${i}].Title`, detTitle);
                formData.append(`AboutDetails[${i}].Title`, detTitle);

                formData.append(`${modelPrefix}.AboutDetails[${i}].Description`, detDesc);
                formData.append(`AboutDetails[${i}].Description`, detDesc);

                formData.append(`${modelPrefix}.AboutDetails[${i}].DisplayOrder`, detOrder);
                formData.append(`AboutDetails[${i}].DisplayOrder`, detOrder);

                formData.append(`${modelPrefix}.AboutDetails[${i}].IsActive`, detActive);
                formData.append(`AboutDetails[${i}].IsActive`, detActive);

                formData.append(`${modelPrefix}.AboutDetails[${i}].ImageUrl`, detImgUrl);
                formData.append(`AboutDetails[${i}].ImageUrl`, detImgUrl);

                const fileInput = $(this).find(".det-file")[0];
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const dFile = fileInput.files[0];
                    formData.append(`${modelPrefix}.AboutDetails[${i}].ImageFile`, dFile);
                }
            });

            // 7. Serialize AboutPerson
            $("#peopleRepeaterContainer .repeater-card").each(function (i) {
                const perId = $(this).find(".per-id").val();
                const perName = ($(this).find(".per-name").val() || "").trim();
                const perDesc = ($(this).find(".per-desc").val() || "").trim();
                const perOrder = $(this).find(".per-order").val() || 0;
                const perActive = $(this).find(".per-active").is(":checked");
                const perImgUrl = $(this).find(".per-imageurl").val() || "";

                if (perId && perId !== "0") {
                    formData.append(`${modelPrefix}.AboutPerson[${i}].PersonId`, perId);
                    formData.append(`AboutPerson[${i}].PersonId`, perId);
                }
                formData.append(`${modelPrefix}.AboutPerson[${i}].PersonName`, perName);
                formData.append(`AboutPerson[${i}].PersonName`, perName);

                formData.append(`${modelPrefix}.AboutPerson[${i}].FullDescription`, perDesc);
                formData.append(`AboutPerson[${i}].FullDescription`, perDesc);

                formData.append(`${modelPrefix}.AboutPerson[${i}].DisplayOrder`, perOrder);
                formData.append(`AboutPerson[${i}].DisplayOrder`, perOrder);

                formData.append(`${modelPrefix}.AboutPerson[${i}].IsActive`, perActive);
                formData.append(`AboutPerson[${i}].IsActive`, perActive);

                formData.append(`${modelPrefix}.AboutPerson[${i}].ImageUrl`, perImgUrl);
                formData.append(`AboutPerson[${i}].ImageUrl`, perImgUrl);

                const fileInput = $(this).find(".per-file")[0];
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const pFile = fileInput.files[0];
                    formData.append(`${modelPrefix}.AboutPerson[${i}].ImageFile`, pFile);
                }
            });

            return formData;
        }

        /* ---------- VALIDATION ---------- */
        function validateAboutPageForm() {
            const title = ($("#txtPageTitle").val() || "").trim();
            const slug = ($("#txtPageSlug").val() || "").trim();

            let errors = [];
            if (!title) errors.push("Page title is required.");
            if (!slug) errors.push("Page slug is required.");

            // 1. Validate Duplicate Display Order in Dynamic Sections
            const secOrders = new Set();
            $("#sectionRepeaterContainer .repeater-card").each(function (i) {
                const val = ($(this).find(".sec-order").val() || "").trim();
                if (val !== "") {
                    const order = parseInt(val, 10);
                    if (!isNaN(order)) {
                        if (secOrders.has(order)) {
                            errors.push(`Duplicate Display Order (${order}) in Dynamic Sections (Row ${i + 1}).`);
                        } else {
                            secOrders.add(order);
                        }
                    }
                }
            });

            // 2. Validate Duplicate Display Order in About Details Repeater
            const detOrders = new Set();
            $("#detailsRepeaterContainer .repeater-card").each(function (i) {
                const val = ($(this).find(".det-order").val() || "").trim();
                if (val !== "") {
                    const order = parseInt(val, 10);
                    if (!isNaN(order)) {
                        if (detOrders.has(order)) {
                            errors.push(`Duplicate Display Order (${order}) in About Details Repeater (Row ${i + 1}).`);
                        } else {
                            detOrders.add(order);
                        }
                    }
                }
            });

            // 3. Validate Duplicate Display Order in About People Repeater
            const perOrders = new Set();
            $("#peopleRepeaterContainer .repeater-card").each(function (i) {
                const val = ($(this).find(".per-order").val() || "").trim();
                if (val !== "") {
                    const order = parseInt(val, 10);
                    if (!isNaN(order)) {
                        if (perOrders.has(order)) {
                            errors.push(`Duplicate Display Order (${order}) in About People Repeater (Row ${i + 1}).`);
                        } else {
                            perOrders.add(order);
                        }
                    }
                }
            });

            if (errors.length > 0) {
                toastr.warning(errors.join("<br/>"), "Validation Error");
                return false;
            }
            return true;
        }

        /* ---------- SUBMIT FORM ---------- */
        $(document).on("click", "#btnSaveAboutPage, #btnUpdateAboutPage", function (e) {
            e.preventDefault();
            if (validateAboutPageForm()) {
                submitAboutPageForm($(this));
            }
        });

        function submitAboutPageForm($btn) {
            const isUpdate = $("#hdn_AboutPageId").val() !== "0";
            let rawUrl = $btn.data("url");
            let url = rawUrl;
            if (!url) {
                url = _BaseURL + (isUpdate ? "/Admin/UpdateAboutPage" : "/Admin/CreateAboutPage");
            } else if (url.startsWith("/")) {
                url = window.location.origin + url;
            }

            if ($btn.prop("disabled")) return;

            $btn.prop("disabled", true).find(".spinner-border").removeClass("d-none");
            toastr.info(isUpdate ? "Updating About Page..." : "Saving About Page...", "Please wait");

            const formData = buildAboutPageFormData();
            showLoader();

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() || '';

            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    '__RequestVerificationToken': antiforgeryToken
                },
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
                        toastr.success(res.Response || res.response || "About Page saved successfully!", "Success");
                        $("#addAboutPageModal").modal("hide");
                        loadAboutPages(currentPage);
                    } else {
                        const errorMsg = res.Response || res.response || "Operation failed.";
                        toastr.warning(errorMsg, "API Error");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    $btn.prop("disabled", false).find(".spinner-border").addClass("d-none");
                    hideLoader();
                }
            });
        }

        function resetAboutPageForm() {
            $("#addAboutPageForm")[0].reset();
            $("#hdn_AboutPageId").val("0");
            $("#hdnBannerImageUrl").val("");
            $("#imgBannerPreview").attr("src", "");
            $("#bannerImagePreviewContainer").hide();

            if (quillHistoryInstance) {
                quillHistoryInstance.setText("");
            }

            $("#sectionRepeaterContainer").empty();
            $("#detailsRepeaterContainer").empty();
            $("#peopleRepeaterContainer").empty();
            updateCountBadges();

            $("#addAboutPageTitle").html('<i class="fa fa-info-circle"></i> Add About Page');
            $("#btnSaveAboutPage").removeClass("d-none");
            $("#btnUpdateAboutPage").addClass("d-none");
            $("#chkAboutPageActive").prop("checked", true);
        }

        /* ---------- GET ALL / TABLE BINDING ---------- */
        function loadAboutPages(pageNumber = 1) {
            currentPage = pageNumber;
            const url = _BaseURL + `/Admin/GetAllAboutPages?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(currentSearch)}`;

            showLoader();
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (res) {
                    const data = res ? (res.data || res.Data || []) : [];
                    const totalRecords = res ? (res.totalRecords || 0) : 0;
                    bindAboutPageTable(data);
                    renderPagination("#aboutPagePagination", currentPage, totalRecords, pageSize, function (targetPage) {
                        loadAboutPages(targetPage);
                    });
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                    bindAboutPageTable([]);
                    renderPagination("#aboutPagePagination", 1, 0, pageSize, function () { });
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        function bindAboutPageTable(data) {
            const $tbody = $("#tab_aboutpage tbody");
            $tbody.empty();

            if (!data || data.length === 0) {
                $tbody.append('<tr><td colspan="8" class="text-center text-muted py-4">No About Pages found</td></tr>');
                return;
            }

            const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);

            $.each(data, function (index, item) {
                const slNo = (currentPage - 1) * pageSize + (index + 1);
                const id = item.AboutPageId || item.aboutPageId || 0;
                const pageTitle = item.PageTitle || item.pageTitle || "N/A";
                const pageSlug = item.PageSlug || item.pageSlug || "N/A";
                const heroTitle = item.HeroTitle || item.heroTitle || "N/A";
                const bannerUrl = item.BannerImageUrl || item.bannerImageUrl || "";
                const fullBannerUrl = bannerUrl && bannerUrl.startsWith('/') ? apiBase + bannerUrl : bannerUrl;
                const isActive = (item.IsActive === true || item.isActive === true) ?
                    '<span class="badge bg-success text-white px-2 py-1 rounded-pill" style="font-size:11px;"><i class="fa fa-check-circle mr-1"></i>Active</span>' :
                    '<span class="badge bg-danger text-white px-2 py-1 rounded-pill" style="font-size:11px;"><i class="fa fa-times-circle mr-1"></i>Inactive</span>';
                const createdDate = item.CreatedDate || item.createdDate ? new Date(item.CreatedDate || item.createdDate).toLocaleDateString() : "N/A";

                const row = `
                <tr>
                    <td class="text-center font-weight-bold text-secondary">${slNo}</td>
                    <td class="fw-bold text-dark">${escapeHtml(pageTitle)}</td>
                    <td><code class="text-primary bg-light px-2 py-1 rounded">${escapeHtml(pageSlug)}</code></td>
                    <td class="text-secondary">${escapeHtml(heroTitle)}</td>
                    <td class="text-center">
                        ${fullBannerUrl ? `<img src="${fullBannerUrl}" alt="Banner" style="height:38px; width:55px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" />` : '<span class="text-muted small">No Image</span>'}
                    </td>
                    <td class="text-center">${isActive}</td>
                    <td class="text-secondary">${createdDate}</td>
                    <td class="text-center">
                        <div class="action-btn-group">
                            <button class="btn btn-info btn-xs btnViewAboutPage px-2" data-id="${id}" title="View"><i class="fa fa-eye"></i></button>
                            <button class="btn btn-primary btn-xs btnEditAboutPage px-2" data-id="${id}" title="Edit"><i class="fa fa-pencil"></i></button>
                            <button class="btn btn-danger btn-xs btnDeleteAboutPage px-2" data-id="${id}" title="Delete"><i class="fa fa-trash-o"></i></button>
                        </div>
                    </td>
                </tr>`;
                $tbody.append(row);
            });
        }

        /* ---------- EDIT FLOW ---------- */
        $(document).on("click", ".btnEditAboutPage", function () {
            const id = $(this).data("id");
            if (id) {
                loadAboutPageById(id);
            }
        });

        function loadAboutPageById(id) {
            toastr.info("Fetching about page details...", "Please wait");
            showLoader();

            $.ajax({
                url: _BaseURL + "/Admin/GetAboutPageById?id=" + id,
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (res) {
                    let data = res ? (res.Response || res.response || res) : null;
                    if (typeof data === "string") {
                        try { data = JSON.parse(data); } catch (e) { }
                    }
                    if (data) {
                        populateAboutPageForm(data);
                    } else {
                        toastr.warning("Could not retrieve about page details.", "Warning");
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

        function populateAboutPageForm(data) {
            resetAboutPageForm();

            const page = data.AboutPage || data.aboutPage || data;

            $("#hdn_AboutPageId").val(page.AboutPageId || page.aboutPageId || 0);
            $("#txtPageTitle").val(page.PageTitle || page.pageTitle || "");
            $("#txtPageSlug").val(page.PageSlug || page.pageSlug || "");
            $("#txtHeroTitle").val(page.HeroTitle || page.heroTitle || "");
            $("#txtHeroSubtitle").val(page.HeroSubtitle || page.heroSubtitle || "");

            $("#txtHistoryTitle").val(page.HistoryTitle || page.historyTitle || "");
            const historyText = page.HistoryDescription || page.historyDescription || "";
            if (quillHistoryInstance) {
                quillHistoryInstance.root.innerHTML = historyText;
            }

            $("#txtMapTitle").val(page.MapTitle || page.mapTitle || "");
            $("#txtMapAddress").val(page.MapAddress || page.mapAddress || "");
            $("#txtLatitude").val(page.Latitude || page.latitude || "");
            $("#txtLongitude").val(page.Longitude || page.longitude || "");
            $("#chkAboutPageActive").prop("checked", page.IsActive === true || page.isActive === true);

            // Banner image
            const bannerUrl = page.BannerImageUrl || page.bannerImageUrl || "";
            $("#hdnBannerImageUrl").val(bannerUrl);
            if (bannerUrl) {
                const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);
                const fullBannerUrl = bannerUrl.startsWith('/') ? apiBase + bannerUrl : bannerUrl;
                $("#imgBannerPreview").attr("src", fullBannerUrl);
                $("#bannerImagePreviewContainer").show();
            }

            // Populate Sections
            const sections = data.AboutPageSection || data.aboutPageSection || data.AboutPageSections || data.aboutPageSections || page.AboutPageSection || page.AboutPageSections || [];
            sections.forEach(sec => addSectionRow(sec));

            // Populate Details
            const details = data.AboutDetails || data.aboutDetails || page.AboutDetails || [];
            details.forEach(det => addDetailsRow(det));

            // Populate People
            const people = data.AboutPerson || data.aboutPerson || page.AboutPerson || [];
            people.forEach(per => addPersonRow(per));

            $("#addAboutPageTitle").html('<i class="fa fa-pencil"></i> Update About Page');
            $("#btnSaveAboutPage").addClass("d-none");
            $("#btnUpdateAboutPage").removeClass("d-none");
            $("#addAboutPageModal").modal("show");
            toastr.clear();
        }

        /* ---------- VIEW FLOW ---------- */
        $(document).on("click", ".btnViewAboutPage", function () {
            const id = $(this).data("id");
            if (id) {
                viewAboutPageById(id);
            }
        });

        function viewAboutPageById(id) {
            showLoader();
            $.ajax({
                url: _BaseURL + "/Admin/GetAboutPageById?id=" + id,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    let data = res ? (res.Response || res.response || res) : null;
                    if (typeof data === "string") {
                        try { data = JSON.parse(data); } catch (e) { }
                    }
                    if (!data) return;

                    const page = data.AboutPage || data.aboutPage || data;

                    const apiBase = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL);
                    const bannerUrl = page.BannerImageUrl || page.bannerImageUrl || "";
                    const fullBannerUrl = bannerUrl ? (bannerUrl.startsWith('/') ? apiBase + bannerUrl : bannerUrl) : "";
                    const historyDesc = page.HistoryDescription || page.historyDescription || "";

                    const sections = data.AboutPageSection || data.aboutPageSection || data.AboutPageSections || data.aboutPageSections || page.AboutPageSection || page.AboutPageSections || [];
                    const details = data.AboutDetails || data.aboutDetails || page.AboutDetails || [];
                    const people = data.AboutPerson || data.aboutPerson || page.AboutPerson || [];

                    let html = `
                        <h4 class="fw-bold text-break">${escapeHtml(page.PageTitle || page.pageTitle || '')} <small class="text-muted text-break">(${escapeHtml(page.PageSlug || page.pageSlug || '')})</small></h4>
                        <hr/>
                        <div class="row g-3 mb-3">
                            <div class="col-sm-6">
                                <p class="mb-2"><strong>Hero Title:</strong> <span class="text-break">${escapeHtml(page.HeroTitle || page.heroTitle || 'N/A')}</span></p>
                                <p class="mb-2"><strong>Hero Subtitle:</strong> <span class="text-break">${escapeHtml(page.HeroSubtitle || page.heroSubtitle || 'N/A')}</span></p>
                                <p class="mb-2"><strong>History Title:</strong> <span class="text-break">${escapeHtml(page.HistoryTitle || page.historyTitle || 'N/A')}</span></p>
                            </div>
                            <div class="col-sm-6">
                                <p class="mb-2"><strong>Map Title:</strong> <span class="text-break">${escapeHtml(page.MapTitle || page.mapTitle || 'N/A')}</span></p>
                                <p class="mb-2"><strong>Map Address:</strong> <span class="text-break">${escapeHtml(page.MapAddress || page.mapAddress || 'N/A')}</span></p>
                                <p class="mb-2"><strong>Latitude / Longitude:</strong> ${page.Latitude || page.latitude || '0'}, ${page.Longitude || page.longitude || '0'}</p>
                                <p class="mb-2"><strong>Status:</strong> ${(page.IsActive === true || page.isActive === true) ? '<span class="label label-success">Active</span>' : '<span class="label label-danger">Inactive</span>'}</p>
                            </div>
                        </div>
                        ${fullBannerUrl ? `<div class="mb-3"><strong>Banner Image:</strong><br/><div class="mt-1"><img src="${fullBannerUrl}" class="img-fluid rounded" style="max-height:180px; width:auto;" /></div></div>` : ''}
                        ${historyDesc ? `<div class="mb-3"><strong>History Description:</strong><div class="p-3 border rounded bg-light text-break overflow-auto" style="max-height:200px;">${historyDesc}</div></div>` : ''}
                    `;

                    if (sections.length > 0) {
                        html += `<h5 class="mt-4 fw-bold">Sections (${sections.length})</h5><ul class="list-group mb-3">`;
                        sections.forEach(sec => {
                            const secTitle = sec.SectionTitle || sec.sectionTitle || 'N/A';
                            const secSub = sec.SectionSubtitle || sec.sectionSubtitle || '';
                            const secDesc = sec.SectionDescription || sec.sectionDescription || '';
                            html += `<li class="list-group-item"><strong class="d-block mb-1 text-break">${escapeHtml(secTitle)}</strong> ${secSub ? `<small class="text-muted d-block mb-1 text-break">(${escapeHtml(secSub)})</small>` : ''}<div class="text-muted text-break small">${escapeHtml(secDesc)}</div></li>`;
                        });
                        html += `</ul>`;
                    }

                    if (details.length > 0) {
                        html += `<h5 class="mt-4 fw-bold">Details (${details.length})</h5><ul class="list-group mb-3">`;
                        details.forEach(det => {
                            const detTitle = det.Title || det.title || 'N/A';
                            const detDesc = det.Description || det.description || '';
                            let detImg = det.ImageUrl || det.imageUrl || '';
                            if (detImg && detImg.startsWith('/')) {
                                detImg = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + detImg;
                            }
                            const imgHtml = detImg ? `<img src="${detImg}" class="rounded flex-shrink-0" style="height:60px; width:60px; object-fit:cover; border:1px solid #ddd;" alt="Detail" />` : '';
                            html += `<li class="list-group-item"><div class="view-item-card">${imgHtml}<div class="overflow-hidden"><strong class="d-block text-break">${escapeHtml(detTitle)}</strong><div class="small text-muted text-break">${escapeHtml(detDesc)}</div></div></div></li>`;
                        });
                        html += `</ul>`;
                    }

                    if (people.length > 0) {
                        html += `<h5 class="mt-4 fw-bold">People (${people.length})</h5><ul class="list-group mb-3">`;
                        people.forEach(per => {
                            const perName = per.PersonName || per.personName || 'N/A';
                            const perDesc = per.FullDescription || per.fullDescription || '';
                            let perImg = per.ImageUrl || per.imageUrl || '';
                            if (perImg && perImg.startsWith('/')) {
                                perImg = (typeof _ProjectAPI !== 'undefined' ? _ProjectAPI : _BaseURL) + perImg;
                            }
                            const imgHtml = perImg ? `<img src="${perImg}" class="rounded-circle flex-shrink-0" style="height:60px; width:60px; object-fit:cover; border:1px solid #ddd;" alt="Person" />` : '';
                            html += `<li class="list-group-item"><div class="view-item-card">${imgHtml}<div class="overflow-hidden"><strong class="d-block text-break">${escapeHtml(perName)}</strong><div class="small text-muted text-break">${escapeHtml(perDesc)}</div></div></div></li>`;
                        });
                        html += `</ul>`;
                    }

                    $("#viewAboutPageContent").html(html);
                    $("#viewAboutPageModal").modal("show");
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                }
            });
        }

        /* ---------- DELETE FLOW ---------- */
        $(document).on("click", ".btnDeleteAboutPage", function () {
            const id = $(this).data("id");
            if (!id) return;

            showConfirmDialog({
                title: 'Delete About Page',
                message: 'Are you sure you want to delete this About Page and associated files?',
                onYes: function () { deleteAboutPageById(id); }
            });
        });

        function deleteAboutPageById(id) {
            ccConfirmSetLoading(true);

            const antiforgeryToken = $('input[name="__RequestVerificationToken"]').val() ||
                                     $('meta[name="__RequestVerificationToken"]').attr('content') || '';

            $.ajax({
                url: _BaseURL + "/Admin/DeleteAboutPageById?id=" + id,
                type: 'POST',
                data: { id: id },
                dataType: 'json',
                headers: {
                    '__RequestVerificationToken': antiforgeryToken
                },
                success: function (data) {
                    let res;
                    try {
                        res = typeof data === "string" ? JSON.parse(data) : data;
                    } catch (e) {
                        res = data;
                    }

                    const ok = res && (res.Success === true || res.success === true || res.Status === true || res.status === true || res.Status === 'True' || res.status === 'True');
                    if (ok) {
                        ccConfirmClose();
                        toastr.success(res.Response || res.response || 'About Page deleted successfully.', 'Deleted');
                        loadAboutPages(currentPage);
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
    }
});