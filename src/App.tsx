import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  ArrowRight,
  Zap,
  Check,
  Copy,
  QrCode,
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import { OptimizedImage } from './components/OptimizedImage';
import { BrandLogo } from './components/BrandLogo';
import { BRAND, OFFERS, type Offer } from './config/product';

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface PixChargeResult {
  orderId: string;
  pixCode: string;
  qrCodeUrl: string;
}

interface OrderBump {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

type UtmKey = (typeof UTM_KEYS)[number];
type UtmPayload = Record<UtmKey, string>;

const ORDER_BUMPS: OrderBump[] = [
  {
    id: 'bump-sudorex-extra',
    name: 'Reforço SudoreX',
    description: 'Leve +1 pote de SudoreX® com desconto especial para manter sua rotina por mais tempo.',
    price: 24.9,
    image: OFFERS[0].image,
  },
  {
    id: 'bump-maca-peruana',
    name: 'Ashwagandha Extra',
    description: 'Reforce o suporte ao estresse e ao sistema nervoso com 1 frasco adicional de Ashwagandha premium.',
    price: 19.9,
    image: 'https://i.ibb.co/FL7Y763D/image.png',
  },
];

// --- Components ---

const CheckoutHeader = () => (
  <header className="bg-white border-b border-slate-200 py-3 md:py-4 mb-6 md:mb-8 sticky top-0 z-50">
    <div className="max-w-4xl mx-auto px-5 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BrandLogo variant="dark" className="h-8 md:h-9 w-auto max-w-[140px]" />
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        <ShieldCheck size={12} className="text-sudorex md:w-[14px] md:h-[14px]" /> <span className="hidden xs:inline">Checkout</span> Seguro
      </div>
    </div>
  </header>
);

const PixIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
    <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z" />
    <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z" />
  </svg>
);

