/* =========================================================
   ELANORA CLIENT DASHBOARD
   ========================================================= */


function initializeElanoraRevealAnimations(root) {
    if (!root || !root.querySelectorAll) {
        return;
    }
    const view = root.defaultView || window;
    const revealSelectors = [
        ".elanora-dashboard-section-heading",
        ".elanora-dashboard-content [class$=\"-content\"]",
        ".elanora-dashboard-content [class$=\"-heading\"]",
        ".elanora-dashboard-content [class$=\"-card\"]",
        ".elanora-dashboard-content [class$=\"-panel\"]",
        ".elanora-event-profile-panel",
        ".elanora-event-venue-card",
        ".elanora-event-schedule-card",
        ".elanora-vendor-overview-stats",
        ".elanora-vendor-card",
        ".elanora-vendor-coordinator-card",
        ".elanora-timeline-overview",
        ".elanora-timeline-section-heading",
        ".elanora-main-timeline-item",
        ".elanora-deadline-card",
        ".elanora-theme-option-card",
        ".elanora-theme-detail-card",
        ".elanora-action-card",
        ".elanora-message-overview-stats",
        ".elanora-update-card",
        ".elanora-logout-modal-card"
    ];
    const revealTargets = Array.from(root.querySelectorAll(revealSelectors.join(", ")));
    if (!revealTargets.length) {
        return;
    }
    const prefersReducedMotion = view.matchMedia && view.matchMedia("(prefers-reduced-motion: reduce)").matches;
    revealTargets.forEach(function (element, index) {
        const className = String(element.className || "");
        let variant = "fade-up";
        if (className.includes("image") || className.includes("visual") || className.includes("logo")) {
            variant = "scale";
        }
        element.setAttribute("data-reveal", variant);
        element.style.setProperty("--reveal-delay", `${Math.min(index * 60, 360)}ms`);
        if (prefersReducedMotion || element.getBoundingClientRect().top < view.innerHeight * 1.08) {
            element.classList.add("is-revealed");
        }
    });
    if (prefersReducedMotion || !("IntersectionObserver" in view)) {
        revealTargets.forEach(function (element) {
            element.classList.add("is-revealed");
        });
        root.documentElement.classList.add("elanora-reveal-ready");
        return;
    }
    const observer = new IntersectionObserver(function (entries, observerInstance) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add("is-revealed");
            observerInstance.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
    });
    requestAnimationFrame(function () {
        root.documentElement.classList.add("elanora-reveal-ready");
        revealTargets.forEach(function (element) {
            observer.observe(element);
        });
    });
}


