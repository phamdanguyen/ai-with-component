"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericGraphQLClient = void 0;
const graphql_request_1 = require("graphql-request");
// Placeholder for future implementation of GraphQL Client
// This will handle the actual network request to the GraphQL server (Odoo or Gateway)
class GenericGraphQLClient {
    constructor(endpoint, token) {
        this.client = new graphql_request_1.GraphQLClient(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
    async request(query, variables) {
        return this.client.request(query, variables);
    }
}
exports.GenericGraphQLClient = GenericGraphQLClient;
//# sourceMappingURL=graphql-client.js.map