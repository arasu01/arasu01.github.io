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

    document.addEventListener("DOMContentLoaded", initEmailObfuscation);
    window.addEventListener("load", onWindowLoad);
})();
