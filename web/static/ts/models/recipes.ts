import {Client} from "../api";
import {Recipe, RecipeSearchResults} from "./spoonacular";
import {APIObservable} from "../observe";

export class Recipes extends APIObservable<Recipe[]> {
    protected readonly _api: Client;
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
        this.notify({data: this._data});
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
            this._notifyResponseError(e);
        }
    }
}