(function () {
    function getSearchRoot() {
        return document.querySelector("[data-gtc-product-search]");
    }

    function getConfig() {
        var root = getSearchRoot();
        if (!root) {
            return null;
        }

        return {
            itemLabel: root.getAttribute("data-item-label") || "item",
            itemSelector: root.getAttribute("data-item-selector") || ".product[data-search]",
            gridSelectors: (root.getAttribute("data-grid-selectors") || "#products-container")
                .split(",")
                .map(function (s) { return s.trim(); })
                .filter(Boolean)
        };
    }

    window.gtcBuildProductSearchText = function (product) {
        return [product.name, product.description, product.materials, product.occasions, product.category]
            .filter(function (value) { return value != null && value !== ""; })
            .join(" ")
            .toLowerCase()
            .replace(/"/g, "");
    };

    window.gtcFilterPageProducts = function (query) {
        var config = getConfig();
        if (!config) {
            return;
        }

        var normalized = (query || "").toLowerCase().trim();
        var items = document.querySelectorAll(config.itemSelector);
        var statusEl = document.getElementById("gtcSearchStatus");
        var noResultsEl = document.getElementById("gtcNoResults");
        var clearBtn = document.getElementById("gtcClearSearch");
        var visible = 0;

        items.forEach(function (el) {
            var match = !normalized || (el.dataset.search || "").includes(normalized);
            el.style.display = match ? "" : "none";
            if (match) {
                visible++;
            }
        });

        config.gridSelectors.forEach(function (selector) {
            var grid = document.querySelector(selector);
            if (!grid) {
                return;
            }

            if (!normalized) {
                grid.classList.remove("gtc-grid-hidden");
                return;
            }

            var hasVisible = false;
            grid.querySelectorAll(".product[data-search]").forEach(function (el) {
                if (el.style.display !== "none") {
                    hasVisible = true;
                }
            });
            grid.classList.toggle("gtc-grid-hidden", !hasVisible);
        });

        if (statusEl) {
            statusEl.textContent = normalized
                ? visible + " " + config.itemLabel + (visible === 1 ? "" : "s") + " found"
                : "";
        }

        if (noResultsEl) {
            var showEmpty = normalized.length > 0 && visible === 0;
            noResultsEl.classList.toggle("is-visible", showEmpty);
        }

        if (clearBtn) {
            clearBtn.hidden = !normalized;
        }
    };

    window.gtcInitPageSearch = function () {
        var searchInput = document.getElementById("gtcPageSearch");
        var clearBtn = document.getElementById("gtcClearSearch");
        if (!searchInput || searchInput.dataset.bound) {
            return;
        }
        searchInput.dataset.bound = "true";

        searchInput.addEventListener("input", function () {
            gtcFilterPageProducts(searchInput.value);
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", function () {
                searchInput.value = "";
                gtcFilterPageProducts("");
                searchInput.focus();
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (getSearchRoot()) {
            gtcInitPageSearch();
        }
    });
})();
