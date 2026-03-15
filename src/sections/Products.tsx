import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Star, Leaf, Coffee, Flower2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products as initialProducts, categories } from '@/data/products';

interface ProductsProps {
  addToCart: (product: { 
    id: number; 
    name: string; 
    nameKo: string;
    nameRu: string;
    price: number; 
    image: string 
  }) => void;
  language: 'en' | 'ko' | 'ru';
}

const Products = ({ addToCart, language }: ProductsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('lumi_tea_products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      setAllProducts(parsed);
      setDisplayedProducts(parsed);
    }
  }, []);

  // Listen for storage changes (when admin updates products)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProducts = localStorage.getItem('lumi_tea_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        setAllProducts(parsed);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update displayed products when category changes
  useEffect(() => {
    setIsAnimating(true);
    const filtered = activeCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === activeCategory);
    
    // Small delay for smooth transition
    setTimeout(() => {
      setDisplayedProducts(filtered);
      setIsAnimating(false);
    }, 150);
  }, [activeCategory, allProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [displayedProducts]);

  const getCategoryName = (cat: typeof categories[0]) => {
    switch (language) {
      case 'ko': return cat.nameKo;
      case 'ru': return cat.nameRu;
      default: return cat.name;
    }
  };

  const getProductName = (product: typeof allProducts[0]) => {
    switch (language) {
      case 'ko': return product.nameKo;
      case 'ru': return product.nameRu;
      default: return product.name;
    }
  };

  const getProductDesc = (product: typeof allProducts[0]) => {
    switch (language) {
      case 'ko': return product.descriptionKo;
      case 'ru': return product.descriptionRu;
      default: return product.description;
    }
  };

  const getTags = (product: typeof allProducts[0]) => {
    switch (language) {
      case 'ko': return product.tagsKo;
      case 'ru': return product.tagsRu;
      default: return product.tags;
    }
  };

  const content = {
    en: {
      title: 'Our Collection',
      subtitle: 'Collection',
      description: 'Each tea is carefully selected from the finest tea gardens',
      bestseller: 'Bestseller',
      new: 'New',
      addToCart: 'Add to Cart',
      noProducts: 'No products in this category',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock'
    },
    ko: {
      title: '우리의 컬렉션',
      subtitle: '컬렉션',
      description: '각 차는 최고의 차 정원에서 신중하게 선별되었습니다',
      bestseller: '베스트셀러',
      new: '신제품',
      addToCart: '장바구니에 담기',
      noProducts: '이 카테고리에 상품이 없습니다',
      outOfStock: '품절',
      lowStock: '재고 부족'
    },
    ru: {
      title: 'Наша Коллекция',
      subtitle: 'Коллекция',
      description: 'Каждый чай тщательно отобран из лучших чайных садов',
      bestseller: 'Бестселлер',
      new: 'Новинка',
      addToCart: 'В корзину',
      noProducts: 'Нет товаров в этой категории',
      outOfStock: 'Нет в наличии',
      lowStock: 'Мало в наличии'
    }
  };

  const t = content[language];

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'oolong': return <Coffee className="w-4 h-4" />;
      case 'green': return <Leaf className="w-4 h-4" />;
      case 'wellness': return <Flower2 className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const isOutOfStock = (product: typeof allProducts[0]) => {
    return product.stock === 0 || product.outOfStock;
  };

  const isLowStock = (product: typeof allProducts[0]) => {
    return product.stock > 0 && product.stock <= 5 && !product.outOfStock;
  };

  return (
    <section id="products" ref={sectionRef} className="py-20 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 reveal opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title.split(' ')[0]} <span className="gradient-text">{t.subtitle}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 reveal opacity-0" style={{ animationDelay: '0.2s' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white text-gray-700 hover:bg-pink-50'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{getCategoryName(cat)}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className={`reveal opacity-0 tea-card bg-white rounded-2xl overflow-hidden shadow-lg ${isOutOfStock(product) ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={getProductName(product)}
                  className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock(product) ? '' : 'hover:scale-110'}`}
                />
                
                {/* Out of Stock / Low Stock Badge */}
                {isOutOfStock(product) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold transform -rotate-12 shadow-lg">
                      {t.outOfStock}
                    </div>
                  </div>
                )}
                {isLowStock(product) && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 text-white text-xs">
                      {t.lowStock}: {product.stock}
                    </Badge>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {product.bestseller && !isOutOfStock(product) && (
                    <Badge className="bg-pink-500 text-white text-xs">
                      {t.bestseller}
                    </Badge>
                  )}
                  {product.new && !isOutOfStock(product) && (
                    <Badge className="bg-green-500 text-white text-xs">
                      {t.new}
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOutOfStock(product) ? 'bg-gray-200 text-gray-500' : 'bg-white/90 text-gray-800'}`}>
                    {product.weight}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">4.8</span>
                </div>

                <h3 className={`text-lg font-bold mb-1 ${isOutOfStock(product) ? 'text-gray-400' : ''}`}>{getProductName(product)}</h3>
                <p className={`text-xs mb-2 ${isOutOfStock(product) ? 'text-gray-400' : 'text-gray-500'}`}>{product.name}</p>
                <p className={`text-sm mb-3 line-clamp-2 ${isOutOfStock(product) ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getProductDesc(product)}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {getTags(product).slice(0, 2).map((tag) => (
                    <span key={tag} className={`text-xs px-2 py-1 rounded-full ${isOutOfStock(product) ? 'bg-gray-100 text-gray-400' : 'bg-pink-50 text-pink-600'}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.originalPrice.toLocaleString()} ₩
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <span className={`text-xl font-bold ${isOutOfStock(product) ? 'text-gray-400' : 'text-pink-500'}`}>
                      {product.price.toLocaleString()} ₩
                    </span>
                  </div>
                  {!isOutOfStock(product) ? (
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {t.addToCart}
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-500 px-3 py-1">
                      {t.outOfStock}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t.noProducts}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
