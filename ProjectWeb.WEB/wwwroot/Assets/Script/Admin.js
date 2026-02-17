$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

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
});