import { z } from "zod";

import { isValidAssetCode, isValidPublicKey } from "@/lib/stellar";

export interface Trustline {
  assetCode: string;
  assetIssuer: string;
  balance: string;
}

export const addTrustlineFormSchema = z.object({
  assetCode: z
    .string()
    .trim()
    .min(1, "Enter an asset code.")
    .refine(isValidAssetCode, { message: "Asset code must be 1-12 letters or numbers." }),
  assetIssuer: z
    .string()
    .trim()
    .min(1, "Enter the issuer address.")
    .refine(isValidPublicKey, { message: "Enter a valid Stellar issuer address (starts with G)." }),
});

export type AddTrustlineFormInput = z.input<typeof addTrustlineFormSchema>;
export type AddTrustlineFormValues = z.output<typeof addTrustlineFormSchema>;

export interface AddTrustlineFieldErrors {
  assetCode?: string;
  assetIssuer?: string;
}

type AddTrustlineValidationResult =
  | { success: true; data: AddTrustlineFormValues }
  | { success: false; errors: AddTrustlineFieldErrors };

/** Pure, context-free validation — shape and format only, no network calls. */
export function validateAddTrustlineForm(
  input: AddTrustlineFormInput,
): AddTrustlineValidationResult {
  const result = addTrustlineFormSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors = result.error.flatten().fieldErrors;
  return {
    success: false,
    errors: {
      assetCode: fieldErrors.assetCode?.[0],
      assetIssuer: fieldErrors.assetIssuer?.[0],
    },
  };
}
