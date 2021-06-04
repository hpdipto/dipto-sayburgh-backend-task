const bcrypt = require("bcrypt");
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
const UserType = new graphql.GraphQLObjectType({
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
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
