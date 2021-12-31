import os

import pytest

from tests import SPOONACULAR_KEY
from web import create_app


@pytest.fixture
def app(mocker):
    """Create a new app instance for each test."""
    mocker.patch.dict(os.environ, {"SPOONACULAR_KEY": SPOONACULAR_KEY})
    flask_app = create_app()

    return flask_app