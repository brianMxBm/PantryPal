/**
 * Create a div element containing the given inner HTML.
 *
 * @param html The inner HTML to place in the created element.
 * @returns The first element created by the inner HTML.
 */
 export function ce(html: string): Element {
    const div = document.createElement("div");
    div.innerHTML = html;

    if (div.firstElementChild === null) {
        throw new TypeError("The given HTML does not create any elements.");
    }

    return div.firstElementChild;
}

/**
 * @param elem The element to insert.
 * @param refElem The reference element after which to insert the element.
 * @returns The added child element.
 */
export function insertAfter(elem: Element, refElem: Element): Element {
    if (refElem.parentElement === null) {
        throw new TypeError(
            "Cannot insert after the reference element: it has no parent."
        );
    }

    return refElem.parentElement.insertBefore(elem, refElem.nextElementSibling);
}