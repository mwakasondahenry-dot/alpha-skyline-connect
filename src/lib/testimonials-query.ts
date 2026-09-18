/** Published testimonials, shared by every page that shows them (one cache key). */
import { queryOptions } from "@tanstack/react-query";
import { getTestimonials } from "@/lib/alpha-content.functions";

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => getTestimonials(),
  staleTime: 5 * 60 * 1000,
});
