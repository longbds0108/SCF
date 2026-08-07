import { z } from "zod";

import { isValidPublicKey } from "@/lib/stellar";

const MEMO_MAX_BYTES = 28;

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** Asset-agnostic: destination/amount/memo validation is identical for XLM and USDC. */
export const sendPaymentFormSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(1, "Enter a destination address.")
    .refine(isValidPublicKey, { message: "Enter a valid Stellar public key (starts with G)." }),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .refine((value) => /^\d+(\.\d{1,7})?$/.test(value), {
      message: "Enter a positive number with up to 7 decimal places.",
    })
    .refine((value) => Number(value) > 0, { message: "Amount must be greater than 0." }),
  memo: z.string().refine((value) => utf8ByteLength(value.trim()) <= MEMO_MAX_BYTES, {
    message: `Memo must be ${MEMO_MAX_BYTES} bytes or fewer.`,
  }),
});

export type SendPaymentFormInput = z.input<typeof sendPaymentFormSchema>;
export type SendPaymentFormValues = z.output<typeof sendPaymentFormSchema>;

export interface SendPaymentFieldErrors {
  destination?: string;
  amount?: string;
  memo?: string;
}

type SendPaymentValidationResult =
  | { success: true; data: SendPaymentFormValues }
  | { success: false; errors: SendPaymentFieldErrors };

/** Pure, context-free validation — shape and format only, no network calls. */
export function validateSendPaymentForm(input: SendPaymentFormInput): SendPaymentValidationResult {
  const result = sendPaymentFormSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors = result.error.flatten().fieldErrors;
  return {
    success: false,
    errors: {
      destination: fieldErrors.destination?.[0],
      amount: fieldErrors.amount?.[0],
      memo: fieldErrors.memo?.[0],
    },
  };
}
