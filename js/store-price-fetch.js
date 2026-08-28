/**
 * Fetch product prices from Gayathri Thread Couture Instamojo store pages.
 * Parses product:price:amount from store HTML meta tags.
 */
(function (global) {
    var GTC_INSTAMOJO_STORE = "https://gayathrithreadcouture.myinstamojo.com";
    var priceCache = {};
    var cacheLoaded = false;

    function gtcStoreProductUrl(slug) {
        return GTC_INSTAMOJO_STORE + "/product/" + slug;
    }

    function gtcParseStorePriceFromHtml(html) {
        if (!html) return null;
        var match = html.match(/property="product:price:amount"\s+content="(\d+)"/);
        return match ? parseInt(match[1], 10) : null;
    }

    function gtcGetCachedStorePrice(url) {
        try {
            var raw = sessionStorage.getItem("gtc-store-price:" + url);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    function gtcSetCachedStorePrice(url, price) {
        try {
            sessionStorage.setItem("gtc-store-price:" + url, JSON.stringify(price));
        } catch (e) { /* ignore */ }
    }

    function gtcFetchStorePriceFromUrl(url) {
        if (priceCache[url] != null) {
            return Promise.resolve(priceCache[url]);
        }

        var sessionPrice = gtcGetCachedStorePrice(url);
        if (sessionPrice != null) {
            priceCache[url] = sessionPrice;
            return Promise.resolve(sessionPrice);
        }

        var proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
        var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;

        return fetch(proxyUrl, controller ? { signal: controller.signal } : {})
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
                if (timeoutId) clearTimeout(timeoutId);
                var price = gtcParseStorePriceFromHtml(data && data.contents);
                if (price != null) {
                    priceCache[url] = price;
                    gtcSetCachedStorePrice(url, price);
                }
                return price;
            })
            .catch(function () {
                if (timeoutId) clearTimeout(timeoutId);
                return null;
            });
    }

    function gtcLoadStorePriceFile(jsonPath) {
        if (cacheLoaded) {
            return Promise.resolve(priceCache);
        }
        return fetch(jsonPath)
            .then(function (resp) {
                if (!resp.ok) throw new Error("Price file not found");
                return resp.json();
            })
            .then(function (data) {
                Object.keys(data).forEach(function (key) {
                    var entry = data[key];
                    if (entry && entry.url && entry.price != null) {
                        priceCache[entry.url] = entry.price;
                    }
                });
                cacheLoaded = true;
                return data;
            })
            .catch(function () {
                cacheLoaded = true;
                return {};
            });
    }

    function gtcGetStorePriceForProduct(productId, slugPrefix, priceFileData) {
        var slug = slugPrefix + "-" + productId;
        var url = gtcStoreProductUrl(slug);
        if (priceCache[url] != null) return priceCache[url];
        if (priceFileData && priceFileData[String(productId)] && priceFileData[String(productId)].price != null) {
            return priceFileData[String(productId)].price;
        }
        return null;
    }

    function gtcRefreshStorePricesFromUrls(urls, onUpdate) {
        urls.forEach(function (url) {
            gtcFetchStorePriceFromUrl(url).then(function (price) {
                if (price != null && typeof onUpdate === "function") {
                    onUpdate(url, price);
                }
            });
        });
    }

    global.gtcStoreProductUrl = gtcStoreProductUrl;
    global.gtcParseStorePriceFromHtml = gtcParseStorePriceFromHtml;
    global.gtcFetchStorePriceFromUrl = gtcFetchStorePriceFromUrl;
    global.gtcLoadStorePriceFile = gtcLoadStorePriceFile;
    global.gtcGetStorePriceForProduct = gtcGetStorePriceForProduct;
    global.gtcRefreshStorePricesFromUrls = gtcRefreshStorePricesFromUrls;
})(window);
