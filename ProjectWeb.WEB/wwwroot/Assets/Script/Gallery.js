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

    if (action_name === "details" || window.location.pathname.toLowerCase().includes("/details")) {
        const urlParams = new URLSearchParams(window.location.search);
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "";
        const numericPathId = (!isNaN(lastSegment) && lastSegment.toLowerCase() !== "details") ? lastSegment : "";

        const id = ($("#albumId").val() && $("#albumId").val() !== "0")
            ? $("#albumId").val()
            : (urlParams.get("id") && urlParams.get("id") !== "0"
                ? urlParams.get("id")
                : (numericPathId || $("#galleryItemsId").val() || urlParams.get("galleryItemsId") || "1"));

        const gItemId = $("#galleryItemsId").val() || urlParams.get("galleryItemsId") || id;

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
            },
            "8": {
                title: "GAJABURU SOUTH FACE",
                category: "LEAD CLIMB",
                subtitle: "Traditional multi-pitch route ascent and technical rock climb documentation."
            },
            "32": {
                title: "GAJABURU SOUTH FACE",
                category: "LEAD CLIMB",
                subtitle: "Traditional multi-pitch route ascent and technical rock climb documentation."
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

            // Retrieve dynamic album metadata from DOM elements or URL query parameters
            const serverTitle = ($("#serverAlbumTitle").val() || urlParams.get("title") || "").trim();
            const serverCategory = ($("#serverCategory").val() || urlParams.get("category") || "").trim();
            const rawGalleryItemsId = $("#galleryItemsId").val() || urlParams.get("galleryItemsId");
            let galleryItemIdNum = parseInt(rawGalleryItemsId || gItemId || "0", 10);

            if (id === "32" || id === "8") {
                if (!galleryItemIdNum || galleryItemIdNum <= 0) {
                    galleryItemIdNum = 32;
                }
            }

            const fallbackMeta = albumMeta[id] || albumMeta[gItemId] || {
                title: id === "32" || id === "8" ? "GAJABURU SOUTH FACE" : "Expedition Gallery",
                category: id === "32" || id === "8" ? "LEAD CLIMB" : "ALBUM ARCHIVE",
                subtitle: id === "32" || id === "8" 
                    ? "Traditional multi-pitch route ascent and technical rock climb documentation." 
                    : "Captured moments from our thrilling adventures"
            };

            const currentTitle = serverTitle !== "" && serverTitle !== "Adventure Gallery" 
                ? serverTitle 
                : ((id === "32" || id === "8") ? "GAJABURU SOUTH FACE" : fallbackMeta.title);
            const currentCategory = serverCategory !== "" 
                ? serverCategory 
                : fallbackMeta.category;
            const currentSubtitle = (currentTitle.toUpperCase().includes("GAJABURU") || id === "32" || id === "8")
                ? "Traditional multi-pitch route ascent and technical rock climb documentation."
                : (serverCategory !== "" 
                    ? `Official ${serverCategory} photographic documentation & expedition field captures` 
                    : fallbackMeta.subtitle);

            // Set dynamic header titles
            if ($("#dynamicAlbumTitle").text().trim() === "" || $("#dynamicAlbumTitle").text().trim() === "Adventure Gallery") {
                $("#dynamicAlbumTitle").text(currentTitle);
            }
            if ($("#dynamicAlbumSubtitle").text().trim() === "" || $("#dynamicAlbumSubtitle").text().trim().includes("Captured moments")) {
                $("#dynamicAlbumSubtitle").text(currentSubtitle);
            }
            if ($("#dynamicAlbumCategory").text().trim() === "" || $("#dynamicAlbumCategory").text().trim() === "ALBUM ARCHIVE") {
                $("#dynamicAlbumCategory").html('<i class="fa-solid fa-mountain-sun"></i> ' + currentCategory.toUpperCase());
            }

            // Update Report button
            if (galleryItemIdNum > 0) {
                $("#btnAlbumReport").attr("href", "/Home/Gallery/" + galleryItemIdNum).show();
            } else {
                $("#btnAlbumReport").hide();
            }

            // If photos were already rendered on server side by Razor, DO NOT wipe them out!
            if ($datset.children(".gallery-item").length > 0) {
                var serverCount = $datset.children(".gallery-item").length;
                $("#dynamicPhotoCountText").html('<i class="fa-regular fa-images"></i> Showing ' + serverCount + ' High-Res Photos');
                if (typeof window.initGallery === "function") {
                    window.initGallery();
                }
                return;
            }

            $datset.empty();

            const apiUrl = _BaseURL + "/GalleryContent/GetGalleryDetails?id=" + encodeURIComponent(id) + "&galleryItemsId=" + encodeURIComponent(gItemId);
            if (typeof toastr !== "undefined" && toastr.info) {
                toastr.info("Fetching banner details...", "Please wait");
            }

            if (typeof showLoader === "function") showLoader();
            $.ajax({
                url: apiUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (res) {
                    if (res) {
                        let data = res;
                        if (typeof res === "string") {
                            try { data = JSON.parse(res); } catch (e) { data = []; }
                        }
                        if (data && data.Response) {
                            data = data.Response;
                        }
                        var _apiUrl = $("#apiurl").val() || "";

                        if (Array.isArray(data) && data.length > 0) {
                            $("#dynamicPhotoCountText").html('<i class="fa-regular fa-images"></i> Showing ' + data.length + ' High-Res Photos');
                            $.each(data, function (index, val) {
                                let photoNumber = index + 1;
                                var imgPath = (val.ImagePath1 || val.imagePath1 || val.ImagePath || val.imagePath || "");
                                var src = imgPath.startsWith("http") ? imgPath : (_apiUrl + imgPath);
                                let htmlCard = `
                                    <div class="gallery-item" data-index="${index}" role="button" tabindex="0">
                                        <img src="${src}" alt="${currentTitle} Photo ${photoNumber}" class="gallery-item-img" loading="lazy">
                                        <div class="gallery-item-overlay">
                                            <div class="gallery-zoom-icon">
                                                <i class="fa-solid fa-expand"></i>
                                            </div>
                                            <span class="gallery-item-caption">${currentTitle} #${photoNumber}</span>
                                        </div>
                                    </div>
                                `;
                                $datset.append(htmlCard);
                            });

                            // Initialize Lightbox Modal Controller for the newly loaded images
                            if (typeof window.initGallery === "function") {
                                window.initGallery();
                            }
                        } else {
                            // Fallback to static mock photos if available
                            const fallbackPhotos = testimonials.filter(t => t.id === String(id) || t.id === String(gItemId));
                            if (fallbackPhotos && fallbackPhotos.length > 0) {
                                $("#dynamicPhotoCountText").html('<i class="fa-regular fa-images"></i> Showing ' + fallbackPhotos.length + ' High-Res Photos');
                                $.each(fallbackPhotos, function (index, val) {
                                    let photoNumber = index + 1;
                                    let htmlCard = `
                                        <div class="gallery-item" data-index="${index}" role="button" tabindex="0">
                                            <img src="${val.src}" alt="${currentTitle} Photo ${photoNumber}" class="gallery-item-img" loading="lazy">
                                            <div class="gallery-item-overlay">
                                                <div class="gallery-zoom-icon">
                                                    <i class="fa-solid fa-expand"></i>
                                                </div>
                                                <span class="gallery-item-caption">${currentTitle} #${photoNumber}</span>
                                            </div>
                                        </div>
                                    `;
                                    $datset.append(htmlCard);
                                });

                                if (typeof window.initGallery === "function") {
                                    window.initGallery();
                                }
                            } else {
                                $datset.append('<div class="no-albums-found"><i class="fa-solid fa-images fa-2x mb-3"></i><p>No photos available in this album yet.</p></div>');
                            }
                        }
                    } else {
                        toastr.warning("Could not retrieve banner data.", "Warning");
                    }
                },
                error: function (xhr, status, error) {
                    handleAjaxError(xhr, status, error);
                },
                complete: function () {
                    hideLoader();
                    if (typeof window.initGallery === "function") {
                        window.initGallery();
                    }
                }
            });
        }
    }
});