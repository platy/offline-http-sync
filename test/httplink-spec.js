const expect = require('chai').expect;
require('chai').should();
const fs = require('fs');
const express = require('express');
const httplink = require('../index.js').httplink;

describe('httplink', function(){
  const resourceBuffer = new Buffer('some resource data\n');
  var expressPort;

  before('Start test http server', function(done){
    const testApp = express();
    testApp.get('/resource200', function(req, res) {
      res.send(resourceBuffer);
    });
    testApp.get('/resource404', function(req, res) {
      res.status(404).send('this is a 404');
    });
    var server = testApp.listen();
    server.on('listening', function() {
      expressPort = server.address().port;
      expressPort.should.exist;
      done();
    });
  });

  describe('when there is no local file', function() {
    afterEach('remove downloaded files', function(done) {
      fs.unlink(missingResourcePath, done);
    });

    const missingResourcePath = 'resourceMissing';
    it('it downloads the http file', function(done) {
      httplink('http://localhost:' + expressPort + '/resource200', missingResourcePath, function(accessError, downloadFailure) {
        var fileContents = fs.readFileSync(missingResourcePath);
        expect(fileContents.equals(resourceBuffer)).to.equal(true);
        done(accessError || downloadFailure);
      });
    });
    it('fails if the http connection fails', function(done) {
      httplink('http://localhost:1', missingResourcePath, function(accessError, downloadFailure) {
        if (accessError && downloadFailure)
          done();
        else
          done(new Error("Error should be returned when can't connect to source and destination doesn't exist"));
      });
    });
    it('fails if the http response is an error', function(done) {
      httplink('http://localhost:' + expressPort + '/resource404', missingResourcePath, function(accessError, downloadFailure) {
        if (accessError && downloadFailure)
          done();
        else
          done(new Error("Errors should be returned when source produces an error response code and destination doesn't exist. " + accessError || downloadFailure));
      });
    });
  });
  describe('when there is a local file', function(){
    it('it overwrites the file with the one from http');
    it('returns the error if the http connection fails');
    it('returns the error if the download fails');
  });
});
