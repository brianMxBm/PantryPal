import {KeyError} from "../errors";
import {ErrorAlert, WarningAlert} from "../alerts";
import {Client} from "../api";
import {AutocompleteIngredient} from "./spoonacular";
import {AlertingObservable, APIObservable, Message} from "../observe";

export class SelectionsDiff {
    public readonly added: AutocompleteIngredient[];
    public readonly deleted: AutocompleteIngredient[];

    constructor(diff: {
        added?: AutocompleteIngredient[];
        deleted?: AutocompleteIngredient[];
    }) {
        this.added = diff.added ?? [];
        this.deleted = diff.deleted ?? [];
    }
}

export class SelectedIngredients extends AlertingObservable<SelectionsDiff> {
    public lastSelection?: AutocompleteIngredient = undefined;
    private _ingredients: Map<string, AutocompleteIngredient>;

    constructor() {
        super();
        this._ingredients = new Map();
    }

    get ingredients(): IterableIterator<AutocompleteIngredient> {
        return this._ingredients.values();
    }

    add(ingredient: AutocompleteIngredient): void {
        if (this._ingredients.has(ingredient.name)) {
            const alert = new WarningAlert(
                `Ingredient '${ingredient.name}' was already selected.`
            );
            this.notify({alerts: [alert]});
        } else {
            this._ingredients.set(ingredient.name, ingredient);
            this.notify({data: new SelectionsDiff({added: [ingredient]})});
        }
    }

    delete(name: string): void {
        const ingredient = this._ingredients.get(name);
        if (ingredient === undefined) {
            throw new KeyError(`Ingredient ${name} does not exist.`);
        }

        this._ingredients.delete(name);
        this.notify({data: new SelectionsDiff({deleted: [ingredient]})});
    }

    addSelection(input: string): void {
        if (this.lastSelection === undefined) {
            throw new TypeError(
                "Cannot add last selection: nothing has been selected yet."
            );
        }

        if (input !== this.lastSelection.name) {
            const alert = new ErrorAlert(
                "A selection must be made from autocompletion."
            );
            this.notify({alerts: [alert]});
        } else {
            this.add(this.lastSelection);
        }
    }

    clear(): void {
        const deleted = Array.from(this._ingredients.values());
        const diff = new SelectionsDiff({deleted: deleted});
        this.notify({data: diff});
        this._ingredients.clear();
    }
}

export class IngredientForm extends APIObservable<AutocompleteIngredient[]> {
    protected readonly _api: Client;
    private _data: AutocompleteIngredient[] = [];

    constructor(apiClient: Client) {
        super();
        this._api = apiClient;
    }

    get data() {
        return this._data;
    }

    set data(value: AutocompleteIngredient[]) {
        this._data = value;
        const msg = new Message<AutocompleteIngredient[]>({data: value});
        this.notify(msg);
    }

    public async update(query: string): Promise<void> {
        if (!query) {
            // Do nothing for empty inputs.
            return;
        }

        const params = {
            query: query,
            number: 100,
        };

        try {
            const response = await this._api.get("ingredients", params);
            this.data = await response.json();
        } catch (e) {
            this._notifyResponseError(e);
        }
    }
}