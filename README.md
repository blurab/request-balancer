# request-balancer

HTTP(s) Local load balancer client based on request-promise : https://www.npmjs.com/package/request-promise

## installation

```js
npm install request-balancer
``` 

## Description

The main porpose of this library is to provide a basic HTTP(s) load balancer client to send http request to a microservice composed of several nodes, as netflix OSS java 'Ribbon' library does.

Now imagine you have deploy three instance of your microservice with the following host and port:

| node | host                  | port |
|------|-----------------------|------|
| #1   | node1.test.domain.org | 3010 |
| #2   | node2.test.domain.org | 3020 |
| #3   | node3.test.domain.org | 3070 |

Each instance expose a service to get the weather using the following request : GET http://{host:port}/weather?town=paris

To load balance over this three instances you must use request-balancer as follow:

```js

let Rpb = require('../request-balancer');

let rpb = new Rpb(['http://node1.test.domain.org:3010', 'http://node2.test.domain.org:3020', 'http://node3.test.domain.org:3070'], {
            timeout: 2000,
            maxError: 1
        });

rpb.send({
	path:'/weather?town=paris',
	method:'GET'
}).then(function(response){
	console.log(response);
});
``` 

Request balancer come as class you must instanciate to keep the context of round robin balancing
## new Rpb(endpoints,options)
* `endpoints` : is an array of uri of all the endpoints to load balance on
* `options`
	* `timeout` : in order to 'fail fast', it is possible to set the timeout on a request send to endpoints. If it timeout, load balancer send the request to the next endpoint.
	* `maxError` : maximum number of consecutive error after the library consider the endpoint as dead, error counter are reset every `healthCheckPeriod`
	* `healthCheckPeriod` : period after the library perform a health check on each endpoint

## rpb.send(options)
* `options` same as original request library except:
	* `path` replace the `uri` field of request, instead of providing the full `uri` only the uri path is provided