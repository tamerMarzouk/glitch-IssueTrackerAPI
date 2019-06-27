/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
var insertedIds=[];
suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        this.timeout(5000);
        
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Title','Incorrect Title');
          assert.equal(res.body.issue_text,'text','Incorrect text');
          assert.equal(res.body.created_by,'Functional Test - Every field filled in','Incorrect created_by');
          assert.equal(res.body.assigned_to,'Chai and Mocha','Incorrect assigned_to');
          assert.exists(res.body.created_on,'field created_on missing')
          assert.exists(res.body.updated_on,'field updated_on missing')
         insertedIds.push(res.body._id) //used for the update and delete tests
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        this.timeout(8000);
         chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,'Title','Incorrect Title');
          assert.equal(res.body.issue_text,'text','Incorrect text');
          assert.equal(res.body.created_by,'Functional Test - Every field filled in','Incorrect created_by');
          
          assert.equal(res.body.open,true,'Incorrect open status');
          assert.exists(res.body.created_on,'field created_on missing')
          assert.exists(res.body.updated_on,'field updated_on missing')
            insertedIds.push(res.body._id) //used for the update and delete tests
          done();
        });
      
       
      });
      
      test('Missing required fields', function(done) {
         this.timeout(8000);
         chai.request(server)
        .post('/api/issues/test')
        .send({
         // issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
         })
        .end(function(err, res){
           //console.log(res)
          assert.equal(res.status, 200);
          assert.equal(res.text,'missing inputs','Incorrect response!');
        
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: insertedIds[0],
          
       }).end((err,res)=>{
         assert.equal(res.text,'could not update '+insertedIds[0],'incorrect response from API');
         done()
       })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id:insertedIds[0],
          status_text: 'Open',
       }).end((err,res)=>{
         assert.equal(res.text,'successfully updated','update failed');
         done()
       })
      });
      
      test('Multiple fields to update', function(done) {
          
       chai.request(server)
        .put('/api/issues/test')
        .send({
          _id:insertedIds[0],
          open: true,
          projId: 'test',
          status_text: 'In QA',
       }).end((err,res)=>{
         assert.equal(res.text,'successfully updated','update failed');
         done()
       })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
           this.timeout(8000)
        chai.request(server)
        .get('/api/issues/test')
        .query({open:true})
        .end((err,res)=>{
          assert.equal(res.status,200,'Server did not respond with 200 OK');
          assert.isArray(res.body);
                         done();
        })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        this.timeout(8000);
       chai.request(server)
        .get('/api/issues/test')
        .query({open:true,status_text:''})
        .end((err,res)=>{
         assert.equal(res.status,200,'Server did not respond with 200 OK')
         assert.isArray(res.body);
         done();
       })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({ })
        .end((err,res)=>{
          assert.equal(res.status,200,'Server did not respond with 200 OK')
          assert.equal(res.text,'_id error','Server did not respond with error')
          done();
        })
      });
      
      test('Valid _id', function(done) {
        this.timeout(8000)
        let id=insertedIds[0];
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id:id })
        .end((err,res)=>{
          assert.equal(res.status,200,'Server did not respond with 200 OK')
          assert.equal(res.text,'deleted '+id,'Server did not respond with correct result')
          done();
        })
      });
      
    });
 suite('XSS for POST and PUT /api/issues/{project} => Array of objects with issue data', function() {
   test('POST XSS and check result',function(done){
   let doc={
     issue_title:'<script>alert(1)</script>',
     issue_text:'<script>alert(1)</script>',
     created_by:'<script>'
   }
   chai.request(server)
     .post('/api/issues/test')
     .send(doc)
     .end((err,res)=>{
      assert.equal(res.body.created_by,'&lt;script&gt;','XSS exists in created_by');
      assert.equal(res.body.issue_text,'&lt;script&gt;alert(1)&lt;/script&gt;','XSS exists in issue_text');
      assert.equal(res.body.created_by,'&lt;script&gt;','XSS exist');
     done();
     })
   })
   
     test('PUT XSS and check result',function(done){
   let doc={
     _id:insertedIds[0],
     issue_title:'<script>alert(1)</script>',
     issue_text:'<script>alert(1)</script>',
     created_by:'<script>'
   }
   chai.request(server)
     .post('/api/issues/test')
     .send(doc)
     .end((err,res)=>{
      assert.equal(res.body.created_by,'&lt;script&gt;','XSS exists in created_by');
      assert.equal(res.body.issue_text,'&lt;script&gt;alert(1)&lt;/script&gt;','XSS exists in issue_text');
      assert.equal(res.body.created_by,'&lt;script&gt;','XSS exist');
     done();
     })
   })
 
 });
      
});
