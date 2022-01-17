import {CreateImmutable, MandateProps} from "../utils/type.js";
import {removeUndefined} from "../utils/structure.js";
import {ce, insertAfter} from "../utils/dom.js";
import {Dropdown} from "bootstrap";

export interface Selection {
    label: any;
    value: any;
}

export interface Options {
    dropdownOptions?: Dropdown.Options;
    dropdownClass?: string[];
    highlightClass?: string[];
    highlightTyped?: boolean;
    label?: string;
    maximumItems?: number;
    onInput?: (value: string) => any;
    onSelectItem?: (selection: Selection) => any;
    showValue?: boolean;
    threshold?: number;
    value?: string;
}

const DEFAULTS = {
    threshold: 2,
    maximumItems: 5,
    highlightTyped: true,
    highlightClass: ["text-primary"],
    label: "label",
    value: "value",
    showValue: false,
};

export class Autocomplete {
    public readonly options: CreateImmutable<
        MandateProps<Options, typeof DEFAULTS>
    >;

    private readonly _field: HTMLInputElement;
    private readonly _dropdown: Dropdown;
    private readonly _dropdownMenu: Element;
    private _data: Record<string, any>[];

    constructor(
        field: HTMLInputElement,
        options: Options = {},
        data: Record<string, any>[] = []
    ) {
        this._field = field;
        this.options = Object.assign({}, DEFAULTS, removeUndefined(options));
        this._data = data;

        if (field.parentElement === null) {
            throw new TypeError(
                "Cannot create the autocomplete dropdown: the field has no parent."
            );
        }

        field.parentElement.classList.add("dropdown");
        field.setAttribute("data-bs-toggle", "dropdown");
        field.classList.add("dropdown-toggle");

        this._dropdownMenu = ce(`<div class="dropdown-menu"></div>`);
        if (this.options.dropdownClass) {
            this._dropdownMenu.classList.add(...this.options.dropdownClass);
        }

        insertAfter(this._dropdownMenu, field);
        this._dropdown = new Dropdown(field, this.options.dropdownOptions);

        field.addEventListener("click", this._onClick.bind(this));
        field.addEventListener("input", this._onInput.bind(this));
        field.addEventListener("keydown", this._onKeydown.bind(this));
    }

    public set data(data: object[]) {
        this._data = data;
        this.renderIfNeeded();
    }

    public renderIfNeeded(): void {
        if (this.createItems() > 0) {
            this._dropdown.show();
        } else {
            this._field.click();
        }
    }

    public createItems(): number {
        const lookup = this._field.value;
        if (lookup.length < this.options.threshold) {
            this._dropdown.hide();
            return 0;
        }

        // @ts-ignore
        this._dropdownMenu.replaceChildren();

        let count = 0;
        for (let i = 0; i < this._data.length; i++) {
            const entry = this._data[i];
            const item = {
                label: this.options.label
                    ? entry[this.options.label]
                    : i.toString(),
                value: this.options.value ? entry[this.options.value] : entry,
            };

            if (item.label.toLowerCase().indexOf(lookup.toLowerCase()) >= 0) {
                this._dropdownMenu.appendChild(this._createItem(lookup, item));
                if (
                    this.options.maximumItems > 0 &&
                    ++count >= this.options.maximumItems
                )
                    break;
            }
        }

        const items = this._dropdownMenu.querySelectorAll(".dropdown-item");
        for (const item of items) {
            item.addEventListener("click", this._onSelectItem.bind(this));
        }

        return this._dropdownMenu.childNodes.length;
    }

    private _createItem(lookup: string, item: Selection): Element {
        let label;
        if (this.options.highlightTyped) {
            const classes = this.options.highlightClass.join(" ");

            const i = item.label.toLowerCase().indexOf(lookup.toLowerCase());
            const start = item.label.slice(0, i);
            const typed = item.label.slice(i, i + lookup.length);
            const end = item.label.slice(i + lookup.length, item.label.length);

            label = start + `<span class="${classes}">${typed}</span>` + end;
        } else {
            label = item.label;
        }

        if (this.options.showValue) {
            label += ` ${item.value}`;
        }

        return ce(`
            <button type="button" class="dropdown-item" data-label="${item.label}"
                    data-value="${item.value}">
                ${label}
            </button>`);
    }

    private _onSelectItem(event: Event): void {
        let dataLabel = (event.target as Element).getAttribute("data-label");
        let dataValue = (event.target as Element).getAttribute("data-value");

        if (dataLabel === null || dataValue === null) {
            throw new TypeError(
                "Clicked item's label or label data attributes don't exist."
            );
        }

        this._field.value = dataLabel;

        if (this.options.onSelectItem) {
            this.options.onSelectItem({
                value: dataValue,
                label: dataLabel,
            });
        }

        this._dropdown.hide();
    }

    private _onClick(event: MouseEvent): void {
        if (this.createItems() === 0) {
            event.stopPropagation();
            this._dropdown.hide();
        }
    }

    private _onInput(event: Event) {
        if (this.options.onInput) {
            this.options.onInput(this._field.value);
        }
        this.renderIfNeeded();
    }

    private _onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            this._dropdown.hide();
            return;
        }
        if (event.key === "ArrowDown") {
            // @ts-ignore
            this._dropdown._menu.children[0]?.focus();
            return;
        }
    }
}