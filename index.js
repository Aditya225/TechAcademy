"use strict";

/* =========================================================
   TECHS ACADEMY - INDEX.JS
   =========================================================
   Handles:
   1. Mobile Navbar
   2. Process Tabs
   3. Testimonials Carousel
   4. Cookie Consent
   5. Smooth Scrolling
   6. Active Navigation
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initMobileNavbar();

    initProcessTabs();

    initTestimonialsCarousel();

    initCookieConsent();

    initSmoothScroll();

    initActiveNavigation();

});


/* =========================================================
   1. MOBILE NAVBAR
   ========================================================= */

function initMobileNavbar() {

    const mobileToggle =
        document.getElementById("mobileMenuToggle");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (!mobileToggle || !mobileMenu) {
        console.warn(
            "Mobile navbar elements not found."
        );

        return;
    }


    /*
     * Open / Close menu
     */

    mobileToggle.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            const isOpen =
                mobileMenu.classList.contains("open");

            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    /*
     * Close menu when clicking a link
     */

    const mobileLinks =
        mobileMenu.querySelectorAll("a");


    mobileLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                closeMobileMenu();

            }
        );

    });


    /*
     * Close when clicking outside
     */

    document.addEventListener(
        "click",
        function (event) {

            if (
                mobileMenu.classList.contains("open") &&
                !mobileMenu.contains(event.target) &&
                !mobileToggle.contains(event.target)
            ) {

                closeMobileMenu();

            }

        }
    );


    /*
     * Close with Escape key
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeMobileMenu();

            }

        }
    );


    /*
     * Close menu when resizing to desktop
     */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 768) {

                closeMobileMenu();

            }

        }
    );


    /*
     * Open menu function
     */

    function openMobileMenu() {

        mobileMenu.classList.add("open");

        mobileToggle.classList.add("active");

        mobileToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        document.body.classList.add(
            "mobile-menu-open"
        );

    }


    /*
     * Close menu function
     */

    function closeMobileMenu() {

        mobileMenu.classList.remove("open");

        mobileToggle.classList.remove("active");

        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        document.body.classList.remove(
            "mobile-menu-open"
        );

    }

}


/* =========================================================
   2. PROCESS TABS
   ========================================================= */

function initProcessTabs() {

    const tabs =
        document.querySelectorAll(".process-tab");

    const contents =
        document.querySelectorAll(".process-content");


    if (
        !tabs.length ||
        !contents.length
    ) {

        return;

    }


    tabs.forEach(function (tab) {

        tab.addEventListener(
            "click",
            function () {

                /*
                 * Get target from data-tab
                 */

                let target =
                    tab.getAttribute("data-tab");


                /*
                 * Existing HTML may use:
                 *
                 * onclick="switchTab('students')"
                 *
                 * So support that too.
                 */

                if (!target) {

                    const onclick =
                        tab.getAttribute("onclick");

                    if (onclick) {

                        const match =
                            onclick.match(
                                /switchTab\(['"]([^'"]+)['"]\)/
                            );

                        if (match) {

                            target =
                                match[1];

                        }

                    }

                }


                if (!target) {

                    return;

                }


                /*
                 * Active tab
                 */

                tabs.forEach(
                    function (item) {

                        item.classList.toggle(
                            "active",
                            item === tab
                        );

                    }
                );


                /*
                 * Active content
                 */

                contents.forEach(
                    function (content) {

                        const shouldShow =
                            content.id ===
                            "tab-" + target;


                        content.classList.toggle(
                            "active",
                            shouldShow
                        );

                    }
                );

            }
        );

    });

}


/*
 * Global switchTab function
 *
 * This keeps your existing HTML compatible
 * with onclick="switchTab('students')"
 */

