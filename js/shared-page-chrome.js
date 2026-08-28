(function () {
    function initEmailObfuscation() {
        var emailNode = document.getElementById("email");
        if (!emailNode || emailNode.querySelector("a")) {
            return;
        }

        var user = "gayathrithreadcouture";
        var domain = "gmail.com";
        var link = document.createElement("a");
        link.href = "mailto:" + user + "@" + domain;
        link.textContent = user + "@" + domain;
        emailNode.appendChild(link);
    }

    function toggleCookieConsent(show) {
        var el = document.getElementById("cookieConsent");
        if (!el) {
            return;
        }
        el.classList[show ? "add" : "remove"]("show");
    }

    function onWindowLoad() {
        if (!localStorage.getItem("cookieConsent")) {
            toggleCookieConsent(true);
        }
    }

    window.acceptCookies = function () {
        localStorage.setItem("cookieConsent", "accepted");
        toggleCookieConsent(false);
        if (typeof gtag !== "undefined") {
            gtag("consent", "update", { analytics_storage: "granted" });
        }
    };

    window.declineCookies = function () {
        localStorage.setItem("cookieConsent", "declined");
        toggleCookieConsent(false);
        if (typeof gtag !== "undefined") {
            gtag("consent", "update", { analytics_storage: "denied" });
        }
    };

    function initStickyHeader() {
        var stickyHeader = document.getElementById("gtcStickyHeader");
        if (!stickyHeader || stickyHeader.dataset.gtcStickyInit === "true") {
            return;
        }
        stickyHeader.dataset.gtcStickyInit = "true";

        var announcement = document.querySelector(".announcementColor.scrolling-text-container")
            || document.querySelector(".scrolling-text-container");

        document.body.classList.add("gtc-has-sticky-header");

        var spacer = document.createElement("div");
        spacer.className = "gtc-header-spacer";
        spacer.setAttribute("aria-hidden", "true");
        if (stickyHeader.nextSibling) {
            stickyHeader.parentNode.insertBefore(spacer, stickyHeader.nextSibling);
        } else {
            stickyHeader.parentNode.appendChild(spacer);
        }

        function updateStickyHeader() {
            var headerHeight = stickyHeader.offsetHeight;
            var announcementHeight = announcement ? announcement.offsetHeight : 0;
            var scrollY = window.scrollY || window.pageYOffset;

            spacer.style.height = headerHeight + "px";

            if (scrollY >= announcementHeight) {
                stickyHeader.style.top = "0px";
                stickyHeader.classList.toggle("gtc-scrolled", scrollY > announcementHeight + 8);
            } else {
                stickyHeader.style.top = Math.max(0, announcementHeight - scrollY) + "px";
                stickyHeader.classList.remove("gtc-scrolled");
            }
        }

        updateStickyHeader();
        window.addEventListener("scroll", updateStickyHeader, { passive: true });
        window.addEventListener("resize", updateStickyHeader);
        window.addEventListener("load", updateStickyHeader);
    }

    document.addEventListener("DOMContentLoaded", function () {
        initEmailObfuscation();
        initStickyHeader();
    });
    window.addEventListener("load", onWindowLoad);
})();
