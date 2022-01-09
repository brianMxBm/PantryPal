export class Client {
    _buildGetURL(endpoint, params) {
        const url = new URL(endpoint, window.location.href);
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

        return url;
    }

    async get(endpoint, params) {
        const url = this._buildGetURL(`api/${endpoint}`, params);
        return await fetch(url);
    }
}