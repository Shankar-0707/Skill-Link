import 'dotenv/config'
import { PrismaClient, Role, KycStatus, JobStatus, ReservationStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {

    console.log("🌱 Starting database seed...")

    // ---------------------------
    // ADMIN
    // ---------------------------

    const admin = await prisma.user.create({
        data: {
            email: "admin@skilllink.com",
            phone: "9000000000",
            passwordHash: "admin123",
            role: Role.ADMIN
        }
    })


    // ---------------------------
    // CUSTOMERS
    // ---------------------------

    const customerUser1 = await prisma.user.create({
        data: {
            email: "customer1@test.com",
            phone: "9000000001",
            passwordHash: "test123",
            role: Role.CUSTOMER,
            customer: {
                create: {}
            }
        },
        include: { customer: true }
    })

    const customerUser2 = await prisma.user.create({
        data: {
            email: "customer2@test.com",
            phone: "9000000002",
            passwordHash: "test123",
            role: Role.CUSTOMER,
            customer: {
                create: {}
            }
        },
        include: { customer: true }
    })


    // ---------------------------
    // WORKERS
    // ---------------------------

    const workerUser1 = await prisma.user.create({
        data: {
            email: "worker1@test.com",
            phone: "9000000003",
            passwordHash: "test123",
            role: Role.WORKER,
            worker: {
                create: {
                    bio: "Electrician with 5 years experience",
                    experience: 5,
                    skills: ["electrician", "wiring"],
                    serviceRadius: 10,
                    kycStatus: KycStatus.VERIFIED
                }
            }
        },
        include: { worker: true }
    })

    const workerUser2 = await prisma.user.create({
        data: {
            email: "worker2@test.com",
            phone: "9000000004",
            passwordHash: "test123",
            role: Role.WORKER,
            worker: {
                create: {
                    bio: "Professional plumber",
                    experience: 4,
                    skills: ["plumbing", "pipe repair"],
                    serviceRadius: 8,
                    kycStatus: KycStatus.VERIFIED
                }
            }
        },
        include: { worker: true }
    })


    // ---------------------------
    // ORGANISATIONS
    // ---------------------------

    const orgUser1 = await prisma.user.create({
        data: {
            email: "org1@test.com",
            phone: "9000000005",
            passwordHash: "test123",
            role: Role.ORGANISATION,
            organisation: {
                create: {
                    businessName: "GreenBuild Materials",
                    businessType: "Construction Supplies",
                    description: "Eco friendly building materials"
                }
            }
        },
        include: { organisation: true }
    })

    const orgUser2 = await prisma.user.create({
        data: {
            email: "org2@test.com",
            phone: "9000000006",
            passwordHash: "test123",
            role: Role.ORGANISATION,
            organisation: {
                create: {
                    businessName: "Urban Tools Hub",
                    businessType: "Hardware Store",
                    description: "Professional tools and equipment"
                }
            }
        },
        include: { organisation: true }
    })


    // ---------------------------
    // PRODUCTS
    // ---------------------------

    const product1 = await prisma.product.create({
        data: {
            organisationId: orgUser1.organisation!.id,
            name: "Eco Bricks Pack",
            description: "Recycled construction bricks",
            price: 500,
            stockQuantity: 50
        }
    })

    const product2 = await prisma.product.create({
        data: {
            organisationId: orgUser1.organisation!.id,
            name: "Bamboo Panels",
            description: "Sustainable bamboo wall panels",
            price: 1200,
            stockQuantity: 20
        }
    })

    const product3 = await prisma.product.create({
        data: {
            organisationId: orgUser2.organisation!.id,
            name: "Electric Drill",
            description: "Professional drill machine",
            price: 3500,
            stockQuantity: 15
        }
    })

    const product4 = await prisma.product.create({
        data: {
            organisationId: orgUser2.organisation!.id,
            name: "Plumbing Toolkit",
            description: "Complete plumber kit",
            price: 2200,
            stockQuantity: 25
        }
    })


    // ---------------------------
    // JOB
    // ---------------------------

    const job = await prisma.job.create({
        data: {
            customerId: customerUser1.customer!.id,
            workerId: workerUser1.worker!.id,

            title: "Fix electrical wiring",
            description: "Need electrician for house wiring repair",

            category: "Electrical",
            budget: 1500,

            status: JobStatus.ASSIGNED
        }
    })


    // ---------------------------
    // JOB ESCROW
    // ---------------------------

    await prisma.escrow.create({
        data: {
            jobId: job.id,
            amount: 1500
        }
    })


    // ---------------------------
    // RESERVATION
    // ---------------------------

    const reservation = await prisma.reservation.create({
        data: {
            productId: product1.id,
            customerId: customerUser2.customer!.id,
            quantity: 2,
            status: ReservationStatus.CONFIRMED
        }
    })


    // ---------------------------
    // RESERVATION ESCROW
    // ---------------------------

    await prisma.escrow.create({
        data: {
            reservationId: reservation.id,
            amount: 1000
        }
    })


    console.log("✅ Database seeded successfully")
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })