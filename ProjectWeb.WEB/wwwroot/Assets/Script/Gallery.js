$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    if (action_name === "details") {
        const segments = window.location.pathname.split('/');
        const id = segments[segments.length - 1];


        const testimonials = [
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course1.JPG"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course8.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course2.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course3.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course4.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course5.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course6.jpg"
            },
            {
                id: "1",
                src:
                    "/Assets/GalleryDetails/course7.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb1.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb2.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb3.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb4.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb5.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb6.jpg"
            },
            {
                id: "2",
                src:
                    "/Assets/GalleryDetails/climb7.jpg"
            },
            //{
            //    id: "2",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer1.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer2.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer3.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer4.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer5.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer6.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer7.jpg"
            },
            {
                id: "3",
                src:
                    "/Assets/GalleryDetails/ssummer8.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp1.JPG"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp2.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp3.jpeg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp4.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp5.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp6.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp7.jpg"
            },
            {
                id: "4",
                src:
                    "/Assets/GalleryDetails/exp8.jpg"
            },
            {
                id: "5",
                src:
                    "/Assets/GalleryDetails/high1.jpg"
            },
            {
                id: "5",
                src:
                    "/Assets/GalleryDetails/high2.jpg"
            },
            {
                id: "5",
                src:
                    "/Assets/GalleryDetails/high3.jpg"
            },
            {
                id: "5",
                src:
                    "/Assets/GalleryDetails/high4.jpg"
            },
            //{
            //    id: "5",
            //    src:
            //        "/Assets/GalleryDetails/high5.jpg"
            //},
            //{
            //    id: "5",
            //    src:
            //        "/Assets/GalleryDetails/high1.jpg"
            //},
            //{
            //    id: "5",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "5",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/testimonials6.jpeg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},
            //{
            //    id: "6",
            //    src:
            //        "/Assets/GalleryDetails/male.jpg"
            //},

        ];
        detailsImageGalleryBind();
        function detailsImageGalleryBind() {
            let $datset = $("#detailsimageBind");

            $.each(testimonials, function (key, val) {
                let _stringArray = [], _stringHtml = '';
                var $row = $(val);
                const dataid = $row[0].id;
                if (id === dataid) {
                    _stringArray.push('<div class="gallery-item" data-index="' + $row[0].id + '">');
                    _stringArray.push('<img src="' + $row[0].src + '" alt="Photo 1" class="gallery-item-img">');
                    _stringArray.push('<div class="gallery-item-overlay">');
                    _stringArray.push('<i class="fa fa-search-plus"></i>');
                    _stringArray.push('</div>');
                    _stringArray.push('</div>');

                    if (_stringArray.length > 0) {
                        _stringHtml = _stringArray.join('');

                        var htmlobj = $(_stringHtml);
                    }
                    if (_stringHtml.length > 0) {
                        var htmlobj = $(_stringHtml);
                        $datset.append(htmlobj);
                    }
                }
            });
            if (typeof window.initGallery === "function") {
                window.initGallery();
            }
        }


        
    }
});