def test_index_response_200(client):
    """Index endpoint should return 200."""
    res = client.get("/")
    assert res.status_code == 200