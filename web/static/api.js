/**
 * Makes requests to our API.
 */
 export class Client {
    /**
     * Create a URL for an endpoint with the given query parameters.
     *
     * @param {string} endpoint The API endpoint.
     * @param {string} params The query parameters.
     * @returns {URL} The built URL.
     * @private
     */
    _buildGetURL(endpoint, params) {
        const url = new URL(endpoint, window.location.href);
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

        return url;
    }

    /**
     * Perform a GET request.
     *
     * @param {string} endpoint The API endpoint.
     * @param {string} params The query parameters.
     * @returns {Promise<Response>} The response for the GET request.
     */
    async get(endpoint, params) {
        const url = this._buildGetURL(`api/${endpoint}`, params);
        return await fetch(url);
    }
}