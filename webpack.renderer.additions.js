const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.txt$/,
                use: 'raw-loader'
            },
        ],
    },
    resolve: {
        alias: {
            "src":path.resolve(__dirname,"src/"),
            '@components': path.resolve(__dirname, 'src/renderer/components'),
        }
    },
    devServer: {
        historyApiFallback:true
    },
}
