/**
 * Course Management Module JavaScript
 * Climbers Circle Admin Panel
 */

$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var controller_name = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    // Global flatpickr initialization
    if (typeof flatpickr !== "undefined") {
        $(".flatpickr-date").flatpickr({
            dateFormat: "Y-m-d",
            allowInput: true
        });
    }

    // Helper: Currency formatting
    function formatMoney(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return "₹0.00";
        return "₹" + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Helper: Date formatting
    function formatDateDisplay(dateStr) {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    // Common AJAX Error Handler
    function handleAjaxError(xhr, status, error) {
        hideLoader();
        let errorMessage = "An error occurred while processing your request.";
        if (xhr.status === 0) {
            errorMessage = "Network error: Unable to connect to server.";
        } else if (xhr.status === 404) {
            errorMessage = "API endpoint not found (404).";
        } else if (xhr.status === 401) {
            errorMessage = "Unauthorized access. Please login again.";
        } else if (xhr.status === 500) {
            errorMessage = "Internal server error (500).";
        } else if (xhr.responseText) {
            try {
                const res = JSON.parse(xhr.responseText);
                errorMessage = res.Response || res.response || (res.ErrorMassage ? res.ErrorMassage.join("<br/>") : errorMessage);
            } catch (e) {
                errorMessage = xhr.responseText || "Server error occurred.";
            }
        }
        toastr.error(errorMessage, "Error");
        console.error("AJAX Error:", { xhr, status, error });
    }

    // Helper: Common pagination renderer
    function renderPaginationLocal(containerSelector, currentPage, totalRecords, pageSize, onPageClick) {
        const $container = $(containerSelector);
        $container.empty();

        if (!totalRecords || totalRecords <= 0 || !pageSize || pageSize <= 0) return;

        const totalPages = Math.ceil(totalRecords / pageSize);
        if (totalPages <= 1) return;

        const prevDisabled = currentPage === 1 ? "disabled" : "";
        let html = `<li class="page-item ${prevDisabled}"><a class="page-link prev-page" href="#" data-page="${currentPage - 1}"><i class="fa fa-angle-left"></i> Previous</a></li>`;

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
        html += `<li class="page-item ${nextDisabled}"><a class="page-link next-page" href="#" data-page="${currentPage + 1}">Next <i class="fa fa-angle-right"></i></a></li>`;

        $container.html(html);

        $container.off("click", "a.page-link").on("click", "a.page-link", function (e) {
            e.preventDefault();
            const $parent = $(this).parent();
            if ($parent.hasClass("disabled") || $parent.hasClass("active")) return;
            const targetPage = parseInt($(this).data("page"));
            if (targetPage >= 1 && targetPage <= totalPages) {
                onPageClick(targetPage);
            }
        });
    }

    // ==========================================
    // ROBUST API DATA EXTRACTION HELPERS
    // ==========================================
    function extractList(res) {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        
        let target = res.Response !== undefined ? res.Response : (res.data !== undefined ? res.data : res);
        
        if (typeof target === "string") {
            try { target = JSON.parse(target); } catch (e) { return []; }
        }
        if (Array.isArray(target)) return target;
        if (target && Array.isArray(target.data)) return target.data;
        if (target && Array.isArray(target.items)) return target.items;
        return [];
    }

    function extractObject(res) {
        if (!res) return null;
        if (typeof res === "object" && !Array.isArray(res) && res.Response === undefined && res.data === undefined) {
            return res;
        }
        let target = res.Response !== undefined ? res.Response : (res.data !== undefined ? res.data : res);
        if (typeof target === "string") {
            try { target = JSON.parse(target); } catch (e) { return null; }
        }
        if (Array.isArray(target)) return target[0] || null;
        return target;
    }

    function isSuccessResponse(res) {
        if (!res) return false;
        if (Array.isArray(res)) return true;
        if (res.Success !== undefined) return res.Success === true || res.Success === "true" || res.Success === 1;
        if (res.StatusCode !== undefined) return res.StatusCode === 200 || res.StatusCode === "OK";
        if (res.Response !== undefined && res.Response !== null) return true;
        return true;
    }

    // Helper: Populate Course Dropdowns
    function loadCourseDropdowns(selectors, callback) {
        $.ajax({
            url: _BaseURL + "/CourseManagement/GetAllCourse?pageNumber=1&pageSize=500&isActive=true",
            type: "GET",
            dataType: "json",
            success: function (res) {
                const list = extractList(res);
                selectors.forEach(selector => {
                    const $el = $(selector);
                    const currentVal = $el.val();
                    $el.empty().append('<option value="">-- Select Course --</option>');
                    list.forEach(c => {
                        const cId = c.CourseId || c.Id || c.id;
                        const cName = c.CourseName || c.Name || 'Course';
                        const cCode = c.CourseCode || c.Code || '';
                        $el.append(`<option value="${cId}">${cName} ${cCode ? '(' + cCode + ')' : ''}</option>`);
                    });
                    if (currentVal) $el.val(currentVal);
                });
                if (callback) callback(list);
            }
        });
    }

    // Helper: Populate Batch Dropdowns
    function loadBatchDropdowns(selectors, courseId, callback) {
        let url = _BaseURL + "/CourseManagement/GetAllCourseBatch?pageNumber=1&pageSize=500&isActive=true";
        if (courseId) url += "&courseId=" + courseId;

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (res) {
                const list = extractList(res);
                selectors.forEach(selector => {
                    const $el = $(selector);
                    $el.empty().append('<option value="">-- Select Course Batch --</option>');
                    list.forEach(b => {
                        const bId = b.CourseBatchId || b.BatchId || b.Id || b.id;
                        const courseTitle = b.CourseName || b.Course?.CourseName || b.Name || 'Batch';
                        const year = b.CourseYear || b.Year || '';
                        const name = `${courseTitle} ${year ? '(' + year + ')' : ''}`;
                        $el.append(`<option value="${bId}">${name}</option>`);
                    });
                });
                if (callback) callback(list);
            }
        });
    }

    // ==========================================
    // 1. DASHBOARD SUMMARY PAGE (index)
    // ==========================================
    if (controller_name === "coursemanagement" && (action_name === "index" || action_name === "")) {
        loadDashboardData();

        function loadDashboardData() {
            showLoader();
            $.ajax({
                url: _BaseURL + "/CourseManagement/GetCourseDashboard",
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const data = extractObject(res) || {};

                    const totalCourses = data.TotalCourses ?? data.totalCourses ?? data.TotalCourse ?? data.totalCourse ?? data.CourseCount ?? data.courseCount ?? 0;
                    const totalBatches = data.TotalBatches ?? data.totalBatches ?? data.TotalBatch ?? data.totalBatch ?? data.BatchCount ?? data.batchCount ?? 0;
                    const totalParticipants = data.TotalParticipants ?? data.totalParticipants ?? data.TotalParticipant ?? data.totalParticipant ?? data.TotalEnrollments ?? data.totalEnrollments ?? data.ParticipantCount ?? data.participantCount ?? 0;
                    const totalCollection = data.TotalCollection ?? data.totalCollection ?? data.TotalCollected ?? data.totalCollected ?? data.TotalPaid ?? data.totalPaid ?? data.CollectionAmount ?? 0;
                    const totalDue = data.TotalDue ?? data.totalDue ?? data.DueAmount ?? data.dueAmount ?? 0;
                    const totalRefund = data.TotalRefund ?? data.totalRefund ?? data.RefundAmount ?? data.refundAmount ?? 0;
                    const totalExpense = data.TotalExpense ?? data.totalExpense ?? data.ExpenseAmount ?? data.expenseAmount ?? 0;
                    const officialPaid = data.TotalOfficialPaid ?? data.totalOfficialPaid ?? data.OfficialPaid ?? 0;

                    let netIncome = data.NetCourseIncome ?? data.netCourseIncome ?? data.NetIncome ?? data.netIncome;
                    if (netIncome === undefined || netIncome === null || isNaN(netIncome)) {
                        netIncome = totalCollection - totalRefund - totalExpense - officialPaid;
                    }

                    $("#dash_TotalCourses").text(totalCourses);
                    $("#dash_TotalBatches").text(totalBatches);
                    $("#dash_TotalParticipants").text(totalParticipants);
                    $("#dash_TotalCollection").text(formatMoney(totalCollection));
                    $("#dash_TotalDue").text(formatMoney(totalDue));
                    $("#dash_TotalRefund").text(formatMoney(totalRefund));
                    $("#dash_TotalExpense").text(formatMoney(totalExpense));
                    $("#dash_NetCourseIncome").text(formatMoney(netIncome));
                },
                error: handleAjaxError
            });

            // Load Segment Summary
            $.ajax({
                url: _BaseURL + "/CourseManagement/GetCourseSummaryBySegment",
                type: "GET",
                dataType: "json",
                success: function (res) {
                    const list = extractList(res);
                    let html = "";
                    if (list.length === 0) {
                        html = `<tr><td colspan="8" class="text-center py-4 text-muted">No segment data recorded yet.</td></tr>`;
                    } else {
                        list.forEach(item => {
                            const cName = item.CourseName || item.courseName || item.Name || item.name || 'General';
                            const pCount = item.ParticipantCount ?? item.participantCount ?? item.TotalParticipants ?? item.totalParticipants ?? 0;
                            const collected = item.TotalCollected ?? item.totalCollected ?? item.TotalCollection ?? item.totalCollection ?? item.TotalPaid ?? item.totalPaid ?? 0;
                            const due = item.TotalDue ?? item.totalDue ?? 0;
                            const refund = item.TotalRefund ?? item.totalRefund ?? 0;
                            const expense = item.TotalExpense ?? item.totalExpense ?? 0;
                            const officialPaid = item.TotalOfficialPaid ?? item.totalOfficialPaid ?? item.OfficialPaid ?? 0;
                            
                            let netInc = item.NetIncome ?? item.netIncome ?? item.NetCourseIncome ?? item.netCourseIncome;
                            if (netInc === undefined || netInc === null || isNaN(netInc)) {
                                netInc = collected - refund - expense - officialPaid;
                            }

                            html += `
                                <tr>
                                    <td class="font-weight-bold text-primary">${cName}</td>
                                    <td class="text-center">${pCount}</td>
                                    <td class="text-end text-success font-weight-bold">${formatMoney(collected)}</td>
                                    <td class="text-end text-warning">${formatMoney(due)}</td>
                                    <td class="text-end text-danger">${formatMoney(refund)}</td>
                                    <td class="text-end text-secondary">${formatMoney(expense)}</td>
                                    <td class="text-end text-info">${formatMoney(officialPaid)}</td>
                                    <td class="text-end font-weight-bold ${netInc >= 0 ? 'text-success' : 'text-danger'}">${formatMoney(netInc)}</td>
                                </tr>
                            `;
                        });
                    }
                    $("#dash_SegmentTable tbody").html(html);
                }
            });
        }
    }

    // ==========================================
    // 2. COURSES PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "courses") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourses(currentPage);

        $("#btnAddNewCourse").on("click", function () {
            resetCourseModal();
            $("#courseModal").modal("show");
        });

        $("#btnFilterCourse").on("click", function () {
            currentPage = 1;
            loadCourses(currentPage);
        });

        $("#btnResetCourse").on("click", function () {
            $("#course_Search").val("");
            $("#course_StatusFilter").val("");
            currentPage = 1;
            loadCourses(currentPage);
        });

        $("#btnSaveCourse").on("click", function () {
            saveCourse();
        });

        function loadCourses(page) {
            showLoader();
            const search = $("#course_Search").val();
            const isActive = $("#course_StatusFilter").val();
            let url = `${_BaseURL}/CourseManagement/GetAllCourse?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (isActive !== "") url += `&isActive=${isActive}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindCourseTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindCourseTable(list, page, totalRecords) {
            const $tbody = $("#tbl_Courses tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="6" class="text-center py-4 text-muted">No courses found.</td></tr>');
                $("#courseRecordInfo").text("Showing 0 records");
                $("#coursePagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item, index) => {
                const statusBadge = item.IsActive
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-secondary">Inactive</span>';

                html += `
                    <tr>
                        <td>${startIndex + index + 1}</td>
                        <td><span class="badge bg-light text-dark border font-monospace">${item.CourseCode}</span></td>
                        <td class="font-weight-bold text-dark">${item.CourseName}</td>
                        <td class="text-muted small">${item.Description || '-'}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-sm btn-outline-primary btnEditCourse me-1" data-id="${item.CourseId}" title="Edit Course">
                                <i class="fa fa-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-sm ${item.IsActive ? 'btn-outline-danger' : 'btn-outline-success'} btnToggleCourse" data-id="${item.CourseId}" data-active="${item.IsActive}" title="${item.IsActive ? 'Deactivate' : 'Activate'}">
                                <i class="fa ${item.IsActive ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#courseRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#coursePagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadCourses(currentPage);
            });

            $(".btnEditCourse").off("click").on("click", function () {
                const id = $(this).data("id");
                editCourse(id);
            });

            $(".btnToggleCourse").off("click").on("click", function () {
                const id = $(this).data("id");
                const currentActive = $(this).data("active");
                toggleCourseStatus(id, !currentActive);
            });
        }

        function resetCourseModal() {
            $("#hdn_CourseId").val("0");
            $("#txt_CourseCode").val("");
            $("#txt_CourseName").val("");
            $("#txt_CourseDescription").val("");
            $("#chk_CourseIsActive").prop("checked", true);
            $("#courseModalTitle").html('<i class="fa fa-plus-circle"></i> Add Course');
        }

        function editCourse(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetCourseById?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const c = extractObject(res);
                    if (c) {
                        $("#hdn_CourseId").val(c.CourseId);
                        $("#txt_CourseCode").val(c.CourseCode);
                        $("#txt_CourseName").val(c.CourseName);
                        $("#txt_CourseDescription").val(c.Description);
                        $("#chk_CourseIsActive").prop("checked", c.IsActive === true);
                        $("#courseModalTitle").html('<i class="fa fa-pencil"></i> Edit Course');
                        $("#courseModal").modal("show");
                    } else {
                        toastr.warning("Could not load course details.", "Warning");
                    }
                },
                error: handleAjaxError
            });
        }

        function saveCourse() {
            const courseId = parseInt($("#hdn_CourseId").val()) || 0;
            const code = $("#txt_CourseCode").val().trim();
            const name = $("#txt_CourseName").val().trim();
            const desc = $("#txt_CourseDescription").val().trim();
            const isActive = $("#chk_CourseIsActive").is(":checked");

            if (!code || !name) {
                toastr.warning("Course Code and Course Name are required.", "Validation Error");
                return;
            }

            const dto = {
                CourseId: courseId,
                CourseCode: code,
                CourseName: name,
                Description: desc,
                IsActive: isActive
            };

            const isEdit = courseId > 0;
            const endpoint = isEdit ? "/CourseManagement/UpdateCourse" : "/CourseManagement/CreateCourse";

            showLoader();
            $.ajax({
                url: _BaseURL + endpoint,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(isEdit ? "Course updated successfully!" : "Course created successfully!", "Success");
                        $("#courseModal").modal("hide");
                        loadCourses(currentPage);
                    } else {
                        toastr.error(res.Response || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }

        function toggleCourseStatus(id, newStatus) {
            Swal.fire({
                title: "Are you sure?",
                text: `You want to ${newStatus ? 'activate' : 'deactivate'} this course?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: newStatus ? "#28a745" : "#dc3545",
                confirmButtonText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}`
            }).then((result) => {
                if (result.isConfirmed) {
                    showLoader();
                    $.ajax({
                        url: `${_BaseURL}/CourseManagement/GetCourseById?id=${id}`,
                        type: "GET",
                        dataType: "json",
                        success: function (res) {
                            const dto = extractObject(res);
                            if (dto) {
                                dto.IsActive = newStatus;
                                $.ajax({
                                    url: _BaseURL + "/CourseManagement/UpdateCourse",
                                    type: "POST",
                                    contentType: "application/json",
                                    data: JSON.stringify(dto),
                                    success: function (updateRes) {
                                        hideLoader();
                                        if (isSuccessResponse(updateRes)) {
                                            toastr.success(`Course ${newStatus ? 'activated' : 'deactivated'} successfully!`, "Updated");
                                            loadCourses(currentPage);
                                        }
                                    },
                                    error: handleAjaxError
                                });
                            }
                        }
                    });
                }
            });
        }
    }

    // ==========================================
    // 3. COURSE BATCHES PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "coursebatches") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourseDropdowns(["#batch_FilterCourse", "#ddl_BatchCourse"]);
        loadBatches(currentPage);

        $("#btnAddNewBatch").on("click", function () {
            resetBatchModal();
            $("#batchModal").modal("show");
        });

        $("#btnFilterBatch").on("click", function () {
            currentPage = 1;
            loadBatches(currentPage);
        });

        $("#btnResetBatch").on("click", function () {
            $("#batch_FilterCourse").val("");
            $("#batch_FilterYear").val("");
            $("#batch_FilterStatus").val("");
            $("#batch_Search").val("");
            currentPage = 1;
            loadBatches(currentPage);
        });

        $("#btnSaveBatch").on("click", function () {
            saveBatch();
        });

        function loadBatches(page) {
            showLoader();
            const courseId = $("#batch_FilterCourse").val();
            const year = $("#batch_FilterYear").val();
            const isActive = $("#batch_FilterStatus").val();
            const search = $("#batch_Search").val();

            let url = `${_BaseURL}/CourseManagement/GetAllCourseBatch?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (isActive !== "") url += `&isActive=${isActive}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindBatchTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindBatchTable(list, page, totalRecords) {
            const $tbody = $("#tbl_CourseBatches tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">No course batches found.</td></tr>');
                $("#batchRecordInfo").text("Showing 0 records");
                $("#batchPagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item, index) => {
                const statusBadge = item.IsActive
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-secondary">Inactive</span>';

                html += `
                    <tr>
                        <td>${startIndex + index + 1}</td>
                        <td class="font-weight-bold text-dark">${item.CourseName || 'N/A'}</td>
                        <td><span class="badge bg-primary">${item.CourseYear}</span></td>
                        <td>${formatDateDisplay(item.CourseStartDate)}</td>
                        <td>${formatDateDisplay(item.CourseEndDate)}</td>
                        <td class="text-end font-weight-bold text-success">${formatMoney(item.TotalCourseFee)}</td>
                        <td class="text-end text-info">${formatMoney(item.AdvanceAmount)}</td>
                        <td class="text-end text-warning">${formatMoney(item.CancellationRetentionAmount)}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-sm btn-outline-primary btnEditBatch" data-id="${item.CourseBatchId}" title="Edit Batch">
                                <i class="fa fa-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#batchRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#batchPagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadBatches(currentPage);
            });

            $(".btnEditBatch").off("click").on("click", function () {
                const id = $(this).data("id");
                editBatch(id);
            });
        }

        function resetBatchModal() {
            $("#hdn_CourseBatchId").val("0");
            $("#ddl_BatchCourse").val("");
            $("#txt_BatchYear").val(new Date().getFullYear());
            $("#txt_BatchStartDate").val("");
            $("#txt_BatchEndDate").val("");
            $("#txt_TotalCourseFee").val("");
            $("#txt_AdvanceAmount").val("");
            $("#txt_CancellationRetention").val("");
            $("#chk_BatchIsActive").prop("checked", true);
            $("#batchModalTitle").html('<i class="fa fa-plus-circle"></i> Add Course Batch');
        }

        function editBatch(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetCourseBatchById?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const b = extractObject(res);
                    if (b) {
                        $("#hdn_CourseBatchId").val(b.CourseBatchId);
                        $("#ddl_BatchCourse").val(b.CourseId);
                        $("#txt_BatchYear").val(b.CourseYear);
                        $("#txt_BatchStartDate").val(b.CourseStartDate ? b.CourseStartDate.substring(0, 10) : "");
                        $("#txt_BatchEndDate").val(b.CourseEndDate ? b.CourseEndDate.substring(0, 10) : "");
                        $("#txt_TotalCourseFee").val(b.TotalCourseFee);
                        $("#txt_AdvanceAmount").val(b.AdvanceAmount);
                        $("#txt_CancellationRetention").val(b.CancellationRetentionAmount);
                        $("#chk_BatchIsActive").prop("checked", b.IsActive === true);
                        $("#batchModalTitle").html('<i class="fa fa-pencil"></i> Edit Course Batch');
                        $("#batchModal").modal("show");
                    } else {
                        toastr.warning("Could not load batch details.", "Warning");
                    }
                },
                error: handleAjaxError
            });
        }

        function saveBatch() {
            const batchId = parseInt($("#hdn_CourseBatchId").val()) || 0;
            const courseId = parseInt($("#ddl_BatchCourse").val()) || 0;
            const year = parseInt($("#txt_BatchYear").val()) || 0;
            const startDate = $("#txt_BatchStartDate").val();
            const endDate = $("#txt_BatchEndDate").val();
            const totalFee = parseFloat($("#txt_TotalCourseFee").val()) || 0;
            const advance = parseFloat($("#txt_AdvanceAmount").val()) || 0;
            const retention = parseFloat($("#txt_CancellationRetention").val()) || 0;
            const isActive = $("#chk_BatchIsActive").is(":checked");

            if (!courseId || !year || !startDate || !endDate || totalFee <= 0) {
                toastr.warning("Please fill in all required batch details with valid fee amount.", "Validation Error");
                return;
            }

            const dto = {
                CourseBatchId: batchId,
                CourseId: courseId,
                CourseYear: year,
                CourseStartDate: startDate,
                CourseEndDate: endDate,
                TotalCourseFee: totalFee,
                AdvanceAmount: advance,
                CancellationRetentionAmount: retention,
                IsActive: isActive
            };

            const isEdit = batchId > 0;
            const endpoint = isEdit ? "/CourseManagement/UpdateCourseBatch" : "/CourseManagement/CreateCourseBatch";

            showLoader();
            $.ajax({
                url: _BaseURL + endpoint,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(isEdit ? "Batch updated successfully!" : "Batch created successfully!", "Success");
                        $("#batchModal").modal("hide");
                        loadBatches(currentPage);
                    } else {
                        toastr.error(res.Response || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }
    }

    // ==========================================
    // 4. PARTICIPANTS / ENROLLMENT PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "participants") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourseDropdowns(["#enroll_FilterCourse"]);
        loadBatchDropdowns(["#ddl_EnrollBatch"]);

        loadEnrollments(currentPage);

        $("#btnAddNewEnrollment").on("click", function () {
            resetEnrollmentModal();
            $("#enrollModal").modal("show");
        });

        $("#btnFilterEnrollment").on("click", function () {
            currentPage = 1;
            loadEnrollments(currentPage);
        });

        $("#btnResetEnrollment").on("click", function () {
            $("#enroll_FilterCourse").val("");
            $("#enroll_FilterYear").val("");
            $("#enroll_FilterStatus").val("");
            $("#enroll_FilterPaymentStatus").val("");
            $("#enroll_Search").val("");
            $("#enroll_DateFrom").val("");
            $("#enroll_DateTo").val("");
            $("#enroll_FilterFormSubmitted").val("");
            currentPage = 1;
            loadEnrollments(currentPage);
        });

        $("#btnSaveEnrollment").on("click", function () {
            saveEnrollment();
        });

        $("#btnSubmitPayment").on("click", function () {
            submitPayment();
        });

        function loadEnrollments(page) {
            showLoader();
            const courseId = $("#enroll_FilterCourse").val();
            const year = $("#enroll_FilterYear").val();
            const status = $("#enroll_FilterStatus").val();
            const paymentStatus = $("#enroll_FilterPaymentStatus").val();
            const search = $("#enroll_Search").val();
            const dateFrom = $("#enroll_DateFrom").val();
            const dateTo = $("#enroll_DateTo").val();
            const formSubmitted = $("#enroll_FilterFormSubmitted").val();

            let url = `${_BaseURL}/CourseManagement/GetAllEnrollment?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            if (paymentStatus) url += `&paymentStatus=${encodeURIComponent(paymentStatus)}`;
            if (formSubmitted !== "") url += `&formSubmitted=${formSubmitted}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;
            if (dateTo) url += `&dateTo=${dateTo}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindEnrollmentTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindEnrollmentTable(list, page, totalRecords) {
            const $tbody = $("#tbl_Enrollments tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="11" class="text-center py-4 text-muted">No enrollments found.</td></tr>');
                $("#enrollRecordInfo").text("Showing 0 records");
                $("#enrollPagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item) => {
                let statusClass = "bg-primary";
                if (item.EnrollmentStatus === "CONFIRMED" || item.Status === "CONFIRMED") statusClass = "bg-success";
                else if (item.EnrollmentStatus === "CANCELLED" || item.Status === "CANCELLED") statusClass = "bg-danger";
                else if (item.EnrollmentStatus === "WAITING" || item.Status === "WAITING") statusClass = "bg-warning text-dark";

                const isCancelled = item.EnrollmentStatus === "CANCELLED" || item.Status === "CANCELLED";

                const participantName = item.ParticipantName || item.FullName || item.Name || item.Person?.FullName || item.Person?.Name || item.Person?.ParticipantName || item.person?.FullName || item.person?.Name || '-';
                const phone = item.Phone || item.PhoneNumber || item.Person?.Phone || item.Person?.PhoneNumber || item.person?.Phone || item.person?.PhoneNumber || '-';
                const email = item.Email || item.Person?.Email || item.person?.Email || '';
                const courseName = item.CourseName || item.Course?.CourseName || item.BatchName || '-';
                const courseYear = item.CourseYear || item.Year || item.BatchYear || '-';

                const totalCourseFee = item.TotalCourseFee ?? item.CourseFee ?? item.TotalFee ?? item.Course?.TotalCourseFee ?? item.CourseBatch?.Fee ?? 0;
                let totalPaid = item.TotalPaid ?? item.PaidAmount ?? item.Paid ?? 0;
                if ((totalPaid === 0 || totalPaid === undefined || totalPaid === null) && Array.isArray(item.Payments) && item.Payments.length > 0) {
                    totalPaid = item.Payments.reduce((sum, p) => sum + (p.Amount || 0), 0);
                }
                const totalDue = item.TotalDue !== undefined && item.TotalDue !== null ? item.TotalDue : Math.max(0, totalCourseFee - totalPaid);

                let computedPaymentStatus = item.PaymentStatus || item.paymentStatus;
                if (!computedPaymentStatus || computedPaymentStatus === "PENDING") {
                    if (totalCourseFee > 0 && totalDue <= 0 && totalPaid >= totalCourseFee) {
                        computedPaymentStatus = "COMPLETED";
                    } else if (totalPaid > 0 && totalDue > 0) {
                        computedPaymentStatus = "PARTIAL";
                    } else {
                        computedPaymentStatus = "PENDING";
                    }
                } else if (totalCourseFee > 0 && totalDue <= 0 && totalPaid >= totalCourseFee) {
                    computedPaymentStatus = "COMPLETED";
                }

                let payClass = "bg-secondary";
                if (computedPaymentStatus === "COMPLETED") payClass = "bg-success";
                else if (computedPaymentStatus === "PARTIAL") payClass = "bg-warning text-dark";

                html += `
                    <tr>
                        <td><span class="badge bg-light text-dark border font-monospace">${item.RegistrationNumber || 'REG-#' + (item.CourseEnrollmentId || item.EnrollmentId)}</span></td>
                        <td class="font-weight-bold text-dark">${participantName}</td>
                        <td class="small">${phone}<br/><span class="text-muted">${email}</span></td>
                        <td>${courseName}<br/><span class="badge bg-light text-muted border">${courseYear}</span></td>
                        <td>${formatDateDisplay(item.RegistrationDate)}</td>
                        <td class="text-end font-weight-bold">${formatMoney(totalCourseFee)}</td>
                        <td class="text-end text-success font-weight-bold">${formatMoney(totalPaid)}</td>
                        <td class="text-end text-danger font-weight-bold">${formatMoney(totalDue)}</td>
                        <td class="text-center"><span class="badge ${payClass}">${computedPaymentStatus}</span></td>
                        <td class="text-center"><span class="badge ${statusClass}">${item.EnrollmentStatus || item.Status || 'REGISTERED'}</span></td>
                        <td class="text-center">
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-info btnViewEnrollment" data-id="${item.CourseEnrollmentId || item.EnrollmentId}" title="View Profile">
                                    <i class="fa fa-eye"></i>
                                </button>
                                <button type="button" class="btn btn-outline-primary btnEditEnrollment" data-id="${item.CourseEnrollmentId || item.EnrollmentId}" title="Edit Enrollment">
                                    <i class="fa fa-pencil"></i>
                                </button>
                                ${!isCancelled && totalDue > 0 ? `
                                <button type="button" class="btn btn-outline-success btnAddPaymentModal" data-id="${item.CourseEnrollmentId || item.EnrollmentId}" data-name="${participantName}" data-fee="${totalCourseFee}" data-paid="${totalPaid}" data-due="${totalDue}" title="Add Payment">
                                    <i class="fa fa-money"></i>
                                </button>` : ''}
                                ${!isCancelled ? `
                                <button type="button" class="btn btn-outline-danger btnCancelEnrollment" data-id="${item.CourseEnrollmentId || item.EnrollmentId}" data-name="${participantName}" title="Cancel Enrollment">
                                    <i class="fa fa-times-circle"></i>
                                </button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#enrollRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#enrollPagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadEnrollments(currentPage);
            });

            $(".btnViewEnrollment").off("click").on("click", function () {
                const id = $(this).data("id");
                viewEnrollmentDetails(id);
            });

            $(".btnEditEnrollment").off("click").on("click", function () {
                const id = $(this).data("id");
                editEnrollment(id);
            });

            $(".btnAddPaymentModal").off("click").on("click", function () {
                const id = $(this).data("id");
                const name = $(this).data("name");
                const fee = $(this).data("fee");
                const paid = $(this).data("paid");
                const due = $(this).data("due");
                openAddPaymentModal(id, name, fee, paid, due);
            });

            $(".btnCancelEnrollment").off("click").on("click", function () {
                const id = $(this).data("id");
                const name = $(this).data("name");
                confirmCancelEnrollment(id, name);
            });
        }

        function resetEnrollmentModal() {
            $("#hdn_EnrollmentId").val("0");
            $("#hdn_PersonId").val("0");
            $("#hdn_PaymentId").val("0");
            $("#alert_ExistingPaymentInfo").addClass("d-none");
            $("#lbl_ExistingPaymentId").text("0");

            $("#txt_PersonName").val("");
            $("#txt_PersonPhone").val("");
            $("#txt_PersonEmail").val("");
            $("#ddl_PersonGender").val("MALE");
            $("#txt_PersonDOB").val("");
            $("#txt_FatherMotherName").val("");
            $("#txt_Profession").val("");
            $("#txt_Address").val("");
            $("#ddl_BloodGroup").val("");
            $("#ddl_FoodHabit").val("VEG");
            $("#txt_Height").val("");
            $("#txt_Weight").val("");
            $("#txt_PhysicalProblem").val("");

            $("#ddl_EnrollBatch").val("").trigger("change");
            $("#txt_RegistrationDate").val(new Date().toISOString().substring(0, 10));
            $("#ddl_EnrollStatus").val("REGISTERED");
            $("#txt_ReferencePerson").val("");
            $("#chk_FormSubmitted").prop("checked", false);
            $("#txt_EnrollRemarks").val("");

            $("#txt_InitialPaymentAmount").val("");
            $("#ddl_InitialPaymentMode").val("CASH");
            $("#txt_InitialPaymentReceiver").val("");
            $("#txt_InitialTxnRef").val("");

            $(".paymentUpdatediv").find("input, select, textarea, button").prop("disabled", false);
            $("#enrollModalTitle").html('<i class="fa fa-user-plus"></i> New Participant Enrollment');
        }

        function editEnrollment(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetEnrollmentById?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const data = extractObject(res);
                    if (data) {
                        const e = data.Enrollment || data.enrollment || data;
                        const p = data.Person || data.person || e.Person || e.person || data;

                        const actualEnrollmentId = parseInt(e.CourseEnrollmentId || e.EnrollmentId || e.Id || data.CourseEnrollmentId || data.EnrollmentId || id) || id;
                        const actualPersonId = parseInt(p.PersonId || e.PersonId || data.PersonId || 0) || 0;

                        $("#hdn_EnrollmentId").val(actualEnrollmentId);
                        $("#hdn_PersonId").val(actualPersonId);

                        $("#txt_PersonName").val(p.FullName || p.Name || p.ParticipantName || e.FullName || e.Name || e.ParticipantName || "");
                        $("#txt_PersonPhone").val(p.PhoneNumber || p.Phone || e.PhoneNumber || e.Phone || "");
                        $("#txt_PersonEmail").val(p.Email || e.Email || "");

                        // Gender normalization
                        const genderVal = (p.Gender || e.Gender || "MALE").toString().toUpperCase();
                        if (genderVal.includes("FEMALE") || genderVal === "F") $("#ddl_PersonGender").val("FEMALE");
                        else if (genderVal.includes("OTHER") || genderVal === "O") $("#ddl_PersonGender").val("OTHER");
                        else $("#ddl_PersonGender").val("MALE");

                        $("#txt_PersonDOB").val(p.DateOfBirth ? p.DateOfBirth.substring(0, 10) : (e.DateOfBirth ? e.DateOfBirth.substring(0, 10) : ""));
                        $("#txt_FatherMotherName").val(p.FatherMotherName || p.FatherOrMotherName || e.FatherMotherName || e.FatherOrMotherName || "");
                        $("#txt_Profession").val(p.Profession || e.Profession || "");
                        $("#txt_Address").val(p.Address || e.Address || "");
                        $("#ddl_BloodGroup").val(p.BloodGroup || e.BloodGroup || "");

                        // Food habit normalization
                        const foodVal = (p.FoodHabit || e.FoodHabit || "VEG").toString().toUpperCase();
                        if (foodVal.includes("NON")) $("#ddl_FoodHabit").val("NON-VEG");
                        else $("#ddl_FoodHabit").val("VEG");

                        $("#txt_Height").val(p.Height !== null && p.Height !== undefined ? p.Height : (e.Height !== null && e.Height !== undefined ? e.Height : ""));
                        $("#txt_Weight").val(p.Weight !== null && p.Weight !== undefined ? p.Weight : (e.Weight !== null && e.Weight !== undefined ? e.Weight : ""));
                        $("#txt_PhysicalProblem").val(p.PhysicalProblem || e.PhysicalProblem || "");

                        // Populate Batch Dropdown & set value with select2 trigger
                        const batchId = e.CourseBatchId || e.BatchId || (e.Course && (e.Course.CourseBatchId || e.Course.BatchId || e.Course.Id)) || (e.Batch && (e.Batch.CourseBatchId || e.Batch.Id)) || (data.Course && (data.Course.CourseBatchId || data.Course.BatchId)) || "";
                        loadBatchDropdowns(["#ddl_EnrollBatch"], null, function () {
                            if (batchId) {
                                $("#ddl_EnrollBatch").val(batchId.toString()).trigger("change");
                            }
                        });

                        $("#txt_RegistrationDate").val(e.RegistrationDate ? e.RegistrationDate.substring(0, 10) : "");
                        $("#ddl_EnrollStatus").val((e.EnrollmentStatus || e.Status || "REGISTERED").toString().toUpperCase());
                        $("#txt_ReferencePerson").val(e.ReferencePerson || "");
                        $("#chk_FormSubmitted").prop("checked", e.FormSubmitted === true || e.FormSubmitted === "true" || e.IsFormSubmitted === true);
                        $("#txt_EnrollRemarks").val(e.Remarks || "");

                        // Bind Payment details if present in Payments array
                        const payList = e.Payments || e.payments || data.Payments || data.payments || [];
                        if (payList && payList.length > 0) {
                            const pay = payList[0];
                            const payId = pay.CoursePaymentId || pay.PaymentId || pay.paymentId || pay.id || 0;
                            const payAmt = pay.Amount !== undefined && pay.Amount !== null ? pay.Amount : (pay.PaymentAmount !== undefined ? pay.PaymentAmount : "");
                            const payMode = (pay.PaymentMode || pay.Mode || "CASH").toString().toUpperCase();
                            const payReceiver = pay.PaymentReceiver || pay.Receiver || "";
                            const payRef = pay.TransactionReference || pay.TxnRef || pay.RefNo || "";

                            $("#hdn_PaymentId").val(payId);
                            $("#lbl_ExistingPaymentId").text(payId);
                            $("#alert_ExistingPaymentInfo").removeClass("d-none");

                            $("#txt_InitialPaymentAmount").val(payAmt);
                            $("#ddl_InitialPaymentMode").val(payMode);
                            $("#txt_InitialPaymentReceiver").val(payReceiver);
                            $("#txt_InitialTxnRef").val(payRef);

                            // Disable initial payment inputs in Edit mode since payment ID is already generated
                            $(".paymentUpdatediv").find("input, select, textarea, button").prop("disabled", true);
                        } else {
                            $("#hdn_PaymentId").val("0");
                            $("#lbl_ExistingPaymentId").text("0");
                            $("#alert_ExistingPaymentInfo").addClass("d-none");

                            $("#txt_InitialPaymentAmount").val("");
                            $("#ddl_InitialPaymentMode").val("CASH");
                            $("#txt_InitialPaymentReceiver").val("");
                            $("#txt_InitialTxnRef").val("");
                            $(".paymentUpdatediv").find("input, select, textarea, button").prop("disabled", false);
                        }

                        $("#enrollModalTitle").html('<i class="fa fa-pencil"></i> Edit Participant Enrollment');
                        $("#enrollModal").modal("show");
                    } else {
                        toastr.warning("Could not load enrollment details.", "Warning");
                    }
                },
                error: handleAjaxError
            });
        }

        function saveEnrollment() {
            const enrollId = parseInt($("#hdn_EnrollmentId").val()) || 0;
            const personId = parseInt($("#hdn_PersonId").val()) || 0;
            const existingPaymentId = parseInt($("#hdn_PaymentId").val()) || 0;

            const name = $("#txt_PersonName").val().trim();
            const phone = $("#txt_PersonPhone").val().trim();
            const batchId = parseInt($("#ddl_EnrollBatch").val()) || 0;

            if (!name || !phone || !batchId) {
                toastr.warning("Participant Name, Phone and Course Batch are required.", "Validation Error");
                return;
            }

            const rawAmount = $("#txt_InitialPaymentAmount").val();
            const initialAmount = rawAmount !== null && rawAmount !== undefined && rawAmount !== "" 
                ? parseFloat(rawAmount.toString().replace(/,/g, '').trim()) || 0 
                : 0;

            const dto = {
                CourseEnrollmentId: enrollId,
                EnrollmentId: enrollId,
                Id: enrollId,
                PersonId: personId > 0 ? personId : null,
                CourseBatchId: batchId,
                RegistrationDate: $("#txt_RegistrationDate").val(),
                ReferencePerson: $("#txt_ReferencePerson").val().trim(),
                FormSubmitted: $("#chk_FormSubmitted").is(":checked"),
                EnrollmentStatus: $("#ddl_EnrollStatus").val(),
                Remarks: $("#txt_EnrollRemarks").val().trim(),

                Name: name,
                FullName: name,
                Phone: phone,
                PhoneNumber: phone,
                Email: $("#txt_PersonEmail").val().trim(),
                Gender: $("#ddl_PersonGender").val(),
                DateOfBirth: $("#txt_PersonDOB").val() || null,
                FatherOrMotherName: $("#txt_FatherMotherName").val().trim(),
                FatherMotherName: $("#txt_FatherMotherName").val().trim(),
                Address: $("#txt_Address").val().trim(),
                Profession: $("#txt_Profession").val().trim(),
                BloodGroup: $("#ddl_BloodGroup").val(),
                FoodHabit: $("#ddl_FoodHabit").val(),
                Height: $("#txt_Height").val() ? $("#txt_Height").val().toString().trim() : null,
                Weight: $("#txt_Weight").val() ? $("#txt_Weight").val().toString().trim() : null,
                PhysicalProblem: $("#txt_PhysicalProblem").val().trim()
            };

            // If an existing payment ID was previously generated in DB
            if (existingPaymentId > 0) {
                dto.PaymentId = existingPaymentId;
                const payMode = $("#ddl_InitialPaymentMode").val() || "CASH";
                const payReceiver = $("#txt_InitialPaymentReceiver").val().trim();
                const txnRef = $("#txt_InitialTxnRef").val().trim();
                const regDate = $("#txt_RegistrationDate").val() || new Date().toISOString().substring(0, 10);
                const payRemarks = $("#txt_EnrollRemarks").val().trim() || "Initial payment";

                dto.Payment = {
                    PaymentId: existingPaymentId,
                    PaymentDate: regDate,
                    Amount: initialAmount,
                    PaymentMode: payMode,
                    PaymentReceiver: payReceiver,
                    TransactionReference: txnRef,
                    Remarks: payRemarks
                };

                dto.PaymentAmount = initialAmount;
                dto.Amount = initialAmount;
                dto.InitialAmount = initialAmount;
                dto.InitialPaymentAmount = initialAmount;
                dto.PaidAmount = initialAmount;
                dto.TotalPaid = initialAmount;
                dto.AdvanceAmount = initialAmount;
                dto.PaymentMode = payMode;
                dto.InitialPaymentMode = payMode;
                dto.PaymentReceiver = payReceiver;
                dto.InitialPaymentReceiver = payReceiver;
                dto.TransactionReference = txnRef;
                dto.InitialTxnRef = txnRef;
                dto.TxnRef = txnRef;
                dto.PaymentDate = regDate;
                dto.PaymentRemarks = payRemarks;
            } else if (initialAmount > 0) {
                dto.PaymentAmount = initialAmount;
                dto.Amount = initialAmount;
                dto.InitialAmount = initialAmount;
                dto.InitialPaymentAmount = initialAmount;
                dto.PaidAmount = initialAmount;
                dto.TotalPaid = initialAmount;
                dto.AdvanceAmount = initialAmount;

                const payMode = $("#ddl_InitialPaymentMode").val() || "CASH";
                dto.PaymentMode = payMode;
                dto.InitialPaymentMode = payMode;

                const payReceiver = $("#txt_InitialPaymentReceiver").val().trim();
                dto.PaymentReceiver = payReceiver;
                dto.InitialPaymentReceiver = payReceiver;

                const txnRef = $("#txt_InitialTxnRef").val().trim();
                dto.TransactionReference = txnRef;
                dto.InitialTxnRef = txnRef;
                dto.TxnRef = txnRef;

                const regDate = $("#txt_RegistrationDate").val() || new Date().toISOString().substring(0, 10);
                dto.PaymentDate = regDate;
                dto.PaymentRemarks = "Initial payment during enrollment";
            }

            const isEdit = enrollId > 0;
            const endpoint = isEdit ? "/CourseManagement/UpdateEnrollment" : "/CourseManagement/CreateEnrollment";

            showLoader();
            $.ajax({
                url: _BaseURL + endpoint,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(isEdit ? "Enrollment updated!" : "Participant enrolled successfully!", "Success");
                        $("#enrollModal").modal("hide");
                        loadEnrollments(currentPage);
                    } else {
                        toastr.error(res.Response || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }

        function viewEnrollmentDetails(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetEnrollmentDetails?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const data = extractObject(res);
                    if (data) {
                        const e = data.Enrollment || data.enrollment || data;
                        const p = data.Person || data.person || e.Person || e.person || e;
                        const b = data.Batch || data.batch || e.Batch || e.batch || {};

                        const fullName = p.FullName || p.Name || p.ParticipantName || e.FullName || e.Name || e.ParticipantName || '-';
                        const phone = p.PhoneNumber || p.Phone || e.PhoneNumber || e.Phone || '-';
                        const email = p.Email || e.Email || '-';
                        const gender = p.Gender || e.Gender || '-';
                        const dob = p.DateOfBirth || e.DateOfBirth;
                        const guardian = p.FatherMotherName || p.FatherOrMotherName || e.FatherMotherName || e.FatherOrMotherName || '-';
                        const address = p.Address || e.Address || '-';
                        const profession = p.Profession || e.Profession || '-';
                        const motherTongue = p.MotherTongue || e.MotherTongue || '-';
                        const height = (p.Height !== null && p.Height !== undefined) ? p.Height : (e.Height !== null && e.Height !== undefined ? e.Height : null);
                        const weight = (p.Weight !== null && p.Weight !== undefined) ? p.Weight : (e.Weight !== null && e.Weight !== undefined ? e.Weight : null);
                        const bloodGroup = p.BloodGroup || e.BloodGroup || '-';
                        const foodHabit = p.FoodHabit || e.FoodHabit || '-';
                        const physicalProb = p.PhysicalProblem || e.PhysicalProblem || 'None';

                        // Tab 1: Person
                        $("#view_PersonContent").html(`
                            <div class="col-md-4"><strong>Full Name:</strong> ${fullName}</div>
                            <div class="col-md-4"><strong>Phone:</strong> ${phone}</div>
                            <div class="col-md-4"><strong>Email:</strong> ${email}</div>
                            <div class="col-md-4"><strong>Gender:</strong> ${gender}</div>
                            <div class="col-md-4"><strong>Date of Birth:</strong> ${formatDateDisplay(dob)}</div>
                            <div class="col-md-4"><strong>Guardian Name:</strong> ${guardian}</div>
                            <div class="col-md-6"><strong>Address:</strong> ${address}</div>
                            <div class="col-md-3"><strong>Profession:</strong> ${profession}</div>
                            <div class="col-md-3"><strong>Mother Tongue:</strong> ${motherTongue}</div>
                            <div class="col-md-3"><strong>Height:</strong> ${height ? height + ' cm' : '-'}</div>
                            <div class="col-md-3"><strong>Weight:</strong> ${weight ? weight + ' kg' : '-'}</div>
                            <div class="col-md-3"><strong>Blood Group:</strong> ${bloodGroup}</div>
                            <div class="col-md-3"><strong>Food Habit:</strong> ${foodHabit}</div>
                            <div class="col-md-12"><strong>Physical Problems / Allergies:</strong> ${physicalProb}</div>
                        `);

                        // Tab 2: Course
                        $("#view_CourseContent").html(`
                            <div class="col-md-4"><strong>Course Name:</strong> ${e.CourseName || b.CourseName || '-'}</div>
                            <div class="col-md-4"><strong>Batch Year:</strong> ${e.CourseYear || b.CourseYear || '-'}</div>
                            <div class="col-md-4"><strong>Reg Number:</strong> ${e.RegistrationNumber || '-'}</div>
                            <div class="col-md-4"><strong>Registration Date:</strong> ${formatDateDisplay(e.RegistrationDate)}</div>
                            <div class="col-md-4"><strong>Reference Person:</strong> ${e.ReferencePerson || 'Direct'}</div>
                            <div class="col-md-4"><strong>Form Submitted:</strong> ${e.FormSubmitted ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-warning text-dark">No</span>'}</div>
                            <div class="col-md-4"><strong>Enrollment Status:</strong> <span class="badge bg-primary">${e.EnrollmentStatus || e.Status || 'REGISTERED'}</span></div>
                            <div class="col-md-12"><strong>Remarks:</strong> ${e.Remarks || 'None'}</div>
                        `);

                        // Tab 3: Financial
                        $("#view_FinancialContent").html(`
                            <div class="col-md-3"><div class="border rounded p-3 text-center"><small class="text-muted d-block">Total Course Fee</small><span class="h5 font-weight-bold">${formatMoney(e.TotalCourseFee)}</span></div></div>
                            <div class="col-md-3"><div class="border rounded p-3 text-center bg-light"><small class="text-muted d-block">Total Paid</small><span class="h5 font-weight-bold text-success">${formatMoney(e.TotalPaid)}</span></div></div>
                            <div class="col-md-3"><div class="border rounded p-3 text-center bg-light"><small class="text-muted d-block">Total Remaining Due</small><span class="h5 font-weight-bold text-danger">${formatMoney(e.TotalDue)}</span></div></div>
                            <div class="col-md-3"><div class="border rounded p-3 text-center bg-light"><small class="text-muted d-block">Total Refund</small><span class="h5 font-weight-bold text-warning">${formatMoney(e.TotalRefund)}</span></div></div>
                        `);

                        // Tab 4: Payments & Refunds
                        const payments = extractList(data.Payments || e.Payments);
                        let payHtml = "";
                        if (payments.length === 0) payHtml = '<tr><td colspan="6" class="text-center py-2 text-muted">No payments recorded.</td></tr>';
                        else {
                            payments.forEach(py => {
                                payHtml += `<tr><td>${formatDateDisplay(py.PaymentDate)}</td><td class="text-success font-weight-bold">${formatMoney(py.Amount)}</td><td>${py.PaymentMode}</td><td>${py.PaymentReceiver || '-'}</td><td>${py.TransactionReference || '-'}</td><td>${py.Remarks || '-'}</td></tr>`;
                            });
                        }
                        $("#tbl_ViewPayments tbody").html(payHtml);

                        const refunds = extractList(data.Refunds || e.Refunds);
                        let refHtml = "";
                        if (refunds.length === 0) refHtml = '<tr><td colspan="6" class="text-center py-2 text-muted">No refunds.</td></tr>';
                        else {
                            refunds.forEach(rf => {
                                refHtml += `<tr><td>${formatDateDisplay(rf.RefundDate)}</td><td class="text-danger font-weight-bold">${formatMoney(rf.RefundAmount)}</td><td class="text-warning">${formatMoney(rf.RetentionAmount)}</td><td>${rf.RefundMode}</td><td>${rf.Reason || '-'}</td><td>${rf.TransactionReference || '-'}</td></tr>`;
                            });
                        }
                        $("#tbl_ViewRefunds tbody").html(refHtml);

                        $("#enrollDetailsModal").modal("show");
                    }
                },
                error: handleAjaxError
            });
        }

        function openAddPaymentModal(enrollmentId, name, totalFee, totalPaid, totalDue) {
            const numDue = parseFloat(totalDue) || 0;
            $("#pay_EnrollmentId").val(enrollmentId);
            $("#pay_MaxDueAmount").val(numDue);
            $("#pay_ParticipantName").text(name);
            $("#pay_CourseFee").text(parseFloat(totalFee).toFixed(2));
            $("#pay_TotalPaid").text(parseFloat(totalPaid).toFixed(2));
            $("#pay_RemainingDue").text(numDue.toFixed(2));

            $("#pay_Amount")
                .val(numDue.toFixed(2))
                .attr("max", numDue)
                .removeClass("is-invalid");
            $("#pay_Amount_Validation").addClass("d-none");

            $("#pay_PaymentReceiver").val("");
            $("#pay_TransactionReference").val("");
            $("#pay_Remarks").val("");
            $("#addPaymentModal").modal("show");
        }

        // Live validation on payment amount input
        $("#pay_Amount").off("input change").on("input change", function () {
            const entered = parseFloat($(this).val()) || 0;
            const maxDue = parseFloat($("#pay_MaxDueAmount").val()) || parseFloat($("#pay_RemainingDue").text().replace(/[^0-9.]/g, '')) || 0;

            if (maxDue > 0 && entered > maxDue) {
                $(this).addClass("is-invalid");
                $("#pay_Amount_Validation")
                    .text(`Payment amount (₹${entered.toFixed(2)}) cannot exceed due amount (₹${maxDue.toFixed(2)}).`)
                    .removeClass("d-none");
            } else {
                $(this).removeClass("is-invalid");
                $("#pay_Amount_Validation").addClass("d-none");
            }
        });

        function submitPayment() {
            const enrollmentId = parseInt($("#pay_EnrollmentId").val()) || 0;
            const amount = parseFloat($("#pay_Amount").val()) || 0;
            const maxDue = parseFloat($("#pay_MaxDueAmount").val()) || parseFloat($("#pay_RemainingDue").text().replace(/[^0-9.]/g, '')) || 0;

            const paymentDate = $("#pay_PaymentDate").val();
            const paymentMode = $("#pay_PaymentMode").val();
            const receiver = $("#pay_PaymentReceiver").val().trim();
            const txnRef = $("#pay_TransactionReference").val().trim();
            const remarks = $("#pay_Remarks").val().trim();

            if (amount <= 0 || !paymentDate) {
                toastr.warning("Payment amount must be greater than 0.", "Validation Error");
                return;
            }

            if (maxDue > 0 && amount > maxDue) {
                $("#pay_Amount").addClass("is-invalid");
                $("#pay_Amount_Validation")
                    .text(`Payment amount (₹${amount.toFixed(2)}) cannot exceed due amount (₹${maxDue.toFixed(2)}).`)
                    .removeClass("d-none");
                toastr.warning(`Payment amount (₹${amount.toFixed(2)}) cannot exceed due amount (₹${maxDue.toFixed(2)}).`, "Validation Error");
                return;
            }

            const dto = {
                EnrollmentId: enrollmentId,
                PaymentDate: paymentDate,
                Amount: amount,
                PaymentMode: paymentMode,
                PaymentReceiver: receiver,
                TransactionReference: txnRef,
                Remarks: remarks
            };

            showLoader();
            $.ajax({
                url: _BaseURL + "/CourseManagement/AddPayment",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success("Payment recorded successfully!", "Success");
                        $("#addPaymentModal").modal("hide");
                        loadEnrollments(currentPage);
                    } else {
                        const errMsg = res.Response || (res.ErrorMassage ? res.ErrorMassage.join("<br/>") : "Payment validation failed.");
                        toastr.error(errMsg, "API Error");
                    }
                },
                error: handleAjaxError
            });
        }

        function confirmCancelEnrollment(enrollmentId, participantName) {
            Swal.fire({
                title: "Cancel Enrollment?",
                text: `Are you sure you want to cancel enrollment for ${participantName}? The API will calculate retention and refund amount.`,
                icon: "warning",
                input: 'text',
                inputPlaceholder: 'Enter cancellation reason...',
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Yes, Cancel Enrollment"
            }).then((result) => {
                if (result.isConfirmed) {
                    const reason = result.value || "Cancelled by Admin";
                    showLoader();
                    $.ajax({
                        url: _BaseURL + "/CourseManagement/CancelEnrollment",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            EnrollmentId: enrollmentId,
                            Reason: reason,
                            RefundMode: "CASH"
                        }),
                        success: function (res) {
                            hideLoader();
                            if (isSuccessResponse(res)) {
                                const refundInfo = extractObject(res);
                                let msg = "Enrollment cancelled successfully!";
                                if (refundInfo && refundInfo.RefundAmount !== undefined) {
                                    msg += ` Calculated Refund: ${formatMoney(refundInfo.RefundAmount)}`;
                                }
                                Swal.fire("Cancelled", msg, "success");
                                loadEnrollments(currentPage);
                            } else {
                                toastr.error(res.Response || "Cancellation failed.", "Error");
                            }
                        },
                        error: handleAjaxError
                    });
                }
            });
        }
    }

    // ==========================================
    // 5. PAYMENTS MANAGEMENT PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "payments") {
        let currentPage = 1;
        const pageSize = 10;
        let currentPaymentsList = [];

        loadCourseDropdowns(["#paylist_FilterCourse"]);
        loadPayments(currentPage);

        $("#btnFilterPaymentsList").on("click", function () {
            currentPage = 1;
            loadPayments(currentPage);
        });

        $("#btnResetPaymentsList").on("click", function () {
            $("#paylist_FilterCourse").val("");
            $("#paylist_FilterYear").val("");
            $("#paylist_FilterMode").val("");
            $("#paylist_Search").val("");
            currentPage = 1;
            loadPayments(currentPage);
        });

        $("#btnSubmitUpdatePayment").off("click").on("click", function () {
            submitUpdatePayment();
        });

        function submitUpdatePayment() {
            const paymentId = parseInt($("#editpay_PaymentId").val()) || 0;
            const amount = parseFloat($("#editpay_Amount").val()) || 0;
            const paymentDate = $("#editpay_PaymentDate").val();
            const paymentMode = $("#editpay_PaymentMode").val();

            if (paymentId <= 0) {
                toastr.warning("Invalid Payment selected.", "Validation Error");
                return;
            }
            if (amount <= 0) {
                toastr.warning("Please enter a valid payment amount.", "Validation Error");
                return;
            }
            if (!paymentDate) {
                toastr.warning("Please select a valid payment date.", "Validation Error");
                return;
            }

            const dto = {
                PaymentId: paymentId,
                CoursePaymentId: paymentId,
                Id: paymentId,
                PaymentDate: paymentDate,
                Amount: amount,
                PaymentAmount: amount,
                PaymentMode: paymentMode,
                PaymentReceiver: $("#editpay_PaymentReceiver").val().trim(),
                TransactionReference: $("#editpay_TransactionReference").val().trim(),
                Remarks: $("#editpay_Remarks").val().trim()
            };

            showLoader();
            $.ajax({
                url: _BaseURL + "/CourseManagement/UpdatePayment",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success("Payment updated successfully!", "Success");
                        $("#editPaymentModal").modal("hide");
                        loadPayments(currentPage);
                    } else {
                        toastr.error(res.Response || res.Message || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }

        function loadPayments(page) {
            showLoader();
            const courseId = $("#paylist_FilterCourse").val();
            const year = $("#paylist_FilterYear").val();
            const mode = $("#paylist_FilterMode").val();
            const search = $("#paylist_Search").val();

            let url = `${_BaseURL}/CourseManagement/GetAllPayment?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (mode) url += `&paymentMode=${encodeURIComponent(mode)}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindPaymentsTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindPaymentsTable(list, page, totalRecords) {
            currentPaymentsList = list || [];
            const $tbody = $("#tbl_PaymentsList tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">No payments found.</td></tr>');
                $("#paymentRecordInfo").text("Showing 0 records");
                $("#paymentPagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item, index) => {
                const paymentId = item.CoursePaymentId || item.PaymentId || item.Id || item.id || 0;
                const pName = item.ParticipantName || item.FullName || item.Name || item.PersonName || item.Person?.FullName || item.person?.FullName || '-';
                const regNo = item.RegistrationNumber || item.RegNo || item.RegistrationNo || (item.EnrollmentId ? 'REG-#' + item.EnrollmentId : '-');
                const pDate = item.PaymentDate || item.Paymentdate || item.Date || item.date || item.CreatedAt || '';
                const amt = item.Amount !== undefined && item.Amount !== null ? item.Amount : (item.PaymentAmount !== undefined ? item.PaymentAmount : 0);
                const pMode = item.PaymentMode || item.Paymentmode || item.Mode || 'CASH';
                const receiver = item.PaymentReceiver || item.Paymentreceiver || item.Receiver || '-';
                const ref = item.TransactionReference || item.Transactionreference || item.TxnRef || '-';
                const remarks = item.Remarks || item.remarks || '-';

                html += `
                    <tr>
                        <td>${formatDateDisplay(pDate)}</td>
                        <td><span class="badge bg-light text-dark border font-monospace">${regNo}</span></td>
                        <td class="font-weight-bold text-dark">${pName}</td>
                        <td>${item.CourseName || '-'}<br/><span class="badge bg-light text-muted border">${item.CourseYear || '-'}</span></td>
                        <td class="text-end font-weight-bold text-success">${formatMoney(amt)}</td>
                        <td class="text-center"><span class="badge bg-info text-dark">${pMode}</span></td>
                        <td>${receiver}</td>
                        <td><span class="font-monospace small">${ref}</span></td>
                        <td class="small text-muted">${remarks}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-outline-warning btn-sm btnEditPayment" 
                                data-index="${index}" 
                                data-id="${paymentId}" 
                                title="Edit Payment">
                                <i class="fa fa-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#paymentRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#paymentPagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadPayments(currentPage);
            });

            $(".btnEditPayment").off("click").on("click", function () {
                const idx = $(this).data("index");
                const id = $(this).data("id");
                let item = currentPaymentsList[idx];
                if (!item || (item.CoursePaymentId || item.PaymentId || item.Id || item.id) != id) {
                    item = currentPaymentsList.find(x => (x.CoursePaymentId || x.PaymentId || x.Id || x.id) == id) || {};
                }

                const paymentId = item.CoursePaymentId || item.PaymentId || item.Id || item.id || id;
                const pName = item.ParticipantName || item.FullName || item.Name || item.PersonName || item.Person?.FullName || item.person?.FullName || '-';
                const regNo = item.RegistrationNumber || item.RegNo || item.RegistrationNo || (item.EnrollmentId ? 'REG-#' + item.EnrollmentId : '-');
                const rawDate = item.PaymentDate || item.Paymentdate || item.Date || item.date || item.CreatedAt || '';
                const pDate = rawDate ? (rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate) : new Date().toISOString().substring(0, 10);
                const amt = item.Amount !== undefined && item.Amount !== null ? item.Amount : (item.PaymentAmount !== undefined ? item.PaymentAmount : 0);
                const pMode = item.PaymentMode || item.Paymentmode || item.Mode || 'CASH';
                const receiver = item.PaymentReceiver || item.Paymentreceiver || item.Receiver || '';
                const ref = item.TransactionReference || item.Transactionreference || item.TxnRef || '';
                const remarks = item.Remarks || item.remarks || '';

                $("#editpay_PaymentId").val(paymentId);
                $("#editpay_ParticipantName").text(pName);
                $("#editpay_RegNo").text(regNo);
                $("#editpay_PaymentDate").val(pDate);
                $("#editpay_Amount").val(amt);
                $("#editpay_PaymentMode").val(pMode.toUpperCase());
                $("#editpay_PaymentReceiver").val(receiver);
                $("#editpay_TransactionReference").val(ref);
                $("#editpay_Remarks").val(remarks);

                $("#editPaymentModal").modal("show");
            });
        }
    }

    // ==========================================
    // 6. REFUNDS MANAGEMENT PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "refunds") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourseDropdowns(["#refund_FilterCourse"]);
        loadRefunds(currentPage);

        $("#btnFilterRefunds").on("click", function () {
            currentPage = 1;
            loadRefunds(currentPage);
        });

        $("#btnResetRefunds").on("click", function () {
            $("#refund_FilterCourse").val("");
            $("#refund_FilterYear").val("");
            $("#refund_FilterMode").val("");
            $("#refund_Search").val("");
            currentPage = 1;
            loadRefunds(currentPage);
        });

        function loadRefunds(page) {
            showLoader();
            const courseId = $("#refund_FilterCourse").val();
            const year = $("#refund_FilterYear").val();
            const mode = $("#refund_FilterMode").val();
            const search = $("#refund_Search").val();

            let url = `${_BaseURL}/CourseManagement/GetAllRefund?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (mode) url += `&refundMode=${encodeURIComponent(mode)}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindRefundsTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindRefundsTable(list, page, totalRecords) {
            const $tbody = $("#tbl_RefundsList tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">No refund history found.</td></tr>');
                $("#refundRecordInfo").text("Showing 0 records");
                $("#refundPagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item) => {
                html += `
                    <tr>
                        <td>${formatDateDisplay(item.RefundDate)}</td>
                        <td><span class="badge bg-light text-dark border font-monospace">${item.RegistrationNumber || 'REG-#' + item.EnrollmentId}</span></td>
                        <td class="font-weight-bold text-dark">${item.ParticipantName || '-'}</td>
                        <td>${item.CourseName || '-'}<br/><span class="badge bg-light text-muted border">${item.CourseYear || '-'}</span></td>
                        <td class="text-end">${formatMoney(item.TotalPaid)}</td>
                        <td class="text-end text-warning font-weight-bold">${formatMoney(item.RetentionAmount)}</td>
                        <td class="text-end text-danger font-weight-bold">${formatMoney(item.RefundAmount)}</td>
                        <td class="text-center"><span class="badge bg-secondary">${item.RefundMode || 'CASH'}</span></td>
                        <td class="small">${item.Reason || '-'}</td>
                        <td><span class="font-monospace small">${item.TransactionReference || '-'}</span></td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#refundRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#refundPagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadRefunds(currentPage);
            });
        }
    }

    // ==========================================
    // 7. OFFICIALS MANAGEMENT PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "officials") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourseDropdowns(["#official_FilterCourse"]);
        loadBatchDropdowns(["#ddl_OfficialBatch"]);
        loadOfficials(currentPage);

        $("#btnAddNewOfficial").on("click", function () {
            resetOfficialModal();
            $("#officialModal").modal("show");
        });

        $("#btnFilterOfficials").on("click", function () {
            currentPage = 1;
            loadOfficials(currentPage);
        });

        $("#btnResetOfficials").on("click", function () {
            $("#official_FilterCourse").val("");
            $("#official_FilterYear").val("");
            $("#official_FilterRole").val("");
            $("#official_FilterPaymentStatus").val("");
            $("#official_Search").val("");
            currentPage = 1;
            loadOfficials(currentPage);
        });

        $("#btnSaveOfficial").on("click", function () {
            saveOfficial();
        });

        $(".calc-official-total").on("input change", function () {
            const h2d = parseFloat($("#txt_HowrahToDest").val()) || 0;
            const d2h = parseFloat($("#txt_DestToHowrah").val()) || 0;
            $("#txt_OfficialAmount").val((h2d + d2h).toFixed(2));
        });

        function loadOfficials(page) {
            showLoader();
            const courseId = $("#official_FilterCourse").val();
            const year = $("#official_FilterYear").val();
            const role = $("#official_FilterRole").val();
            const status = $("#official_FilterPaymentStatus").val();
            const search = $("#official_Search").val();

            let url = `${_BaseURL}/CourseManagement/GetAllCourseOfficial?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (role) url += `&role=${encodeURIComponent(role)}`;
            if (status) url += `&paymentStatus=${encodeURIComponent(status)}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindOfficialsTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindOfficialsTable(list, page, totalRecords) {
            const $tbody = $("#tbl_Officials tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">No course officials found.</td></tr>');
                $("#officialRecordInfo").text("Showing 0 records");
                $("#officialPagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item, index) => {
                const isPaid = item.PaymentStatus === "PAID";
                const statusBadge = isPaid
                    ? '<span class="badge bg-success">PAID</span>'
                    : '<span class="badge bg-warning text-dark">PENDING</span>';

                html += `
                    <tr>
                        <td>${startIndex + index + 1}</td>
                        <td class="font-weight-bold text-dark">${item.CourseOfficialName || '-'}</td>
                        <td>${item.CourseName || '-'}<br/><span class="badge bg-light text-muted border">${item.CourseYear || '-'}</span></td>
                        <td><span class="badge bg-info text-dark">${item.RoleName || '-'}</span></td>
                        <td class="text-end">${formatMoney(item.HowrahToDestination)}</td>
                        <td class="text-end">${formatMoney(item.DestinationToHowrah)}</td>
                        <td class="text-end font-weight-bold text-primary">${formatMoney(item.Amount)}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="small text-muted">${item.Remarks || '-'}</td>
                        <td class="text-center">
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-primary btnEditOfficial" data-id="${item.CourseOfficialId}" title="Edit Official">
                                    <i class="fa fa-pencil"></i>
                                </button>
                                <button type="button" class="btn ${isPaid ? 'btn-outline-warning' : 'btn-outline-success'} btnToggleOfficialStatus" data-id="${item.CourseOfficialId}" data-status="${isPaid ? 'PENDING' : 'PAID'}" title="Mark as ${isPaid ? 'PENDING' : 'PAID'}">
                                    <i class="fa ${isPaid ? 'fa-clock-o' : 'fa-check'}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#officialRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#officialPagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadOfficials(currentPage);
            });

            $(".btnEditOfficial").off("click").on("click", function () {
                const id = $(this).data("id");
                editOfficial(id);
            });

            $(".btnToggleOfficialStatus").off("click").on("click", function () {
                const id = $(this).data("id");
                const newStatus = $(this).data("status");
                updateOfficialStatus(id, newStatus);
            });
        }

        function resetOfficialModal() {
            $("#hdn_CourseOfficialId").val("0");
            $("#hdn_OfficialPersonId").val("0");
            $("#txt_OfficialName").val("");
            $("#ddl_OfficialBatch").val("");
            $("#txt_OfficialRole").val("Instructor");
            $("#ddl_OfficialPaymentStatus").val("PENDING");
            $("#txt_HowrahToDest").val("0");
            $("#txt_DestToHowrah").val("0");
            $("#txt_OfficialAmount").val("0");
            $("#txt_OfficialRemarks").val("");
            $("#officialModalTitle").html('<i class="fa fa-user-secret"></i> Add Course Official');
        }

        function editOfficial(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetCourseOfficialById?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const o = extractObject(res);
                    if (o) {
                        $("#hdn_CourseOfficialId").val(o.CourseOfficialId);
                        $("#hdn_OfficialPersonId").val(o.PersonId || 0);
                        $("#txt_OfficialName").val(o.CourseOfficialName);
                        $("#ddl_OfficialBatch").val(o.CourseBatchId);
                        $("#txt_OfficialRole").val(o.RoleName);
                        $("#ddl_OfficialPaymentStatus").val(o.PaymentStatus || "PENDING");
                        $("#txt_HowrahToDest").val(o.HowrahToDestination);
                        $("#txt_DestToHowrah").val(o.DestinationToHowrah);
                        $("#txt_OfficialAmount").val(o.Amount);
                        $("#txt_OfficialRemarks").val(o.Remarks);

                        $("#officialModalTitle").html('<i class="fa fa-pencil"></i> Edit Course Official');
                        $("#officialModal").modal("show");
                    } else {
                        toastr.warning("Could not load official details.", "Warning");
                    }
                },
                error: handleAjaxError
            });
        }

        function saveOfficial() {
            const officialId = parseInt($("#hdn_CourseOfficialId").val()) || 0;
            const personId = parseInt($("#hdn_OfficialPersonId").val()) || 0;
            const name = $("#txt_OfficialName").val().trim();
            const batchId = parseInt($("#ddl_OfficialBatch").val()) || 0;
            const role = $("#txt_OfficialRole").val();
            const status = $("#ddl_OfficialPaymentStatus").val();
            const h2d = parseFloat($("#txt_HowrahToDest").val()) || 0;
            const d2h = parseFloat($("#txt_DestToHowrah").val()) || 0;
            const amount = parseFloat($("#txt_OfficialAmount").val()) || 0;
            const remarks = $("#txt_OfficialRemarks").val().trim();

            if (!name || !batchId || !role) {
                toastr.warning("Official Name, Course Batch, and Role are required.", "Validation Error");
                return;
            }

            const dto = {
                CourseOfficialId: officialId,
                PersonId: personId,
                OfficialName: name,
                CourseOfficialName: name,

                CourseBatchId: batchId,
                Role: role,
                RoleName: role,
                PaymentStatus: status,
                HowrahToDestination: h2d ? h2d.toString() : "0",
                DestinationToHowrah: d2h ? d2h.toString() : "0",
                Amount: amount,
                Remarks: remarks
            };

            const isEdit = officialId > 0;
            const endpoint = isEdit ? "/CourseManagement/UpdateCourseOfficial" : "/CourseManagement/AddCourseOfficial";

            showLoader();
            $.ajax({
                url: _BaseURL + endpoint,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(isEdit ? "Official updated!" : "Official added successfully!", "Success");
                        $("#officialModal").modal("hide");
                        loadOfficials(currentPage);
                    } else {
                        toastr.error(res.Response || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }

        function updateOfficialStatus(id, newStatus) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/UpdateCourseOfficialPaymentStatus?id=${id}&paymentStatus=${newStatus}`,
                type: "POST",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(`Payment status marked as ${newStatus}!`, "Success");
                        loadOfficials(currentPage);
                    } else {
                        toastr.error(res.Response || "Failed to update status.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }
    }

    // ==========================================
    // 8. EXPENSES MANAGEMENT PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "expenses") {
        let currentPage = 1;
        const pageSize = 10;

        loadCourseDropdowns(["#expense_FilterCourse"]);
        loadBatchDropdowns(["#ddl_ExpenseBatch"]);
        loadExpenses(currentPage);

        $("#btnAddNewExpense").on("click", function () {
            resetExpenseModal();
            $("#expenseModal").modal("show");
        });

        $("#btnFilterExpenses").on("click", function () {
            currentPage = 1;
            loadExpenses(currentPage);
        });

        $("#btnResetExpenses").on("click", function () {
            $("#expense_FilterCourse").val("");
            $("#expense_FilterYear").val("");
            $("#expense_FilterCategory").val("");
            $("#expense_FilterPaymentMode").val("");
            $("#expense_Search").val("");
            $("#expense_DateFrom").val("");
            $("#expense_DateTo").val("");
            currentPage = 1;
            loadExpenses(currentPage);
        });

        $("#btnSaveExpense").on("click", function () {
            saveExpense();
        });

        function loadExpenses(page) {
            showLoader();
            const courseId = $("#expense_FilterCourse").val();
            const year = $("#expense_FilterYear").val();
            const category = $("#expense_FilterCategory").val();
            const mode = $("#expense_FilterPaymentMode").val();
            const search = $("#expense_Search").val();
            const dateFrom = $("#expense_DateFrom").val();
            const dateTo = $("#expense_DateTo").val();

            let url = `${_BaseURL}/CourseManagement/GetAllCourseExpense?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
            if (courseId) url += `&courseId=${courseId}`;
            if (year) url += `&year=${year}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            if (mode) url += `&paymentMode=${encodeURIComponent(mode)}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;
            if (dateTo) url += `&dateTo=${dateTo}`;

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const list = extractList(res);
                    const totalRecords = res.TotalItem || res.TotalRecords || res.totalRecords || list.length;
                    bindExpensesTable(list, page, totalRecords);
                },
                error: handleAjaxError
            });
        }

        function bindExpensesTable(list, page, totalRecords) {
            const $tbody = $("#tbl_Expenses tbody");
            $tbody.empty();

            if (list.length === 0) {
                $tbody.html('<tr><td colspan="9" class="text-center py-4 text-muted">No expenses recorded.</td></tr>');
                $("#expenseRecordInfo").text("Showing 0 records");
                $("#expensePagination").empty();
                return;
            }

            let html = "";
            const startIndex = (page - 1) * pageSize;

            list.forEach((item) => {
                html += `
                    <tr>
                        <td>${formatDateDisplay(item.ExpenseDate)}</td>
                        <td>${item.CourseName || '-'}<br/><span class="badge bg-light text-muted border">${item.CourseYear || '-'}</span></td>
                        <td><span class="badge bg-secondary">${item.ExpenseCategory || 'General'}</span></td>
                        <td class="font-weight-bold text-dark">${item.Description || '-'}</td>
                        <td class="text-end font-weight-bold text-danger">${formatMoney(item.Amount)}</td>
                        <td>${item.PaidBy || '-'}</td>
                        <td class="text-center"><span class="badge bg-info text-dark">${item.PaymentMode || 'CASH'}</span></td>
                        <td class="small text-muted">${item.Remarks || '-'}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-sm btn-outline-primary btnEditExpense" data-id="${item.CourseExpenseId}" title="Edit Expense">
                                <i class="fa fa-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $tbody.html(html);
            $("#expenseRecordInfo").text(`Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalRecords)} of ${totalRecords} entries`);

            renderPaginationLocal("#expensePagination", page, totalRecords, pageSize, function (newPage) {
                currentPage = newPage;
                loadExpenses(currentPage);
            });

            $(".btnEditExpense").off("click").on("click", function () {
                const id = $(this).data("id");
                editExpense(id);
            });
        }

        function resetExpenseModal() {
            $("#hdn_CourseExpenseId").val("0");
            $("#ddl_ExpenseBatch").val("");
            $("#txt_ExpenseDate").val(new Date().toISOString().substring(0, 10));
            $("#ddl_ExpenseCategory").val("Food & Catering");
            $("#txt_ExpenseAmount").val("");
            $("#txt_PaidBy").val("");
            $("#ddl_ExpensePaymentMode").val("CASH");
            $("#txt_ExpenseDescription").val("");
            $("#txt_ExpenseRemarks").val("");
            $("#expenseModalTitle").html('<i class="fa fa-credit-card"></i> Add Course Expense');
        }

        function editExpense(id) {
            showLoader();
            $.ajax({
                url: `${_BaseURL}/CourseManagement/GetCourseExpenseById?id=${id}`,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const ex = extractObject(res);
                    if (ex) {
                        $("#hdn_CourseExpenseId").val(ex.CourseExpenseId);
                        $("#ddl_ExpenseBatch").val(ex.CourseBatchId);
                        $("#txt_ExpenseDate").val(ex.ExpenseDate ? ex.ExpenseDate.substring(0, 10) : "");
                        $("#ddl_ExpenseCategory").val(ex.ExpenseCategory);
                        $("#txt_ExpenseAmount").val(ex.Amount);
                        $("#txt_PaidBy").val(ex.PaidBy);
                        $("#ddl_ExpensePaymentMode").val(ex.PaymentMode || "CASH");
                        $("#txt_ExpenseDescription").val(ex.Description);
                        $("#txt_ExpenseRemarks").val(ex.Remarks);

                        $("#expenseModalTitle").html('<i class="fa fa-pencil"></i> Edit Course Expense');
                        $("#expenseModal").modal("show");
                    } else {
                        toastr.warning("Could not load expense details.", "Warning");
                    }
                },
                error: handleAjaxError
            });
        }

        function saveExpense() {
            const expenseId = parseInt($("#hdn_CourseExpenseId").val()) || 0;
            const batchId = parseInt($("#ddl_ExpenseBatch").val()) || 0;
            const expenseDate = $("#txt_ExpenseDate").val();
            const category = $("#ddl_ExpenseCategory").val();
            const amount = parseFloat($("#txt_ExpenseAmount").val()) || 0;
            const paidBy = $("#txt_PaidBy").val().trim();
            const mode = $("#ddl_ExpensePaymentMode").val();
            const desc = $("#txt_ExpenseDescription").val().trim();
            const remarks = $("#txt_ExpenseRemarks").val().trim();

            if (!batchId || !expenseDate || !category || amount <= 0 || !desc) {
                toastr.warning("Please fill in batch, date, category, valid amount (> 0), and description.", "Validation Error");
                return;
            }

            const dto = {
                CourseExpenseId: expenseId,
                CourseBatchId: batchId,
                ExpenseDate: expenseDate,
                ExpenseCategory: category,
                Amount: amount,
                PaidBy: paidBy,
                PaymentMode: mode,
                Description: desc,
                Remarks: remarks
            };

            const isEdit = expenseId > 0;
            const endpoint = isEdit ? "/CourseManagement/UpdateCourseExpense" : "/CourseManagement/AddCourseExpense";

            showLoader();
            $.ajax({
                url: _BaseURL + endpoint,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(dto),
                success: function (res) {
                    hideLoader();
                    if (isSuccessResponse(res)) {
                        toastr.success(isEdit ? "Expense updated!" : "Expense recorded successfully!", "Success");
                        $("#expenseModal").modal("hide");
                        loadExpenses(currentPage);
                    } else {
                        toastr.error(res.Response || "Operation failed.", "Error");
                    }
                },
                error: handleAjaxError
            });
        }
    }

    // ==========================================
    // 9. REPORTS & FINANCIAL ANALYTICS PAGE
    // ==========================================
    if (controller_name === "coursemanagement" && action_name === "reports") {
        loadCourseDropdowns(["#report_FilterCourse"]);
        loadReportsData();

        $("#btnFilterReports").off("click").on("click", function (e) {
            e.preventDefault();
            loadReportsData();
        });

        $("#btnResetReports").off("click").on("click", function (e) {
            e.preventDefault();
            $("#report_FilterCourse").val("").trigger("change");
            $("#report_FilterYear").val(new Date().getFullYear());
            $("#report_DateFrom").val("");
            $("#report_DateTo").val("");
            loadReportsData();
        });

        function renderSegmentTable(segments) {
            let segHtml = "";
            if (!segments || segments.length === 0) {
                segHtml = '<tr><td colspan="8" class="text-center py-4 text-muted">No segment summary available.</td></tr>';
            } else {
                segments.forEach(seg => {
                    const cName = seg.CourseName || seg.courseName || seg.Name || seg.name || 'Segment';
                    const pCount = seg.ParticipantCount ?? seg.participantCount ?? seg.TotalParticipants ?? seg.totalParticipants ?? 0;
                    const collected = seg.TotalCollected ?? seg.totalCollected ?? seg.TotalCollection ?? seg.totalCollection ?? seg.TotalPaid ?? seg.totalPaid ?? 0;
                    const due = seg.TotalDue ?? seg.totalDue ?? 0;
                    const refund = seg.TotalRefund ?? seg.totalRefund ?? 0;
                    const expense = seg.TotalExpense ?? seg.totalExpense ?? 0;
                    const officialPaid = seg.TotalOfficialPaid ?? seg.totalOfficialPaid ?? seg.OfficialPaid ?? 0;
                    
                    let netInc = seg.NetIncome ?? seg.netIncome ?? seg.NetCourseIncome ?? seg.netCourseIncome;
                    if (netInc === undefined || netInc === null || isNaN(netInc)) {
                        netInc = collected - refund - expense - officialPaid;
                    }

                    segHtml += `
                        <tr>
                            <td class="font-weight-bold text-primary">${cName}</td>
                            <td class="text-center">${pCount}</td>
                            <td class="text-end text-success font-weight-bold">${formatMoney(collected)}</td>
                            <td class="text-end text-warning">${formatMoney(due)}</td>
                            <td class="text-end text-danger">${formatMoney(refund)}</td>
                            <td class="text-end text-secondary">${formatMoney(expense)}</td>
                            <td class="text-end text-info">${formatMoney(officialPaid)}</td>
                            <td class="text-end font-weight-bold ${netInc >= 0 ? 'text-success' : 'text-danger'}">${formatMoney(netInc)}</td>
                        </tr>
                    `;
                });
            }
            $("#rep_SegmentTable tbody").html(segHtml);
        }

        function renderYearTable(years) {
            let yrHtml = "";
            if (!years || years.length === 0) {
                yrHtml = '<tr><td colspan="7" class="text-center py-4 text-muted">No year-wise records found.</td></tr>';
            } else {
                years.forEach(yr => {
                    const cYear = yr.CourseYear || yr.courseYear || yr.Year || yr.year || '-';
                    const cName = yr.CourseName || yr.courseName || yr.Name || yr.name || 'All Courses';
                    const pCount = yr.ParticipantCount ?? yr.participantCount ?? yr.TotalParticipants ?? yr.totalParticipants ?? 0;
                    const collected = yr.TotalCollected ?? yr.totalCollected ?? yr.TotalCollection ?? yr.totalCollection ?? yr.TotalPaid ?? yr.totalPaid ?? 0;
                    const refund = yr.TotalRefund ?? yr.totalRefund ?? 0;
                    const expense = yr.TotalExpense ?? yr.totalExpense ?? 0;
                    
                    let netInc = yr.NetIncome ?? yr.netIncome ?? yr.NetCourseIncome ?? yr.netCourseIncome;
                    if (netInc === undefined || netInc === null || isNaN(netInc)) {
                        netInc = collected - refund - expense;
                    }

                    yrHtml += `
                        <tr>
                            <td><span class="badge bg-primary fs-6">${cYear}</span></td>
                            <td class="font-weight-bold">${cName}</td>
                            <td class="text-center font-weight-bold">${pCount}</td>
                            <td class="text-end text-success font-weight-bold">${formatMoney(collected)}</td>
                            <td class="text-end text-danger">${formatMoney(refund)}</td>
                            <td class="text-end text-secondary">${formatMoney(expense)}</td>
                            <td class="text-end font-weight-bold ${netInc >= 0 ? 'text-success' : 'text-danger'}">${formatMoney(netInc)}</td>
                        </tr>
                    `;
                });
            }
            $("#rep_YearTable tbody").html(yrHtml);
        }

        function loadReportsData() {
            showLoader();
            const courseId = $("#report_FilterCourse").val();
            let year = $("#report_FilterYear").val();
            if (!year && !courseId) {
                year = new Date().getFullYear();
                $("#report_FilterYear").val(year);
            }
            const dateFrom = $("#report_DateFrom").val();
            const dateTo = $("#report_DateTo").val();

            let queryParams = [];
            if (courseId) queryParams.push(`courseId=${courseId}`);
            if (year) queryParams.push(`year=${year}`);
            if (dateFrom) queryParams.push(`dateFrom=${dateFrom}`);
            if (dateTo) queryParams.push(`dateTo=${dateTo}`);

            const query = queryParams.length > 0 ? "?" + queryParams.join("&") : "";

            // 1. Overall Financial Report & Summary
            $.ajax({
                url: _BaseURL + "/CourseManagement/GetCourseFinancialReport" + query,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    hideLoader();
                    const r = extractObject(res) || {};
                    const s = r.Summary || r.summary || r;

                    const regTotal = s.TotalRegistrations ?? s.totalRegistrations ?? s.TotalParticipants ?? s.totalParticipants ?? 0;
                    let regConfirmed = s.ConfirmedCount ?? s.confirmedCount ?? s.Confirmed ?? s.confirmed ?? 0;
                    let regCancelled = s.CancelledCount ?? s.cancelledCount ?? s.Cancelled ?? s.cancelled ?? 0;
                    let regRegistered = s.RegisteredCount ?? s.registeredCount ?? s.Registered ?? s.registered ?? 0;
                    let regCompleted = s.CompletedCount ?? s.completedCount ?? s.Completed ?? s.completed ?? 0;
                    let regWaiting = s.WaitingCount ?? s.waitingCount ?? s.Waiting ?? s.waiting ?? 0;

                    const finCollection = s.TotalCollection ?? s.totalCollection ?? s.TotalCollected ?? s.totalCollected ?? s.TotalPaid ?? s.totalPaid ?? 0;
                    const finRefund = s.TotalRefund ?? s.totalRefund ?? 0;
                    const finExpense = s.TotalExpense ?? s.totalExpense ?? 0;
                    const finOfficialPaid = s.TotalOfficialPaid ?? s.totalOfficialPaid ?? s.OfficialPaid ?? 0;
                    
                    let netIncome = s.NetCourseIncome ?? s.netCourseIncome ?? s.NetIncome ?? s.netIncome;
                    if (netIncome === undefined || netIncome === null || isNaN(netIncome)) {
                        netIncome = finCollection - finRefund - finExpense - finOfficialPaid;
                    }

                    $("#rep_RegTotal").text(regTotal);
                    $("#rep_RegConfirmed").text(regConfirmed);
                    $("#rep_RegCancelled").text(regCancelled);
                    $("#rep_RegRegistered").text(regRegistered);
                    $("#rep_RegCompleted").text(regCompleted);
                    $("#rep_RegWaiting").text(regWaiting);

                    $("#rep_FinCollection").text(formatMoney(finCollection));
                    $("#rep_FinRefund").text(formatMoney(finRefund));
                    $("#rep_FinExpense").text(formatMoney(finExpense));
                    $("#rep_FinOfficialPaid").text(formatMoney(finOfficialPaid));
                    $("#rep_NetCourseIncome").text(formatMoney(netIncome));

                    // If status counts are zero or total is zero, fetch enrollment list to calculate breakdown dynamically
                    if ((regConfirmed + regCancelled + regRegistered + regCompleted + regWaiting === 0) || regTotal === 0) {
                        let enrollQuery = "?pageSize=1000";
                        if (year) enrollQuery += `&year=${year}`;
                        if (courseId) enrollQuery += `&courseId=${courseId}`;

                        $.ajax({
                            url: _BaseURL + "/CourseManagement/GetAllEnrollment" + enrollQuery,
                            type: "GET",
                            dataType: "json",
                            success: function (enrollRes) {
                                const enrollList = extractList(enrollRes);
                                if (enrollList && enrollList.length > 0) {
                                    let countConf = 0, countCanc = 0, countReg = 0, countComp = 0, countWait = 0;
                                    enrollList.forEach(eItem => {
                                        const st = (eItem.EnrollmentStatus || eItem.Status || 'REGISTERED').toUpperCase();
                                        if (st === "CONFIRMED") countConf++;
                                        else if (st === "CANCELLED") countCanc++;
                                        else if (st === "COMPLETED") countComp++;
                                        else if (st === "WAITING") countWait++;
                                        else countReg++;
                                    });

                                    $("#rep_RegTotal").text(enrollList.length);
                                    $("#rep_RegConfirmed").text(countConf);
                                    $("#rep_RegCancelled").text(countCanc);
                                    $("#rep_RegRegistered").text(countReg);
                                    $("#rep_RegCompleted").text(countComp);
                                    $("#rep_RegWaiting").text(countWait);
                                }
                            }
                        });
                    }

                    // Segment-Wise Table
                    const segments = extractList(r.SegmentSummaries || r.segmentSummaries || r.segments);
                    if (segments.length > 0) {
                        renderSegmentTable(segments);
                    } else {
                        // Secondary call for Segment Summary
                        let segQuery = "";
                        let segParams = [];
                        if (year) segParams.push(`year=${year}`);
                        if (dateFrom) segParams.push(`dateFrom=${dateFrom}`);
                        if (dateTo) segParams.push(`dateTo=${dateTo}`);
                        if (segParams.length > 0) segQuery = "?" + segParams.join("&");

                        $.ajax({
                            url: _BaseURL + "/CourseManagement/GetCourseSummaryBySegment" + segQuery,
                            type: "GET",
                            dataType: "json",
                            success: function (segRes) {
                                const segList = extractList(segRes);
                                renderSegmentTable(segList);
                            },
                            error: function () {
                                renderSegmentTable([]);
                            }
                        });
                    }
                },
                error: handleAjaxError
            });

            // 2. Year-Wise Summary
            $.ajax({
                url: _BaseURL + "/CourseManagement/GetYearWiseCourseSummary" + query,
                type: "GET",
                dataType: "json",
                success: function (res) {
                    const years = extractList(res);
                    if (years.length > 0) {
                        renderYearTable(years);
                    } else {
                        $.ajax({
                            url: _BaseURL + "/CourseManagement/GetYearWiseCourseSummary",
                            type: "GET",
                            dataType: "json",
                            success: function (yRes) {
                                renderYearTable(extractList(yRes));
                            },
                            error: function () {
                                renderYearTable([]);
                            }
                        });
                    }
                }
            });
        }
    }
});
