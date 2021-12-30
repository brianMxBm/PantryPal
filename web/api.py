import flask
import requests
from flask import current_app as app, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

bp = flask.Blueprint("api", __name__)
limiter = Limiter(key_func=get_remote_address)
session = requests.Session()


def abort_with_json(code, **json):
    """Abort with an HTTP code and a JSON response."""
    flask.abort(flask.make_response(json, code))


def spoonacular_get(endpoint, params):
    """Perform an authenticated GET request with `params` to the Spoonacular API `endpoint`."""
    authed_params = {"apiKey": app.config["SPOONACULAR_KEY"]} | params

    return session.get(f"https://api.spoonacular.com/{endpoint}", params=authed_params)


@bp.errorhandler(429)
def rate_limit_handler(e):
    """Return a JSON response when the rate limit is exceeded."""
    return flask.make_response(flask.jsonify(error=f"Rate limit exceeded {e.description}."), 429)


@bp.route("/search")
@limiter.limit("1/minute")
def search_api():
    # Disallow these to conserve the request quota.
    for arg in ("fillIngredients", "addRecipeNutrition"):
        if request.args.get(arg) == "true":
            abort_with_json(403, error=f"{arg} is disabled.")

    response = spoonacular_get("recipes/complexSearch", request.args)
    return response.json()


@bp.route("/ingredients")
@limiter.limit("15/minute")
def ingredient_api():
    response = spoonacular_get("recipes/parseIngredients", request.args)
    return response.json()
