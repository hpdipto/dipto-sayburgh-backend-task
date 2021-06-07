const graphql = require("graphql");
const { GraphQLSchema } = graphql;

const { RootQuery } = require("./rootQuery");
const { Mutation } = require("./mutation");

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
