import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common'
import { AuthGuard, type RequestUser } from '../auth/auth.guard'
import type { BidQuery } from '../domain/query'
import { parseMoney } from '../domain/validation'
import { Store } from '../persistence/store'

@Controller()
export class BidsController {
  constructor(
    private readonly store: Store,
    private readonly auth: AuthGuard,
  ) {}

  @Post('auctions/:id/bids')
  async bid(@Param('id') id: string, @Body() body: { amount?: unknown }, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const result = this.store.catalog.placeBid(user.id, id, parseMoney(body.amount))
    if ('error' in result) throw new BadRequestException({ errors: { amount: result.error } })
    await this.store.persist()
    return result.auction
  }

  @Get('me/bids')
  bids(@Query() query: Record<string, string>, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const parsed: BidQuery = {
      status: (query.status as BidQuery['status']) || 'active',
      category: query.category ?? 'All Categories',
      sort: (query.sort as BidQuery['sort']) || 'ending',
      page: Number(query.page ?? 1) || 1,
      pageSize: Number(query.pageSize ?? 4) || 4,
    }
    return this.store.catalog.myBids(user.id, parsed)
  }
}
