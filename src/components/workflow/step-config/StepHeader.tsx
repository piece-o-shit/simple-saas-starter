
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";

interface StepHeaderProps {
  stepOrder: number;
  onMoveStep: (direction: 'up' | 'down') => void;
  onDeleteStep: () => void;
}

export function StepHeader({ stepOrder, onMoveStep, onDeleteStep }: StepHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Badge variant="secondary">Step {stepOrder + 1}</Badge>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveStep('up')}
          disabled={stepOrder === 0}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteStep}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
