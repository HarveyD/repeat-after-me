const path = require('path');

module.exports = {
    entry: './app.ts',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: './dist/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.mp3$/,
                exclude: /node_modules/,
                loader: 'file-loader'
            }
        ]
    }
}