window.switchTab = function (target) {

    const targetContent =
        document.getElementById(
            "tab-" + target
        );


    if (!targetContent) {

        return;

    }


    /*
     * Remove active from all tabs
     */

    document
        .querySelectorAll(".process-tab")
        .forEach(function (tab) {

            let tabTarget =
                tab.getAttribute("data-tab");


            if (!tabTarget) {

                const onclick =
                    tab.getAttribute("onclick") || "";

                const match =
                    onclick.match(
                        /switchTab\(['"]([^'"]+)['"]\)/
                    );

                if (match) {

                    tabTarget =
                        match[1];

                }

            }


            tab.classList.toggle(
                "active",
                tabTarget === target
            );

        });


    /*
     * Remove active from all contents
     */

    document
        .querySelectorAll(".process-content")
        .forEach(function (content) {

            content.classList.toggle(
                "active",
                content === targetContent
            );

        });

};


/* =========================================================
   3. TESTIMONIAL CAROUSEL
   ========================================================= */

function initTestimonialsCarousel() {

    /*
     * These IDs match your HTML:
     *
     * carouselTrack
     * prevBtn
     * nextBtn
     * carouselDots
     */

    const track =
        document.getElementById(
            "carouselTrack"
        );

    const prevButton =
        document.getElementById(
            "prevBtn"
        );

    const nextButton =
        document.getElementById(
            "nextBtn"
        );

    const dotsContainer =
        document.getElementById(
            "carouselDots"
        );


    if (!track) {

        console.warn(
            "Carousel track not found."
        );

        return;

    }


    /*
     * Get testimonial cards
     */

    const cards =
        Array.from(
            track.querySelectorAll(
                ".testimonial-card"
            )
        );


    if (!cards.length) {

        console.warn(
            "No testimonial cards found."
        );

        return;

    }


    let currentIndex = 0;

    let autoplayTimer = null;

    let touchStartX = 0;

    let touchEndX = 0;


    /*
     * Number of visible cards
     */

    function getVisibleCards() {

        if (window.innerWidth <= 768) {

            return 1;

        }


        if (window.innerWidth <= 1050) {

            return 2;

        }


        return 3;

    }


    /*
     * Maximum carousel index
     */

    function getMaxIndex() {

        const visible =
            getVisibleCards();


        return Math.max(
            0,
            cards.length - visible
        );

    }


    /*
     * Calculate card width
     */

    function updateCardWidths() {

        const viewport =
            track.parentElement;


        if (!viewport) {

            return;

        }


        const visible =
            getVisibleCards();


        const computed =
            window.getComputedStyle(
                track
            );


        const gap =
            parseFloat(
                computed.gap
            ) || 0;


        const viewportWidth =
            viewport.clientWidth;


        const totalGap =
            gap * (visible - 1);


        const cardWidth =
            (
                viewportWidth -
                totalGap
            ) / visible;


        cards.forEach(
            function (card) {

                card.style.flex =
                    `0 0 ${cardWidth}px`;

                card.style.width =
                    `${cardWidth}px`;

                card.style.minWidth =
                    `${cardWidth}px`;

            }
        );

    }


    /*
     * Move carousel
     */

    function updateCarousel(
        restartAutoplay = false
    ) {

        updateCardWidths();


        const maxIndex =
            getMaxIndex();


        /*
         * Make sure index remains valid
         */

        if (
            currentIndex >
            maxIndex
        ) {

            currentIndex = 0;

        }


        const firstCard =
            cards[0];


        if (!firstCard) {

            return;

        }


        const cardWidth =
            firstCard.getBoundingClientRect().width;


        const computed =
            window.getComputedStyle(
                track
            );


        const gap =
            parseFloat(
                computed.gap
            ) || 0;


        const moveAmount =
            (
                cardWidth +
                gap
            ) * currentIndex;


        track.style.transform =
            `translate3d(-${moveAmount}px, 0, 0)`;


        updateDots();


        if (restartAutoplay) {

            startAutoplay();

        }

    }


    /*
     * Next slide
     */

    function nextSlide() {

        const maxIndex =
            getMaxIndex();


        if (
            currentIndex >=
            maxIndex
        ) {

            currentIndex = 0;

        } else {

            currentIndex++;

        }


        updateCarousel(true);

    }


    /*
     * Previous slide
     */

    function previousSlide() {

        const maxIndex =
            getMaxIndex();


        if (
            currentIndex <= 0
        ) {

            currentIndex =
                maxIndex;

        } else {

            currentIndex--;

        }


        updateCarousel(true);

    }


    /*
     * Next button
     */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                nextSlide();

            }
        );

    }


    /*
     * Previous button
     */

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                previousSlide();

            }
        );

    }


    /*
     * Create dots
     */

    function createDots() {

        if (!dotsContainer) {

            return;

        }


        dotsContainer.innerHTML = "";


        const maxIndex =
            getMaxIndex();


        for (
            let i = 0;
            i <= maxIndex;
            i++
        ) {

            const dot =
                document.createElement(
                    "button"
                );


            dot.type =
                "button";


            dot.className =
                "dot";


            dot.setAttribute(
                "aria-label",
                `Go to testimonial ${i + 1}`
            );


            dot.addEventListener(
                "click",
                function () {

                    currentIndex =
                        i;


                    updateCarousel(
                        true
                    );

                }
            );


            dotsContainer.appendChild(
                dot
            );

        }


        updateDots();

    }


    /*
     * Update active dot
     */

    function updateDots() {

        if (!dotsContainer) {

            return;

        }


        const dots =
            dotsContainer.querySelectorAll(
                ".dot"
            );


        dots.forEach(
            function (
                dot,
                index
            ) {

                const active =
                    index ===
                    currentIndex;


                dot.classList.toggle(
                    "active",
                    active
                );


                if (active) {

                    dot.setAttribute(
                        "aria-current",
                        "true"
                    );

                } else {

                    dot.removeAttribute(
                        "aria-current"
                    );

                }

            }
        );

    }


    /*
     * Start autoplay
     */

    function startAutoplay() {

        stopAutoplay();


        /*
         * Respect user's reduced motion preference
         */

        if (
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            return;

        }


        autoplayTimer =
            setInterval(
                function () {

                    nextSlide();

                },
                5000
            );

    }


    /*
     * Stop autoplay
     */

    function stopAutoplay() {

        if (autoplayTimer) {

            clearInterval(
                autoplayTimer
            );

            autoplayTimer =
                null;

        }

    }


    /*
     * Pause autoplay when mouse
     * enters carousel
     */

    const carouselWrapper =
        track.parentElement;


    if (carouselWrapper) {

        carouselWrapper.addEventListener(
            "mouseenter",
            function () {

                stopAutoplay();

            }
        );


        carouselWrapper.addEventListener(
            "mouseleave",
            function () {

                startAutoplay();

            }
        );

    }


    /*
     * Touch start
     */

    track.addEventListener(
        "touchstart",
        function (event) {

            if (
                event.changedTouches &&
                event.changedTouches[0]
            ) {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;

            }


            stopAutoplay();

        },
        {
            passive: true
        }
    );


    /*
     * Touch end
     */

    track.addEventListener(
        "touchend",
        function (event) {

            if (
                !event.changedTouches ||
                !event.changedTouches[0]
            ) {

                startAutoplay();

                return;

            }


            touchEndX =
                event.changedTouches[0]
                    .screenX;


            const difference =
                touchStartX -
                touchEndX;


            /*
             * Ignore tiny movements
             */

            if (
                Math.abs(
                    difference
                ) < 50
            ) {

                startAutoplay();

                return;

            }


            if (
                difference > 0
            ) {

                /*
                 * Swipe left
                 */

                nextSlide();

            } else {

                /*
                 * Swipe right
                 */

                previousSlide();

            }

        },
        {
            passive: true
        }
    );


    /*
     * Resize handling
     */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        currentIndex =
                            0;


                        createDots();


                        updateCarousel(
                            false
                        );

                    },
                    200
                );

        }
    );


    /*
     * Initial setup
     */

    createDots();

    updateCarousel(false);

    startAutoplay();

}


