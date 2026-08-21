/* =========================================================
   ÉLANORA EVENTS
   Main JavaScript
   ========================================================= */

"use strict";


function initializeElanoraRevealAnimations(root) {
    if (!root || !root.querySelectorAll) {
        return;
    }
    const view = root.defaultView || window;
    const revealSelectors = [
        ".elanora-footer-column",
        ".elanora-footer-bottom",
        ".elanora-footer-start",
        ".elanora-footer-social",
        "main .section-title",
        "main .section-subtitle",
        "main [class$=\"-content\"]",
        "main [class$=\"-heading\"]",
        "main [class$=\"-card\"]",
        "main [class$=\"-image\"]",
        "main [class$=\"-visual\"]",
        "main [class$=\"-intro\"]",
        "main [class$=\"-cta\"]",
        ".elanora-hero-layout > *",
        ".elanora-hero-copy",
        ".elanora-hero-visual",
        ".elanora-home2-hero-content",
        ".elanora-home2-hero-image",
        ".elanora-home2-intro-image",
        ".elanora-home2-intro-content",
        ".elanora-home2-experiences-heading",
        ".elanora-home2-experience",
        ".elanora-home2-method-heading",
        ".elanora-home2-method-card",
        ".elanora-home2-method-statement",
        ".elanora-home2-featured-simple-content",
        ".elanora-home2-testimonial-heading",
        ".elanora-home2-testimonial-content",
        ".elanora-home2-final-cta-content",
        ".elanora-about-hero-content",
        ".elanora-about-hero-image",
        ".elanora-about-belief-card",
        ".elanora-about-approach-card",
        ".elanora-about-team-card",
        ".elanora-services-offer-heading",
        ".elanora-services-offer-card",
        ".elanora-services-wedding-content",
        ".elanora-services-events-heading",
        ".elanora-services-event-card",
        ".elanora-package-card",
        ".elanora-services-final-cta-content",
        ".elanora-gallery-featured-heading",
        ".elanora-gallery-featured-item",
        ".elanora-gallery-weddings-heading",
        ".elanora-gallery-wedding-item",
        ".elanora-gallery-details-heading",
        ".elanora-gallery-detail-item",
        ".elanora-gallery-final-cta-content",
        ".elanora-contact-intro",
        ".contact-detail-card",
        ".contact-form",
        ".elanora-auth-card",
        ".client-review-item",
        ".why-elanora-card"
    ];
    const revealTargets = Array.from(root.querySelectorAll(revealSelectors.join(", ")));
    if (!revealTargets.length) {
        return;
    }
    const prefersReducedMotion = view.matchMedia && view.matchMedia("(prefers-reduced-motion: reduce)").matches;
    revealTargets.forEach(function (element, index) {
        const className = String(element.className || "");
        let variant = "fade-up";
        if (className.includes("image") || className.includes("visual") || className.includes("logo") || className.includes("photo")) {
            variant = "scale";
        }
        element.setAttribute("data-reveal", variant);
        element.style.setProperty("--reveal-delay", `${Math.min(index * 65, 390)}ms`);
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
        ".elanora-stat strong",
        ".elanora-about-milestone strong",
        ".elanora-home2-intro-details strong",
        ".client-review-counter",
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

    console.log("Élanora Events website loaded successfully.");

});

/* =========================================================
   ÉLANORA EVENTS
   Main JavaScript
   ========================================================= */

"use strict";


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const mobileMenuToggle =
        document.getElementById("mobileMenuToggle");

    const mainNavigation =
        document.getElementById("mainNavigation");


    if (mobileMenuToggle && mainNavigation) {

        mobileMenuToggle.addEventListener("click", function () {

            mainNavigation.classList.toggle("active");

            const isOpen =
                mainNavigation.classList.contains("active");

            mobileMenuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );


            const icon =
                mobileMenuToggle.querySelector("i");


            if (icon) {

                icon.classList.toggle(
                    "fa-bars",
                    !isOpen
                );

                icon.classList.toggle(
                    "fa-xmark",
                    isOpen
                );

            }

        });

    }


    /* =====================================================
       SHARED DARK MODE
       ===================================================== */

    const themeToggleSelectors = [
        "#themeToggle",
        "#themeToggleMobile",
        "#authThemeToggle",
        "#dashboardThemeToggle",
        "[data-theme-toggle]",
    ];


    const themeToggles =
        document.querySelectorAll(themeToggleSelectors.join(", "));


    function updateThemeIcons() {

        const isDark =
            document.body.classList.contains("dark-mode");


        themeToggles.forEach(function (toggle) {

            const icon =
                toggle.querySelector("i");


            if (!icon) {
                return;
            }


            icon.classList.toggle("fa-moon", !isDark);
            icon.classList.toggle("fa-sun", isDark);

        });

    }


    function applySavedTheme() {

        const savedTheme =
            localStorage.getItem("elanora-theme");


        document.body.classList.toggle(
            "dark-mode",
            savedTheme === "dark"
        );

        document.documentElement.classList.remove("dark-mode");

        updateThemeIcons();

    }


    function setTheme(isDark) {

        document.body.classList.toggle("dark-mode", isDark);

        document.documentElement.classList.remove("dark-mode");

        localStorage.setItem(
            "elanora-theme",
            isDark ? "dark" : "light"
        );

        updateThemeIcons();

    }


    if (themeToggles.length) {

        applySavedTheme();


        themeToggles.forEach(function (toggle) {

            toggle.addEventListener("click", function () {

                setTheme(
                    !document.body.classList.contains("dark-mode")
                );

            });

        });

    }


    /* =====================================================
       SHARED RTL MODE
       ===================================================== */

    const rtlToggleSelectors = [
        "#rtlToggle",
        "#rtlToggleMobile",
        "#authRtlToggle",
        "#dashboardRtlToggle",
        "[data-rtl-toggle]",
    ];


    const rtlToggles =
        document.querySelectorAll(rtlToggleSelectors.join(", "));


    function applySavedDirection() {

        const savedDirection =
            localStorage.getItem("elanora-direction");


        if (savedDirection === "rtl" || savedDirection === "ltr") {

            document.documentElement.setAttribute(
                "dir",
                savedDirection
            );

        }

    }


    function setDirection(direction) {

        document.documentElement.setAttribute(
            "dir",
            direction
        );

        localStorage.setItem(
            "elanora-direction",
            direction
        );

    }


    if (rtlToggles.length) {

        applySavedDirection();


        rtlToggles.forEach(function (toggle) {

            toggle.addEventListener("click", function () {

                const currentDirection =
                    document.documentElement.getAttribute("dir") === "rtl"
                        ? "rtl"
                        : "ltr";


                setDirection(
                    currentDirection === "rtl" ? "ltr" : "rtl"
                );

            });

        });

    }


    /* =====================================================
       CLOSE MOBILE MENU AFTER CLICK
       ===================================================== */

    const navLinks =
        document.querySelectorAll(".nav-link");


    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (window.innerWidth <= 1024) {

                mainNavigation.classList.remove("active");

                if (mobileMenuToggle) {

                    mobileMenuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    const icon =
                        mobileMenuToggle.querySelector("i");


                    if (icon) {

                        icon.classList.remove(
                            "fa-xmark"
                        );

                        icon.classList.add(
                            "fa-bars"
                        );

                    }

                }

            }

        });

    });


});

