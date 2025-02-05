
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
require('dotenv').config(); // Cargar variables de entorno

// Leer la versión desde version.json
const packageJson = JSON.parse(fs.readFileSync('./version.json', 'utf-8'));
const appVersion = packageJson.version;

module.exports = {
  entry: './src/index.js', // Punto de entrada de la aplicación
  output: {
    path: path.resolve(__dirname), // Carpeta de salida (raíz del proyecto)
    filename: 'bundle.js', // Nombre del archivo JavaScript resultante
    publicPath: '/' // Asegura que las rutas sean relativas para GitHub Pages
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Procesa archivos .js
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/, // Procesa archivos CSS
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Procesa imágenes
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Usa el HTML desde la raíz del proyecto
      filename: 'index.html', // Genera el archivo index.html en la raíz
      inject: true, // Inyecta los scripts generados por Webpack
      appVersion: appVersion // Pasar la versión como variable
    })
  ],
  devServer: {
    static: './', // Sirve archivos desde la raíz del proyecto
    historyApiFallback: true // Soporte para rutas en aplicaciones SPA
  },
  mode: 'development' // Cambia a 'production' cuando despliegues
};