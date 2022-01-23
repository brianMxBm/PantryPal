import {timeUntilUTCMidnight} from "./utils/date";
import {ResponseError} from "./errors";
import {FailureResponse} from "./models/spoonacular";

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
        const response = await fetch(url);

        if (response.ok) {
            return response;
        } else {
            const result = (await response.json()) as FailureResponse;
            console.error(`${result.code}: ${result.message}`);
            throw new ResponseError(this._getErrorMessage(response));
        }
    }

    /**
     * Return an error message for a failed request.
     *
     * @param response The response for the failed request.
     */
    private _getErrorMessage(response: Response): string {
        if (response.status === 429) {
            const seconds = response.headers.get("Retry-After");
            return `You are searching too frequently. Please wait ${seconds} before retrying.`;
        } else if (response.status == 402) {
            const time = timeUntilUTCMidnight();
            return `The request quota has been reached for the day. Please come back ${time}.`;
        } else {
            return `An internal network error occurred! (status ${response.status})`;
        }
    }
}