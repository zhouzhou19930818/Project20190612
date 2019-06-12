const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(proxy('/api', {
        target: 'http://172.168.201.40:9999',
        secure: false,
        changeOrigin: true,
        // pathRewrite: {
        //     "^/api": "/"
        // },
        // cookieDomainRewrite: "http://localhost:3000"
    }));
};