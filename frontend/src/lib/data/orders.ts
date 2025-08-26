import { prisma } from "@/prisma";

export const getOrders = async( filterOptions?:Record<string, string>)=>{
    const data = await prisma.paperTradeOrder.findMany({where:filterOptions})
    return data.map(({ticker, qty, submitted, orderPrice, orderType, side, status})=>({ticker, qty, submitted, orderPrice, orderType, side, status}))
}