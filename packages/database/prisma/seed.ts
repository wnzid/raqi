import { Gender,PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
async function main(){
 const nike=await prisma.brand.upsert({where:{slug:'nike'},update:{},create:{name:'Nike',slug:'nike'}});
 const black=await prisma.color.upsert({where:{slug:'black'},update:{},create:{name:'Black',slug:'black',hex:'#111111'}});
 const white=await prisma.color.upsert({where:{slug:'white'},update:{},create:{name:'White',slug:'white',hex:'#FFFFFF'}});
 const family=await prisma.productFamily.upsert({where:{slug:'urban-runner'},update:{name:'Urban Runner'},create:{name:'Urban Runner',slug:'urban-runner'}});
 for(const entry of [{color:black,code:'BLK'},{color:white,code:'WHT'}]){
  const slug=`urban-runner-${entry.color.slug}`,title=`Urban Runner | ${entry.color.name}`;
  const product=await prisma.product.upsert({where:{familyId_colorId:{familyId:family.id,colorId:entry.color.id}},update:{title},create:{familyId:family.id,colorId:entry.color.id,title,slug,description:'A lightweight everyday running shoe.',basePrice:99,material:'Mesh',soleType:'Cushioned rubber',heelType:'Flat',gender:Gender.MEN,isActive:true,publishedAt:new Date(),brandId:nike.id}});
  for(const sizeEu of[40,41,42]){
   const sku=`URB-${entry.code}-${sizeEu}`,sizeUk=sizeEu-34,sizeUs=sizeEu-33;
   await prisma.productVariant.upsert({where:{productId_colorId_sizeEu:{productId:product.id,colorId:entry.color.id,sizeEu}},update:{sku,sizeUk,sizeUs,stockQuantity:8,weightGrams:850},create:{productId:product.id,colorId:entry.color.id,sku,sizeEu,sizeUk,sizeUs,stockQuantity:8,weightGrams:850}});
  }
 }
}
main().finally(async()=>prisma.$disconnect());
