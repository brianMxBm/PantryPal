from pathlib import Path

import flask
from flask import render_template

bp = flask.Blueprint("recipes", __name__)

TEMPLATE_ROOT = Path(bp.root_path, "templates")
MODAL_PAGES = []

for p in sorted((TEMPLATE_ROOT / "recipes/modal_pages").iterdir()):
    page = str(p.relative_to(TEMPLATE_ROOT).as_posix()), p.stem[3:].replace("_", " ").title()
    MODAL_PAGES.append(page)


@bp.route("/")
def index():
    return render_template("recipes/index.html", modal_pages=MODAL_PAGES)