function initializeElanoraCounterAnimations(root) {
    if (!root || !root.querySelectorAll) {
        return;
    }

    const view = root.defaultView || window;
    const counterSelectors = [
        ".elanora-event-count",
        ".elanora-vendor-overview-stats strong",
        ".elanora-dashboard-section-heading strong",
        ".elanora-timeline-progress-top strong",
        ".elanora-timeline-progress-bottom strong",
        ".elanora-payment-progress-heading > strong",
        ".elanora-payment-progress-details strong"
    ];
    const counterTargets = Array.from(
        root.querySelectorAll(counterSelectors.join(", "))
    );

    if (!counterTargets.length) {
        return;
    }

    const prefersReducedMotion =
        view.matchMedia &&
        view.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function parseCounterText(text) {
        const trimmed = String(text || "").trim();
        const match = trimmed.match(/^([^0-9-+₹$€£]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);

        if (!match) {
            return null;
        }

        const prefix = match[1];
        const rawNumber = match[2];
        const suffix = match[3];
        const numericValue = Number(rawNumber.replace(/,/g, ""));

        if (Number.isNaN(numericValue)) {
            return null;
        }

        return {
            prefix: prefix,
            suffix: suffix,
            end: numericValue,
            decimals: rawNumber.includes(".")
                ? rawNumber.split(".")[1].length
                : 0,
            digitLength: rawNumber.replace(/[^0-9]/g, "").length,
            hasGrouping: rawNumber.includes(",")
        };
    }

    function formatCounterValue(value, meta) {
        if (meta.hasGrouping) {
            return Number(value).toLocaleString("en-IN", {
                minimumFractionDigits: meta.decimals,
                maximumFractionDigits: meta.decimals
            });
        }

        if (meta.decimals > 0) {
            return Number(value).toFixed(meta.decimals);
        }

        return String(Math.max(0, Math.round(value))).padStart(
            Math.max(meta.digitLength, 1),
            "0"
        );
    }

    function animateCounter(element) {
        if (element.dataset.counterAnimated === "true") {
            return;
        }

        const meta = parseCounterText(element.textContent);

        if (!meta) {
            return;
        }

        element.dataset.counterAnimated = "true";

        if (prefersReducedMotion) {
            element.textContent =
                `${meta.prefix}${formatCounterValue(meta.end, meta)}${meta.suffix}`;
            return;
        }

        const duration =
            Number(element.getAttribute("data-counter-duration")) || 1100;
        const startTime = performance.now();

        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = meta.end * eased;

            element.textContent =
                `${meta.prefix}${formatCounterValue(currentValue, meta)}${meta.suffix}`;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    if (prefersReducedMotion || !("IntersectionObserver" in view)) {
        counterTargets.forEach(animateCounter);
        return;
    }

    const observer = new IntersectionObserver(function (entries, observerInstance) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            animateCounter(entry.target);
            observerInstance.unobserve(entry.target);
        });
    }, {
        threshold: 0.35,
        rootMargin: "0px 0px -6% 0px"
    });

    counterTargets.forEach(function (element) {
        observer.observe(element);
    });
}

