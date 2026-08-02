import { z } from "zod";

export const submissionTypeSchema = z.enum([
  "NEW_WORD",
  "CORRECTION",
  "AUDIO",
  "EXAMPLE",
  "CULTURAL_NOTE",
  "ALTERNATIVE_SPELLING",
]);

export const communitySubmissionSchema = z.object({
  type: submissionTypeSchema,
  payload: z.record(z.string(), z.unknown()),
  submitterNote: z.string().max(1000).optional(),
  submitterEmail: z.string().email().optional(),
});

export type CommunitySubmissionInput = z.infer<
  typeof communitySubmissionSchema
>;
