# KISSMAP
APP. Mejora Besos por el Mundo.

Uso de WEBPACK y REACT.


en package.json no h epuesto esto:
3. Configura los scripts en package.json 

Ajusta los scripts para que funcionen correctamente con esta nueva configuración: 
json
 
"scripts": {
  "start": "webpack serve --open", // Inicia el servidor de desarrollo
  "build": "webpack", // Compila la aplicación para producción
  "deploy": "npm run build && gh-pages -d ." // Compila y despliega en GitHub Pages
}
 
 

Cambios:  

    En el script deploy, usamos gh-pages -d . para indicar que los archivos compilados están directamente en la raíz del proyecto.
     
