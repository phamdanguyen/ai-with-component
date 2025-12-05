import { GraphQLSchema } from 'graphql';
import { Tool } from '../types';
export declare class GraphQLToolAdapter {
    private schema;
    constructor(schema: GraphQLSchema);
    /**
     * Introspects the schema and returns a list of Tools corresponding to Queries and Mutations.
     */
    generateTools(): Tool[];
    private convertFieldsToTools;
    private createToolFromField;
    private mapGraphQLTypeToToolType;
    private constructQuery;
}
//# sourceMappingURL=graphql-adapter.d.ts.map