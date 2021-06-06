const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        post: {
            type: String,
            required: true,
        },
        tags: [
            {
                type: String,
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const CommentSchema = new Schema(
    {
        commenter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model("Post", PostSchema);
const Comment = mongoose.model("Comment", CommentSchema);

module.exports = { Post, Comment };
