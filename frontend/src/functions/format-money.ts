export const formatMoney = (number:number) => {
    if (Math.abs(number) <0.005)
        return '0'
    else
        return number.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})
}
