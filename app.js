//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://rkrana001:Test-123@cluster0.mmemhxm.mongodb.net/todolistDB")

const itemsSchema = {
  name : String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item ({
  name : "Welcome to your todolist"
})
const item2 = new Item ({
  name : "Hit the + button to add a new line"
})
const item3 = new Item ({
  name : "Hit the checkbox whenever complete a task"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  //const day = date.getDate();
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(() => {
      console.log("Inserted array items successfully")
    })
    res.redirect("/")
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;
  console.log(listName)

  const item = new Item ({
    name : newItem
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  }else {
    List.findOne({name : listName}).then((foundList) => {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
   }
});

app.post ("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(console.log("successfully deleted item"))
    res.redirect("/")
  }else {
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}).then(() => {
      res.redirect("/" + listName)
    })
  }
})

app.get("/:customListName", (req,res) => {
  const customListName = _.capitalize(req.params.customListName)
  
  List.findOne({name : customListName}).then((foundList) => {
    if (!foundList) {
      console.log("Doesn't Exists but creating")
      
      const list = new List ({
        name : customListName,
        items : defaultItems
      })

      list.save()
      res.redirect("/" + customListName)
    }else {
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  });
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
