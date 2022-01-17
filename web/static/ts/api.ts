/**
 * Makes requests to our API.
 */
 export class Client {
    /**
     * Create a URL for an endpoint with the given query parameters.
     *
     * @param endpoint The API endpoint.
     * @param params The query parameters.
     * @returns The built URL.
     */
    private _buildGetURL(endpoint: string, params: {[key: string]: any}): URL {
        const url = new URL(endpoint, window.location.href);
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

        return url;
    }

    /**
     * Perform a GET request.
     *
     * @param endpoint The API endpoint.
     * @param params The query parameters.
     * @returns The response for the GET request.
     */
    public async get(
        endpoint: string,
        params: {[key: string]: any}
    ): Promise<Response> {
        const url = this._buildGetURL(`api/${endpoint}`, params);
        // @ts-ignore
        return await fetch(url);
    }
}