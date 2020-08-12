const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    ["/api", "/auth"],
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );
};

//NOTE: whenever we run into /api routes, we will redirect it to http://localhost:5000/api. So for example, in the client, you send the request to route "/api/signup", then in server you need to catch it with "/api/signup" too !!!! This is very important !!!!
