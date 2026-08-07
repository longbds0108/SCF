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
import { SendUsdcFlow } from "@/features/send/components/send-usdc-flow";

export function SendUsdcDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Send USDC
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send USDC</DialogTitle>
        </DialogHeader>
        <SendUsdcFlow onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
