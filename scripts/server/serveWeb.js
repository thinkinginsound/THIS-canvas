const path = require('path');
const sass = require('sass');

let serverroot = path.resolve(__dirname, '../..'); // .replace("/scripts/server","");

module.exports = {
  serveStaticWebroot:function(webRoot){
    let webRootPath = path.join(serverroot, webRoot);
    console.log("webRootPath", webRootPath);
    global.app.use(global.session);

    // Serve static webfolder
    global.app.use("/", global.express.static(webRootPath))
  },
  serveLibraries:function(){
    // Serve socket.io
    app.use("/assets/libs/socket.io", express.static(path.join(serverroot, 'node_modules/socket.io-client/dist/')));

    // Serve p5.js
    app.use("/assets/libs/p5", express.static(path.join(serverroot, 'node_modules/p5/lib/')));

    // Serve tone.js
    app.use("/assets/libs/tone", express.static(path.join(serverroot, 'node_modules/tone/build/')));

    // Serve JQuery
    app.use('/assets/libs/jquery', express.static(serverroot + '/node_modules/jquery/dist/'));
    
    // Serve Popper.JS
    app.use('/assets/libs/popper', express.static(serverroot + '/node_modules/@popperjs/core/dist/umd'));

    // Serve mobile-detect
    app.use("/assets/libs/mobile-detect", express.static(path.join(serverroot, 'node_modules/mobile-detect/')));

    // Serve Bootstrap
    let bootstrap_scss = sass.renderSync({file: "scss/bootstrap_override.scss"});
    app.use("/assets/libs/bootstrap/js/", express.static(path.join(serverroot, 'node_modules/bootstrap/dist/js/')));
    app.use('/assets/libs/bootstrap/css/bootstrap.css', function (req, res, next) {
      res.setHeader('Content-disposition', 'attachment; filename=bootstrap.css');
      res.setHeader('Content-type', 'text/css');
      res.send(bootstrap_scss.css.toString())
    })
  }
}