/* =========================================================
   ELANORA CLIENT TESTIMONIAL SLIDER
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const reviewItems = document.querySelectorAll(
        ".client-review-item"
    );

    const previousButton = document.querySelector(
        ".client-review-prev"
    );

    const nextButton = document.querySelector(
        ".client-review-next"
    );

    const counter = document.querySelector(
        ".client-review-counter"
    );

    const storyImage = document.querySelector(
        "#clientStoryImage"
    );

    const storyEvent = document.querySelector(
        "#clientStoryEvent"
    );

    const storyCaption = document.querySelector(
        "#clientStoryCaption"
    );


    /* Stop if section is not present */
    if (
        !reviewItems.length ||
        !previousButton ||
        !nextButton ||
        !counter
    ) {
        return;
    }


    let currentReview = 0;


    /* =====================================================
       REVIEW DATA
       ===================================================== */

    const reviewData = [

        {
            image: "images/c1.jpg",
            event: "BIRTHDAY CELEBRATION",
            caption: "A celebration made personal."
        },

        {
            image: "images/c2.jpg",
            event: "ANNIVERSARY CELEBRATION",
            caption: "A beautiful evening to remember."
        },

        {
            image: "images/c3.jpg",
            event: "CORPORATE EVENT",
            caption: "A polished experience from start to finish."
        }

    ];


    /* =====================================================
       SHOW REVIEW
       ===================================================== */

    function showReview(index) {

        reviewItems.forEach(function (item) {

            item.classList.remove(
                "is-active"
            );

        });


        reviewItems[index].classList.add(
            "is-active"
        );


        const currentNumber =
            String(index + 1).padStart(2, "0");

        const totalNumber =
            String(reviewItems.length).padStart(2, "0");


        counter.textContent =
            `${currentNumber} / ${totalNumber}`;


        /* Update right-side image */

        if (
            storyImage &&
            storyEvent &&
            storyCaption
        ) {

            storyImage.style.opacity = "0";


            setTimeout(function () {

                storyImage.src =
                    reviewData[index].image;

                storyImage.alt =
                    reviewData[index].event;


                storyEvent.textContent =
                    reviewData[index].event;


                storyCaption.textContent =
                    reviewData[index].caption;


                storyImage.style.opacity = "1";

            }, 180);

        }

    }


    /* =====================================================
       NEXT
       ===================================================== */

    nextButton.addEventListener(
        "click",
        function () {

            currentReview++;

            if (
                currentReview >=
                reviewItems.length
            ) {

                currentReview = 0;

            }

            showReview(currentReview);

        }
    );


    /* =====================================================
       PREVIOUS
       ===================================================== */

    previousButton.addEventListener(
        "click",
        function () {

            currentReview--;

            if (currentReview < 0) {

                currentReview =
                    reviewItems.length - 1;

            }

            showReview(currentReview);

        }
    );


    /* =====================================================
       INITIAL REVIEW
       ===================================================== */

    showReview(currentReview);

});

/* =========================================================
   ELANORA FAQ ACCORDION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const faqItems = document.querySelectorAll(
        ".elanora-faq-item"
    );


    if (!faqItems.length) {
        return;
    }


    faqItems.forEach(function (item) {

        const question = item.querySelector(
            ".elanora-faq-question"
        );


        question.addEventListener("click", function () {

            const isActive =
                item.classList.contains("active");


            /* Close all other FAQ items */

            faqItems.forEach(function (otherItem) {

                otherItem.classList.remove("active");

                const otherButton =
                    otherItem.querySelector(
                        ".elanora-faq-question"
                    );

                if (otherButton) {

                    otherButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });


            /* Open selected item */

            if (!isActive) {

                item.classList.add("active");

                question.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        });

    });

});

/* =========================================================
   ELANORA AUTH — PASSWORD TOGGLE
   ========================================================= */

document.querySelectorAll(".elanora-password-toggle").forEach(function (button) {

    button.addEventListener("click", function () {

        const targetId = button.getAttribute("data-target");

        const passwordInput = document.getElementById(targetId);

        const icon = button.querySelector("i");


        if (!passwordInput) {
            return;
        }


        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

            button.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

            button.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

});
