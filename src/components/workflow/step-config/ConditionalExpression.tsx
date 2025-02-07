
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StepConfigFormValues } from './types';

interface ConditionalExpressionProps {
  form: UseFormReturn<StepConfigFormValues>;
}

export function ConditionalExpression({ form }: ConditionalExpressionProps) {
  return (
    <FormField
      control={form.control}
      name="conditional_expression"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Conditional Expression</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Enter condition" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
