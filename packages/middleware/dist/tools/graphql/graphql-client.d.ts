export declare class GenericGraphQLClient {
    private client;
    constructor(endpoint: string, token?: string);
    request(query: string, variables?: Record<string, any>): Promise<unknown>;
}
//# sourceMappingURL=graphql-client.d.ts.map