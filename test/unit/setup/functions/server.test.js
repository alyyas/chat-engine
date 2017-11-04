const assert   = require('chai').assert;
const Mock = require('pubnub-functions-mock');

const endpointResponseObject = {
    "headers": {},
    "status": 200,
    "send": function ( body ) {
        return new Promise((resolve) => { 
            resolve({
                "body": body || "",
                "status": this.status
            });
        });
    }
};

const endpointRequestObject = {
    "body": "{}",
    "message": {},
    "method": null,
    "params": {}
};

describe('#server', () => {
    let server = null;

    beforeEach(() => {
        server = Mock('./setup/functions/server.js');
    });

    it('creates server event handler of type Function', (done) => {
        assert.isFunction(server, 'was successfully created');
        done();
    });

    it('returns the "home page"', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        request.method = 'get';

        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "Hello World!",
            "status": 200 
        };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('returns 404 - based on request method', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        request.method = 'post';

        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "",
            "status": 404 
        };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('returns 404 - based on request route', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        request.method = 'get';
        request.params.route = '/invalid-route';

        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "",
            "status": 404 
        };

        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            done();
        });
    });

    it('confirms valid requests for "/insecure/grant"', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        request.method = 'POST';
        request.params.route = '/insecure/grant';
        request.body = JSON.stringify({
            "channel": "test",
            "uuid": "test",
            "authKey": "test"
        });

        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "",
            "status": 200 
        };

        // Good request
        server(request, response).then((testResult) => {

            assert.equal(testResult.status, correctResult.status, 'status');
            assert.equal(testResult.body, correctResult.body, 'response body');

            // Bad http method
            request.method = 'get';
            return server(request, response);

        }).then((testResult) => {

            correctResult = { "status": 404 };
            assert.equal(testResult.status, correctResult.status, 'status');

            // Bad request contents
            request.body = "{}";
            request.method = 'post';
            return server(request, response);

        }).then((testResult) => {
            
            correctResult = { "status": 422 };
            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
    });

    it('confirms valid requests for "/insecure/chats"', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        request.method = 'GET';
        request.params.route = '/insecure/chats';
        request.params.uuid = 'test';

        let response = Object.assign({}, endpointResponseObject);

        let correctResult = {
            "body": "",
            "status": 200 
        };

        // Get - valid
        server(request, response).then((testResult) => {
            assert.equal(testResult.status, correctResult.status, 'status');

            // Post - valid
            request.method = 'POST';
            request.body = JSON.stringify({
                "chat": {
                    "channel": "test"
                },
                "uuid": "test"
            });
            return server(request, response)
        }).then((testResult) => {
            assert.equal(testResult.status, correctResult.status, 'status');
            
            // Delete - valid
            request.method = 'DELETE';
            request.body = JSON.stringify({
                "chat": {
                    "channel": "test"
                },
                "uuid": "test",
                "globalChannel": "test"
            });
            return server(request, response)
        }).then((testResult) => {
            assert.equal(testResult.status, correctResult.status, 'status');
            done();
        });
    });

    it('confirms valid requests for "/insecure/chat/grant"', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        

        request.method = 'POST';
        request.params.route = '/insecure/chat/grant';
        request.params.uuid = 'test';

        // Post - valid: private chat
        let requestBody = {
            "chat": {
                "channel": "test",
                "private": true
            },
            "uuid": "test",
            "authKey": "test"
        };

        request.body = JSON.stringify(requestBody);

        // Set the KVStore so the UUID is already allowed in the channel
        let key = ['authed', requestBody.chat.channel].join(':');
        let kvstore = {};
        kvstore[key] = requestBody.uuid;

        server.mockKVStoreData(kvstore);

        server(request, response).then((testResult) => {

            let correctResult = {
                "body": "",
                "status": 200 
            };

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
 
    });

    it('confirms valid requests for "/insecure/chat/grant/read"', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        

        request.method = 'POST';
        request.params.route = '/insecure/chat/grant/read';
        request.params.uuid = 'test';

        // Post - valid: private chat
        let requestBody = {
            "chat": {
                "channel": "test",
                "private": true
            },
            "uuid": "test",
            "authKey": "test"
        };

        request.body = JSON.stringify(requestBody);

        // Set the KVStore so the UUID is already allowed in the channel
        let key = ['authed', requestBody.chat.channel].join(':');
        let kvstore = {};
        kvstore[key] = requestBody.uuid;

        server.mockKVStoreData(kvstore);

        server(request, response).then((testResult) => {

            let correctResult = {
                "body": "",
                "status": 200 
            };

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
 
    });

    it('confirms valid requests for "/insecure/chat/grant/write"', (done) => {

        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        

        request.method = 'POST';
        request.params.route = '/insecure/chat/grant/write';
        request.params.uuid = 'test';

        // Post - valid: private chat
        let requestBody = {
            "chat": {
                "channel": "test",
                "private": true
            },
            "uuid": "test",
            "authKey": "test"
        };

        request.body = JSON.stringify(requestBody);

        // Set the KVStore so the UUID is already allowed in the channel
        let key = ['authed', requestBody.chat.channel].join(':');
        let kvstore = {};
        kvstore[key] = requestBody.uuid;

        server.mockKVStoreData(kvstore);

        server(request, response).then((testResult) => {

            let correctResult = {
                "body": "",
                "status": 200 
            };

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
 
    });

    it('confirms valid requests for "/insecure/chat/invite"', (done) => {
        
        let request = Object.assign({}, endpointRequestObject);
        let response = Object.assign({}, endpointResponseObject);

        request.method = 'POST';
        request.params.route = '/insecure/chat/invite';
        request.params.uuid = 'test';
        request.body = JSON.stringify({
            "chat": {
                "channel": "test"
            },
            "uuid": "test",
            "authKey": "test",
            "myUuid": "test"
        });

        server(request, response).then((testResult) => {
            
            let correctResult = {
                "body": "",
                "status": 200 
            };

            assert.equal(testResult.status, correctResult.status, 'status');

            done();
        });
 
    });
});