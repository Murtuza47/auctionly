import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { UserRecord } from '../domain/seed'
import { Store } from '../persistence/store'

export type RequestUser = { user?: UserRecord }

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly store: Store,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestUser & { headers: { authorization?: string } }>()
    request.user = this.readUser(request.headers.authorization)
    return true
  }

  require(request: RequestUser): UserRecord {
    if (!request.user) throw new UnauthorizedException({ errors: { auth: 'Sign in to continue' } })
    return request.user
  }

  private readUser(header?: string): UserRecord | undefined {
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return undefined
    try {
      const payload = this.jwt.verify<{ sub: string }>(token)
      return this.store.catalog.findUser(payload.sub) ?? undefined
    } catch {
      return undefined
    }
  }
}
