/**
 * Flatpickr Year Dropdown Extension
 * Climbers Circle Admin Panel
 * Transforms the default numeric year input in Flatpickr into an intuitive <select> dropdown
 */
(function () {
    "use strict";

    if (typeof flatpickr === "undefined") {
        return;
    }

    function buildYearOptions(minYear, maxYear, selectedYear) {
        var frag = document.createDocumentFragment();
        for (var y = minYear; y <= maxYear; y++) {
            var opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === selectedYear) {
                opt.selected = true;
            }
            frag.appendChild(opt);
        }
        return frag;
    }

    function initYearDropdown(selectedDates, dateStr, instance) {
        if (!instance || !instance.calendarContainer) return;

        var currentMonths = instance.calendarContainer.querySelectorAll(".flatpickr-current-month");
        if (!currentMonths || currentMonths.length === 0) return;

        currentMonths.forEach(function (monthContainer) {
            var numWrapper = monthContainer.querySelector(".numInputWrapper");
            if (!numWrapper) return;

            // Hide the default numeric year input and arrows
            numWrapper.style.setProperty("display", "none", "important");

            var curYear = instance.currentYear || new Date().getFullYear();

            // Default min/max years (broad range for Date of Birth & future events)
            var minYear = 1920;
            var maxYear = (new Date().getFullYear()) + 15;

            if (instance.config && instance.config.minDate) {
                var dMin = new Date(instance.config.minDate);
                if (!isNaN(dMin.getFullYear())) minYear = dMin.getFullYear();
            }
            if (instance.config && instance.config.maxDate) {
                var dMax = new Date(instance.config.maxDate);
                if (!isNaN(dMax.getFullYear())) maxYear = dMax.getFullYear();
            }

            if (curYear < minYear) minYear = curYear;
            if (curYear > maxYear) maxYear = curYear;

            var existingSelect = monthContainer.querySelector(".flatpickr-year-dropdown");
            if (existingSelect) {
                var hasOpt = false;
                for (var i = 0; i < existingSelect.options.length; i++) {
                    if (parseInt(existingSelect.options[i].value, 10) === curYear) {
                        hasOpt = true;
                        break;
                    }
                }
                if (!hasOpt) {
                    var newOpt = document.createElement("option");
                    newOpt.value = curYear;
                    newOpt.textContent = curYear;
                    existingSelect.appendChild(newOpt);
                }
                existingSelect.value = curYear;
                return;
            }

            var select = document.createElement("select");
            select.className = "flatpickr-year-dropdown flatpickr-monthDropdown-months";
            select.setAttribute("aria-label", "Select Year");
            select.appendChild(buildYearOptions(minYear, maxYear, curYear));
            select.value = curYear;

            select.addEventListener("change", function (e) {
                var chosenYear = parseInt(e.target.value, 10);
                if (!isNaN(chosenYear)) {
                    instance.currentYear = chosenYear;
                    if (instance.currentYearElement) {
                        instance.currentYearElement.value = chosenYear;
                    }
                    if (instance.selectedDates && instance.selectedDates.length > 0) {
                        var currSelected = new Date(instance.selectedDates[0].getTime());
                        currSelected.setFullYear(chosenYear);
                        instance.setDate(currSelected, true);
                    } else {
                        instance.jumpToDate(new Date(chosenYear, instance.currentMonth, 1));
                    }
                }
            });

            // Prevent flatpickr from closing or intercepting input events
            select.addEventListener("mousedown", function (e) {
                e.stopPropagation();
            });
            select.addEventListener("click", function (e) {
                e.stopPropagation();
            });
            select.addEventListener("keydown", function (e) {
                e.stopPropagation();
            });

            numWrapper.parentNode.insertBefore(select, numWrapper.nextSibling);
        });
    }

    function syncYearDropdown(selectedDates, dateStr, instance) {
        if (!instance || !instance.calendarContainer) return;
        var selects = instance.calendarContainer.querySelectorAll(".flatpickr-year-dropdown");
        if (!selects || selects.length === 0) {
            initYearDropdown(selectedDates, dateStr, instance);
            return;
        }
        var curYear = instance.currentYear;
        selects.forEach(function (sel) {
            if (curYear && sel.value != curYear) {
                var hasOpt = false;
                for (var i = 0; i < sel.options.length; i++) {
                    if (parseInt(sel.options[i].value, 10) === curYear) {
                        hasOpt = true;
                        break;
                    }
                }
                if (!hasOpt) {
                    var newOpt = document.createElement("option");
                    newOpt.value = curYear;
                    newOpt.textContent = curYear;
                    sel.appendChild(newOpt);
                }
                sel.value = curYear;
            }
        });
    }

    // Configure globally as default hooks for all flatpickr instances
    flatpickr.setDefaults({
        onReady: [initYearDropdown],
        onOpen: [syncYearDropdown],
        onMonthChange: [syncYearDropdown],
        onYearChange: [syncYearDropdown],
        onValueUpdate: [syncYearDropdown]
    });

    // Expose helpers globally
    window.initFlatpickrYearDropdown = initYearDropdown;
    window.syncFlatpickrYearDropdown = syncYearDropdown;
})();
