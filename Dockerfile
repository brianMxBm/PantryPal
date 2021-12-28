FROM python:3.9-slim-buster

ENV PIP_NO_CACHE_DIR=false \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /recipes

ENTRYPOINT ["gunicorn"]
CMD ["web:create_app()", "-b", "0.0.0.0:8000"]

RUN pip install -U poetry

COPY poetry.lock pyproject.toml ./

RUN poetry install --no-dev

COPY . .