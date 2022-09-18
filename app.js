

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var date = new Date();
  var op={
    weekday:"long",
    day:"numeric",
    month:"long"

  };
var day=date.toLocaleDateString("en-US",op);

mongoose.connect("mongodb+srv:XXXXX");

const Todoschema = {
  name:String,
  p:Number
};

const Todo = mongoose.model("Todo",Todoschema);





const new_items = [];
const Listschema = {
  name:String,
  items:[Todoschema]
}

const List = mongoose.model("List",Listschema);



//Todo.insertMany(defailt,function(err){
  //if(err){
  //  console.log(err);

 // } 
  //else{
  //  console.log("Successfully saved");
  //} 
//})

app.get("/", function(req, res) {
  
  Todo.find({},function(err,found){
    
    res.render("list", {listTitle: day, newListItems: found});
    
  });

}); 

app.get("/:custom",function(req,res){
   const customname = _.capitalize(req.params.custom);
   
   List.findOne({name:customname},function(err,foundlist){
    if(!err){
      if(!foundlist){
      const list = new List({   
        name:customname,
        items:new_items
       });
       list.save();
       res.redirect("/"+customname);
    }
    else{
      
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items})
      
    } 

  }
  
  });
  
});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname = req.body.list;
  const pr = req.body.priority;
  const item = new Todo({
    name:itemname,
    p:pr
  });
  if(listname === day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      
      foundlist.save();
      res.redirect("/"+listname);
    });
  }
  
});

app.post("/delete",function(req,res){
  const checkedid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === day){
   Todo.findByIdAndRemove(checkedid,function(err){
      if(!err){
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedid}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    
    })
  }
  
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
app.listen(3000, function() {
  console.log("Server started on port 3000 successfully!!!");
});
