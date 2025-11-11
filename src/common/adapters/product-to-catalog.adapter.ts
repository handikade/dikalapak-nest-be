import { ProductDocument } from '../../products/schemas/product.schema';
import { CatalogDto } from '../../catalogs/dto/catalog.dto';

export function productToCatalog(product: ProductDocument): CatalogDto {
  return {
    category: product.category,
    description: product.description ?? '',
    id: product._id.toString(),
    images: product.images.map((image) => image.url),
    isActive: product.isActive,
    name: product.name,
    price: product.price,
    stock: product.stock ?? 0,
    tags: product.tags,
  };
}
