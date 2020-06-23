const path = require('path');


module.exports = {
    module: {
        rules: [
            {
                test: /\.txt$/,
                use: 'raw-loader'
            },
            // {
            //     test: /\.s[ca]ss$/,
            //     use: [
            //         'vue-style-loader',
            //         'css-loader',
            //         {
            //             loader: 'sass-loader',
            //             options: {
            //                 implementation: require('sass'),
            //                 sassOptions: {
            //                     fiber: require('fibers'),
            //                     indentedSyntax: true // optional
            //                 },
            //             },
            //         },
            //     ],
            // },
        ],
    },
    resolve: {
        alias: {
            "@src":path.resolve(__dirname,"src/"),
            '@components': path.resolve(__dirname, 'src/renderer/components'),
        }
    }
}
