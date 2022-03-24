//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _= require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Pranjali_Bora:liveat46@cluster0.522la.mongodb.net/todolistDB")

const itemsSchema ={
  name:String
};
const Item = mongoose.model(
"Item"  ,  itemsSchema
);
const item1 = new Item({
  name:"Welcome to the To-Do"
});
const item2 = new Item({
  name:"Click + to add item"
});
const item3 = new Item({
  name:"Check the box to mark done!"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List =mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
   if(foundItems.length === 0){

     Item.insertMany( defaultItems,function err(){
       console.log("done");
     });
     res.redirect("/");
   }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
const listName =req.body.list;
  const item = new Item({
    name:itemName
  });
if(listName === "Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}
});

app.get("/:customList",function(req,res){
  var customList=_.capitalize(req.params.customList);
List.findOne({name:customList},function(err,foundList){
  if(!err){
    if(!foundList){
      //new list
      const list =new List({
        name:customList,
        items:defaultItems
      });

      list.save();
      res.render("/"+customList);
    }else{
      res.render("List",{listTitle:foundList.name, newListItems:foundList.items})
    }
  }

});



});

app.post("/delete",function(req, res){
const checkedItemID=req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
Item.findByIdAndRemove(checkedItemID,function(err){
  console.log("ok");
  res.redirect('/');
});
}else{
  List.findOneAndUpdate({name: listName},{
    $pull:{items:{_id:checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
}
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
