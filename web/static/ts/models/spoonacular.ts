export interface FailureResponse {
    readonly status: string;
    readonly code: number;
    readonly message: string;
}

export interface RecipeSearchResults {
    readonly results: Recipe[];
    readonly offset: number;
    readonly number: number;
    readonly totalResults: number;
}

interface BaseRecipe {
    readonly id: number;
    readonly title: string;
    readonly image: string;
    readonly imageType: string;
}

interface RecipeInfo {
    readonly vegetarian: boolean;
    readonly vegan: boolean;
    readonly glutenFree: boolean;
    readonly dairyFree: boolean;
    readonly veryHealthy: boolean;
    readonly cheap: boolean;
    readonly veryPopular: boolean;
    readonly sustainable: boolean;
    readonly weightWatcherSmartPoints: number;
    readonly gaps: string;
    readonly lowFodmap: boolean;
    readonly preparationMinutes: number;
    readonly cookingMinutes: number;
    readonly aggregateLikes: number;
    readonly spoonacularScore: number;
    readonly healthScore: number;
    readonly creditsText: string;
    readonly sourceName: string;
    readonly pricePerServing: number;
    readonly readyInMinutes: number;
    readonly servings: number;
    readonly sourceUrl: string;
    readonly summary: string;
    readonly cuisines: string[];
    readonly dishTypes: string[];
    readonly diets: string[];
    readonly occasions: string[];
    readonly analyzedInstructions: Instructions[];
    readonly spoonacularSourceUrl: string;
}

interface FilledIngredients {
    readonly extendedIngredients: ExtendedIngredient[];
    readonly usedIngredientCount: number;
    readonly missedIngredientCount: number;
    readonly missedIngredients: Ingredient[];
    readonly usedIngredients: Ingredient[];
    readonly unusedIngredients: Ingredient[];
    readonly likes: number;
}

export interface Recipe extends BaseRecipe, RecipeInfo, FilledIngredients {}

interface BaseIngredient {
    readonly id: number | null;
    readonly aisle: string | null;
    readonly image: string | null;
    readonly consistency: string | null;
    readonly name: string;
    readonly original: string;
    readonly originalString: string;
    readonly originalName: string;
    readonly amount: number;
    readonly unit: string;
    readonly meta: string[];
    readonly metaInformation: string[];
}

export interface Ingredient extends BaseIngredient {
    readonly unitLong: string;
    readonly unitShort: string;
}

export interface ExtendedIngredient extends BaseIngredient {
    readonly nameClean: string | null;
    readonly measure: {us: Measure; metric: Measure};
}

export interface Measure {
    readonly amount: number;
    readonly unitShort: string;
    readonly unitLong: string;
}

export interface Instructions {
    readonly name: string;
    readonly steps: Step[];
}

export interface Step {
    readonly number: number;
    readonly step: string;
    readonly ingredients: StepRequirement[];
    readonly equipment: StepRequirement[];
}

export interface StepRequirement {
    readonly id: number;
    readonly name: string;
    readonly localizedName: string;
    readonly image: string;
}