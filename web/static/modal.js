export class PaginatedModal extends bootstrap.Modal {
    constructor(element, config) {
        super(element, config);

        for (const pageLink of this._element.querySelectorAll(".page-link")) {
            pageLink.addEventListener("click", this._changePage.bind(this));
        }
    }

    _changePage(event) {
        const activeLink = this._element.querySelector(
            ".page-item.active .page-link"
        );
        if (event.target === activeLink) {
            // Exit early if the selected page is already the current page.
            return;
        }

        let pageClass = activeLink.getAttribute("data-page");

        // Hide the current page and make it inactive.
        this._element.querySelector(pageClass).classList.add("d-none");
        activeLink.removeAttribute("aria-current");
        activeLink.parentElement.classList.remove("active");

        // Show the selected page and make it active.
        pageClass = event.target.getAttribute("data-page");
        this._element.querySelector(pageClass).classList.remove("d-none");
        event.target.setAttribute("aria-current", "page");
        event.target.parentElement.classList.add("active");
    }
}