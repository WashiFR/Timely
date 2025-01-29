import axios from 'axios'

export let pluginAxios = {}
pluginAxios.install = function (app, options) {
    app.provide(
        'api',
        axios.create({
            baseURL: options.baseURL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'key=' + options.apiKey,
            },
        }),
    )
}
