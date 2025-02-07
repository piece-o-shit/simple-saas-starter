
import { supabase } from "@/integrations/supabase/client";
import { Tool, ToolConfiguration } from "./types";
import { ToolExecutionError } from "./types";
import { toast } from "@/hooks/use-toast";

export const executeToolAction = async (
  toolId: string,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  try {
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (toolError) throw toolError;

    const typedTool: Tool = {
      id: tool.id,
      type: tool.type,
      configuration: typeof tool.configuration === 'string' ? 
        JSON.parse(tool.configuration) : 
        (tool.configuration || {}) as ToolConfiguration
    };

    let result: Record<string, any>;

    switch (typedTool.type) {
      case 'api':
        result = await executeApiTool(typedTool.configuration, input);
        break;
      case 'database':
        result = await executeDatabaseTool(typedTool.configuration, input);
        break;
      case 'file_system':
        result = await executeFileSystemTool(typedTool.configuration, input);
        break;
      case 'custom':
        result = await executeCustomTool(typedTool.configuration, input);
        break;
      default:
        throw new Error(`Unsupported tool type: ${typedTool.type}`);
    }

    return result;
  } catch (error: any) {
    const toolError = new ToolExecutionError(
      error.message,
      toolId,
      { input }
    );
    toast({
      variant: "destructive",
      title: "Tool execution failed",
      description: error.message,
    });
    throw toolError;
  }
};

const executeApiTool = async (
  configuration: ToolConfiguration,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const { url, method = 'GET', headers = {} } = configuration;
  if (!url) throw new Error('URL is required for API tool');

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: method !== 'GET' ? JSON.stringify(input) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
};

const executeDatabaseTool = async (
  configuration: ToolConfiguration,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const { table, operation, query } = configuration;
  if (!table || !operation) {
    throw new Error('Table and operation are required for database tool');
  }

  switch (operation) {
    case 'select':
      const { data, error } = await supabase
        .from(table)
        .select(query || '*');
      if (error) throw error;
      return { data };

    case 'insert':
      const { data: insertData, error: insertError } = await supabase
        .from(table)
        .insert(input)
        .select();
      if (insertError) throw insertError;
      return { data: insertData };

    case 'update':
      const { data: updateData, error: updateError } = await supabase
        .from(table)
        .update(input.data)
        .match(input.match)
        .select();
      if (updateError) throw updateError;
      return { data: updateData };

    default:
      throw new Error(`Unsupported database operation: ${operation}`);
  }
};

const executeFileSystemTool = async (
  configuration: ToolConfiguration,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const { bucket, operation } = configuration;
  if (!bucket || !operation) {
    throw new Error('Bucket and operation are required for file system tool');
  }

  switch (operation) {
    case 'upload':
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(input.path, input.file);
      if (uploadError) throw uploadError;
      return { data: uploadData };

    case 'download':
      const { data: downloadData, error: downloadError } = await supabase
        .storage
        .from(bucket)
        .download(input.path);
      if (downloadError) throw downloadError;
      return { data: downloadData };

    case 'list':
      const { data: listData, error: listError } = await supabase
        .storage
        .from(bucket)
        .list(input.path || '');
      if (listError) throw listError;
      return { data: listData };

    default:
      throw new Error(`Unsupported file system operation: ${operation}`);
  }
};

const executeCustomTool = async (
  configuration: ToolConfiguration,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const { functionName } = configuration;
  if (!functionName) {
    throw new Error('Function name is required for custom tool');
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: input,
  });

  if (error) throw error;
  return data;
};
