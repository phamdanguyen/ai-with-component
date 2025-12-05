
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLField,
    GraphQLScalarType,
    GraphQLNonNull,
    GraphQLList,
    printSchema,
    getIntrospectionQuery,
    buildClientSchema,
    GraphQLArgument
} from 'graphql';
import { Tool, ToolParameter } from '../types';

export class GraphQLToolAdapter {
    constructor(private schema: GraphQLSchema) { }

    /**
     * Introspects the schema and returns a list of Tools corresponding to Queries and Mutations.
     */
    generateTools(): Tool[] {
        const tools: Tool[] = [];

        const queryType = this.schema.getQueryType();
        if (queryType) {
            tools.push(...this.convertFieldsToTools(queryType, 'query'));
        }

        const mutationType = this.schema.getMutationType();
        if (mutationType) {
            tools.push(...this.convertFieldsToTools(mutationType, 'mutation'));
        }

        return tools;
    }

    private convertFieldsToTools(type: GraphQLObjectType, operation: 'query' | 'mutation'): Tool[] {
        const fields = type.getFields();
        return Object.values(fields).map(field => this.createToolFromField(field, operation));
    }

    private createToolFromField(field: GraphQLField<any, any>, operation: 'query' | 'mutation'): Tool {
        const parameters = field.args.map((arg: GraphQLArgument) => ({
            name: arg.name,
            type: this.mapGraphQLTypeToToolType(arg.type),
            description: arg.description || '',
            required: arg.type instanceof GraphQLNonNull
        }));

        // Add selection set parameter for Queries to allow choosing return fields
        if (operation === 'query') {
            parameters.push({
                name: 'fields',
                type: 'string',
                description: 'GraphQL selection set (e.g. "id name price")',
                required: true
            });
        }

        return {
            name: `graphql_${operation}_${field.name}`,
            description: `[GraphQL ${operation}] ${field.description || `Execute ${field.name}`}`,
            parameters,
            execute: async (params) => {
                // This is a placeholder. The actual execution will be handled by the GraphQLClient
                // using the constructed query.
                return {
                    success: true,
                    data: {
                        query: this.constructQuery(operation, field.name, params),
                        variables: params
                    },
                    executionTime: 0
                };
            }
        };
    }

    private mapGraphQLTypeToToolType(type: any): 'string' | 'number' | 'boolean' | 'object' {
        if (type instanceof GraphQLNonNull) {
            return this.mapGraphQLTypeToToolType(type.ofType);
        }
        if (type instanceof GraphQLList) {
            return 'object'; // Array represented as object
        }
        if (type instanceof GraphQLScalarType) {
            switch (type.name) {
                case 'Int':
                case 'Float':
                    return 'number';
                case 'Boolean':
                    return 'boolean';
                default:
                    return 'string';
            }
        }
        return 'object';
    }

    private constructQuery(operation: 'query' | 'mutation', fieldName: string, params: Record<string, any>): string {
        const args = Object.keys(params)
            .filter(key => key !== 'fields')
            .map(key => `${key}: $${key}`)
            .join(', ');

        const fields = params.fields || '';

        // Note: This simple construction assumes top-level variables. 
        // In a real implementation, we would need to generate the variable definitions ($var: Type) properly.
        return `${operation} ${fieldName}Query {
      ${fieldName}${args ? `(${args})` : ''} {
        ${fields}
      }
    }`;
    }
}
