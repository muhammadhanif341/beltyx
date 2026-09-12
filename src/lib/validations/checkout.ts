import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Enter the recipient's full name."),
  phone: z.string().min(7, "Enter a valid phone number."),
  email: z.string().email("Enter a valid email address."),
  line1: z.string().min(3, "Enter a street address."),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city."),
  state: z.string().optional(),
  postalCode: z.string().min(3, "Enter a postal code."),
  country: z.string().min(2, "Enter a country."),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  notes: z.string().optional(),
});
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().min(2, "Enter a subject."),
  message: z.string().min(10, "Message should be at least 10 characters."),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(2, "Give your review a short title.").optional().or(z.literal("")),
  body: z.string().min(10, "Share at least a sentence or two."),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
