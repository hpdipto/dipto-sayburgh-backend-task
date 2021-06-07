const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const graphql = require("graphql");
const { GraphQLID, GraphQLString, GraphQLObjectType, GraphQLList, GraphQLNonNull } = graphql;

const User = require("../models/user.models");
const { Post, Comment } = require("../models/post.models");
const { UserType, PostType, CommentType } = require("./types");

require("dotenv").config();

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        register: {
            type: UserType,
            args: {
                firstName: {
                    type: GraphQLString,
                },
                lastName: {
                    type: GraphQLString,
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(parent, args) {
                let password = await bcrypt.hash(args.password, 11);
                try {
                    let user = new User({
                        firstName: args.firstName,
                        lastName: args.lastName,
                        email: args.email,
                        password: password,
                    });

                    // save to db
                    let savedUser = user.save();
                    return savedUser;
                } catch (e) {
                    throw new Error(e);
                }
            },
        },
        login: {
            type: GraphQLString,
            args: {
                email: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(parent, args) {
                let { email, password } = args;
                let user = await User.findOne({ email: email });
                if (!user) {
                    throw new Error("No user found with this email");
                }
                let loginSuccess = await bcrypt.compare(password, user.password);
                if (loginSuccess) {
                    const token = jwt.sign(
                        {
                            user: user.id,
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "7d",
                        }
                    );
                    return token;
                } else throw new Error("Passowrd didn't match");
            },
        },
        createPost: {
            type: PostType,
            args: {
                title: {
                    type: GraphQLString,
                },
                post: {
                    type: GraphQLString,
                },
                tags: {
                    type: new GraphQLList(GraphQLString),
                },
            },
            async resolve(parent, args, context) {
                if (!context.req.user) throw new Error("Unauthorized user!");
                let post = await Post.create({
                    author: context.req.user,
                    title: args.title,
                    post: args.post,
                    tags: args.tags,
                });
                return post;
            },
        },
        updatePost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLString },
                post: { type: GraphQLString },
                tags: { type: new GraphQLList(GraphQLString) },
            },
            async resolve(parent, args, context) {
                if (!context.req.user) throw new Error("Unauthorized user!");
                let post = await Post.findById(args.id);
                if (post) {
                    if (context.req.user != post.author) throw new Error("Permission denied!");
                    else {
                        if (args.title) post.title = args.title;
                        if (args.post) post.post = args.post;
                        if (args.tags) post.tags = args.tags;
                        await post.save();
                        return post;
                    }
                } else throw new Error("No post found!");
            },
        },
        deletePost: {
            type: GraphQLString,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, args, context) {
                if (!context.req.user) throw new Error("Unauthorized user!");
                let post = await Post.findById(args.id);
                if (post) {
                    if (context.req.user != post.author) throw new Error("Permission denied!");
                    else {
                        await Post.findOneAndDelete(args.id);
                        return "Post deleted successfully";
                    }
                } else throw new Error("No post found!");
            },
        },
        createComment: {
            type: CommentType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                },
                comment: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(parent, args, context) {
                if (!context.req.user) throw new Error("Unauthorized user!");
                let post = await Post.findById(args.id);
                if (post) {
                    let comment = await Comment.create({
                        commenter: context.req.user,
                        comment: args.comment,
                        time: new Date().toDateString(),
                    });
                    console.log(comment);
                    post.comments.push(comment);
                    await post.save();
                    return comment;
                } else throw new Error("No post found!");
            },
        },
    },
});

module.exports = { Mutation };
