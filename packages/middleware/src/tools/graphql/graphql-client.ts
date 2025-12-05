
import { GraphQLClient } from 'graphql-request';

// Placeholder for future implementation of GraphQL Client
// This will handle the actual network request to the GraphQL server (Odoo or Gateway)
export class GenericGraphQLClient {
    private client: GraphQLClient;

    constructor(endpoint: string, token?: string) {
        this.client = new GraphQLClient(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async request(query: string, variables?: Record<string, any>) {
        return this.client.request(query, variables);
    }
}
