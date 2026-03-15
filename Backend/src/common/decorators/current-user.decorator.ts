import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface JwtPayload {
    sub : string  // userId
    email : string
    role : string
    iat? : number
    exp? : number
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): JwtPayload | null => {
        const request = ctx.switchToHttp().getRequest()
        return request.user ?? null;
    },
)



// Ye code NestJs me ek custom parameter decorator (@currentUser)
// create krta hai jo controller methods me directly authenticated user ka data 
// access karne ke liye use hota h 
// JwtPayload interface define karta hai ki JWT token ke payload me kaun-kaun se fields (jaise sub, email, role, iat, exp) honge.