
import pytest

from web import create_app


@pytest.fixture
def app():
    """Create a new app instance for each test."""
    return create_app()
