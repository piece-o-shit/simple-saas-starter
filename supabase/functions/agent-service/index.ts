
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "https://esm.sh/@langchain/openai@0.0.14";
import { JsonOutputParser } from "https://esm.sh/@langchain/core/output_parsers";
import { StructuredOutputParser } from "https://esm.sh/@langchain/core/output_parsers";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, executionId, agentId } = await req.json();

    if (!query) {
      throw new Error('No query provided');
    }

    const model = new ChatOpenAI({
      openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
      modelName: "gpt-4-1106-preview",
      temperature: 0.7,
    });

    // Create a structured output parser
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      action: "The next action to take",
      reasoning: "The reasoning behind the action",
      response: "The response to the user",
    });

    console.log('Invoking LangChain with query:', query);
    
    const response = await model.invoke(query);
    console.log('LangChain response received');

    // Update execution status in database if executionId is provided
    if (executionId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('agent_executions')
        .update({
          status: 'completed',
          output: { response: response.content },
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId);
    }

    return new Response(
      JSON.stringify({ content: response.content }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in agent-service:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