document.addEventListener("DOMContentLoaded", function () {

    initializeElanoraRevealAnimations(document);
    initializeElanoraCounterAnimations(document);


    /* =====================================================
       SIDEBAR
       ===================================================== */

    const dashboardSidebar =
        document.getElementById("dashboardSidebar");

    const sidebarOpen =
        document.getElementById("sidebarOpen");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    function openDashboardSidebar() {

        if (!dashboardSidebar) return;

        dashboardSidebar.classList.add("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

    }


    function closeDashboardSidebar() {

        if (!dashboardSidebar) return;

        dashboardSidebar.classList.remove("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

    }


    if (sidebarOpen) {

        sidebarOpen.addEventListener(
            "click",
            openDashboardSidebar
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeDashboardSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeDashboardSidebar
        );

    }



    /* =====================================================
       SHARED DASHBOARD DARK MODE
       ===================================================== */

    const dashboardThemeToggle =
        document.getElementById("dashboardThemeToggle");


    if (dashboardThemeToggle) {

        const themeIcon =
            dashboardThemeToggle.querySelector("i");


        function syncDashboardThemeIcons() {

            const isDark =
                document.body.classList.contains("dark-mode");


            if (!themeIcon) {
                return;
            }


            themeIcon.classList.toggle("fa-moon", !isDark);
            themeIcon.classList.toggle("fa-sun", isDark);

        }


        const savedTheme =
            localStorage.getItem("elanora-theme");


        document.body.classList.toggle(
            "dark-mode",
            savedTheme === "dark"
        );

        document.documentElement.classList.remove("dark-mode");

        syncDashboardThemeIcons();


        dashboardThemeToggle.addEventListener(
            "click",
            function () {

                const isDark =
                    !document.body.classList.contains("dark-mode");


                document.body.classList.toggle("dark-mode", isDark);

                document.documentElement.classList.remove("dark-mode");

                localStorage.setItem(
                    "elanora-theme",
                    isDark ? "dark" : "light"
                );

                syncDashboardThemeIcons();

            }
        );

    }



    /* =====================================================
       RTL MODE
       ===================================================== */

    const dashboardRtlToggle =
        document.getElementById("dashboardRtlToggle");


    if (dashboardRtlToggle) {

        const savedDirection =
            localStorage.getItem("elanora-direction");


        if (savedDirection === "rtl") {

            document.documentElement.setAttribute(
                "dir",
                "rtl"
            );

        }


        dashboardRtlToggle.addEventListener(
            "click",
            function () {

                const currentDirection =
                    document.documentElement.getAttribute(
                        "dir"
                    );


                if (currentDirection === "rtl") {

                    document.documentElement.setAttribute(
                        "dir",
                        "ltr"
                    );

                    localStorage.setItem(
                        "elanora-direction",
                        "ltr"
                    );

                } else {

                    document.documentElement.setAttribute(
                        "dir",
                        "rtl"
                    );

                    localStorage.setItem(
                        "elanora-direction",
                        "rtl"
                    );

                }

            }
        );

    }



    /* =====================================================
       LOGOUT CONFIRMATION
       ===================================================== */

    const dashboardLogout =
        document.getElementById("dashboardLogout");

    const logoutModal =
        document.getElementById("logoutModal");

    const logoutNo =
        document.getElementById("logoutNo");

    const logoutYes =
        document.getElementById("logoutYes");


    function openLogoutModal() {

        if (!logoutModal) return;

        logoutModal.classList.add("show");

        document.body.style.overflow = "hidden";

    }


    function closeLogoutModal() {

        if (!logoutModal) return;

        logoutModal.classList.remove("show");

        document.body.style.overflow = "";

    }


    if (dashboardLogout) {

        dashboardLogout.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (logoutNo) {

        logoutNo.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    /* Click overlay to close */

    const logoutOverlay =
        document.querySelector(
            ".elanora-logout-modal-overlay"
        );


    if (logoutOverlay) {

        logoutOverlay.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    /* YES — LOGOUT */

    if (logoutYes) {

        logoutYes.addEventListener(
            "click",
            function () {

                window.location.href =
                    "login.html";

            }
        );

    }


    /* ESC KEY */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                logoutModal &&
                logoutModal.classList.contains("show")
            ) {

                closeLogoutModal();

            }

        }
    );

});

/* =====================================================
   SIDEBAR MENU TOGGLE
   ===================================================== */

const dashboardSidebar =
    document.getElementById("dashboardSidebar");

const sidebarOpen =
    document.getElementById("sidebarOpen");

const sidebarClose =
    document.getElementById("sidebarClose");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


function openDashboardSidebar() {

    if (!dashboardSidebar) return;

    dashboardSidebar.classList.add("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("show");
    }

    if (sidebarOpen) {
        sidebarOpen.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    document.body.style.overflow = "hidden";
}


function closeDashboardSidebar() {

    if (!dashboardSidebar) return;

    dashboardSidebar.classList.remove("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }

    if (sidebarOpen) {
        sidebarOpen.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    document.body.style.overflow = "";
}


/* HAMBURGER TOGGLE */

if (sidebarOpen) {

    sidebarOpen.addEventListener(
        "click",
        function () {

            if (
                dashboardSidebar.classList.contains("open")
            ) {

                closeDashboardSidebar();

            } else {

                openDashboardSidebar();

            }

        }
    );

}


/* CLOSE BUTTON */

if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeDashboardSidebar
    );

}


/* OVERLAY */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeDashboardSidebar
    );

}


/* CLOSE AFTER MENU ITEM CLICK */

const dashboardLinks =
    document.querySelectorAll(
        ".elanora-dashboard-link"
    );

dashboardLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            if (window.innerWidth <= 1199) {

                closeDashboardSidebar();

            }

        }
    );

});


/* ESC KEY */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeDashboardSidebar();

        }

    }
);


/* RESET WHEN MOVING BACK TO DESKTOP */

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 1199) {

            closeDashboardSidebar();

        }

    }
);
