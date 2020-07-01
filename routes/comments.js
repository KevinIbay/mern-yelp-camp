let express = require("express");
let router  = express.Router({mergeParams: true});
let Campground = require("../models/campground");
let Comment = require("../models/comment");
let middleware = require("../middleware");

// add new comment
router.get("/new", middleware.isLoggedIn, (req, res) => {
    //find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    })
})

// create new comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    // look up campground using id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    // redirect to campground show page
                    req.flash("success", "Successfully added comment");
                    res.redirect(`/campgrounds/${campground._id}`);
                }
            })
        }
    })
})

// EDIT COMMENT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
        }
    })
})

// UPDATE COMMENT ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    } )
})

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    })
})

module.exports = router;