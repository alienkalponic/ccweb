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
    }

});