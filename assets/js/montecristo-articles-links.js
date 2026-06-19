/* Montecristo Auto Finance - homepage articles link patch.
   Purpose: make existing resource/article cards truly accessible without redesigning the section.
   Add before </body> on the homepage:
   <script src="/assets/js/montecristo-articles-links.js"></script>
*/
(function () {
  "use strict";

  const articles = [
    {
      title: "Understanding Car Loans in Alberta",
      category: "Loan Basics",
      url: "/articles/understanding-car-loans-in-alberta.html",
      cta: ""
    },
    {
      title: "Bad Credit Auto Loans",
      category: "Credit Help",
      url: "/articles/bad-credit-auto-loans.html",
      cta: ""
    },
    {
      title: "Financing as a Newcomer to Canada",
      category: "Newcomers",
      url: "/articles/financing-newcomer-canada.html",
      cta: ""
    },
    {
      title: "Tips to Improve Your Approval Odds",
      category: "Tips & Advice",
      url: "/articles/improve-approval-odds.html",
      cta: ""
    },
    {
      title: "Lower Your Interest Rate",
      category: "Refinancing",
      url: "/articles/lower-interest-rate.html",
      cta: ""
    },
    {
      title: "Flexible Financing Options",
      oldTitle: "Guaranteed Financing Options",
      category: "Lease to Own",
      url: "/articles/flexible-financing-options.html",
      cta: ""
    }
  ];

  function normalize(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findHeadingByText(title, oldTitle) {
    const targets = [normalize(title), normalize(oldTitle)].filter(Boolean);
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6,strong,b"));

    return headings.find(function (heading) {
      const text = normalize(heading.textContent);
      return targets.some(function (target) {
        return text === target || text.includes(target);
      });
    });
  }

  function findCardElement(heading) {
    return heading.closest("a, article, .article-card, .blog-card, .resource-card, .post-card, .card, .service-card, .news-card, .content-card") || heading.parentElement;
  }

  function updateReadMore(card, url, cta) {
    const possibleLinks = Array.from(card.querySelectorAll("a, button"));
    const readMore = possibleLinks.find(function (el) {
      return normalize(el.textContent).includes("read more");
    });

    if (readMore && readMore.tagName.toLowerCase() === "a") {
      readMore.setAttribute("href", url);
      readMore.setAttribute("aria-label", cta.replace("→", "") + " article");
      return;
    }

    if (readMore && readMore.tagName.toLowerCase() === "button") {
      readMore.setAttribute("type", "button");
      readMore.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = url;
      });
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.className = "article-read-more";
    link.textContent = cta;
    link.setAttribute("aria-label", cta.replace("→", "") + " article");
    card.appendChild(link);
  }

  function makeCardClickable(card, url, title) {
    if (!card || card.dataset.articleLink === url) return;

    // If the card itself is already an anchor, update it directly.
    if (card.tagName && card.tagName.toLowerCase() === "a") {
      card.setAttribute("href", url);
      card.setAttribute("aria-label", title);
      card.dataset.articleLink = url;
      return;
    }

    card.dataset.articleLink = url;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", title);

    card.addEventListener("click", function (event) {
      const interactive = event.target.closest("a, button, input, select, textarea, label");
      if (interactive) return;
      window.location.href = url;
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = url;
      }
    });
  }

  function replaceOldTitle(heading, oldTitle, newTitle) {
    if (!oldTitle || !heading) return;
    const current = normalize(heading.textContent);
    if (current.includes(normalize(oldTitle))) {
      heading.textContent = newTitle;
    }
  }

  function init() {
    articles.forEach(function (article) {
      const heading = findHeadingByText(article.title, article.oldTitle);
      if (!heading) return;

      replaceOldTitle(heading, article.oldTitle, article.title);
      const card = findCardElement(heading);
      updateReadMore(card, article.url, article.cta);
      makeCardClickable(card, article.url, article.title);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
