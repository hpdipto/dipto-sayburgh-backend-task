const graphql = require("graphql");
const { GraphQLID, GraphQLObjectType, GraphQLList, GraphQLNonNull } = graphql;

const User = require("../models/user.models");
const { Post } = require("../models/post.models");
const { UserType, PostType } = require("./types");

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
        posts: {
            type: new GraphQLList(PostType),
            async resolve(parent, args, context) {
                let posts = Post.find({});
                return posts;
            },
        },
        post: {
            type: PostType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                },
            },
            async resolve(parent, args, context) {
                let post = await Post.findById(args.id);
                if (post) {
                    return post;
                } else throw new Error("No post found");
            },
        },
    }),
});

module.exports = { RootQuery };
