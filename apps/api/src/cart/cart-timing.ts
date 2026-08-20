export function cartTiming(label:string,started:number):void{if(process.env.CART_TIMING==='true')console.info(`[cart timing] ${label}: ${(performance.now()-started).toFixed(1)}ms`)}
