import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Enter a full name."),
  phone: z.string().min(7, "Enter a valid phone number."),
  line1: z.string().min(3, "Enter a street address."),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city."),
  state: z.string().optional(),
  postalCode: z.string().min(3, "Enter a postal code."),
  country: z.string().min(2, "Enter a country."),
  isDefault: z.boolean(),
});
export type AddressInput = z.infer<typeof addressSchema>;
