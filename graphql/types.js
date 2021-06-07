const graphql = require("graphql");
const { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLList } = graphql;

const User = require("../models/user.models");
const { Comment } = require("../models/post.models");

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
        title: { type: GraphQLString },
        post: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) },
        author: {
            type: UserType,
            async resolve(parent, args) {
                let user = await User.findOne(parent.author);
                return user;
            },
        },
        comments: {
            type: new GraphQLList(CommentType),
            async resolve(parent, args) {
                let comments = await Comment.find({ _id: { $in: parent.comments } });
                return comments;
            },
        },
    }),
});

const CommentType = new GraphQLObjectType({
    name: "Comment",
    description: "Documentation for Comment",
    fields: () => ({
        id: { type: GraphQLID },
        commenter: {
            type: UserType,
            async resolve(parent, args) {
                let user = await User.findById(parent.commenter);
                return user;
            },
        },
        comment: { type: GraphQLString },
        time: { type: GraphQLString },
    }),
});

module.exports = { UserType, PostType, CommentType };
