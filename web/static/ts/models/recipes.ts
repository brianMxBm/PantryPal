import {BaseObservable} from "../observe";
import {Client} from "../api";
import {Recipe, RecipeSearchResults} from "./spoonacular";
import {Alert, ErrorAlert} from "../alerts";
import {ResponseError} from "../errors";

export class RecipesMessage {
    public readonly recipes?: Recipe[];
    public readonly alerts: Alert[];

    constructor(diff: {recipes?: Recipe[]; alerts?: Alert[]}) {
        this.recipes = diff.recipes;
        this.alerts = diff.alerts ?? [];
    }
}

export class Recipes extends BaseObservable<RecipesMessage> {
    private readonly _api: Client;
    private _data: Recipe[] = [];

    constructor(apiClient: Client) {
        super();
        this._api = apiClient;
    }

    get data(): Recipe[] {
        return this._data;
    }

    set data(value: Recipe[]) {
        this._data = value;
        this.notify(new RecipesMessage({recipes: this._data}));
    }

    async update(
        ingredients: string,
        sort: string,
        cuisine: string,
        type: string,
        maxReadyTime: string
    ): Promise<void> {
        const params = {
            includeIngredients: ingredients,
            addRecipeInformation: "true",
            fillIngredients: "true",
            cuisine: cuisine,
            type: type,
            sort: sort,
            maxReadyTime: maxReadyTime,
        };

        try {
            const response = await this._api.get("search", params);
            const results = (await response.json()) as RecipeSearchResults;
            this.data = results.results;
        } catch (e) {
            let msg;
            try {
                if (e instanceof ResponseError) {
                    msg = e.message;
                } else {
                    msg = "An internal error occurred!";
                    throw e;
                }
            } finally {
                if (msg) {
                    const alert = new ErrorAlert(msg);
                    this.notify(new RecipesMessage({alerts: [alert]}));
                }
            }
        }
    }
}