/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('../db');
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
var htmlencode = require('htmlencode');

module.exports = function (app) {
MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true},(err,client)=>{
  let db=client.db('test');
  mongo=mongo(db);
})
  function parseData(d){
    if(typeof d=='string'){
    return htmlencode.htmlEncode(d);}else{
      return d;
    }
  }
  app.route('/api/issues/:project')
    .get(function (req, res){
      var project = req.params.project;
    let data=req.query;
       let doc={
      projId:project,...data,
      }
       //remove the project parameter as we are already using projId
       delete doc.project;
    // fix the ObjectId
    if(doc._id!=undefined){
      doc._id=ObjectId(doc._id)
    }
    //make sure open is boolean
    if(doc.open!=undefined){
      doc.open=doc.open.toLowerCase()=='true'?true:false;
    }
  
       //console.log(doc)
      mongo.getProjectIssues(doc,(result)=>{
        //console.log(result)
        res.send(result);
      })
    })
    
    .post(function (req, res){
      var project = req.params.project;
    let data=req.body;  
        //make sure required inputs are provided
   // console.log(data)
    if(data.issue_title==undefined||data.issue_text==undefined||data.created_by==undefined){
      res.send('missing inputs');
      return;
    }
    let doc={
      projId:parseData(project),
            issue_title:parseData(data.issue_title),
      issue_text:parseData(data.issue_text),
      created_by:parseData(data.created_by),
      assigned_to:parseData(data.assigned_to) ,
      status_text:parseData(data.status_text),
      open:true,
      }
     mongo.insertProjectIssue(doc,(result)=>{
      res.send(result)
    })
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var data=req.body;
   
    //make sure that there are supplied fields to update
    let keys=Object.keys(data);
    if(keys.length<=1){
      res.send('could not update '+data._id);
      return;
    }
    //make sure to remove fields that should not go to the DB
    let supportedKeys=['projId','issue_title','issue_text','created_by','assigned_to','status_text','open'];
    var doc={};
    keys.forEach(key=>{
      if (supportedKeys.includes(key)){
       
          doc[key]=parseData(data[key]);

              
      }
    });
   let searchDoc={_id:ObjectId(data._id)};
    //console.log(searchDoc) ;
    mongo.updateProjectIssue(searchDoc,doc,(result)=>{
      if(result.modifiedCount==null || result.modifiedCount==0){
        res.send('could not update '+data._id);
        return;
      }
      //console.log('-----------------',result);
      res.send('successfully updated');
    })
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var data=req.body;
    console.log(data);
    if(data._id==undefined){
      res.send('_id error');
      return;
    }
    mongo.deleteProjectIssue({...data,_id:ObjectId(data._id)},(result)=>{
      if(result.deletedCount==1){
        res.send('deleted '+data._id);
      }
    })
    });
    
};
