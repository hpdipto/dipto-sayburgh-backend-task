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

// Root Query
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    description: "Root Query",
    fields: () => ({
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
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
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
