const path = require('path');
const merge = require('webpack-merge')
const {VuetifyLoaderPlugin} = require('vuetify-loader')

module.exports = config => {
    let newConfig = merge(config, extraConfig)
    let newRules = []
    for (let rule of newConfig.module.rules) {
        if (rule.test.toString() !== '/\\.s([ac])ss$/') {
            newRules.push(rule)
        }
    }
    newConfig.module.rules = newRules
    return newConfig
}

let extraConfig = {
    module: {
        rules: [
            {
                test: /\.txt$/,
                use: 'raw-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'css-hot-loader',
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            // implementation: require('sass'),
                            sassOptions: {
                                fiber: require('fibers'),
                                indented: false
                            },
                            prependData: "@import 'src/plugins/vuetifyVariables.scss';"
                        },
                    },
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    'css-hot-loader',
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            // implementation: require('sass'),
                            sassOptions: {
                                fiber: require('fibers'),
                                indented: false
                            },
                            prependData: "@import 'src/plugins/vuetifyVariables.scss'"
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        alias: {
            "src": path.resolve(__dirname, "src/"),
            '@components': path.resolve(__dirname, 'src/renderer/components'),
        }
    },
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new VuetifyLoaderPlugin()
    ]
}

// "use": [
//     "css-hot-loader",
//     "/Users/jerry/Desktop/restructured-notes/node_modules/mini-css-extract-plugin/dist/loader.js",
//     {
//         "loader": "css-loader",
//         "options": {
//             "modules": "global"
//         }
//     },
//     "sass-loader"
// ]