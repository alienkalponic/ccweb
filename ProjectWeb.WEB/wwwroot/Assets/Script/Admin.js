$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    if (action_name === "bannercontent") {
        

        $("#btnAddNew").on("click", function () {
            
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

            // clear form
            $('#bannar_form')[0].reset();

            // clear image previews
            $('#targetImgback').attr('src', '');
            $('#targetImgsplit').attr('src', '');

        });

        $(document).on("click", "#btnSave", function () {
            var fd = $.formdata("#bannar_form");
            var files = $("#back_img").get(0).files;
            const title = $("#txt_BannerTitle").val().trim();
            const caption = $("#txt_BannerHeading").val().trim();
            const displayOrder = $("#txt_DisplayPriority").val().trim();

            //if (fileInput.files.length === 0) {
            //    $.alert({ title: "Error", content: "Please select background image", type: "red" });
            //    return;
            //}

            //const file = fileInput.files[0];
            

            // 2️⃣ File type validation
            //const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            //if (!allowedTypes.includes(files.type)) {
            //    $.alert({ title: "Error", content: "Only JPG, PNG, WEBP images are allowed", type: "red" });
            //    return;
            //}

            //// 3️⃣ File size validation (example: 2MB)
            //const maxSize = 2 * 1024 * 1024;
            //if (files.size > maxSize) {
            //    $.alert({ title: "Error", content: "Image size must be less than 2MB", type: "red" });
            //    return;
            //}

            //// 4️⃣ Text validations
            //if (title === "") {
            //    $.alert({ title: "Error", content: "Banner title is required", type: "red" });
            //    return;
            //}

            //if (caption === "") {
            //    $.alert({ title: "Error", content: "Banner caption is required", type: "red" });
            //    return;
            //}

            //if (displayOrder === "") {
            //    $.alert({ title: "Error", content: "Display priority is required", type: "red" });
            //    return;
            //}

            //if (isNaN(displayOrder) || Number(displayOrder) < 0) {
            //    $.alert({ title: "Error", content: "Display priority must be a valid number", type: "red" });
            //    return;
            //}


            $.ajax({
                url: _BaseURL + "/Admin/CreateBanner",
                type: 'POST',
                data: fd,
                enctype: "multipart/form-data",
                contentType: false,
                processData: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    if ($.parseBool(data.Status)) {



                        $.alert({
                            title: "Success", content: data.Response, type: "green", button: {
                                ok: function () {

                                }
                            }

                        });
                        $("#bannar_form").trigger('reset');
                        $("#addBannerModal").modal('hide');
                        
                    }
                    else {

                        //$.alert({ title: "Error", content: "Oops!...Something went wrong", type: "orange" })
                        $.alert({ title: "Error", content: data.Response, type: "orange" })
                    }

                },
                error: function () {

                    //$.alert({ title: "Error", content: "Oops!...Something went wrong", type: "red" });
                },

            });

        })
    }

});