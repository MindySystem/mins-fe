import type { Category, Product } from '../types'

const MOCK_PRODUCTS: Product[] = [
  // Shoes (Giày Cầu Lông) - Matching the reference image
  {
    id: 'g-yonex-cumulo',
    name: 'Giày Cầu Lông Yonex Cumulo',
    price: 1250000,
    category: 'gear',
    brand: 'Yonex',
    isPremium: true,
    image: '/images/shop/products/shoes_white.png',
    colorVariants: [
      {
        color: 'blue',
        image: '/images/shop/products/shoes_white.png',
      },
      {
        color: 'white',
        image: '/images/shop/products/shoes_white.png',
      },
    ],
    sizes: ['38', '39', '40', '41', '42'],
    branchAvailability: ['VNB Super Center', 'VNB PREMIUM Quận 1'],
    stock: 20,
    unit: 'Đôi',
  },
  {
    id: 'g-yonex-velo300',
    name: 'Giày Cầu Lông Yonex Velo 300 Chính Hãng',
    price: 679000,
    originalPrice: 700000,
    discount: 3,
    category: 'gear',
    brand: 'Yonex',
    isPremium: true,
    image: '/images/shop/products/shoes_white.png',
    sizes: ['37', '38', '39', '40'],
    branchAvailability: ['VNB PREMIUM Quận 11', 'VNB PREMIUM Bình Thạnh'],
    stock: 15,
    unit: 'Đôi',
  },
  {
    id: 'g-yonex-subaxia-gt-wide',
    name: 'Vợt Cầu Lông Yonex Astrox Nextage',
    price: 3479000,
    originalPrice: 3514000,
    discount: 1,
    category: 'gear',
    brand: 'Yonex',
    isPremium: true,
    image: '/images/shop/products/racket_premium.png',
    sizes: ['3U', '4U'],
    branchAvailability: ['VNB Super Center'],
    stock: 5,
    unit: 'Cây',
  },
  {
    id: 'g-yonex-rapio',
    name: 'Bao Vợt Cầu Lông VNB Tournament',
    price: 850000,
    category: 'gear',
    brand: 'VNB',
    image: '/images/shop/products/tournament_bag.png',
    sizes: ['L'],
    branchAvailability: ['VNB PREMIUM Quận 1'],
    stock: 12,
    unit: 'Cái',
  },
  {
    id: 'g-yonex-shirt',
    name: 'Áo Cầu Lông VNB Pro Dry-Fit',
    price: 250000,
    category: 'gear',
    brand: 'VNB',
    image: '/images/shop/products/sport_shirt.png',
    sizes: ['M', 'L', 'XL'],
    branchAvailability: ['VNB Super Center'],
    stock: 50,
    unit: 'Cái',
  },
]

export const shopService = {
  getProducts: async () => {
    return MOCK_PRODUCTS
  },
  getShopProducts: async () => {
    return MOCK_PRODUCTS
  },
  getProductById: async (productId: string) => {
    return MOCK_PRODUCTS.find((p) => p.id === productId) ?? null
  },
  getServiceProducts: async () => {
    return [
      {
        id: 's1',
        name: 'Trà Đào Cam Sả',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop',
        category: 'drinks' as Category,
        unit: 'ly',
        stock: 100,
      },
      {
        id: 's2',
        name: 'Cà Phê Sữa Đá',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1517701604599-bb28b3650422?w=300&h=300&fit=crop',
        category: 'drinks' as Category,
        unit: 'ly',
        stock: 50,
      },
      {
        id: 's3',
        name: 'Bánh Mì Que',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop',
        category: 'snacks' as Category,
        unit: 'cái',
        stock: 20,
      },
    ]
  },
  getServiceCategories: () => {
    return [
      { id: 'all', name: 'Tất cả' },
      { id: 'drinks', name: 'Đồ uống' },
      { id: 'snacks', name: 'Đồ ăn vặt' },
    ]
  },
  getBrands: () => {
    return ['Yonex', 'Lining', 'Victor', 'Mizuno', 'Adidas']
  },
  getBranches: () => {
    return [
      'VNB Super Center',
      'VNB PREMIUM Quận 1',
      'VNB PREMIUM Quận 11',
      'VNB PREMIUM Bình Thạnh',
      'VNB PREMIUM TP Thủ Đức',
    ]
  },
  getSizes: () => {
    return [
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '37.5',
      '38',
      '38.5',
      '39',
      '39.5',
      '40',
      '40.5',
    ]
  },
  getPriceRanges: () => {
    return [
      { label: 'Giá dưới 500.000đ', min: 0, max: 500000 },
      { label: '500.000đ - 1 triệu', min: 500000, max: 1000000 },
      { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
      { label: '2 - 3 triệu', min: 2000000, max: 3000000 },
      { label: 'Giá trên 3 triệu', min: 3000000, max: Infinity },
    ]
  },
  getHomeBanners: async () => {
    return [
      {
        id: 'b1',
        image: '/images/shop/banners/sale_banner.png',
        title: 'VNB SUPER SALE',
        link: '/shop/sale',
      },
      {
        id: 'b2',
        image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=1200&h=600&fit=crop',
        title: 'ĐÂN XUÂN GIÁP THÌN',
        link: '/shop/list',
      },
    ]
  },
  getLatestNews: async () => {
    return [
      {
        id: 'n1',
        title: 'Top 5 cây vợt cầu lông Yonex đáng mua nhất đầu năm 2024',
        summary: 'Khám phá những siêu phẩm vợt cầu lông đến từ thương hiệu Nhật Bản...',
        image: 'https://images.unsplash.com/photo-1626225967045-9410dd9964a9?w=800&h=600&fit=crop',
        date: '27/03/2024',
        category: 'Kinh nghiệm',
      },
      {
        id: 'n2',
        title: 'Cách chọn giày cầu lông phù hợp cho người mới chơi',
        summary: 'Giày cầu lông đóng vai trò cực kỳ quan trọng trong việc bảo vệ cổ chân...',
        image: 'https://images.unsplash.com/photo-1560272564-c83d66b1ad12?w=800&h=600&fit=crop',
        date: '25/03/2024',
        category: 'Hướng dẫn',
      },
    ]
  },
  getFeaturedCategories: () => {
    return [
      {
        id: 'vot',
        name: 'Vợt Cầu Lông',
        image: '/images/shop/categories/rackets.png',
        icon: 'LayoutGrid',
      },
      {
        id: 'giay',
        name: 'Giày Cầu Lông',
        image: '/images/shop/categories/shoes.png',
        icon: 'ShoppingBag',
      },
      {
        id: 'ao',
        name: 'Áo Cầu Lông',
        image: '/images/shop/categories/apparel.png',
        icon: 'Package',
      },
      {
        id: 'balo',
        name: 'Bao Vợt / Balo',
        image: '/images/shop/categories/bags.png',
        icon: 'MapPin',
      },
    ]
  },
  getFeaturedProducts: async (type: 'new' | 'hot' | 'sale') => {
    if (type === 'sale') return MOCK_PRODUCTS.filter((p) => p.discount)
    if (type === 'hot') return MOCK_PRODUCTS.slice(0, 4)
    return MOCK_PRODUCTS.slice(2, 6)
  },
}
