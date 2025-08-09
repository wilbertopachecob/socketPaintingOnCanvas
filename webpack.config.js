const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const CLIENT_PORT = process.env.CLIENT_PORT || 3001;
  const SERVER_PORT = process.env.PORT || 3000;
  
  return {
    entry: './client/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'client'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './client/index.html',
        favicon: './public/favicon.svg'
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: CLIENT_PORT,
      proxy: [
        {
          context: ['/socket.io'],
          target: `http://localhost:${SERVER_PORT}`,
          ws: true,
        },
      ],
    },
  };
};
