'use strict';

let rp = require('request-promise');
let _ = require('lodash');
let debug = true;

let log = function(m) {
    if (debug) console.log(m);
};

let roundRoubinStrategy = function(self, options) {
    // node selection strategy
    let node;
    do {
        // get next
        if (self.index >= self.nodes.length) self.index = 0;
        node = self.nodes[self.index++];

        // reqch max number of error ?
    } while (node.errorCounter > options.maxError)
    return node;
};

class Rpb {

    constructor(endpoints, options) {
        this.options = options;
        this.strategy = roundRoubinStrategy;
        this.index = 0;
        this.nodes = [];
        endpoints.forEach(endpoint => this.nodes.push({
            uri: endpoint,
            errorCounter: 0
        }));
    }


    send(options) {
        let self = this;
        let node = this.strategy(this, options);

        // send
        let mOptions;
        if (typeof options === 'string') {
            mOptions = node.uri + options;
        } else {
            mOptions = _.clone(options);
            mOptions.uri = node.uri + options.path;
        }

        return rp(mOptions)
            .then(function(response) {
                log(response)
                node.errorCounter = 0;
                return response;
            })
            .catch(function(err) {
                log(err)
                if (err.constructor.name === 'RequestError') {
                    // try with next endpoint
                    node.errorCounter++;
                    return self.send(options)
                } else {
                    // reset counter ?
                    node.errorCounter = 0;
                    throw err;
                }
            })

    }
    report() {
        // TBD return a report regarding the connection of eqch node
    }
}

module.exports = Rpb;