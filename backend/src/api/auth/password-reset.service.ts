import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMailService } from '../sendMail/sendMail.service';
import { randomBytes } from 'crypto';
import { createHash, compareHash } from '../user/utils/user.utils';

@Injectable()
export class PasswordResetService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: SendMailService,
    ) {}

    validate(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    async findUser(email: string) {
        return this.prisma.user.findUnique({
            where: { email }
        })
    }

    async generateToken(email: string) {
        const token = randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 30 * 60 * 1000)

        await this.prisma.user.update({
            where: { email },
            data: {
                verifyToken: await createHash(token),
                verifyTimeout: expiry
            }
        })

        return token
    }

    async execute(email: string) {
        if (!this.validate(email)) {
            return { success: false, message: "Email invalide" }
        }

        const user = await this.findUser(email)

        if (!user) {
            return { success: true, message: "Si cet email existe, un lien a été envoyé." }
        }

        const token = await this.generateToken(email)
        const link = `${process.env.DEV_URL}/reset-password?token=${token}`

        await this.mailer.sendMail(
            email,
            "Réinitialisation de votre mot de passe",
            `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${link}\n\nCe lien expire dans 30 minutes.`
        )

        return { success: true, message: "Si cet email existe, un lien a été envoyé." }
    }

    async resetPassword(token: string, newPassword: string) {
    const users = await this.prisma.user.findMany({
        where: {
            verifyTimeout: { gt: new Date() },
            verifyToken: { not: null }
        }
    })
    const user = await Promise.all(
        users.map(async (u) => ({
            user: u,
            match: await compareHash(token, u.verifyToken!)
        }))
    ).then(results => results.find(r => r.match)?.user)

    if (!user) {
        return { success: false, message: "Lien invalide ou expiré." }
    }

    const hashed = await createHash(newPassword)

    await this.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashed,
            verifyToken: null,
            verifyTimeout: null
        }
    })

    return { success: true, message: "Mot de passe mis à jour." }
    }
}
