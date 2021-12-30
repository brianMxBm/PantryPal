import json

import flask
import requests
from flask import current_app as app, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException

bp = flask.Blueprint("api", __name__)
limiter = Limiter(key_func=get_remote_address)
session = requests.Session()


def spoonacular_get(endpoint, params):
    """Perform an authenticated GET request with `params` to the Spoonacular API `endpoint`."""
    authed_params = {"apiKey": app.config["SPOONACULAR_KEY"]} | params

    response = session.get(
        f"https://api.spoonacular.com/{endpoint}", params=authed_params)
    response.raise_for_status()

    return response


@bp.errorhandler(HTTPException)
def handle_exception(error: HTTPException):
    """Return a JSON response instead of HTML for HTTP errors."""
    response = error.get_response()

    # Only display the name if there's no description.
    description = f": {error.description}" if error.description else ""

    # Mimic Spoonacular's response format.
    response.data = json.dumps(
        dict(
            status="failure",
            code=error.code,
            message=error.name + description,
        )
    )
    response.content_type = "application/json"

    return response


@bp.errorhandler(requests.HTTPError)
def handle_requests_exception(error: requests.HTTPError):
    """Forward the response from Spoonacular."""
    return flask.Response(
        response=error.response.content,
        status=error.response.status_code,
        content_type=error.response.headers["content-type"],
    )


@bp.route("/search")
@limiter.limit("1/minute")
def search_api():
    # Disallow these to conserve the request quota.
    for arg in ("fillIngredients", "addRecipeNutrition"):
        if request.args.get(arg) == "true":
            flask.abort(403, description=f"{arg} is disabled.")

    response = spoonacular_get("recipes/complexSearch", request.args)
    return response.json()


@bp.route("/ingredients")
@limiter.limit("15/minute")
def ingredient_api():
    response = spoonacular_get("recipes/parseIngredients", request.args)
    return response.json()
