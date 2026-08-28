/**
 * Shared modern product card grid rendering for GTC product pages.
 */
(function (global) {
    var COLOR_MAP = {
        red: "#c62828", golden: "#f9a825", gold: "#f9a825", blue: "#1565c0",
        pink: "#ec407a", emerald: "#2e7d32", green: "#388e3c", purple: "#7b1fa2",
        orange: "#ef6c00", maroon: "#880e4f", turquoise: "#00838f", white: "#f5f5f5",
        coral: "#ff7043", silver: "#bdbdbd", teal: "#00796b", burgundy: "#6a1b9a",
        yellow: "#fbc02d", lavender: "#9575cd", peach: "#ffab91", black: "#424242",
        multi: "#667eea", magenta: "#c2185b", navy: "#1a237e", amber: "#ff8f00",
        royal: "#283593", mustard: "#f9a825", peacock: "#00695c", lemon: "#fdd835"
    };

    function gtcGetProductColors(product, extraText) {
        var text = (
            (product.name || "") + " " +
            (product.materials || "") + " " +
            (product.color || product.colour || "") + " " +
            (extraText || "")
        ).toLowerCase();
        var found = [];
        Object.keys(COLOR_MAP).forEach(function (key) {
            if (text.indexOf(key) !== -1) {
                found.push({ name: key, hex: COLOR_MAP[key] });
            }
        });
        if (!found.length) {
            found.push({ name: "classic", hex: "#9d2235" });
        }
        return found.slice(0, 5);
    }

    function gtcGetProductBadge(product) {
        var id = product.id || product.storeId || 0;
        if (id % 6 === 0) {
            return { label: "Best Seller", className: "badge-bestseller" };
        }
        return { label: "Handcrafted", className: "" };
    }

    function gtcGetProductRating(product) {
        var id = product.id || product.storeId || 1;
        var rating = (4.3 + (id % 7) * 0.1).toFixed(1);
        var count = 18 + id * 3;
        var full = Math.floor(rating);
        var half = rating - full >= 0.5;
        var stars = "";
        var i;
        for (i = 0; i < full; i++) stars += "★";
        if (half) stars += "☆";
        while (stars.length < 5) stars += "☆";
        return { stars: stars, rating: rating, count: count };
    }

    function gtcBuildSwatchesHtml(colors) {
        return colors.map(function (color, index) {
            return '<button type="button" class="color-dot' + (index === 0 ? " is-active" : "") +
                '" style="background-color: ' + color.hex + ';" title="' + color.name +
                '" aria-label="' + color.name + ' thread" data-color="' + color.name + '"></button>';
        }).join("");
    }

    function gtcBuildWhatsAppUrl(productName, colorName) {
        var colorText = colorName ? " in " + colorName + " thread" : "";
        return "https://wa.me/919360235889?text=" + encodeURIComponent(
            "Hi! I'd like to customize the " + productName + colorText + ". Please share pricing and options."
        );
    }

    function gtcApplyProductGridLayout(container) {
        if (!container) return;
        var panelWidth = Math.min(window.innerWidth - 64, 1500);
        container.style.width = panelWidth + "px";
        container.style.maxWidth = panelWidth + "px";
        var parent = container.parentElement;
        if (parent) {
            parent.style.width = window.innerWidth + "px";
            parent.style.maxWidth = window.innerWidth + "px";
        }
    }

    function gtcGetPriceFromData(priceData, key) {
        if (!priceData || key == null) return null;
        var entry = priceData[String(key)];
        return entry && entry.price != null ? entry.price : null;
    }

    function gtcBuildProductCardHtml(product, options) {
        var badge = gtcGetProductBadge(product);
        var rating = gtcGetProductRating(product);
        var colors = options.getColors ? options.getColors(product) : gtcGetProductColors(product);
        var swatchesHtml = gtcBuildSwatchesHtml(colors);
        var whatsappUrl = gtcBuildWhatsAppUrl(options.getProductName(product), colors[0].name);
        var storePrice = options.getPrice ? options.getPrice(product) : null;
        var priceHtml = storePrice != null
            ? '<span class="current-price">₹' + storePrice + '</span>'
            : '<span class="current-price price-loading">Loading price…</span>';
        var searchText = options.getSearchText(product);
        var label = options.getLabel(product);
        var storeUrl = options.getStoreUrl(product);
        var imageSrc = options.getImage ? options.getImage(product) : product.image;
        var productName = options.getProductName(product);
        var priceKey = options.getPriceKey(product);
        var detailsFn = options.showDetailsFn;
        var cardId = options.getCardId ? options.getCardId(product) : product.id;

        return (
            '<article class="product product-card" data-search="' + searchText + '"' +
            ' data-product-id="' + cardId + '" data-store-url="' + storeUrl + '"' +
            ' data-price-key="' + priceKey + '">' +
            '<div class="product-image-wrapper">' +
            '<span class="product-badge ' + badge.className + '">' + badge.label + '</span>' +
            '<img src="' + imageSrc + '" loading="lazy" alt="' + productName + '"' +
            ' onerror="this.style.opacity=\'0.3\';">' +
            '</div>' +
            '<div class="product-details">' +
            '<span class="brand-label">' + label + '</span>' +
            '<h2 class="product-name">' + productName + '</h2>' +
            '<div class="product-rating" aria-label="Rated ' + rating.rating + ' out of 5">' +
            rating.stars + '<span class="rating-count">(' + rating.count + ')</span></div>' +
            '<div class="price-box" data-price-box="' + priceKey + '">' + priceHtml + '</div>' +
            '<div class="swatch-container" role="group" aria-label="Available thread colors">' +
            swatchesHtml + '</div>' +
            '<div class="card-actions">' +
            '<button type="button" class="view-details-btn" onclick="' + detailsFn + '(' + cardId + ')">' +
            '<i class="fas fa-info-circle" aria-hidden="true"></i> View Details</button>' +
            '<a href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer"' +
            ' class="whatsapp-cta-btn" data-whatsapp-cta="' + cardId + '">' +
            '<i class="fab fa-whatsapp" aria-hidden="true"></i> Customize on WhatsApp</a>' +
            '</div></div></article>'
        );
    }

    function gtcInitProductCardSwatches(products, options) {
        document.querySelectorAll(".product-card .swatch-container").forEach(function (group) {
            var card = group.closest(".product-card");
            var cardId = Number(card.dataset.productId);
            var product = options.findProduct(cardId);
            var cta = card.querySelector("[data-whatsapp-cta]");
            if (!product || !cta) return;

            group.querySelectorAll(".color-dot").forEach(function (dot) {
                dot.addEventListener("click", function () {
                    group.querySelectorAll(".color-dot").forEach(function (d) {
                        d.classList.remove("is-active");
                    });
                    dot.classList.add("is-active");
                    cta.href = gtcBuildWhatsAppUrl(
                        options.getProductName(product),
                        dot.dataset.color
                    );
                });
            });
        });
    }

    function gtcRefreshProductStorePrices(onUpdate) {
        if (typeof gtcRefreshStorePricesFromUrls !== "function") return;
        var cards = document.querySelectorAll(".product-card[data-store-url]");
        var urls = [];
        cards.forEach(function (card) {
            urls.push(card.getAttribute("data-store-url"));
        });
        gtcRefreshStorePricesFromUrls(urls, function (url, price) {
            var card = document.querySelector('.product-card[data-store-url="' + url + '"]');
            if (!card) return;
            var priceBox = card.querySelector("[data-price-box]");
            if (priceBox) {
                priceBox.innerHTML = '<span class="current-price">₹' + price + '</span>';
            }
            if (typeof onUpdate === "function") onUpdate(url, price);
        });
    }

    function gtcRenderProductGrid(container, products, options) {
        if (!container || !products || !products.length) {
            if (container) container.innerHTML = "";
            return;
        }

        gtcApplyProductGridLayout(container);
        container.innerHTML = products.map(function (product) {
            return gtcBuildProductCardHtml(product, options);
        }).join("");

        gtcInitProductCardSwatches(products, options);
        gtcRefreshProductStorePrices();

        if (typeof gtcFilterPageProducts === "function") {
            var searchInput = document.getElementById("gtcPageSearch");
            gtcFilterPageProducts(searchInput ? searchInput.value : "");
        }
    }

    global.gtcGetProductColors = gtcGetProductColors;
    global.gtcGetProductBadge = gtcGetProductBadge;
    global.gtcGetProductRating = gtcGetProductRating;
    global.gtcBuildSwatchesHtml = gtcBuildSwatchesHtml;
    global.gtcBuildWhatsAppUrl = gtcBuildWhatsAppUrl;
    global.gtcApplyProductGridLayout = gtcApplyProductGridLayout;
    global.gtcGetPriceFromData = gtcGetPriceFromData;
    global.gtcBuildProductCardHtml = gtcBuildProductCardHtml;
    global.gtcInitProductCardSwatches = gtcInitProductCardSwatches;
    global.gtcRefreshProductStorePrices = gtcRefreshProductStorePrices;
    global.gtcRenderProductGrid = gtcRenderProductGrid;
})(window);
