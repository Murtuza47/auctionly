import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import mongoose, { Model, Schema } from 'mongoose'
import { CatalogService, seedUser } from '../domain/catalog.service'
import type { AuctionRecord, UserRecord } from '../domain/seed'

function documentSchema() {
  return new Schema(
    { id: { type: String, required: true, unique: true } },
    { strict: false, versionKey: false },
  )
}

function strip<T>(rows: Array<T & { _id?: unknown }>): T[] {
  return rows.map((row) => {
    const copy = { ...row } as T & { _id?: unknown }
    delete copy._id
    return copy
  })
}

@Injectable()
export class Store implements OnModuleInit {
  readonly catalog = new CatalogService()
  mongo = false
  private auctions?: Model<AuctionRecord>
  private users?: Model<UserRecord>

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const hash = await bcrypt.hash('Auction1', 8)
    this.catalog.users = [seedUser(hash)]
    const uri = this.config.get<string>('MONGODB_URI')?.trim()
    if (!uri) return

    await mongoose.connect(uri)
    this.auctions = mongoose.models.Auction ?? mongoose.model<AuctionRecord>('Auction', documentSchema())
    this.users = mongoose.models.User ?? mongoose.model<UserRecord>('User', documentSchema())
    const count = await this.auctions.countDocuments()
    if (count === 0) {
      await this.persist()
    } else {
      const auctions = await this.auctions.find().lean<AuctionRecord[]>()
      const users = await this.users.find().lean<UserRecord[]>()
      this.catalog.replaceAll(strip(auctions), strip(users))
    }
    this.mongo = true
  }

  async persist() {
    if (!this.auctions || !this.users) return
    await this.auctions.deleteMany({})
    await this.users.deleteMany({})
    if (this.catalog.auctions.length) await this.auctions.insertMany(this.catalog.auctions)
    if (this.catalog.users.length) await this.users.insertMany(this.catalog.users)
  }
}
