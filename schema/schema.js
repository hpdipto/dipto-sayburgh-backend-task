const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const graphql = require("graphql");
const {
    GraphQLID,
    GraphQLSchema,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

const User = require("../models/user.models");
const { Post } = require("../models/post.models");

// Create Type
const UserType = new GraphQLObjectType({
    name: "User",
    description: "Documentation for User",
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});

const PostType = new GraphQLObjectType({
    name: "Post",
    description: "Documentation for Post",
    fields: () => ({
        id: { type: GraphQLID },
        author: { type: GraphQLID },
        title: { type: GraphQLString },
        post: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) },
        comments: { type: new GraphQLList(CommentType) },
    }),
});

const CommentType = new GraphQLObjectType({
    name: "Comment",
    description: "Documentation for Comment",
    fields: () => ({
        id: { type: GraphQLID },
        commenter: { type: GraphQLID },
        comment: { type: GraphQLString },
        time: { type: GraphQLString },
    }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    description: "Root Query",
    fields: () => ({
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args, context) {
                if (context.req.user) return User.find({});
                else throw new Error("Unauthorized user!");
            },
        },
        me: {
            type: UserType,
            async resolve(parent, args, context) {
                let token = context.req.headers.authorization;
                if (!token) {
                    throw new Error("Unauthorized user!");
                }
                let user = await User.find({});
                return user[0];
            },
        },
    }),
});

// Mutations
const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        createUser: {
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
                let user = new User({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    email: args.email,
                    password: password,
                });
                // save to db
                user.save();

                return user;
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
                        "secRet",
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
                id: { type: GraphQLID },
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
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
