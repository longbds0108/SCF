"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SC_VAL_TYPES,
  type ContractArgInput,
  type ScValArgType,
} from "@/features/contracts/types/contract";

interface ContractArgsEditorProps {
  args: ContractArgInput[];
  errors?: (string | undefined)[];
  onChange: (args: ContractArgInput[]) => void;
  label?: string;
  /** Fixed at one row, no add/remove — used for single-value inputs like a storage key. */
  singleRow?: boolean;
}

/** Reusable typed-argument list editor: used for invoke args and for a storage-read key. */
export function ContractArgsEditor({
  args,
  errors,
  onChange,
  label = "Arguments",
  singleRow = false,
}: ContractArgsEditorProps) {
  function updateArg(index: number, patch: Partial<ContractArgInput>) {
    onChange(args.map((arg, i) => (i === index ? { ...arg, ...patch } : arg)));
  }

  function addArg() {
    onChange([...args, { type: "string", value: "" }]);
  }

  function removeArg(index: number) {
    onChange(args.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!singleRow && (
          <Button type="button" size="sm" variant="outline" onClick={addArg}>
            Add
          </Button>
        )}
      </div>

      {args.length === 0 && <p className="text-xs text-muted-foreground">No arguments.</p>}

      {args.map((arg, index) => (
        <div key={index} className="space-y-1">
          <div className="flex gap-2">
            <Select
              value={arg.type}
              onValueChange={(type) => updateArg(index, { type: type as ScValArgType })}
            >
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SC_VAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={arg.value}
              onChange={(event) => updateArg(index, { value: event.target.value })}
              placeholder="value"
              className="flex-1"
            />
            {!singleRow && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeArg(index)}
                aria-label="Remove argument"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors?.[index] && <p className="text-xs text-destructive">{errors[index]}</p>}
        </div>
      ))}
    </div>
  );
}