/* =========================================================
   4. COOKIE CONSENT
   ========================================================= */

function initCookieConsent() {

    /*
     * These IDs match your HTML:
     *
     * cookieBanner
     * cookieAccept
     * cookieDecline
     */

    const cookieBanner =
        document.getElementById(
            "cookieBanner"
        );

    const acceptButton =
        document.getElementById(
            "cookieAccept"
        );

    const declineButton =
        document.getElementById(
            "cookieDecline"
        );


    if (!cookieBanner) {

        console.warn(
            "Cookie banner not found."
        );

        return;

    }


    const COOKIE_KEY =
        "techsacademy_cookie_consent";


    /*
     * Read existing consent
     */

    let existingConsent =
        null;


    try {

        existingConsent =
            localStorage.getItem(
                COOKIE_KEY
            );

    } catch (error) {

        console.warn(
            "localStorage is unavailable.",
            error
        );

    }


    /*
     * If already selected,
     * hide cookie banner
     */

    if (
        existingConsent === "accepted" ||
        existingConsent === "declined"
    ) {

        cookieBanner.style.display =
            "none";

        cookieBanner.classList.add(
            "hide"
        );

        return;

    }


    /*
     * Show banner
     */

    cookieBanner.style.display =
        "flex";

    cookieBanner.classList.remove(
        "hide"
    );


    /*
     * Save consent
     */

    function saveConsent(
        value
    ) {

        try {

            localStorage.setItem(
                COOKIE_KEY,
                value
            );

        } catch (error) {

            console.warn(
                "Could not save cookie consent.",
                error
            );

        }


        /*
         * Hide immediately
         */

        cookieBanner.classList.add(
            "hide"
        );


        /*
         * Make sure it cannot block
         * the page after animation
         */

        setTimeout(
            function () {

                cookieBanner.style.display =
                    "none";

            },
            300
        );

    }


    /*
     * ACCEPT ALL
     */

    if (acceptButton) {

        /*
         * Important:
         * This prevents accidental form submission.
         */

        acceptButton.type =
            "button";


        acceptButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                saveConsent(
                    "accepted"
                );

            }
        );

    }


    /*
     * DECLINE
     */

    if (declineButton) {

        declineButton.type =
            "button";


        declineButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                saveConsent(
                    "declined"
                );

            }
        );

    }

}


