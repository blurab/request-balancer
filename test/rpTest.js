'use strict';
var mocha = require('genery').mocha

let Rpb = require('../request-balancer');
let express = require('express');
var assert = require('chai').assert;

let listen = function(port) {
    return new Promise(function(resolve, reject) {
        let app = express();
        let server = app.listen(port, function() {
            console.log('app listening on port ' + port);
            app.get('/echo', function(req, res) {
                res.send({
                    port: port
                });
            });
            resolve(server);
        });
    })
}
let app1, app2, app3;



describe('', function() {
    mocha.before(function * () {
        app1 = yield listen(3010);
        app2 = yield listen(3020);
        app3 = yield listen(3030);
    });

    mocha.it('should do round robin on three application', function * () {
        let rpb = new Rpb(['http://localhost:3010', 'http://localhost:3020', 'http://localhost:3030'], {
            timeout: 2000,
            maxError: 1
        });
        let echo = function * () {
            res = yield rpb.send('/echo');
            return JSON.parse(res);
        }
        let res;
        res = yield * echo();
        assert.equal(res.port, 3010)
        res = yield * echo();
        assert.equal(res.port, 3020)
        res = yield * echo();
        assert.equal(res.port, 3030)
        res = yield * echo();
        assert.equal(res.port, 3010)

    });

    mocha.it('should do round robin on three application, one unresponsive', function * () {
        let rpb = new Rpb(['http://localhost:3010', 'http://localhost:3099', 'http://localhost:3030'], {
            timeout: 2000,
            maxError: 1
        });
        let echo = function * () {
            res = yield rpb.send('/echo');
            return JSON.parse(res);
        }
        let res;
        res = yield * echo();
        assert.equal(res.port, 3010)
        res = yield * echo();
        assert.equal(res.port, 3030)
        res = yield * echo();
        assert.equal(res.port, 3010)
        res = yield * echo();
        assert.equal(res.port, 3030)

    });

    mocha.after(function * () {
        //console.log(app1)
        app1.close();
        app2.close();
        app3.close();

    })
})