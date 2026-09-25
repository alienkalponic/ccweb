$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    // Global helper for Real-Time Instagram API Integration via Backend Controller Proxy
    window.initInstagramRealTimeFeed = function () {
        const $container = $("#instagramFeedContainer");
        if ($container.length === 0) return;

        const feedEndpoint = _BaseURL + "/GalleryContent/GetInstagramFeed";

        $.ajax({
            url: feedEndpoint,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response && response.data && response.data.length > 0) {
                    $container.empty(); // Replace fallback with ACTUAL live Instagram posts!

                    $.each(response.data, function (idx, post) {
                        // Extract actual thumbnail image URL from Instagram
                        let imgUrl = post.media_url;
                        if (post.media_type === "VIDEO" && post.thumbnail_url) {
                            imgUrl = post.thumbnail_url;
                        }

                        if (!imgUrl) return; // skip if no image URL

                        const permalink = post.permalink || "https://instagram.com";
                        const captionText = post.caption ? post.caption : "Climbers' Circle Expedition Moment";
                        const likes = post.like_count !== undefined ? post.like_count : "♥";
                        const comments = post.comments_count !== undefined ? post.comments_count : "💬";

                        const cardHtml = `
                            <div class="insta-card">
                                <a href="${permalink}" target="_blank" rel="noopener noreferrer">
                                    <img src="${imgUrl}" alt="Actual Instagram Post" loading="lazy">
                                    <div class="insta-card-overlay">
                                        <div class="insta-card-top">
                                            <div class="insta-icon-badge">
                                                <i class="fa-brands fa-instagram"></i>
                                            </div>
                                            <div class="insta-metrics">
                                                <span><i class="fa-solid fa-heart"></i> ${likes}</span>
                                                <span><i class="fa-solid fa-comment"></i> ${comments}</span>
                                            </div>
                                        </div>
                                        <div class="insta-caption">
                                            ${captionText}
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                        $container.append(cardHtml);
                    });
                } else if (response && response.error) {
                    console.warn("Instagram API Notice:", response.message, response.error);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error connecting to Instagram proxy endpoint:", error);
            }
        });
    };

    // Auto-trigger on page load
    window.initInstagramRealTimeFeed();

    if (action_name === "details") {
        const segments = window.location.pathname.split('/');
        const id = segments[segments.length - 1];

        // Album Metadata Mapping
        const albumMeta = {
            "1": {
                title: "Annual Training Courses",
                category: "TRAINING SKILLS",
                subtitle: "Basic & advanced mountaineering skills, knot techniques, & endurance training."
            },
            "2": {
                title: "Rock Climbing",
                category: "TECHNICAL ROCK",
                subtitle: "Bouldering sessions, artificial & natural rock face scaling."
            },
            "3": {
                title: "Summer Camp",
                category: "YOUTHOUTDOOR CAMP",
                subtitle: "Youth adventure workshops, tent pitching, & team building activities."
            },
            "4": {
                title: "Himalayan Expedition",
                category: "SUMMIT EXPEDITION",
                subtitle: "Summit attempts, glacier crossing, and technical high-altitude climbs."
            },
            "5": {
                title: "High-Altitude Treks",
                category: "TREKKING & TRAILS",
                subtitle: "Breathtaking Himalayan trail journeys, mountain passes, and alpine scenery."
            }
        };

        const testimonials = [
            // Album 1 Photos
            { id: "1", src: "/Assets/GalleryDetails/course1.JPG" },
            { id: "1", src: "/Assets/GalleryDetails/course8.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course2.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course3.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course4.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course5.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course6.jpg" },
            { id: "1", src: "/Assets/GalleryDetails/course7.jpg" },

            // Album 2 Photos
            { id: "2", src: "/Assets/GalleryDetails/climb1.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb2.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb3.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb4.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb5.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb6.jpg" },
            { id: "2", src: "/Assets/GalleryDetails/climb7.jpg" },

            // Album 3 Photos
            { id: "3", src: "/Assets/GalleryDetails/ssummer1.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer2.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer3.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer4.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer5.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer6.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer7.jpg" },
            { id: "3", src: "/Assets/GalleryDetails/ssummer8.jpg" },

            // Album 4 Photos
            { id: "4", src: "/Assets/GalleryDetails/exp1.JPG" },
            { id: "4", src: "/Assets/GalleryDetails/exp2.jpg" },
            { id: "4", src: "/Assets/GalleryDetails/exp3.jpeg" },
            { id: "4", src: "/Assets/GalleryDetails/exp4.jpg" },
            { id: "4", src: "/Assets/GalleryDetails/exp5.jpg" },
            { id: "4", src: "/Assets/GalleryDetails/exp6.jpg" },
            { id: "4", src: "/Assets/GalleryDetails/exp7.jpg" },
            { id: "4", src: "/Assets/GalleryDetails/exp8.jpg" },

            // Album 5 Photos
            { id: "5", src: "/Assets/GalleryDetails/high1.jpg" },
            { id: "5", src: "/Assets/GalleryDetails/high2.jpg" },
            { id: "5", src: "/Assets/GalleryDetails/high3.jpg" },
            { id: "5", src: "/Assets/GalleryDetails/high4.jpg" }
        ];

        detailsImageGalleryBind();

        function detailsImageGalleryBind() {
            let $datset = $("#detailsimageBind");
            $datset.empty();


            const apiUrl = _BaseURL + "/GalleryContent/GetGalleryDetails?id=" + id;
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

                        //$("#dynamicPhotoCountText").html('<i class="fa-regular fa-images"></i> Showing ' + matchingPhotos.length + ' High-Res Photos');

                        //if (matchingPhotos.length === 0) {
                        //    $datset.append('<div class="no-albums-found"><i class="fa-solid fa-images fa-2x mb-3"></i><p>No photos available in this album yet.</p></div>');
                        //    return;
                        //}
                        var _apiUrl = $("#apiurl").val();
                        $.each(data, function (index, val) {
                            let photoNumber = index + 1;
                            var src = _apiUrl + val.ImagePath1;
                            let htmlCard = `
                                <div class="gallery-item" data-index="${index}">
                                    <img src="${src}" alt="${currentMeta.title} Photo ${photoNumber}" class="gallery-item-img" loading="lazy">
                                    <div class="gallery-item-overlay">
                                        <div class="gallery-zoom-icon">
                                            <i class="fa-solid fa-expand"></i>
                                        </div>
                                        <span class="gallery-item-caption">${currentMeta.title} #${photoNumber}</span>
                                    </div>
                                </div>
                            `;
                            $datset.append(htmlCard);
                        });
                       
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

            const currentMeta = albumMeta[id] || {
                title: "Expedition Gallery",
                category: "ALBUM ARCHIVE",
                subtitle: "Captured moments from our thrilling adventures"
            };

            // Set dynamic header titles

            //$("#dynamicAlbumTitle").text(currentMeta.title);
            //$("#dynamicAlbumSubtitle").text(currentMeta.subtitle);
            //$("#dynamicAlbumCategory").html('<i class="fa-solid fa-mountain-sun"></i> ' + currentMeta.category);

            //let matchingPhotos = testimonials.filter(val => val.id === id);
            
            //$("#dynamicPhotoCountText").html('<i class="fa-regular fa-images"></i> Showing ' + matchingPhotos.length + ' High-Res Photos');

            //if (matchingPhotos.length === 0) {
            //    $datset.append('<div class="no-albums-found"><i class="fa-solid fa-images fa-2x mb-3"></i><p>No photos available in this album yet.</p></div>');
            //    return;
            //}

            //$.each(matchingPhotos, function (index, val) {
            //    let photoNumber = index + 1;
            //    let htmlCard = `
            //        <div class="gallery-item" data-index="${index}">
            //            <img src="${val.src}" alt="${currentMeta.title} Photo ${photoNumber}" class="gallery-item-img" loading="lazy">
            //            <div class="gallery-item-overlay">
            //                <div class="gallery-zoom-icon">
            //                    <i class="fa-solid fa-expand"></i>
            //                </div>
            //                <span class="gallery-item-caption">${currentMeta.title} #${photoNumber}</span>
            //            </div>
            //        </div>
            //    `;
            //    $datset.append(htmlCard);
            //});

            // Initialize Lightbox Modal Controller
            if (typeof window.initGallery === "function") {
                window.initGallery();
            }
        }
    }
});