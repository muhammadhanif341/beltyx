import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  fullName: z.string().min(2, "Enter the recipient's full name."),
  phone: z.string().min(7, "Enter a valid phone number."),
  line1: z.string().min(3, "Enter a street address."),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city."),
  state: z.string().optional(),
  postalCode: z.string().min(3, "Enter a postal code."),
  country: z.string().min(2, "Enter a country."),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.string().min(1, "Select a payment method."),
  notes: z.string().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const CHECKOUT_STEPS = [
  { id: 1, title: "Customer Information" },
  { id: 2, title: "Shipping Address" },
  { id: 3, title: "Shipping Method" },
  { id: 4, title: "Payment" },
  { id: 5, title: "Order Review" },
] as const;

export const CHECKOUT_STEP_FIELDS: Record<number, (keyof CheckoutInput)[]> = {
  1: ["email"],
  2: ["fullName", "phone", "line1", "city", "postalCode", "country"],
  3: ["shippingMethod"],
  4: ["paymentMethod"],
  5: [],
};

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
