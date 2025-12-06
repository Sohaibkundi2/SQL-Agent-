export const sqlGeneratorTool = [
  {
    name: "generate_sql_query",
    description: `Generates a SQL query based on user's natural language request.

Available tables and schema:
- customers: id (INTEGER), name (TEXT), email (TEXT), total_spent (REAL), created_at (TEXT)
- orders: id (INTEGER), customer_id (INTEGER), amount (REAL), order_date (TEXT), status (TEXT)

Generate proper SQLite syntax for SELECT queries.`,
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "The SQL SELECT query in proper SQLite syntax"
        },
        explanation: {
          type: "string",
          description: "Brief explanation of what this query does"
        }
      },
      required: ["query", "explanation"]
    }
  }
];