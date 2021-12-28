import flask
from flask import render_template


bp = flask.Blueprint("recipes", __name__)


@bp.route("/")
def index():
    return render_template("recipes/index.html")