/* =========================================================
   5. SMOOTH SCROLL
   ========================================================= */

function initSmoothScroll() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    /*
                     * Ignore plain #
                     */

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    let target;


                    try {

                        target =
                            document.querySelector(
                                targetId
                            );

                    } catch (error) {

                        return;

                    }


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


/* =========================================================
   6. ACTIVE NAVIGATION
   ========================================================= */

function initActiveNavigation() {

    const currentPath =
        window.location.pathname;


    let currentPage =
        currentPath
            .split("/")
            .pop()
            .toLowerCase();


    /*
     * Homepage
     */

    if (!currentPage) {

        currentPage =
            "index.html";

    }


    const navigationLinks =
        document.querySelectorAll(
            ".nav-links a, .mobile-menu a"
        );


    navigationLinks.forEach(
        function (link) {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {

                return;

            }


            /*
             * Ignore anchor links
             */

            if (
                href.startsWith("#")
            ) {

                return;

            }


            const linkPage =
                href
                    .split("/")
                    .pop()
                    .split("#")[0]
                    .toLowerCase();


            if (
                linkPage ===
                currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   OPTIONAL GLOBAL OBJECT
   ========================================================= */

window.TechsAcademy = {

    /*
     * Reset cookie consent.
     *
     * Useful for testing.
     */

    resetCookieConsent: function () {

        try {

            localStorage.removeItem(
                "techsacademy_cookie_consent"
            );

            location.reload();

        } catch (error) {

            console.error(
                "Could not reset cookie consent.",
                error
            );

        }

    }

};
