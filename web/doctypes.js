/**
 * A requirement for a recipe.
 *
 * @typedef {Object} Requirement
 *
 * @property {number} id A unique identifier.
 * @property {string} name The requirement's name.
 * @property {string} image The requirement's image's file name.
 */

/**
 * @typedef {Object} Measure
 *
 * @property {number} amount The quantity of the ingredient.
 * @property {string} unitShort The abbreviated unit name for the amount.
 */

/**
 * A required ingredient for a recipe.
 *
 * @typedef {Object} Ingredient
 * @extends Requirement
 *
 * @property {{us: Measure, metric: Measure}} measures Ingredient's quantity in different units.
 */

/**
 * A preparation step for a recipe.
 *
 * @typedef {Object} Step
 *
 * @property {string} step The preparation instructions for the step.
 * @property {Requirement[]} equipment The required equipment for the step.
 */

/**
 * Recipe data from the Spoonacular API.
 *
 * @typedef {Object} Recipe
 *
 * @property {number} id A unique identifier.
 * @property {string} title The recipe's title.
 * @property {string} image The recipe's image URL.
 * @property {number} missedIngredientCount
 *      The difference between the required ingredients and the user's ingredients.
 * @property {number} healthScore A percentage value indicating how healthy the recipe is.
 * @property {number} readyInMinutes The time in minutes for the recipe to be ready.
 * @property {number} pricePerServing The price per serving of the recipe in US cents.
 * @property {string} summary A brief description of the recipe.
 * @property {Ingredient[]} extendedIngredients Ingredients required by the recipe.
 * @property {{steps: Step[]}} analyzedInstructions Instructions for preparing the recipe.
 */