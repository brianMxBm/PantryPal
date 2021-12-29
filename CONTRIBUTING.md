# Development Environment

## Initial Setup

As prerequisites, Python 3.9 and [poetry] are required. Once those are installed, `cd` into the project's root directory and install the project's dependencies:

```bash
poetry install
```

Next, install the pre-commit hook to ensure the linters will run upon a commit:

```bash
poetry run pre-commit install
```

Create a `.env` file in the project's root directory and write the following to it:

```
FLASK_ENV=development
SPOONACULAR_KEY=your_key
```

## Running the Website

Use Docker Compose to bring up the container.

```bash
docker-compose up
```

This will host the server on http://127.0.0.1:8000 with Flask in debug mode. It will also mount the host machine's repository within the container. Therefore, changes made to local files on the host will be mirrored within the container. This avoids constant rebuilds after making changes.

To forcefully rebuild the container, `--build` can be appended to the above command.

### Alternative to Docker

To run the site without Docker, do the following:

```bash
# Unix
export FLASK_APP=web
export FLASK_ENV=development
# Windows
set FLASK_APP=web
set FLASK_ENV=development
poetry run flask run
```

## Running Tests

Tests run through pytest:

```bash
poetry run pytest
```

### Coverage

To generate coverage, run

```bash
poetry run coverage run -m pytest
```

To see the report, run

```bash
poetry run coverage report
```

or `coverage html` for an HTML report.

[poetry]: https://github.com/python-poetry/poetry/