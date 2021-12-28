from flask import Flask


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_pyfile("config.py", silent=True)

    # Important to import views after the app is created.
    from web import recipes

    app.register_blueprint(recipes.bp)
    app.add_url_rule("/", endpoint="index")

    return app
