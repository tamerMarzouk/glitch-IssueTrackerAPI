/*
 *
 *
 *       FILL IN EACH UNIT TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]----
 *       (if additional are added, keep them at the very end!)
 */

var chai = require('chai');
var dbHandler = require('../db.js');
var mongoClient = require('mongodb');
var assert = chai.assert;
var mongo;
const projectId = "TestProjectNumberxyz";
assert.exists(dbHandler, 'Unable to find file!')

let issueData = {
  projId: projectId,
  issue_title: 'Bad db connection string',
  issue_text: 'Connection string is for mongodb version 3.3 where driver used is for Mongodb version 2.2',
  created_by: 'Tamer Marzouk',
  assigned_to: 'Tamer Marzouk',
  status_text: 'OPEN'
};

suite('Unit Tests', function () {
  setup(function (done) {
    this.timeout(5000);
    const connectionStr = process.env.DB;
    mongoClient.connect(connectionStr,{ useNewUrlParser: true }, function (err, client) {
      let db=client.db('test');
      mongo = dbHandler(db);
      console.log('--- Delete all project test issues ----')
      db.collection('IssueTracker').deleteMany({
        projId: projectId
      }).then((result) => {
        //console.log('deleted: ' + result.deletedCount);
        done();
      }).catch(err=>{
        console.log('----------------GLOBAL ERR----------------');
        console.log(err);
      });

      if (err) {
        console.log(err)
      }
    })
  })
  test('Test Setup is working', function (done) {

    assert.isTrue(true, 'testing setup is not working!')
    done();
  });
  test('updateProjectIssue() - update project issue from project ' + projectId, function (done) {
    this.timeout(14000);
     mongo.insertProjectIssue(issueData, (x) => {
       assert.exists(x._id, 'mongodb insertion failed')
       mongo.updateProjectIssue(issueData, {
         status_text: 'Fixed'
       }, (result) => {
        
         mongo.getProjectIssues({projId:issueData.projId}, (docs) => {
           assert.isAbove(docs.length,0,'missing data');
           docs.forEach(doc => {
             assert.exists(doc.created_on, 'missing created_on field');
             assert.exists(doc.updated_on, 'missing updated_on field');
             assert.equal(doc.status_text, 'Fixed', 'error matching status_text');
             assert.equal(doc.issue_title, issueData.issue_title, 'error matching issue_title');
           });
           done();
         });
       })
     });
 
   });


  test('getProjectIssues is defined', function (done) {

    assert.isFunction(mongo.getProjectIssues, 'getProjectIssues is missing')
    done();
  });

  test('insertProjectIssue() - Add one issue to project ' + projectId, function (done) {
    mongo.insertProjectIssue(issueData, (x) => {
      assert.exists(x._id)
      done();
    })


  });

  test('getProjectIssues() - Read inserted issue from project ' + projectId, function (done) {
    this.timeout(15000);
    mongo.insertProjectIssue(issueData, (x) => {
      assert.exists(x._id, 'mongodb insertion failed')
      mongo.getProjectIssues({projId:issueData.projId}, (docs) => {
        assert.isAbove(docs.length,0,'missing data');
        docs.forEach(doc => { 
          assert.exists(doc.created_on, 'missing created_on field');
          assert.exists(doc.updated_on, 'missing updated_on field');
          assert.equal(doc.status_text, issueData.status_text, 'error matching status_text');
          assert.equal(doc.issue_title, issueData.issue_title, 'error matching issue_title');
        });
        done();
      });
    })
  });

  

});