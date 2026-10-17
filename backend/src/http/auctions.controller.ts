import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common'
import { AuthGuard, type RequestUser } from '../auth/auth.guard'
import type { AuctionQuery, EndingWindow, SortKey } from '../domain/query'
import { parseMoney } from '../domain/validation'
import { Store } from '../persistence/store'

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value) return [value]
  return []
}

@Controller()
export class AuctionsController {
  constructor(
    private readonly store: Store,
    private readonly auth: AuthGuard,
  ) {}

  @Get('auctions/home')
  home() {
    return this.store.catalog.home()
  }

  @Get('auctions')
  auctions(@Query() query: Record<string, unknown>, @Req() request: RequestUser) {
    const saved = query.saved === '1' || query.saved === 'true'
    const user = saved ? this.auth.require(request) : request.user
    const parsed: AuctionQuery = {
      search: String(query.q ?? ''),
      categories: list(query.category),
      conditions: list(query.condition),
      location: String(query.location ?? ''),
      minPrice: query.minPrice === undefined || query.minPrice === '' ? null : parseMoney(query.minPrice),
      maxPrice: query.maxPrice === undefined || query.maxPrice === '' ? null : parseMoney(query.maxPrice),
      ending: String(query.ending ?? '') as EndingWindow,
      sort: (String(query.sort ?? 'ending') || 'ending') as SortKey,
      page: Number(query.page ?? 1) || 1,
      pageSize: Number(query.pageSize ?? 9) || 9,
      savedIds: saved ? user?.watchIds ?? [] : undefined,
    }
    return this.store.catalog.search(parsed)
  }

  @Get('auctions/:id')
  one(@Param('id') id: string) {
    const auction = this.store.catalog.getAuction(id)
    if (!auction) throw new NotFoundException({ errors: { auction: 'Auction not found' } })
    return auction
  }

  @Post('auctions')
  async create(@Body() body: Record<string, unknown>, @Req() request: RequestUser) {
    const user = this.auth.require(request)
    const result = this.store.catalog.createListing(user.id, {
      title: String(body.title ?? ''),
      category: String(body.category ?? ''),
      condition: String(body.condition ?? ''),
      description: String(body.description ?? ''),
      startingPrice: parseMoney(body.startingPrice),
      reservePrice: body.reservePrice === '' || body.reservePrice === undefined || body.reservePrice === null ? null : parseMoney(body.reservePrice),
      location: String(body.location ?? ''),
      pickup: Boolean(body.pickup),
      domestic: Boolean(body.domestic),
      international: Boolean(body.international),
      pickupNotes: String(body.pickupNotes ?? ''),
      durationDays: Number(body.durationDays ?? 7),
      photos: Array.isArray(body.photos) ? body.photos.map(String) : [],
      publish: body.publish !== false,
    })
    if ('errors' in result) throw new BadRequestException(result)
    await this.store.persist()
    return result.auction
  }

  @Get('health')
  health() {
    return { ok: true, mongo: this.store.mongo }
  }
}
