"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SendXlmFlow } from "@/features/send/components/send-xlm-flow";

export function SendXlmDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Send XLM</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send XLM</DialogTitle>
        </DialogHeader>
        <SendXlmFlow onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
