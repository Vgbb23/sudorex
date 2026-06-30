export const BRAND = {
  name: 'SudoreX',
  company: 'SudoreX®',
  tagline: 'Equilíbrio, conforto e confiança para o seu dia a dia.',
  logo: '/sudorex-product.png',
  heroImage: '/sudorex-hero.png',
  productImage: '/sudorex-product.png',
  truthImage: '/sudorex-truth.png',
  howItWorksImage: '/sudorex-product.png',
} as const;

export interface Offer {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  installments: string;
  image: string;
  popular: boolean;
  capsules: string;
}

export const OFFERS: Offer[] = [
  {
    id: 1,
    name: 'KIT EXPERIMENTO',
    price: '39,00',
    originalPrice: '197,00',
    installments: '12x de R$ 3,25',
    image: '/sudorex-product.png',
    popular: false,
    capsules: '1 pote • 60 cápsulas vegetais',
  },
  {
    id: 2,
    name: 'KIT DUPLO',
    price: '59,00',
    originalPrice: '394,00',
    installments: '12x de R$ 4,92',
    image: '/sudorex-kit-2.png',
    popular: true,
    capsules: '2 potes • 120 cápsulas vegetais',
  },
  {
    id: 3,
    name: 'MELHOR CUSTO-BENEFÍCIO',
    price: '79,00',
    originalPrice: '591,00',
    installments: '12x de R$ 6,58',
    image: '/sudorex-kit-3.png',
    popular: false,
    capsules: '3 potes • 180 cápsulas vegetais',
  },
];
