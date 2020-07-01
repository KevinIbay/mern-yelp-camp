let express = require("express");
let router  = express.Router();
let Campground = require("../models/campground");
let middleware = require("../middleware");
const { findByIdAndRemove } = require("../models/campground");
const campground = require("../models/campground");


// INDEX - show all campgrounds
router.get("/", (req, res) => {
    // Get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
        res.render("campgrounds/index", {campgrounds : allCampgrounds});
        }
    })
})

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from form and add to campgrounds arr
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newCampground = {name: name, image: image, description: desc, author: author};
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) {
            console.log(err);
        } else {
          // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
})

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})

// SHOW - shows more info about 1 campground
router.get("/:id", (req, res) => {
    // find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err) {
            console.log(err)
        } else {
             // render show template w/ that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    })
})

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
        Campground.findById(req.params.id, (err, foundCampground) => {
            res.render("campgrounds/edit", {campground: foundCampground});
        })
})

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    })
    // redirect somewhere (show page)
})

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;