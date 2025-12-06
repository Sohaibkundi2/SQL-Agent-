import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sqlGeneratorTool } from '@/lib/tools';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  // console.log('API route hit');
  
  try {
    const { message, history = [] } = await request.json();
    // console.log('User message:', message);

    // Initialize model with tool
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: sqlGeneratorTool as any }],
    });

    // Start chat
    const chat = model.startChat({
      history: history,
    });

    // Send message
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    // Check if model generated a SQL query
    const functionCall = response.functionCalls()?.[0];
    
    if (functionCall && functionCall.name === 'generate_sql_query') {
      const { query, explanation } = functionCall.args as { query: string; explanation: string };
      
      // console.log(' SQL Generated:', query);
      // console.log(' Explanation:', explanation);
      
      // Return the SQL query and explanation
      return NextResponse.json({
        type: 'sql_generated',
        query: query,
        explanation: explanation,
        message: `Here's the SQL query:\n\n\`\`\`sql\n${query}\n\`\`\`\n\n**Explanation:** ${explanation}`
      });
    }

    // If no function call, return regular text response
    return NextResponse.json({
      type: 'text',
      message: response.text()
    });

  } catch (error: any) {
    console.error(' Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}