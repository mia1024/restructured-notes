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
        }
    }
}
