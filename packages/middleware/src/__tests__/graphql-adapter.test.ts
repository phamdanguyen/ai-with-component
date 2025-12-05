
import { describe, it, expect } from 'vitest';
import { buildSchema } from 'graphql';
import { GraphQLToolAdapter } from '../tools/graphql/graphql-adapter';

describe('GraphQLToolAdapter', () => {
    it('should generate tools from GraphQL schema', () => {
        const schema = buildSchema(`
      type Query {
        getUser(id: ID!): User
        listProducts(category: String): [Product]
      }
      type Mutation {
        createOrder(productId: ID!, quantity: Int!): Order
      }
      type User { id: ID, name: String }
      type Product { id: ID, name: String, price: Float }
      type Order { id: ID, total: Float }
    `);

        const adapter = new GraphQLToolAdapter(schema);
        const tools = adapter.generateTools();

        expect(tools.length).toBe(3); // getUser, listProducts, createOrder

        const getUserTool = tools.find(t => t.name === 'graphql_query_getUser');
        expect(getUserTool).toBeDefined();
        expect(getUserTool?.parameters).toContainEqual(expect.objectContaining({ name: 'id', required: true }));
        expect(getUserTool?.parameters).toContainEqual(expect.objectContaining({ name: 'fields', required: true }));

        const createOrderTool = tools.find(t => t.name === 'graphql_mutation_createOrder');
        expect(createOrderTool).toBeDefined();
        expect(createOrderTool?.parameters).toContainEqual(expect.objectContaining({ name: 'quantity', type: 'number' }));
    });

    it('should construct correct query', async () => {
        const schema = buildSchema(`type Query { getWeather(city: String): String }`);
        const adapter = new GraphQLToolAdapter(schema);
        const tools = adapter.generateTools();
        const tool = tools[0];

        const result = await tool.execute({ city: 'Hanoi', fields: 'temperature' });

        expect(result.success).toBe(true);
        expect(result.data.query).toContain('query getWeatherQuery');
        expect(result.data.query).toContain('getWeather(city: $city)');
        expect(result.data.query).toContain('temperature');
        expect(result.data.variables).toEqual({ city: 'Hanoi', fields: 'temperature' });
    });
});
