import { Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { AuthGuard, type RequestUser } from '../auth/auth.guard'
import { Store } from '../persistence/store'

@Controller()
export class WatchlistController {
  constructor(
    private readonly store: Store,
    private readonly auth: AuthGuard,
  ) {}

  @Get('me/watchlist')
  watchlist(@Req() request: RequestUser) {
    const user = this.auth.require(request)
    const savedIds = this.store.catalog.watchIds(user.id)
    return this.store.catalog.search({
      search: '',
      categories: [],
      conditions: [],
      location: '',
      minPrice: null,
      maxPrice: null,
      ending: '',
      sort: 'ending',
      page: 1,
      pageSize: 50,
      savedIds,
    })
  }

  @Post('me/watchlist/:auctionId')
  async watch(@Param('auctionId') auctionId: string, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const ids = this.store.catalog.toggleWatch(user.id, auctionId)
    await this.store.persist()
    return { savedIds: ids }
  }

  @Delete('me/watchlist/:auctionId')
  async unwatch(@Param('auctionId') auctionId: string, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const current = this.store.catalog.watchIds(user.id)
    if (current.includes(auctionId)) this.store.catalog.toggleWatch(user.id, auctionId)
    await this.store.persist()
    return { savedIds: this.store.catalog.watchIds(user.id) }
  }
}
