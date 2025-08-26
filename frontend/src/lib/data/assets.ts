import { prisma } from "@/prisma";

export const getAssets = async(id:string) => {
    const data = await prisma.assets.findMany({where:{paperTradeAccountId:id}})
    return data.map(({qty, ticker})=>({qty, ticker}))
}