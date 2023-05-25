const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Implement database
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const rubbish = new Item({
  name: "Throw rubbish"
});
const clean = new Item({
  name: "Clean house"
});
const grocery = new Item({
  name: "Do groceries"
});

// insert data to the collection
const defaultItems = [rubbish, clean, grocery];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// Item.deleteOne({name: "Do groceries"}).then(function(){
//   mongoose.connection.close();
//   console.log("Successfully delete item.");
// }).catch(function(error){
//   console.log(error);
// });

app.get("/", function(req, res){
  // log all items in the collection
  Item.find().then(function(foundItems){
    // Check items availability in collection
    if (foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Successfully insert default items.");
      }).catch(function(error){
        console.log(error);
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      // Create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
    } else {
      // Show existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(error){
    console.log(error);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    // insert new item
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkedbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    // Delete finished item(s)
    Item.findByIdAndRemove(checkedItemId).then(function(){
      console.log("Successfully delete finished item.");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(function(){
      res.redirect("/" + listName);
    });
  }

});

app.post("/work", function(req, res) {
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function(){
  console.log("Server running from server 3000.");
});
