// service of prisma here 
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name)

    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE })
        super({
            adapter,
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'warn' },
            ],
        })
    }

    async onModuleInit(): Promise<void> {
        await this.$connect()
        this.logger.log('Database connected')

        // Log slow queries in development
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any).$on('query', (e: { query: string; duration: number }) => {
                if (e.duration > 200) {
                    this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
                }
            })
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect()
        this.logger.log('Database disconnected')
    }

     /**
   * Use inside services for atomic operations.
   * Example: await this.prisma.$transaction(async (tx) => { ... })
   */
}
