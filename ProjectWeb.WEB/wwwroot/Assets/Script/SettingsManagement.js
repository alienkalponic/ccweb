/**
 * =========================================================================
 * Settings Management
 * 1. Course Accountants / Payment Receivers Master
 * 2. Course Expense Categories Master
 * =========================================================================
 */
(function ($) {
    "use strict";

    var _BaseURL = window.location.origin;
    var accountantList = [];
    var categoryList = [];

    $(document).ready(function () {
        if ($("#tbl_Accountants").length > 0) {
            initAccountantEvents();
            loadAccountants();
        }

        if ($("#tbl_ExpenseCategories").length > 0) {
            initCategoryEvents();
            loadExpenseCategories();
        }
    });

    // =========================================================================
    // SECTION 1: COURSE ACCOUNTANTS / PAYMENT RECEIVERS
    // =========================================================================

    function initAccountantEvents() {
        $("#btnAddNewAccountant").on("click", function () {
            openCreateAccountantModal();
        });

        $("#btnSaveAccountant").on("click", function () {
            saveAccountant();
        });

        $("#accountant_Search").on("keyup", function (e) {
            filterAccountants();
        });

        $("#accountant_StatusFilter").on("change", function () {
            filterAccountants();
        });

        $("#btnFilterAccountant").on("click", function () {
            filterAccountants();
        });

        $("#btnResetAccountant").on("click", function () {
            $("#accountant_Search").val("");
            $("#accountant_StatusFilter").val("");
            renderAccountantTable(accountantList);
        });

        $("#chk_AccountantIsActive").on("change", function () {
            $("#lbl_AccountantIsActive").text(this.checked ? "Active" : "Inactive");
        });

        $(".btnModalClose").on("click", function () {
            $("#accountantModal").modal("hide");
        });
    }

    function loadAccountants(callback) {
        $("#tbl_Accountants tbody").html(`
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fa fa-spinner fa-spin me-2"></i> Loading accountants...
                </td>
            </tr>
        `);

        $.ajax({
            type: "GET",
            url: _BaseURL + "/SettingsManagement/GetAllCourseAccountants",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                accountantList = [];
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    var data = res.Response ?? res.response ?? [];
                    if (Array.isArray(data)) {
                        accountantList = data;
                    } else if (data && typeof data === "object") {
                        accountantList = data.data ?? data.Data ?? data.items ?? data.Items ?? [];
                    }
                }

                filterAccountants();

                if (typeof callback === "function") {
                    callback(accountantList);
                }
            },
            error: function (xhr, status, error) {
                console.error("[SettingsManagement] Load accountants error:", error);
                $("#tbl_Accountants tbody").html(`
                    <tr>
                        <td colspan="6" class="text-center py-4 text-danger">
                            <i class="fa fa-exclamation-triangle me-2"></i> Failed to load accountants. Please try again.
                        </td>
                    </tr>
                `);
                toastr.error("Failed to load course accountants.", "Error");
            }
        });
    }

    function filterAccountants() {
        var query = ($("#accountant_Search").val() || "").trim().toLowerCase();
        var statusFilter = $("#accountant_StatusFilter").val();

        var filtered = accountantList.filter(function (acc) {
            var name = (acc.name ?? acc.Name ?? "").toLowerCase();
            var id = String(acc.courseAccountantId ?? acc.CourseAccountantId ?? acc.id ?? "");
            var isActive = (acc.isActive !== undefined ? acc.isActive : acc.IsActive) !== false;

            var matchesQuery = !query || name.includes(query) || id.includes(query);
            var matchesStatus = true;

            if (statusFilter === "true") {
                matchesStatus = (isActive === true);
            } else if (statusFilter === "false") {
                matchesStatus = (isActive === false);
            }

            return matchesQuery && matchesStatus;
        });

        renderAccountantTable(filtered);
    }

    function renderAccountantTable(list) {
        var $tbody = $("#tbl_Accountants tbody");
        $tbody.empty();

        if (!list || list.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fa fa-info-circle me-1"></i> No course accountants found.
                    </td>
                </tr>
            `);
            $("#accountantRecordInfo").text("Showing 0 records");
            return;
        }

        list.forEach(function (acc, index) {
            var id = acc.courseAccountantId ?? acc.CourseAccountantId ?? acc.id ?? 0;
            var name = acc.name ?? acc.Name ?? "N/A";
            var isActive = (acc.isActive !== undefined ? acc.isActive : acc.IsActive) !== false;
            var createdDate = acc.createdDate ?? acc.CreatedDate;
            var formattedDate = "N/A";

            if (createdDate) {
                try {
                    var d = new Date(createdDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });
                    }
                } catch (e) {
                    formattedDate = createdDate;
                }
            }

            var statusBadge = isActive
                ? `<span class="status-badge active-badge" title="Click to toggle status" data-id="${id}" data-active="true">
                     <i class="fa fa-check-circle"></i> Active
                   </span>`
                : `<span class="status-badge inactive-badge" title="Click to toggle status" data-id="${id}" data-active="false">
                     <i class="fa fa-times-circle"></i> Inactive
                   </span>`;

            var rowHtml = `
                <tr>
                    <td style="text-align: center; font-weight: 600; color: #64748b;">${index + 1}</td>
                    <td style="text-align: center; font-weight: 600; color: #475569;">#${id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle me-2 d-inline-flex align-items-center justify-content-center" 
                                 style="width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; color: var(--admin-primary, #a01c2b); font-weight: 700; font-size: 0.85rem;">
                                ${escapeHtml(name.charAt(0).toUpperCase())}
                            </div>
                            <span class="fw-semibold text-dark">${escapeHtml(name)}</span>
                        </div>
                    </td>
                    <td class="text-muted"><i class="fa fa-calendar-o me-1"></i> ${formattedDate}</td>
                    <td style="text-align: center;">${statusBadge}</td>
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-edit-accountant me-1" 
                                data-id="${id}" title="Edit Accountant" style="padding: 4px 10px;">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-accountant" 
                                data-id="${id}" data-name="${escapeHtml(name)}" title="Inactivate / Delete" style="padding: 4px 10px;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            $tbody.append(rowHtml);
        });

        $("#accountantRecordInfo").text(`Showing ${list.length} of ${accountantList.length} total records`);

        $tbody.find(".status-badge").on("click", function () {
            var id = $(this).data("id");
            var currentActive = $(this).data("active") === true || $(this).data("active") === "true";
            toggleAccountantStatus(id, currentActive);
        });

        $tbody.find(".btn-edit-accountant").on("click", function () {
            var id = $(this).data("id");
            openEditAccountantModal(id);
        });

        $tbody.find(".btn-delete-accountant").on("click", function () {
            var id = $(this).data("id");
            var name = $(this).data("name");
            deleteAccountant(id, name);
        });
    }

    function openCreateAccountantModal() {
        $("#hdn_AccountantId").val("0");
        $("#accountantModalTitle").text("Add Course Accountant");
        $("#txt_AccountantName").val("");
        $("#chk_AccountantIsActive").prop("checked", true);
        $("#lbl_AccountantIsActive").text("Active");
        $("#btnSaveAccountant").html('<i class="fa fa-save me-1"></i> Save');

        $("#accountantModal").modal("show");
        setTimeout(function () {
            $("#txt_AccountantName").focus();
        }, 300);
    }

    function openEditAccountantModal(id) {
        var existing = accountantList.find(function (a) {
            return String(a.courseAccountantId ?? a.CourseAccountantId ?? a.id) === String(id);
        });

        if (existing) {
            populateAndShowAccountantModal(existing);
            return;
        }

        $.ajax({
            type: "GET",
            url: _BaseURL + "/SettingsManagement/GetCourseAccountantById?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    var data = res.Response ?? res.response;
                    if (data) {
                        populateAndShowAccountantModal(data);
                        return;
                    }
                }
                toastr.warning("Could not load accountant details.", "Warning");
            },
            error: function () {
                toastr.error("Failed to fetch accountant details.", "Error");
            }
        });
    }

    function populateAndShowAccountantModal(data) {
        var id = data.courseAccountantId ?? data.CourseAccountantId ?? data.id;
        var name = data.name ?? data.Name ?? "";
        var isActive = (data.isActive !== undefined ? data.isActive : data.IsActive) !== false;

        $("#hdn_AccountantId").val(id);
        $("#accountantModalTitle").text("Edit Course Accountant");
        $("#txt_AccountantName").val(name);
        $("#chk_AccountantIsActive").prop("checked", isActive);
        $("#lbl_AccountantIsActive").text(isActive ? "Active" : "Inactive");
        $("#btnSaveAccountant").html('<i class="fa fa-save me-1"></i> Update');

        $("#accountantModal").modal("show");
        setTimeout(function () {
            $("#txt_AccountantName").focus();
        }, 300);
    }

    function saveAccountant() {
        var id = parseInt($("#hdn_AccountantId").val(), 10) || 0;
        var name = ($("#txt_AccountantName").val() || "").trim();
        var isActive = $("#chk_AccountantIsActive").is(":checked");

        if (!name) {
            toastr.warning("Please enter accountant / receiver name.", "Validation Error");
            $("#txt_AccountantName").focus();
            return;
        }

        var isEdit = id > 0;
        var endpoint = isEdit
            ? _BaseURL + "/SettingsManagement/UpdateCourseAccountant"
            : _BaseURL + "/SettingsManagement/CreateCourseAccountant";
        var httpMethod = isEdit ? "PUT" : "POST";

        var payload = isEdit
            ? { CourseAccountantId: id, Name: name, IsActive: isActive }
            : { Name: name, IsActive: isActive };

        var $btn = $("#btnSaveAccountant");
        $btn.prop("disabled", true).html('<i class="fa fa-spinner fa-spin me-1"></i> Saving...');

        $.ajax({
            type: httpMethod,
            url: endpoint,
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                $btn.prop("disabled", false).html(isEdit ? '<i class="fa fa-save me-1"></i> Update' : '<i class="fa fa-save me-1"></i> Save');

                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success(isEdit ? "Accountant updated successfully!" : "Accountant created successfully!", "Success");
                    $("#accountantModal").modal("hide");
                    loadAccountants();
                } else {
                    var errMsg = extractErrorMessage(res) || "Operation failed.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function (xhr) {
                $btn.prop("disabled", false).html(isEdit ? '<i class="fa fa-save me-1"></i> Update' : '<i class="fa fa-save me-1"></i> Save');
                var errMsg = "Failed to save course accountant.";
                try {
                    var parsed = JSON.parse(xhr.responseText);
                    errMsg = extractErrorMessage(parsed) || errMsg;
                } catch (e) { }
                toastr.error(errMsg, "Error");
            }
        });
    }

    function toggleAccountantStatus(id, currentActive) {
        var newStatus = !currentActive;

        $.ajax({
            type: "PUT",
            url: _BaseURL + "/SettingsManagement/UpdateCourseAccountantStatus?id=" + id + "&isActive=" + newStatus,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success(`Accountant marked as ${newStatus ? 'Active' : 'Inactive'}!`, "Status Updated");
                    loadAccountants();
                } else {
                    var errMsg = extractErrorMessage(res) || "Failed to update status.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function () {
                toastr.error("Failed to update accountant status.", "Error");
            }
        });
    }

    function deleteAccountant(id, name) {
        var confirmMsg = `Are you sure you want to inactivate / delete accountant "${name}"?`;

        if (typeof Swal !== "undefined") {
            Swal.fire({
                title: "Are you sure?",
                text: confirmMsg,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#a01c2b",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    performDeleteAccountant(id);
                }
            });
        } else if (confirm(confirmMsg)) {
            performDeleteAccountant(id);
        }
    }

    function performDeleteAccountant(id) {
        $.ajax({
            type: "DELETE",
            url: _BaseURL + "/SettingsManagement/DeleteCourseAccountant?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success("Accountant inactivated / deleted successfully!", "Deleted");
                    loadAccountants();
                } else {
                    fallbackInactiveAccountant(id);
                }
            },
            error: function () {
                fallbackInactiveAccountant(id);
            }
        });
    }

    function fallbackInactiveAccountant(id) {
        $.ajax({
            type: "POST",
            url: _BaseURL + "/SettingsManagement/InactiveCourseAccountant?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success("Accountant inactivated successfully!", "Updated");
                    loadAccountants();
                } else {
                    var errMsg = extractErrorMessage(res) || "Could not delete/inactivate accountant.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function () {
                toastr.error("Failed to delete/inactivate accountant.", "Error");
            }
        });
    }


    // =========================================================================
    // SECTION 2: COURSE EXPENSE CATEGORIES
    // =========================================================================

    function initCategoryEvents() {
        $("#btnAddNewCategory").on("click", function () {
            openCreateCategoryModal();
        });

        $("#btnSaveCategory").on("click", function () {
            saveCategory();
        });

        $("#category_Search").on("keyup", function (e) {
            filterCategories();
        });

        $("#category_StatusFilter").on("change", function () {
            filterCategories();
        });

        $("#btnFilterCategory").on("click", function () {
            filterCategories();
        });

        $("#btnResetCategory").on("click", function () {
            $("#category_Search").val("");
            $("#category_StatusFilter").val("");
            renderCategoryTable(categoryList);
        });

        $("#chk_CategoryIsActive").on("change", function () {
            $("#lbl_CategoryIsActive").text(this.checked ? "Active" : "Inactive");
        });

        $(".btnModalClose").on("click", function () {
            $("#categoryModal").modal("hide");
        });
    }

    function loadExpenseCategories(callback) {
        $("#tbl_ExpenseCategories tbody").html(`
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fa fa-spinner fa-spin me-2"></i> Loading expense categories...
                </td>
            </tr>
        `);

        $.ajax({
            type: "GET",
            url: _BaseURL + "/SettingsManagement/GetAllCourseExpenseCategories",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                categoryList = [];
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    var data = res.Response ?? res.response ?? [];
                    if (Array.isArray(data)) {
                        categoryList = data;
                    } else if (data && typeof data === "object") {
                        categoryList = data.data ?? data.Data ?? data.items ?? data.Items ?? [];
                    }
                }

                filterCategories();

                if (typeof callback === "function") {
                    callback(categoryList);
                }
            },
            error: function (xhr, status, error) {
                console.error("[SettingsManagement] Load expense categories error:", error);
                $("#tbl_ExpenseCategories tbody").html(`
                    <tr>
                        <td colspan="6" class="text-center py-4 text-danger">
                            <i class="fa fa-exclamation-triangle me-2"></i> Failed to load expense categories. Please try again.
                        </td>
                    </tr>
                `);
                toastr.error("Failed to load course expense categories.", "Error");
            }
        });
    }

    function filterCategories() {
        var query = ($("#category_Search").val() || "").trim().toLowerCase();
        var statusFilter = $("#category_StatusFilter").val();

        var filtered = categoryList.filter(function (cat) {
            var name = (cat.name ?? cat.Name ?? "").toLowerCase();
            var id = String(cat.courseExpenseCategoryId ?? cat.CourseExpenseCategoryId ?? cat.id ?? "");
            var isActive = (cat.isActive !== undefined ? cat.isActive : cat.IsActive) !== false;

            var matchesQuery = !query || name.includes(query) || id.includes(query);
            var matchesStatus = true;

            if (statusFilter === "true") {
                matchesStatus = (isActive === true);
            } else if (statusFilter === "false") {
                matchesStatus = (isActive === false);
            }

            return matchesQuery && matchesStatus;
        });

        renderCategoryTable(filtered);
    }

    function renderCategoryTable(list) {
        var $tbody = $("#tbl_ExpenseCategories tbody");
        $tbody.empty();

        if (!list || list.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fa fa-info-circle me-1"></i> No course expense categories found.
                    </td>
                </tr>
            `);
            $("#categoryRecordInfo").text("Showing 0 records");
            return;
        }

        list.forEach(function (cat, index) {
            var id = cat.courseExpenseCategoryId ?? cat.CourseExpenseCategoryId ?? cat.id ?? 0;
            var name = cat.name ?? cat.Name ?? "N/A";
            var isActive = (cat.isActive !== undefined ? cat.isActive : cat.IsActive) !== false;
            var createdDate = cat.createdDate ?? cat.CreatedDate;
            var formattedDate = "N/A";

            if (createdDate) {
                try {
                    var d = new Date(createdDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });
                    }
                } catch (e) {
                    formattedDate = createdDate;
                }
            }

            var statusBadge = isActive
                ? `<span class="status-badge active-badge" title="Click to toggle status" data-id="${id}" data-active="true">
                     <i class="fa fa-check-circle"></i> Active
                   </span>`
                : `<span class="status-badge inactive-badge" title="Click to toggle status" data-id="${id}" data-active="false">
                     <i class="fa fa-times-circle"></i> Inactive
                   </span>`;

            var rowHtml = `
                <tr>
                    <td style="text-align: center; font-weight: 600; color: #64748b;">${index + 1}</td>
                    <td style="text-align: center; font-weight: 600; color: #475569;">#${id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle me-2 d-inline-flex align-items-center justify-content-center" 
                                 style="width: 32px; height: 32px; border-radius: 50%; background: #fdf2f2; color: var(--admin-primary, #a01c2b); font-weight: 700; font-size: 0.85rem;">
                                <i class="fa fa-tag" style="font-size: 0.8rem;"></i>
                            </div>
                            <span class="fw-semibold text-dark">${escapeHtml(name)}</span>
                        </div>
                    </td>
                    <td class="text-muted"><i class="fa fa-calendar-o me-1"></i> ${formattedDate}</td>
                    <td style="text-align: center;">${statusBadge}</td>
                    <td style="text-align: center;">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-edit-category me-1" 
                                data-id="${id}" title="Edit Category" style="padding: 4px 10px;">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-category" 
                                data-id="${id}" data-name="${escapeHtml(name)}" title="Inactivate / Delete" style="padding: 4px 10px;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            $tbody.append(rowHtml);
        });

        $("#categoryRecordInfo").text(`Showing ${list.length} of ${categoryList.length} total records`);

        $tbody.find(".status-badge").on("click", function () {
            var id = $(this).data("id");
            var currentActive = $(this).data("active") === true || $(this).data("active") === "true";
            toggleCategoryStatus(id, currentActive);
        });

        $tbody.find(".btn-edit-category").on("click", function () {
            var id = $(this).data("id");
            openEditCategoryModal(id);
        });

        $tbody.find(".btn-delete-category").on("click", function () {
            var id = $(this).data("id");
            var name = $(this).data("name");
            deleteCategory(id, name);
        });
    }

    function openCreateCategoryModal() {
        $("#hdn_CategoryId").val("0");
        $("#categoryModalTitle").text("Add Course Expense Category");
        $("#txt_CategoryName").val("");
        $("#chk_CategoryIsActive").prop("checked", true);
        $("#lbl_CategoryIsActive").text("Active");
        $("#btnSaveCategory").html('<i class="fa fa-save me-1"></i> Save');

        $("#categoryModal").modal("show");
        setTimeout(function () {
            $("#txt_CategoryName").focus();
        }, 300);
    }

    function openEditCategoryModal(id) {
        var existing = categoryList.find(function (c) {
            return String(c.courseExpenseCategoryId ?? c.CourseExpenseCategoryId ?? c.id) === String(id);
        });

        if (existing) {
            populateAndShowCategoryModal(existing);
            return;
        }

        $.ajax({
            type: "GET",
            url: _BaseURL + "/SettingsManagement/GetCourseExpenseCategoryById?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    var data = res.Response ?? res.response;
                    if (data) {
                        populateAndShowCategoryModal(data);
                        return;
                    }
                }
                toastr.warning("Could not load category details.", "Warning");
            },
            error: function () {
                toastr.error("Failed to fetch category details.", "Error");
            }
        });
    }

    function populateAndShowCategoryModal(data) {
        var id = data.courseExpenseCategoryId ?? data.CourseExpenseCategoryId ?? data.id;
        var name = data.name ?? data.Name ?? "";
        var isActive = (data.isActive !== undefined ? data.isActive : data.IsActive) !== false;

        $("#hdn_CategoryId").val(id);
        $("#categoryModalTitle").text("Edit Course Expense Category");
        $("#txt_CategoryName").val(name);
        $("#chk_CategoryIsActive").prop("checked", isActive);
        $("#lbl_CategoryIsActive").text(isActive ? "Active" : "Inactive");
        $("#btnSaveCategory").html('<i class="fa fa-save me-1"></i> Update');

        $("#categoryModal").modal("show");
        setTimeout(function () {
            $("#txt_CategoryName").focus();
        }, 300);
    }

    function saveCategory() {
        var id = parseInt($("#hdn_CategoryId").val(), 10) || 0;
        var name = ($("#txt_CategoryName").val() || "").trim();
        var isActive = $("#chk_CategoryIsActive").is(":checked");

        if (!name) {
            toastr.warning("Please enter expense category name.", "Validation Error");
            $("#txt_CategoryName").focus();
            return;
        }

        var isEdit = id > 0;
        var endpoint = isEdit
            ? _BaseURL + "/SettingsManagement/UpdateCourseExpenseCategory"
            : _BaseURL + "/SettingsManagement/CreateCourseExpenseCategory";
        var httpMethod = isEdit ? "PUT" : "POST";

        var payload = isEdit
            ? { CourseExpenseCategoryId: id, Name: name, IsActive: isActive }
            : { Name: name, IsActive: isActive };

        var $btn = $("#btnSaveCategory");
        $btn.prop("disabled", true).html('<i class="fa fa-spinner fa-spin me-1"></i> Saving...');

        $.ajax({
            type: httpMethod,
            url: endpoint,
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                $btn.prop("disabled", false).html(isEdit ? '<i class="fa fa-save me-1"></i> Update' : '<i class="fa fa-save me-1"></i> Save');

                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success(isEdit ? "Category updated successfully!" : "Category created successfully!", "Success");
                    $("#categoryModal").modal("hide");
                    loadExpenseCategories();
                } else {
                    var errMsg = extractErrorMessage(res) || "Operation failed.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function (xhr) {
                $btn.prop("disabled", false).html(isEdit ? '<i class="fa fa-save me-1"></i> Update' : '<i class="fa fa-save me-1"></i> Save');
                var errMsg = "Failed to save course expense category.";
                try {
                    var parsed = JSON.parse(xhr.responseText);
                    errMsg = extractErrorMessage(parsed) || errMsg;
                } catch (e) { }
                toastr.error(errMsg, "Error");
            }
        });
    }

    function toggleCategoryStatus(id, currentActive) {
        var newStatus = !currentActive;

        $.ajax({
            type: "PUT",
            url: _BaseURL + "/SettingsManagement/UpdateCourseExpenseCategoryStatus?id=" + id + "&isActive=" + newStatus,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success(`Category marked as ${newStatus ? 'Active' : 'Inactive'}!`, "Status Updated");
                    loadExpenseCategories();
                } else {
                    var errMsg = extractErrorMessage(res) || "Failed to update status.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function () {
                toastr.error("Failed to update category status.", "Error");
            }
        });
    }

    function deleteCategory(id, name) {
        var confirmMsg = `Are you sure you want to inactivate / delete expense category "${name}"?`;

        if (typeof Swal !== "undefined") {
            Swal.fire({
                title: "Are you sure?",
                text: confirmMsg,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#a01c2b",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    performDeleteCategory(id);
                }
            });
        } else if (confirm(confirmMsg)) {
            performDeleteCategory(id);
        }
    }

    function performDeleteCategory(id) {
        $.ajax({
            type: "DELETE",
            url: _BaseURL + "/SettingsManagement/DeleteCourseExpenseCategory?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success("Category inactivated / deleted successfully!", "Deleted");
                    loadExpenseCategories();
                } else {
                    fallbackInactiveCategory(id);
                }
            },
            error: function () {
                fallbackInactiveCategory(id);
            }
        });
    }

    function fallbackInactiveCategory(id) {
        $.ajax({
            type: "POST",
            url: _BaseURL + "/SettingsManagement/InactiveCourseExpenseCategory?id=" + id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res && (res.Success || res.success || res.StatusCode === 200 || res.statusCode === 200)) {
                    toastr.success("Category inactivated successfully!", "Updated");
                    loadExpenseCategories();
                } else {
                    var errMsg = extractErrorMessage(res) || "Could not delete/inactivate category.";
                    toastr.error(errMsg, "Error");
                }
            },
            error: function () {
                toastr.error("Failed to delete/inactivate category.", "Error");
            }
        });
    }


    // =========================================================================
    // UTILITIES
    // =========================================================================

    function extractErrorMessage(res) {
        if (!res) return "";
        if (Array.isArray(res.ErrorMassage) && res.ErrorMassage.length > 0) return res.ErrorMassage.join(", ");
        if (Array.isArray(res.errorMassage) && res.errorMassage.length > 0) return res.errorMassage.join(", ");
        if (typeof res.Response === "string") return res.Response;
        if (typeof res.response === "string") return res.response;
        if (typeof res.Message === "string") return res.Message;
        if (typeof res.message === "string") return res.message;
        return "";
    }

    function escapeHtml(text) {
        if (!text) return "";
        return $("<div>").text(text).html();
    }

    // Expose globally
    window.SettingsManagement = {
        loadAccountants: loadAccountants,
        loadExpenseCategories: loadExpenseCategories
    };

})(jQuery);
