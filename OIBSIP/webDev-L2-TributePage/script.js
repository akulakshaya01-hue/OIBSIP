/* =========================================
   LEGACY — TRIBUTE PAGE
========================================= */


/* =========================================
   SCROLL REVEAL ANIMATION
========================================= */

const revealElements =
    document.querySelectorAll(
        ".section-heading, .story-content p, .timeline-item, .achievement-card, .legacy-inner, .quote-section blockquote"
    );


revealElements.forEach((element) => {

    element.classList.add("reveal");

});


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                }

            });

        },
        {
            threshold: 0.12
        }
    );


revealElements.forEach((element) => {

    observer.observe(element);

});


/* =========================================
   NAVIGATION ACTIVE STATE
========================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );

const navLinks =
    document.querySelectorAll(
        ".navbar nav a"
    );


const sectionObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (
                    entry.isIntersecting
                ) {

                    navLinks.forEach(
                        (link) => {

                            link.classList.remove(
                                "active"
                            );

                            if (
                                link.getAttribute(
                                    "href"
                                ) ===
                                "#" + entry.target.id
                            ) {

                                link.classList.add(
                                    "active"
                                );
                            }

                        }
                    );
                }

            });

        },
        {
            rootMargin:
                "-35% 0px -55% 0px"
        }
    );


sections.forEach((section) => {

    sectionObserver.observe(section);

});


/* =========================================
   ACTIVE NAV STYLE
========================================= */

const style =
    document.createElement("style");

style.textContent = `

    .navbar nav a.active {
        color: #b9853b;
    }

`;

document.head.appendChild(style);


/* =========================================
   IMAGE FALLBACK
========================================= */

const heroImage =
    document.querySelector(
        ".image-frame img"
    );


heroImage.addEventListener(
    "error",
    () => {

        heroImage.alt =
            "Portrait of Dr. A. P. J. Abdul Kalam";

        heroImage.style.objectFit =
            "contain";

        heroImage.style.padding =
            "30px";

    }
);