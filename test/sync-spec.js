const expect = require('chai').expect;
require('chai').should();
const fs = require('fs');
const express = require('express');
const sync = require('../index.js').sync;

describe('sync', function(){
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
    const missingResourcePath = 'resourceMissing';

    afterEach('remove downloaded files', function(done) {
      fs.unlink(missingResourcePath, function(){done()});
    });

    it('it downloads the http file', function(done) {
      sync('http://localhost:' + expressPort + '/resource200', missingResourcePath, function(accessError, downloadFailure) {
        var fileContents = fs.readFileSync(missingResourcePath);
        expect(fileContents.equals(resourceBuffer)).to.equal(true);
        done(accessError || downloadFailure);
      });
    });
    it('fails if the http connection fails', function(done) {
      sync('http://localhost:1', missingResourcePath, function(accessError, downloadFailure) {
        if (accessError && downloadFailure)
          done();
        else
          done(new Error("Error should be returned when can't connect to source and destination doesn't exist. " + accessError + ' ' +  downloadFailure));
      });
    });
    it('fails if the http response is an error', function(done) {
      sync('http://localhost:' + expressPort + '/resource404', missingResourcePath, function(accessError, downloadFailure) {
        if (accessError && downloadFailure)
          done();
        else
          done(new Error("Errors should be returned when source produces an error response code and destination doesn't exist. " + accessError + ' ' +  downloadFailure));
      });
    });
  });
  describe('when there is a local file', function(){
    const existingResourcePath = 'resourceExisting';

    beforeEach('create local file', function(done) {
      fs.writeFile(existingResourcePath, 'existing resource data', done);
    });
    afterEach('remove potentially changed files', function(done) {
      fs.unlink(existingResourcePath, done);
    });

    it('it overwrites the file with the one from http', function(done) {
      sync('http://localhost:' + expressPort + '/resource200', existingResourcePath, function(accessError, downloadFailure) {
        var fileContents = fs.readFileSync(existingResourcePath);
        expect(fileContents.equals(resourceBuffer)).to.equal(true);
        done(accessError || downloadFailure);
      });
    });
    it('returns the non-fatal error if the http connection fails', function(done) {
      sync('http://localhost:1', existingResourcePath, function(accessError, downloadFailure) {
        expect(downloadFailure).to.exist;
        var fileContents = fs.readFileSync(existingResourcePath);
        expect(fileContents.toString()).to.equal('existing resource data');
        done(accessError);
      });
    });
    it('returns the error if the download fails', function(done) {
      sync('http://localhost:' + expressPort + '/resource404', existingResourcePath, function(accessError, downloadFailure) {
        expect(downloadFailure).to.exist;
        var fileContents = fs.readFileSync(existingResourcePath);
        expect(fileContents.toString()).to.equal('existing resource data');
        done(accessError);
      });
    });
  });
});
