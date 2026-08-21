export function safeRelativeRedirect(value:string|null|undefined,fallback='/account'):string{
  if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return fallback;
  try{const parsed=new URL(value,'https://raqi.invalid');return parsed.origin==='https://raqi.invalid'?`${parsed.pathname}${parsed.search}${parsed.hash}`:fallback}catch{return fallback}
}
