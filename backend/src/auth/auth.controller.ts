import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { AuthGuard, type RequestUser } from './auth.guard'
import { Store } from '../persistence/store'
import { initialsFromName } from '../domain/validation'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly store: Store,
    private readonly jwt: JwtService,
    private readonly auth: AuthGuard,
  ) {}

  @Post('register')
  async register(@Body() body: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    acceptedTerms?: boolean
  }) {
    const errors = this.store.catalog.checkSignup(body)
    if (Object.keys(errors).length) throw new BadRequestException({ errors })
    const id = `user-${Date.now()}`
    const name = body.name!.trim()
    this.store.catalog.addUser({
      id,
      name,
      email: body.email!.trim(),
      passwordHash: await bcrypt.hash(body.password!, 8),
      initials: initialsFromName(name),
      displayName: name,
      handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'member'}`,
      bio: '',
      location: '',
      memberSince: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      rating: 0,
      reviews: 0,
      avatar: 'avatar',
      watchIds: [],
      bids: [],
      activity: [],
      notifications: [],
      stats: [
        { label: 'Active Listings', value: '0' },
        { label: 'Auctions Won', value: '0' },
        { label: 'Completed Tx', value: '0' },
        { label: 'Total Earnings', value: '$0' },
      ],
    })
    await this.store.persist()
    return this.tokenFor(id, false)
  }

  @Post('login')
  async login(@Body() body: { email?: string; password?: string; remember?: boolean }) {
    const errors = this.store.catalog.checkLogin(body)
    if (Object.keys(errors).length) throw new BadRequestException({ errors })
    const user = this.store.catalog.findUserByEmail(body.email ?? '')
    const matches = user ? await bcrypt.compare(body.password ?? '', user.passwordHash) : false
    if (!user || !matches) {
      throw new BadRequestException({ errors: { password: 'Email or password is incorrect' } })
    }
    return this.tokenFor(user.id, Boolean(body.remember))
  }

  @Get('me')
  me(@Req() request: RequestUser) {
    const user = this.auth.require(request)
    return { user: this.store.catalog.publicUser(user) }
  }

  private tokenFor(id: string, remember: boolean) {
    const user = this.store.catalog.findUser(id)!
    const accessToken = this.jwt.sign({ sub: id }, { expiresIn: remember ? '30d' : '1d' })
    return { accessToken, user: this.store.catalog.publicUser(user) }
  }
}
