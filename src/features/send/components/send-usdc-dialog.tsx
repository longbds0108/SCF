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
import { UsdcIcon } from "@/components/usdc-icon";
import { SendUsdcFlow } from "@/features/send/components/send-usdc-flow";

export function SendUsdcDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <UsdcIcon className="h-4 w-4 shrink-0" />
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
