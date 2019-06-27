module.exports=function(db){
  function setCreatedOn(doc){
    let timestamp = doc._id.toString().substring(0,8);
      doc['created_on']=new Date( parseInt( timestamp, 16 ) * 1000 );
  }
  this.getProjectIssues=function(filter,done){
    let docs=db.collection('IssueTracker').find({...filter});
    docs.toArray((err,result)=>{
      //console.log('--------------------------------------------Here',filter,result)
      if(result==null || result.length==0){
        done([]);
        return; 
      }
      result.forEach(d=>{
      setCreatedOn(d);
    })
      done(result);
    })
    
  }
 
  this.insertProjectIssue=function(doc,done){
    db.collection('IssueTracker').updateOne(doc,{$set:{...doc},$currentDate: { updated_on:true}},{upsert:true}).then((result)=>{ 
       //return the inserted document
      db.collection('IssueTracker').findOne(doc,(err,data)=>{
        setCreatedOn(data)
        //console.log(data);
       done(data);
      })
      
    }).catch(err=>{
     // console.log('----------------------',err);
      done(null)
    });
        
  }
  
  this.updateProjectIssue=function(searchdoc,udatedoc,done){
    
    db.collection('IssueTracker').updateOne(searchdoc,{$set:{...udatedoc},$currentDate: { updated_on:true}},{upsert:false}).then((result)=>{ 
      
       done(result);
    }).catch(err=>{
      //console.log('----------------------',err);
      done(null)
    });
        
  }
  this.deleteProjectIssue=function(doc,done){
  
    db.collection('IssueTracker').deleteOne(doc,(err,result)=>{
      console.log(result)
      if(err){
        console.log(err)
        done(null);
        return;
      }
      done(result);
    })
  }

  return this;
}  