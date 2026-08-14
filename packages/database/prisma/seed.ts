import { Gender, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const men = await prisma.category.upsert({ where: { slug: 'men' }, update: {}, create: { name: 'Men', slug: 'men' } });
  const sneakers = await prisma.category.upsert({ where: { slug: 'men-sneakers' }, update: { parentId: men.id }, create: { name: 'Sneakers', slug: 'men-sneakers', parentId: men.id } });
  const casual = await prisma.occasion.upsert({ where: { slug: 'casual' }, update: {}, create: { name: 'Casual', slug: 'casual' } });
  const sports = await prisma.occasion.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports' } });
  const black = await prisma.color.upsert({ where: { slug: 'black' }, update: {}, create: { name: 'Black', slug: 'black', hex: '#111111' } });
  const brown = await prisma.color.upsert({ where: { slug: 'brown' }, update: {}, create: { name: 'Brown', slug: 'brown', hex: '#6F4E37' } });
  const white = await prisma.color.upsert({ where: { slug: 'white' }, update: {}, create: { name: 'White', slug: 'white', hex: '#FFFFFF' } });

  const products = [
    { title: 'Classic Leather Loafer', slug: 'classic-leather-loafer', description: 'A versatile full-grain leather loafer.', basePrice: 129.00, material: 'Leather', soleType: 'Rubber', heelType: 'Low', colorIds: [black.id, brown.id], occasions: [casual.id], sku: 'CLL' },
    { title: 'Urban Runner', slug: 'urban-runner', description: 'A lightweight everyday running shoe.', basePrice: 99.00, material: 'Mesh', soleType: 'Cushioned rubber', heelType: 'Flat', colorIds: [black.id, white.id], occasions: [casual.id, sports.id], sku: 'URB' },
    { title: 'Canvas Low Sneaker', slug: 'canvas-low-sneaker', description: 'A clean low-profile canvas sneaker.', basePrice: 69.00, material: 'Canvas', soleType: 'Vulcanized rubber', heelType: 'Flat', colorIds: [white.id], occasions: [casual.id], sku: 'CLS' },
  ];
  for (const item of products) {
    const product = await prisma.product.upsert({ where: { slug: item.slug }, update: {}, create: { title: item.title, slug: item.slug, description: item.description, basePrice: item.basePrice, material: item.material, soleType: item.soleType, heelType: item.heelType, gender: Gender.MEN, isActive: true, publishedAt: new Date(), categoryId: sneakers.id, occasions: { connect: item.occasions.map((id) => ({ id })) } } });
    for (const [colorIndex, colorId] of item.colorIds.entries()) for (const [sizeIndex, sizeEu] of [40, 41, 42].entries()) {
      const sku = `${item.sku}-${colorIndex + 1}-${sizeEu}`;
      await prisma.productVariant.upsert({ where: { sku }, update: {}, create: { productId: product.id, colorId, sku, sizeEu, sizeUk: sizeEu - 34, sizeUs: sizeEu - 33, stockQuantity: sizeIndex === 2 && colorIndex === 0 ? 0 : 8, priceOverride: item.sku === 'URB' && sizeEu === 42 ? 109 : undefined, weightGrams: 850 } });
    }
  }
}

main().finally(async () => prisma.$disconnect());
