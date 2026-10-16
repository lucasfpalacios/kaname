import { BadRequestException, type PipeTransform } from "@nestjs/common";
import { ErrorCode } from "@kaname/shared";
import type { z } from "zod";

// Valida el body con un schema de @kaname/shared. Los errores salen como códigos (la web los
// traduce con Errors.<código>), nunca como texto.
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    throw new BadRequestException({
      message: ErrorCode.validationFailed,
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.message,
      })),
    });
  }
}