/** Compacta dados do checkout para o upsell (base64url). O upsell decodifica e gera PIX sem depender da API de pedido. */
const encodeUpsellCustomerPrefill = (payload: {n: string; e: string; p: string; c: string}) => {
  const raw = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const Checkout = ({ offer, onBack }: { offer: Offer; onBack: () => void }) => {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [shippingMethod, setShippingMethod] = useState<'free' | 'sedex'>('free');
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ cpf: '', cep: '' });
  const [touchedFields, setTouchedFields] = useState({ cpf: false, cep: false });
  const [cepLookupError, setCepLookupError] = useState('');
  const [isCreatingPixCharge, setIsCreatingPixCharge] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pixCharge, setPixCharge] = useState<PixChargeResult | null>(null);
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [isPaymentApproved, setIsPaymentApproved] = useState(false);
  const [selectedOrderBumps, setSelectedOrderBumps] = useState<string[]>([]);
  const hasRedirectedAfterPayment = useRef(false);

  const unitPrice = parseFloat(offer.price.replace(',', '.'));
  const subtotal = unitPrice * quantity;
  const shippingCost = shippingMethod === 'sedex' ? 12.84 : 0;
  const orderBumpsTotal = ORDER_BUMPS
    .filter((bump) => selectedOrderBumps.includes(bump.id))
    .reduce((sum, bump) => sum + bump.price, 0);
  const totalPrice = (subtotal + shippingCost + orderBumpsTotal).toFixed(2).replace('.', ',');
  const subtotalPrice = subtotal.toFixed(2).replace('.', ',');
  const orderBumpsPrice = orderBumpsTotal.toFixed(2).replace('.', ',');

  const toggleOrderBump = (id: string) => {
    setSelectedOrderBumps((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const getUtmPayload = (): UtmPayload => {
    const searchParams = new URLSearchParams(window.location.search);
    const utm: Partial<UtmPayload> = {};

    UTM_KEYS.forEach((key) => {
      const valueFromUrl = searchParams.get(key)?.trim() ?? '';
      const storageKey = `utmify:${key}`;
      const valueFromStorage = sessionStorage.getItem(storageKey)?.trim() ?? '';
      const finalValue = valueFromUrl || valueFromStorage || '';

      if (valueFromUrl) {
        sessionStorage.setItem(storageKey, valueFromUrl);
      }

      utm[key] = finalValue;
    });

    return utm as UtmPayload;
  };

  const normalizePhone = (phoneValue: string) => {
    const digits = phoneValue.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  const getPixPayloadFromResponse = (payload: any): PixChargeResult | null => {
    if (!payload?.data) return null;
    const data = payload.data;
    const pixData = data.pix ?? {};

    const pickString = (...values: unknown[]) => {
      const firstValid = values.find((value) => typeof value === 'string' && value.trim().length > 0);
      return typeof firstValid === 'string' ? firstValid : '';
    };

    const pixCode = pickString(
      pixData.copy_paste,
      pixData.copyPaste,
      pixData.emv,
      pixData.payload,
      pixData.code,
      data.copy_paste,
      data.copyPaste,
      data.emv,
      data.payload,
      data.code
    );

    let qrCodeUrl = pickString(
      pixData.qr_code,
      pixData.qrCode,
      pixData.qrcode,
      data.qr_code,
      data.qrCode,
      data.qrcode
    );

    if (qrCodeUrl && !qrCodeUrl.startsWith('http') && !qrCodeUrl.startsWith('data:image')) {
      qrCodeUrl = `data:image/png;base64,${qrCodeUrl}`;
    }

    if (!qrCodeUrl && pixCode) {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    }

    if (!pixCode || !qrCodeUrl) return null;

    return {
      orderId: data.order_id ?? data.orderId ?? '',
      pixCode,
      qrCodeUrl,
    };
  };

  const createPixCharge = async () => {
    setIsCreatingPixCharge(true);
    setPaymentError('');
    setIsPaymentApproved(false);
    hasRedirectedAfterPayment.current = false;

    try {
      const utm = getUtmPayload();

      const response = await fetch('/api/pix/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: normalizePhone(formData.phone),
          cpf: formData.cpf.replace(/\D/g, ''),
          itemValue: Math.round(unitPrice * 100),
          quantity,
          shippingValue: Math.round(shippingCost * 100),
          orderBumpsValue: Math.round(orderBumpsTotal * 100),
          subtotalValue: Math.round(subtotal * 100),
          totalValue: Math.round((subtotal + shippingCost + orderBumpsTotal) * 100),
          utm,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? 'Não foi possível criar a cobrança PIX.');
      }

      const pixData = getPixPayloadFromResponse(result);
      if (!pixData) {
        throw new Error('Cobrança criada, mas os dados PIX não foram retornados pela API.');
      }

      setPixCharge(pixData);
      return true;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Erro ao criar pagamento PIX.');
      return false;
    } finally {
      setIsCreatingPixCharge(false);
    }
  };

  const validateCpf = (cpfValue: string) => {
    const cpf = cpfValue.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
    let firstCheckDigit = (sum * 10) % 11;
    if (firstCheckDigit === 10) firstCheckDigit = 0;
    if (firstCheckDigit !== Number(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
    let secondCheckDigit = (sum * 10) % 11;
    if (secondCheckDigit === 10) secondCheckDigit = 0;
    return secondCheckDigit === Number(cpf[10]);
  };

  const validateCep = (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    return cep.length === 8;
  };

  // Fetch address from ViaCEP when CEP is valid
  useEffect(() => {
    getUtmPayload();
  }, []);

  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      const fetchAddress = async () => {
        setIsFetchingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setCepLookupError('');
            setFieldErrors(prev => ({ ...prev, cep: '' }));
            setFormData(prev => ({
              ...prev,
              address: data.logradouro || prev.address,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              state: data.uf || prev.state,
            }));
            // Focus on number field after filling address
            const numberInput = document.getElementsByName('number')[0] as HTMLInputElement;
            if (numberInput) numberInput.focus();
          } else {
            const message = 'CEP inválido. Confira o número.';
            setCepLookupError(message);
            setFieldErrors(prev => ({ ...prev, cep: message }));
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
          const message = 'CEP inválido. Confira o número.';
          setCepLookupError(message);
          setFieldErrors(prev => ({ ...prev, cep: message }));
        } finally {
          setIsFetchingCep(false);
        }
      };
      fetchAddress();
    } else {
      setCepLookupError('');
      setFieldErrors(prev => ({ ...prev, cep: '' }));
    }
  }, [formData.cep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').slice(0, 8);
      if (formattedValue.length > 5) {
        formattedValue = `${formattedValue.slice(0, 5)}-${formattedValue.slice(5)}`;
      }
      if (formattedValue.replace(/\D/g, '').length === 8) {
        setTouchedFields(prev => ({ ...prev, cep: true }));
      }
    } else if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
      if (formattedValue.length > 9) {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3, 6)}.${formattedValue.slice(6, 9)}-${formattedValue.slice(9)}`;
      } else if (formattedValue.length > 6) {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3, 6)}.${formattedValue.slice(6)}`;
      } else if (formattedValue.length > 3) {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3)}`;
      }
    } else if (name === 'phone') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
      if (formattedValue.length > 10) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7)}`;
      } else if (formattedValue.length > 6) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 6)}-${formattedValue.slice(6)}`;
      } else if (formattedValue.length > 2) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2)}`;
      } else if (formattedValue.length > 0) {
        formattedValue = `(${formattedValue}`;
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (name === 'cpf' && touchedFields.cpf) {
      setFieldErrors(prev => ({
        ...prev,
        cpf: validateCpf(formattedValue) ? '' : 'CPF inválido. Confira os números.',
      }));
    }

    if (name === 'cep' && touchedFields.cep) {
      setCepLookupError('');
      setFieldErrors(prev => ({
        ...prev,
        cep: validateCep(formattedValue) ? '' : 'CEP inválido. Use o formato 00000-000.',
      }));
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setTouchedFields(prev => ({ ...prev, cpf: true }));
      setFieldErrors(prev => ({
        ...prev,
        cpf: validateCpf(value) ? '' : 'CPF inválido. Confira os números.',
      }));
    }

    if (name === 'cep') {
      setTouchedFields(prev => ({ ...prev, cep: true }));
      setFieldErrors(prev => ({
        ...prev,
        cep: !validateCep(value)
          ? 'CEP inválido. Use o formato 00000-000.'
          : cepLookupError,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfError = validateCpf(formData.cpf) ? '' : 'CPF inválido. Confira os números.';
    const cepError = !validateCep(formData.cep)
      ? 'CEP inválido. Use o formato 00000-000.'
      : isFetchingCep
        ? 'Aguarde a validação do CEP.'
        : cepLookupError;

    setTouchedFields({ cpf: true, cep: true });
    setFieldErrors({ cpf: cpfError, cep: cepError });

    if (cpfError || cepError) return;

    const isPixReady = await createPixCharge();
    if (!isPixReady) return;

    setStep('payment');
    window.scrollTo(0, 0);
  };

  const copyPixCode = async () => {
    if (!pixCharge?.pixCode) {
      setPaymentError('Código PIX indisponível.');
      return;
    }
    try {
      await navigator.clipboard.writeText(pixCharge.pixCode);
      setIsPixCopied(true);
      setTimeout(() => setIsPixCopied(false), 2500);
    } catch {
      setPaymentError('Não foi possível copiar o código PIX.');
    }
  };

  useEffect(() => {
    if (step !== 'payment' || !pixCharge?.orderId || hasRedirectedAfterPayment.current) {
      return undefined;
    }

    let isCancelled = false;

    const checkOrderStatus = async () => {
      if (isCancelled || hasRedirectedAfterPayment.current) return;

      try {
        const response = await fetch(`/api/order/${encodeURIComponent(pixCharge.orderId)}`, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) return;

        const orderResponse = await response.json();
        const paidAt = orderResponse?.data?.paid_at ?? orderResponse?.paid_at ?? null;
        if (paidAt) {
          hasRedirectedAfterPayment.current = true;
          setIsPaymentApproved(true);
          window.setTimeout(() => {
            const nextUrl = new URL('https://upselltesto.vercel.app/');
            const params = new URLSearchParams(window.location.search);
            params.set('orderId', pixCharge.orderId);
            try {
              params.set(
                'prefill',
                encodeUpsellCustomerPrefill({
                  n: formData.name.trim(),
                  e: formData.email.trim(),
                  p: normalizePhone(formData.phone),
                  c: formData.cpf.replace(/\D/g, ''),
                })
              );
            } catch {
              // segue só com orderId
            }
            nextUrl.search = params.toString();
            window.location.href = nextUrl.toString();
          }, 1200);
        }
      } catch {
        // Ignora falhas momentâneas no polling para tentar novamente no próximo ciclo.
      }
    };

    checkOrderStatus();
    const intervalId = window.setInterval(checkOrderStatus, 300);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [step, pixCharge?.orderId]);

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <CheckoutHeader />
        <div className="max-w-xl mx-auto px-5">
          <button onClick={() => setStep('form')} className="flex items-center gap-2 text-slate-500 mb-8 hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} /> Voltar para os dados
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sudorex/10 text-sudorex rounded-full mb-6">
              <QrCode size={32} />
            </div>
            
            <h2 className="text-2xl font-black mb-2 uppercase italic">Pague com PIX</h2>
            <p className="text-slate-500 text-sm mb-4">Escaneie o QR Code ou copie o código abaixo para finalizar sua compra de <span className="font-bold text-slate-800">{offer.name}</span> ({quantity} unidade{quantity > 1 ? 's' : ''}).</p>
            
            <div className="mb-8">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Valor Total</span>
              <span className="text-3xl font-black text-sudorex italic">R$ {totalPrice}</span>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex flex-col items-center">
              <OptimizedImage
                src={pixCharge?.qrCodeUrl ?? 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=erro-ao-gerar-pix'} 
                alt="QR Code PIX" 
                className="w-48 h-48 mb-4"
                referrerPolicy="no-referrer"
                priority
              />
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                {isPaymentApproved ? 'Pagamento aprovado!' : 'Aguardando pagamento...'}
              </p>
              {pixCharge?.orderId && (
                <p className="text-[10px] text-slate-400 mt-2">Pedido: {pixCharge.orderId}</p>
              )}
            </div>

            {isPaymentApproved && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Pagamento aprovado, redirecionando...
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={copyPixCode}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  isPixCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Copy size={18} /> {isPixCopied ? 'COPIADO' : 'COPIAR CÓDIGO PIX'}
              </button>
              
              <div className="text-left bg-sudorex/5 p-4 rounded-xl border border-sudorex/20">
                <h4 className="text-sudorex-dark font-bold text-xs uppercase mb-2 flex items-center gap-2">
                  <Zap size={14} /> Como pagar?
                </h4>
                <ol className="text-[11px] text-sudorex-dark space-y-1 list-decimal ml-4">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha a opção PIX &gt; Copia e Cola ou QR Code</li>
                  <li>Cole o código ou escaneie a imagem</li>
                  <li>Confirme os dados e finalize o pagamento</li>
                </ol>
              </div>
            </div>
            {paymentError && (
              <p className="mt-4 text-xs text-red-600 font-bold">{paymentError}</p>
            )}
            
            <p className="mt-8 text-[10px] text-slate-400 uppercase font-bold">
              O acesso ao rastreio será enviado para o seu e-mail após a confirmação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <CheckoutHeader />
      <div className="max-w-4xl mx-auto px-5">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-8 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /> Voltar para as ofertas
        </button>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
          {/* Order Summary - Top on Mobile, Sidebar on Desktop */}
          <div className="md:col-span-1 md:order-last">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 md:sticky md:top-24">
              <h3 className="text-sm font-black mb-6 uppercase italic border-b border-slate-100 pb-4">Produto Selecionado</h3>
              <div className="flex items-center gap-4 mb-6">
                <OptimizedImage src={offer.image} alt={offer.name} className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-sm">{offer.name}</h4>
                  <p className="text-xs text-slate-500">{BRAND.company}</p>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Quantidade</span>
                <div className="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 bg-slate-50 text-slate-700 font-black text-lg hover:bg-slate-100 transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 bg-slate-50 text-slate-700 font-black text-lg hover:bg-slate-100 transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="mt-8 space-y-3 hidden md:block">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                  <Truck size={14} className="text-sudorex" /> Entrega Garantida
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase italic">
                  <User size={20} className="text-sudorex" /> Dados Pessoais
                </h3>
                <div className="grid gap-4">
                  <div className="relative">
                    <input
                      id="checkout-name"
                      required
                      name="name"
                      placeholder="Nome completo"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    <span
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-opacity ${
                        formData.name.trim().length > 0 ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      Nome completo
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="Seu melhor e-mail"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <input
                      required
                      name="phone"
                      placeholder="WhatsApp com DDD"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input
                    required
                    name="cpf"
                    placeholder="CPF"
                    className={`w-full p-4 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                      fieldErrors.cpf ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-sudorex'
                    }`}
                    value={formData.cpf}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                  />
                  {fieldErrors.cpf && <p className="text-xs text-red-600 -mt-2">{fieldErrors.cpf}</p>}
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase italic">
                  <MapPin size={20} className="text-sudorex" /> Endereço de Entrega
                </h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <input 
                          required
                          name="cep"
                          placeholder="CEP"
                          className={`w-full p-4 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-colors ${isFetchingCep ? 'opacity-50' : ''} ${
                            fieldErrors.cep ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-sudorex'
                          }`}
                          value={formData.cep}
                          onChange={handleInputChange}
                          onBlur={handleFieldBlur}
                        />
                        {isFetchingCep && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-sudorex border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      {fieldErrors.cep && <p className="text-xs text-red-600">{fieldErrors.cep}</p>}
                    </div>
                    <input 
                      required
                      name="city"
                      placeholder="Cidade"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input 
                    required
                    name="address"
                    placeholder="Endereço (Rua, Avenida...)"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      name="number"
                      placeholder="Número"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.number}
                      onChange={handleInputChange}
                    />
                    <input 
                      name="complement"
                      placeholder="Complemento (Opcional)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.complement}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      name="neighborhood"
                      placeholder="Bairro"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                    />
                    <input 
                      required
                      name="state"
                      placeholder="Estado (UF)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sudorex transition-colors"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Opções de Frete - Aparece após preencher o CEP */}
              {formData.cep.replace(/\D/g, '').length >= 8 && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase italic">
                    <Truck size={20} className="text-sudorex" /> Opções de Entrega
                  </h3>
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('free')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        shippingMethod === 'free' 
                          ? 'border-sudorex bg-sudorex/5 shadow-sm' 
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          shippingMethod === 'free' ? 'border-sudorex' : 'border-slate-300'
                        }`}>
                          {shippingMethod === 'free' && <div className="w-2.5 h-2.5 rounded-full bg-sudorex" />}
                        </div>
                        <div className="text-left">
                          <span className="block font-bold text-slate-800 text-sm">Frete Grátis</span>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">7 a 12 dias úteis</span>
                        </div>
                      </div>
                      <span className="text-sudorex font-black text-sm uppercase italic">Grátis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod('sedex')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        shippingMethod === 'sedex' 
                          ? 'border-sudorex bg-sudorex/5 shadow-sm' 
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          shippingMethod === 'sedex' ? 'border-sudorex' : 'border-slate-300'
                        }`}>
                          {shippingMethod === 'sedex' && <div className="w-2.5 h-2.5 rounded-full bg-sudorex" />}
                        </div>
                        <div className="text-left">
                          <span className="block font-bold text-slate-800 text-sm">Frete SEDEX</span>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">2 a 5 dias úteis</span>
                        </div>
                      </div>
                      <span className="text-slate-800 font-black text-sm uppercase italic">R$ 12,84</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Pagamento */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase italic">
                  <CreditCard size={20} className="text-sudorex" /> Forma de Pagamento
                </h3>
                <div className="group relative overflow-hidden p-5 border-2 border-sudorex bg-gradient-to-br from-sudorex/5 to-white rounded-2xl flex items-center justify-between transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Zap size={40} className="text-sudorex" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-sudorex bg-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-sudorex"></div>
                    </div>
                    <div>
                      <span className="block font-black text-slate-800 text-sm md:text-base">PIX (Aprovação Imediata)</span>
                      <span className="block text-[10px] text-sudorex font-bold uppercase tracking-wider">Liberação instantânea do pedido</span>
                    </div>
                  </div>
                  <div className="relative z-10 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1">
                    <PixIcon className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                    <span className="text-[10px] md:text-xs font-black uppercase text-emerald-700 tracking-wide">PIX</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                  <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700">DICA:</span> O pagamento via PIX é processado na hora e garante que seu pedido seja enviado ainda hoje.
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  {ORDER_BUMPS.map((bump) => {
                    const isSelected = selectedOrderBumps.includes(bump.id);
                    return (
                      <button
                        key={bump.id}
                        type="button"
                        onClick={() => toggleOrderBump(bump.id)}
                        className={`w-full text-left rounded-xl border p-4 transition-colors ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <OptimizedImage
                              src={bump.image}
                              alt={bump.name}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-black text-slate-900">{bump.name}</p>
                              <p className="text-xs text-slate-500 mt-1">{bump.description}</p>
                            </div>
                          </div>
                          <span className="text-emerald-600 font-black whitespace-nowrap">
                            + R$ {bump.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black mb-6 uppercase italic border-b border-slate-100 pb-4">Resumo do Pedido</h3>
                <div className="flex items-center gap-4 mb-6">
                  <OptimizedImage src={offer.image} alt={offer.name} className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-sm">{offer.name}</h4>
                    <p className="text-xs text-slate-500">{BRAND.company}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Subtotal ({quantity}x)</span>
                    <span className="font-bold">R$ {subtotalPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Frete</span>
                    <span className={`${shippingMethod === 'free' ? 'text-sudorex' : 'text-slate-800'} font-bold uppercase`}>
                      {shippingMethod === 'free' ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Adicionais</span>
                    <span className="font-bold">R$ {orderBumpsPrice}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-4 border-t border-slate-100">
                    <span>TOTAL</span>
                    <span className="text-sudorex uppercase italic">R$ {totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isCreatingPixCharge}
                  className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-lg shadow-sudorex/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isCreatingPixCharge ? 'GERANDO PIX...' : 'FINALIZAR COMPRA'} <ArrowRight size={20} />
                </button>
                {paymentError && <p className="text-xs text-red-600 font-bold -mt-2">{paymentError}</p>}

                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-center text-sm font-black text-slate-900 mb-3 normal-case">
                    Mais de 8.000 homens atendidos
                  </p>
                  <div className="space-y-2">
                    <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                      "Eu vivia escolhendo roupa para esconder o peito. Hoje me sinto muito mais seguro."
                      <span className="font-bold text-slate-800"> - Carlos M., Belo Horizonte/MG</span>
                    </blockquote>
                    <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                      "Gostei da fórmula e da praticidade. Comprei o tratamento completo."
                      <span className="font-bold text-slate-800"> - Rafael S., Campinas/SP</span>
                    </blockquote>
                    <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                      "Produto chegou rápido e o atendimento foi tranquilo do começo ao fim."
                      <span className="font-bold text-slate-800"> - Diego P., Curitiba/PR</span>
                    </blockquote>
                  </div>
                </div>
                
                {/* Trust Footer below button */}
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-100">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <ShieldCheck size={20} className="text-slate-400" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Compra 100% Protegida</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <div className="flex justify-center mb-2">
                      <Truck size={20} className="text-slate-400" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Frete Grátis com Seguro</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Zap size={20} className="text-slate-400" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Aprovação Imediata</p>
                  </div>
                </div>

                <div className="bg-slate-100/50 rounded-2xl p-4 flex items-center gap-4">
                  <OptimizedImage src={OFFERS[0].image} className="w-10 h-10 object-contain opacity-50 grayscale" alt="Garantia" referrerPolicy="no-referrer" />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    <span className="font-bold text-slate-700 block mb-1">GARANTIA DE SATISFAÇÃO</span>
                    Se você não ficar satisfeito em até 30 dias, entre em contato para solicitar sua garantia.
                  </p>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default function App() {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const handleSelectOffer = (offer: Offer) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setSelectedOffer(offer);
  };

  if (selectedOffer) {
    return (
      <div className="checkout-theme">
        <Checkout offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
      </div>
    );
  }

  return <LandingPage onSelectOffer={handleSelectOffer} />;
}
