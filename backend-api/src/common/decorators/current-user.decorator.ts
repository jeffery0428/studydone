import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type CurrentUserPayload = {
  userId: string;
  email: string;
  role?: "student" | "teacher";
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserPayload }>();
    return request.user;
  },
);

