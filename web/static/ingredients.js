const toolTipOptions = {
    html: true,
    template: `
        <div class="tooltip ingredient-tooltip" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner border bg-light"></div>
        </div>`,
};
const ingredients = [];
const ingredientTemplate = document.getElementById("ingredient-template");

// eslint-disable-next-line no-unused-vars
async function addIngredient() {
    const input = document.getElementById("ingredient-input");

    // TODO: check the returned status code.
    // TODO: check for empty input.
    const response = await fetch("api/ingredients", {
        method: "POST",
        body: new URLSearchParams({
            ingredientList: input.value,
        }),
    });

    // The API returns a list because it parses each line of input.
    // However, ingredients come from the front end 1 by 1, so only use the first list item.
    const info = (await response.json())[0];
    ingredients.push(info);

    // TODO: check for duplicate inputs.
    createIngredient(info);
    input.value = ""; // Clear the input bar.
}

ingredientTemplate.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        await addIngredient();
    }
});

function createIngredient(info) {
    // Create an element for the new ingredient by cloning the template.
    const clone = ingredientTemplate.cloneNode(true);
    clone.id = `ingredient-${info.name}`;
    clone.firstElementChild.textContent = `${info.name}, ${info.amount} ${info.unitShort}`;
    ingredientTemplate.parentNode.appendChild(clone);

    // Initialise the tooltip for the new element. Display the ingredient's image on hover.
    const title = `<img src="https://spoonacular.com/cdn/ingredients_100x100/${info.image}">`;
    const tooltip = new bootstrap.Tooltip(clone, {
        container: clone,
        title: title,
        ...toolTipOptions,
    });

    // Hide the tooltip when hovering over it. Therefore, in practice, the tooltip will only show
    // when hovering over the `clone` element created above. This is done to avoid obstructing
    // adjacent ingredients with the tooltip.
    clone.addEventListener("shown.bs.tooltip", (e) => {
        tooltip
            .getTipElement()
            .addEventListener("pointerenter", (e) => tooltip.hide());
    });
}

// eslint-disable-next-line no-unused-vars
function deleteIngredient(ingredientButton) {
    bootstrap.Tooltip.getInstance(ingredientButton.parentNode).dispose();
    ingredientButton.parentNode.remove();
}

// eslint-disable-next-line no-unused-vars
async function search() {
    const sort = document.getElementById("sort");
    const type = document.getElementById("filter-type");
    const cuisine = document.getElementById("filter-cuisine");
    const time = document.getElementById("filter-time");

    const url = new URL("api/search", window.location.href);
    const params = {
        includeIngredients: ingredients.map((i) => i.name).join(","),
        addRecipeInformation: "true",
        cuisine: cuisine.value,
        type: type.value,
        sort: sort.value,
        maxReadyTime: time.value,
    };
    Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
    );

    // TODO: check response status code.
    const response = await fetch(url);
    const results = await response.json();

    for (const result of results.results) {
        displayRecipes(result);
    }
}

function displayRecipes(recipe) {
    const template = document.getElementById("recipe-template");
    const clone = template.cloneNode(true);

    clone.id = `recipe-${recipe.id}`;
    clone.querySelector(".recipe-name").textContent = recipe.title;
    clone.querySelector(".recipe-img").src = recipe.image;

    clone.querySelector(
        ".recipe-healthiness"
    ).textContent = `${recipe.healthScore}%`;

    clone.querySelector(
        ".recipe-time"
    ).textContent = `${recipe.readyInMinutes} m`;

    clone.querySelector(".recipe-price").textContent = (
        recipe.pricePerServing / 100
    ).toFixed(2);

    template.parentNode.appendChild(clone);
}