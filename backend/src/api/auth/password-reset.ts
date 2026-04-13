import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class Passwordreset {

    private email: string

    constructor(email: string) {
        this.email = email
    }

    validate(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(this.email)
    }

    async findUser() {
        const user = await prisma.user.findUnique({
            where: { email: this.email }
        })
        return user
    }

    async execute() {
        if (!this.validate()) {
            return { success: false, message: "Email invalide" }
        }

        const user = await this.findUser()

        if (!user) {
            return { success: true, message: "cet email n'est pas enregistré" }
        }

        
    }
}