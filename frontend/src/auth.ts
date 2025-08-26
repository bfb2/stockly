import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import {prisma} from "@/prisma"

export const {handlers, signIn, signOut, auth} = NextAuth({
    session:{
        strategy:"jwt"
    },
    secret:process.env.AUTH_SECRET,
    providers:[Google],
    callbacks: {
        async signIn({user, account}) {
            if(!user.email || !account)
                return false
    
            const existingUser = await prisma.user.findUnique({where:{id:account.providerAccountId, email:user.email}})
             if(!existingUser){
                   await prisma.user.create({
                    data:{
                        id:account.providerAccountId,
                        email:user.email,
                        paperTradeAccount:{
                            create:{
                                
                                balance:100000
                                
                            }
                        }
                    }
                })    
            } 
            return true
        },
        async jwt({token, account}){
            if(account)
                token.id = account.providerAccountId

            return token

        }
    },
    debug: process.env.NODE_ENV == 'development'
})