import {BaseObservable} from "../observe";
import {Client} from "../api";
import {Recipe, RecipeSearchResults} from "./spoonacular";

export class Recipes extends BaseObservable<Recipe[]> {
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
        this.notify(this._data);
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

        // TODO: check response status code.
        const response = await this._api.get("search", params);
        const results = (await response.json()) as RecipeSearchResults;
        this.data = results.results;
    }
}