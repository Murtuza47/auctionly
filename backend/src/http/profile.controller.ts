import { Body, Controller, Get, Patch, Req } from '@nestjs/common'
import { AuthGuard, type RequestUser } from '../auth/auth.guard'
import { Store } from '../persistence/store'

@Controller()
export class ProfileController {
  constructor(
    private readonly store: Store,
    private readonly auth: AuthGuard,
  ) {}

  @Get('me/profile')
  profile(@Req() request: RequestUser) {
    const user = this.auth.require(request)
    return this.store.catalog.profile(user.id)
  }

  @Patch('me/profile')
  async updateProfile(@Body() body: { name?: string; bio?: string }, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const profile = this.store.catalog.updateProfile(user.id, body)
    await this.store.persist()
    return profile
  }

  @Get('me/notifications')
  notifications(@Req() request: RequestUser) {
    const user = this.auth.require(request)
    return { items: this.store.catalog.notifications(user.id) }
  }
}
