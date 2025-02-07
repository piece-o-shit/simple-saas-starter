
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StepConfigFormValues } from './types';

interface ToolSelectorProps {
  form: UseFormReturn<StepConfigFormValues>;
  tools: Array<{ id: string; name: string; }>;
}

export function ToolSelector({ form, tools }: ToolSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="tool_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tool</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {tools?.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
