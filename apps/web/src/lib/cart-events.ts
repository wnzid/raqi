export const CART_QUANTITY_EVENT='raqi:cart-quantity';
export function publishCartQuantity(totalQuantity:number){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent<number>(CART_QUANTITY_EVENT,{detail:totalQuantity}))}
