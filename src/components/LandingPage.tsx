import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  ArrowRight,
  BatteryLow,
  ChevronDown,
  Droplets,
  Flame,
  Heart,
  Leaf,
  Menu,
  Pill,
  ShieldCheck,
  Star,
  Timer,
  TrendingUp,
  X,
  Brain,
  Check,
} from 'lucide-react';
import { BRAND, OFFERS, type Offer } from '../config/product';
import { OptimizedImage } from './OptimizedImage';
import { BrandLogo } from './BrandLogo';

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  delay: `${(i % 8) * 0.7}s`,
  duration: `${6 + (i % 5)}s`,
}));

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sudorex/30 bg-sudorex-dark/20 text-sudorex-light text-xs font-semibold tracking-wide"
    >
      <Timer size={14} className="text-sudorex animate-pulse" />
      <span>
        Oferta especial expira em{' '}
        <strong className="text-white tabular-nums">
          {timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
        </strong>
      </span>
    </motion.div>
  );
};

type FadeInProps = React.ComponentProps<typeof motion.div> & {
  delay?: number;
};

const FadeIn = ({ children, className = '', delay = 0, ...rest }: FadeInProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { href: '#solucao', label: 'Mecanismo' },
    { href: '#beneficios', label: 'Benefícios' },
    { href: '#oferta', label: 'Oferta' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav py-2">
      <motion.div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3">
          <BrandLogo className="h-10 md:h-11 w-auto max-w-[180px]" priority />
          <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] hidden sm:block">{BRAND.company}</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#oferta" className="btn-cta text-xs py-2.5 px-5 !rounded-lg">
            Comprar
          </a>
        </div>

        <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-white" aria-label="Menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-b border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setIsMenuOpen(false)} className="font-semibold text-slate-200 uppercase text-sm py-2">
                  {l.label}
                </a>
              ))}
              <a href="#oferta" onClick={() => setIsMenuOpen(false)} className="btn-cta text-center mt-2">
                Comprar Agora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="relative min-h-[100dvh] flex items-center bg-mesh overflow-x-hidden pt-20 pb-16">
    <motion.div className="particles">
      {PARTICLES.map((p) => (
        <span key={p.id} className="particle" style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }} />
      ))}
    </motion.div>

    <div className="max-w-6xl mx-auto px-4 w-full relative z-10">
      <div className="flex flex-col items-center text-center w-full sm:max-w-2xl sm:mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sudorex text-xs font-semibold uppercase tracking-[0.25em] mb-4"
          >
            Suplemento alimentar em cápsulas
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] text-white mb-6"
          >
            Mais{' '}
            <span className="text-gradient">conforto e confiança</span>{' '}
            para viver o dia sem se preocupar com o suor
          </motion.h1>

          <div className="relative mb-6 sm:mb-8 w-full flex justify-center">
            <div className="relative flex justify-center items-center w-full max-w-4xl mx-auto">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full max-w-3xl h-48 sm:h-64 rounded-full bg-sudorex/15 blur-3xl" />
            </div>
            <OptimizedImage
              src={BRAND.heroImage}
              alt={`${BRAND.name} — equilíbrio e confiança no dia a dia`}
              className="relative z-10 block mx-auto w-full h-auto rounded-2xl object-contain object-center drop-shadow-2xl"
              priority
            />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base md:text-lg leading-relaxed mb-6"
          >
            Fórmula premium com <strong className="text-white">7 ativos selecionados</strong> para apoiar o equilíbrio do organismo, dar suporte ao sistema nervoso e contribuir para mais tranquilidade no dia a dia.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-2 mb-6">
            {['Sem estimulantes', 'Cápsulas vegetais', 'Uso diário'].map((badge) => (
              <span key={badge} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-sudorex/30 bg-sudorex-dark/20 text-sudorex-light">
                {badge}
              </span>
            ))}
          </motion.div>

          <motion.div className="mb-6 flex justify-center">
            <CountdownTimer />
          </motion.div>

          <motion.a
            href="#oferta"
            className="btn-cta btn-cta-pulse w-full sm:w-auto mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Quero mais conforto no dia a dia <ArrowRight size={18} />
          </motion.a>

          <motion.p className="text-slate-500 text-xs flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-sudorex" />
            Suplemento alimentar • Não é medicamento
          </motion.p>
      </div>
    </div>
  </section>
);

const PainSection = () => {
  const symptoms = [
    { icon: Droplets, title: 'Suor em momentos de tensão', desc: 'Reuniões, entrevistas e apresentações viram fonte de desconforto constante.' },
    { icon: Flame, title: 'Calor e rotina agitada', desc: 'O suor aumenta com estresse, ansiedade e dias mais corridos.' },
    { icon: Heart, title: 'Insegurança social', desc: 'Você evita cumprimentar, levantar os braços ou se aproximar de alguém.' },
    { icon: TrendingUp, title: 'Roupas escolhidas para esconder', desc: 'Camadas extras e tecidos escuros viram estratégia para disfarçar o incômodo.' },
    { icon: BatteryLow, title: 'Confiança abalada', desc: 'A preocupação com a transpiração rouba sua presença em momentos importantes.' },
  ];

  return (
    <section className="py-16 md:py-24 bg-section-dark relative">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            A transpiração intensa está limitando sua confiança?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Muitos homens convivem com esse desconforto em silêncio — e buscam uma alternativa natural para recuperar tranquilidade no trabalho, nos estudos e na vida social.
          </p>
        </FadeIn>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {symptoms.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08}>
              <motion.div className="card-premium p-6 h-full group">
                <div className="w-11 h-11 rounded-xl bg-[#0a1414] border border-sudorex/20 flex items-center justify-center mb-4 group-hover:border-sudorex/40 transition-colors">
                  <s.icon size={20} className="text-sudorex" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const TruthSection = () => {
  const causes = [
    'Estresse e ansiedade no dia a dia',
    'Momentos de tensão emocional ou pressão profissional',
    'Calor, clima e rotina agitada',
    'Fatores que intensificam a resposta do organismo à transpiração',
    'Sono ruim e sobrecarga mental que afetam o equilíbrio corporal',
  ];

  return (
    <section className="py-16 md:py-24 bg-mesh relative overflow-hidden">
      <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-sudorex-dark/10 to-transparent pointer-events-none" />
      <motion.div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <FadeIn>
            <p className="text-sudorex text-xs font-semibold uppercase tracking-[0.2em] mb-3">O que está por trás do incômodo</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              Por que o suor piora em certos momentos?
            </h2>
            <div className="space-y-5 text-slate-300 text-sm md:text-base leading-relaxed">
              <p>
                A transpiração intensa não é frescura. Em muitas pessoas, ela se intensifica quando o organismo enfrenta estresse, ansiedade, calor ou uma rotina mais exigente.
              </p>
              <p>
                Quando o sistema nervoso fica sobrecarregado, o corpo pode reagir com mais suor — especialmente em situações sociais, profissionais ou pessoais que exigem presença e confiança.
              </p>
            </div>

            <ul className="mt-7 space-y-3">
              {causes.map((cause) => (
                <li key={cause} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-sudorex shadow-[0_0_14px_rgba(72,169,166,0.8)] shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-slate-300 text-sm md:text-base leading-relaxed">
              O SudoreX® foi desenvolvido para oferecer suporte nutricional ao equilíbrio do organismo e ao sistema nervoso — contribuindo para uma rotina com mais conforto, tranquilidade e confiança.
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-sudorex/10 blur-2xl" />
              <OptimizedImage
                src={BRAND.truthImage}
                alt="Fatores que intensificam a transpiração — estresse, calor e rotina agitada"
                className="relative aspect-square w-full rounded-3xl border border-white/10 object-cover shadow-2xl shadow-black/40"
              />
            </div>
          </FadeIn>
        </div>
      </motion.div>
    </section>
  );
};

const SolutionSection = () => {
  const pillars = [
    {
      icon: Leaf,
      title: 'Equilíbrio do organismo',
      ingredient: 'Ingredientes naturais',
      desc: 'Extratos vegetais cuidadosamente selecionados oferecem suporte ao equilíbrio fisiológico e auxiliam no controle de fatores que intensificam a transpiração.',
      color: 'from-sudorex/20 to-sudorex-dark/10',
    },
    {
      icon: Brain,
      title: 'Sistema nervoso',
      ingredient: 'L-Teanina + Ashwagandha',
      desc: 'Nutrientes que auxiliam o funcionamento adequado do sistema nervoso, ajudando o organismo a responder melhor ao estresse e à tensão emocional.',
      color: 'from-sudorex-light/15 to-sudorex-dark/10',
    },
    {
      icon: Droplets,
      title: 'Conforto diário',
      ingredient: 'Bem-estar emocional',
      desc: 'Ao contribuir para o equilíbrio do organismo, auxilia quem deseja sentir-se mais confortável em situações que costumam aumentar a transpiração.',
      color: 'from-slate-600/20 to-slate-900/10',
    },
  ];

  return (
    <section id="solucao" className="py-16 md:py-24 bg-mesh relative overflow-hidden">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-14">
          <p className="text-sudorex text-xs font-semibold uppercase tracking-[0.2em] mb-3">Como a fórmula atua</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            {BRAND.name} trabalha em{' '}
            <span className="text-gradient">3 pilares</span> do seu bem-estar
          </h2>
        </FadeIn>

        <motion.div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.12}>
              <motion.div
                className={`card-premium p-8 h-full bg-gradient-to-b ${p.color} relative overflow-hidden`}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-sudorex/5 rounded-full blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-sudorex/20 border border-sudorex/30 flex items-center justify-center mb-6">
                  <p.icon size={26} className="text-sudorex-light" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sudorex">{p.ingredient}</span>
                <h3 className="font-display text-2xl font-bold text-white mt-1 mb-3">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Equilíbrio do organismo',
      desc: 'Suporte nutricional para quem busca mais controle e conforto no dia a dia.',
    },
    {
      icon: Brain,
      title: 'Sistema nervoso',
      desc: 'Ativos que auxiliam o funcionamento adequado do sistema nervoso e a resposta ao estresse.',
    },
    {
      icon: Heart,
      title: 'Mais confiança',
      desc: 'Volte a se sentir seguro em reuniões, entrevistas, encontros e momentos importantes.',
    },
    {
      icon: Droplets,
      title: 'Conforto diário',
      desc: 'Contribui para uma rotina mais tranquila em situações que intensificam a transpiração.',
    },
    {
      icon: Leaf,
      title: '7 ativos premium',
      desc: 'Fórmula completa com extratos vegetais, vitaminas e minerais reconhecidos internacionalmente.',
    },
    {
      icon: Pill,
      title: 'Prático e sem estimulantes',
      desc: 'Cápsulas vegetais de uso diário — fácil de incluir na sua rotina, sem complicação.',
    },
  ];

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-section-dark">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Benefícios para viver com mais tranquilidade
          </h2>
          <p className="text-slate-400 text-sm md:text-base">{BRAND.tagline}</p>
        </FadeIn>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {benefits.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.06}>
              <motion.div
                className="card-premium group relative h-full overflow-hidden p-6 md:p-7"
                whileHover={{ y: -4 }}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sudorex/10 blur-2xl transition-opacity group-hover:opacity-90" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-sudorex/30 bg-gradient-to-br from-sudorex/25 to-[#0a1414]/40 shadow-lg shadow-black/30">
                  <benefit.icon size={22} className="text-sudorex-light" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{benefit.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { num: '01', title: 'Uso diário', desc: 'Inclua as cápsulas na sua rotina — prático, discreto e fácil de manter.' },
    { num: '02', title: 'Suporte ao organismo', desc: 'A fórmula atua em pilares do equilíbrio corporal, sistema nervoso e bem-estar emocional.' },
    { num: '03', title: 'Confiança gradual', desc: 'Com constância, o objetivo é favorecer mais conforto, tranquilidade e segurança no dia a dia.' },
  ];

  return (
    <section className="py-16 md:py-24 bg-mesh">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="mb-10 md:mb-14">
          <OptimizedImage
            src={BRAND.howItWorksImage}
            alt={`Como funciona o ${BRAND.name}`}
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl shadow-black/30 border border-white/10 object-contain bg-black/40 p-8"
          />
        </FadeIn>

        <FadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Como funciona</h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base">Um cuidado premium, prático e integrado à sua rotina masculina.</p>
        </FadeIn>

        <motion.div className="relative">
          <motion.div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px timeline-line" />
          <motion.div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.15} className="relative text-center">
                <motion.div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sudorex to-sudorex-dark flex items-center justify-center font-display text-xl font-bold text-white mb-5 shadow-lg shadow-sudorex/30 relative z-10">
                  {step.num}
                </motion.div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </FadeIn>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const CompositionSection = () => {
  const ingredients = [
    {
      name: 'Sálvia + Melissa',
      subtitle: 'Equilíbrio e relaxamento',
      desc: 'Extrato de Sálvia tradicionalmente utilizado para auxiliar em situações relacionadas à transpiração. Melissa Officinalis promove sensação de tranquilidade.',
    },
    {
      name: 'L-Teanina + Ashwagandha',
      subtitle: 'Sistema nervoso e estresse',
      desc: 'Aminoácido do chá-verde que favorece relaxamento sem sonolência. Ashwagandha adaptógena auxilia o organismo na resposta ao estresse físico e mental.',
    },
    {
      name: 'Magnésio + Zinco + B6',
      subtitle: 'Nutrientes essenciais',
      desc: 'Magnésio Bisglicinato para o sistema nervoso e muscular. Zinco para proteção celular. Vitamina B6 para metabolismo energético e função nervosa.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-section-dark">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <p className="text-sudorex text-xs font-semibold uppercase tracking-[0.2em] mb-2">Composição</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">7 ativos em uma fórmula premium</h2>
        </FadeIn>

        <motion.div className="grid md:grid-cols-3 gap-6">
          {ingredients.map((ing, i) => (
            <FadeIn key={ing.name} delay={i * 0.1}>
              <motion.div className="card-premium p-7 h-full border-t-2 border-t-sudorex/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0a1414] flex items-center justify-center">
                    <Pill size={18} className="text-sudorex" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{ing.name}</h3>
                    <p className="text-[10px] text-sudorex uppercase tracking-wider font-medium">{ing.subtitle}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{ing.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const TestimonialsSection = () => {
  const reviews = [
    { text: 'Eu evitava apertar a mão das pessoas em reuniões. Depois que comecei o SudoreX, me senti muito mais à vontade no trabalho.', name: 'Marcos', age: '34 anos' },
    { text: 'O suor piorava quando eu ficava nervoso. A fórmula fez sentido para mim como suporte complementar no dia a dia.', name: 'Rafael', age: '41 anos' },
    { text: 'Comprei o tratamento completo para manter constância. Gostei da praticidade das cápsulas e da fórmula premium.', name: 'Diego', age: '28 anos' },
    { text: 'A maior mudança foi na confiança. Parei de escolher roupa só pensando em esconder o suor.', name: 'Thiago', age: '37 anos' },
  ];

  return (
    <section className="py-16 md:py-24 bg-mesh">
      <motion.div className="max-w-6xl mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Homens que decidiram recuperar a confiança</h2>
        </FadeIn>

        <motion.div className="grid sm:grid-cols-2 gap-4">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.08}>
              <motion.div className="card-premium p-6">
                <div className="flex gap-0.5 text-amber-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <p className="text-white font-semibold text-sm">
                  — {r.name}, <span className="text-slate-500 font-normal">{r.age}</span>
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const GuaranteeSection = () => (
  <section className="py-12 bg-section-dark border-y border-white/5">
    <motion.div className="max-w-3xl mx-auto px-4 text-center">
      <FadeIn>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sudorex/30 to-sudorex-dark/20 border-2 border-sudorex/40 mb-6">
          <ShieldCheck size={36} className="text-sudorex" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Risco zero por 30 dias</h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Use o SudoreX® por 30 dias. Se você não ficar satisfeito com a experiência, entre em contato para receber atendimento e solicitar sua garantia.
        </p>
      </FadeIn>
    </motion.div>
  </section>
);

const PricingSection = ({ onSelectOffer }: { onSelectOffer: (offer: Offer) => void }) => (
  <section id="oferta" className="py-16 md:py-24 bg-mesh relative">
    <motion.div className="max-w-6xl mx-auto px-4">
      <FadeIn className="text-center mb-12">
        <p className="text-sudorex text-xs font-semibold uppercase tracking-[0.2em] mb-2">Oferta exclusiva</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Escolha seu kit e comece hoje</h2>
        <p className="text-slate-400 text-sm">Tratamento recomendado: 2 a 3 potes • 60 cápsulas vegetais por pote • Pagamento 100% seguro via PIX</p>
      </FadeIn>

      <motion.div className="flex flex-col md:flex-row gap-5 md:items-stretch">
        {OFFERS.map((offer) => (
          <FadeIn key={offer.id} className="flex-1">
            <motion.div
              className={`card-premium p-6 h-full flex flex-col relative ${
                offer.popular ? 'border-sudorex/50 ring-2 ring-sudorex/30 md:scale-[1.03] z-10' : ''
              }`}
            >
              {offer.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sudorex to-sudorex-light text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Mais vendido
                </span>
              )}

              <h3 className="font-display text-xl font-bold text-white text-center mb-4">{offer.name}</h3>
              <OptimizedImage
                src={offer.image}
                alt={offer.name}
                className={`mx-auto object-contain mb-4 ${
                  offer.id === 2 ? 'h-44 md:h-48' : offer.id === 3 ? 'h-48 md:h-52' : 'h-36'
                }`}
              />

              <div className="text-center mb-6">
                <p className="text-slate-500 line-through text-sm">De R$ {offer.originalPrice}</p>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-lg text-sudorex-light font-semibold">R$</span>
                  <span className="font-display text-5xl font-bold text-white">{offer.price.split(',')[0]}</span>
                  <span className="text-2xl font-bold text-white">,{offer.price.split(',')[1]}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <Check size={14} className="text-sudorex shrink-0" /> {offer.capsules}
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <Check size={14} className="text-sudorex shrink-0" /> Envio imediato para todo Brasil
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <Check size={14} className="text-sudorex shrink-0" /> Garantia de 30 dias
                </li>
              </ul>

              <button
                type="button"
                onClick={() => onSelectOffer(offer)}
                className="btn-cta w-full"
              >
                Comprar agora
              </button>
            </motion.div>
          </FadeIn>
        ))}
      </motion.div>

      <FadeIn className="mt-8 text-center">
        <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-sudorex" />
          Pagamento 100% seguro • Dados criptografados
        </p>
      </FadeIn>
    </motion.div>
  </section>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const questions = [
    {
      q: 'O SudoreX® é indicado para mim?',
      a: 'O SudoreX® é ideal para pessoas que sentem desconforto com transpiração intensa, especialmente em momentos de nervosismo, estresse ou rotina agitada. Casos persistentes ou relacionados a condições médicas devem ser avaliados por um profissional de saúde.',
    },
    {
      q: 'Em quanto tempo posso perceber mudanças?',
      a: 'Muitas pessoas relatam percepção gradual entre 3 e 6 semanas de uso contínuo. Resultados variam conforme organismo, rotina, alimentação e fatores individuais.',
    },
    {
      q: 'Como devo tomar?',
      a: 'Siga o modo de uso indicado no rótulo. Para uma rotina completa, mantenha constância diária e boa hidratação. Cada pote contém 60 cápsulas vegetais.',
    },
    {
      q: 'O SudoreX® substitui tratamento médico?',
      a: 'Não. O SudoreX® não é um medicamento e não substitui tratamentos médicos para hiperidrose. Seu objetivo é oferecer suporte nutricional complementar para bem-estar e conforto.',
    },
    {
      q: 'Precisa de receita?',
      a: 'Não. O SudoreX® é um suplemento alimentar de venda livre. Pessoas com condições de saúde ou uso contínuo de medicamentos devem consultar um profissional antes do consumo.',
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-section-dark">
      <motion.div className="max-w-2xl mx-auto px-4">
        <FadeIn className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-white">Perguntas frequentes</h2>
        </FadeIn>

        <motion.div className="space-y-3">
          {questions.map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.05}>
              <motion.div className="card-premium overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-white"
                >
                  {item.q}
                  <ChevronDown size={18} className={`text-sudorex transition-transform shrink-0 ml-2 ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4 faq-answer">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeIn>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const FinalCTA = () => (
  <section className="py-20 bg-mesh relative overflow-hidden">
    <motion.div className="absolute inset-0 bg-gradient-to-t from-sudorex-dark/20 to-transparent pointer-events-none" />
    <motion.div className="max-w-3xl mx-auto px-4 text-center relative z-10">
      <FadeIn>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
          Imagine viver com mais tranquilidade
        </h2>
        <p className="text-slate-400 mb-8 text-sm md:text-base">
          Levantar os braços sem pensar duas vezes. Cumprimentar com confiança. Participar de reuniões sem preocupação. Escolha seu kit de SudoreX® e comece uma rotina com mais conforto, equilíbrio e confiança.
        </p>
        <a href="#oferta" className="btn-cta btn-cta-pulse text-base px-10 py-5">
          Comprar {BRAND.name} com desconto <ArrowRight size={20} />
        </a>
      </FadeIn>
    </motion.div>
  </section>
);

const Marquee = () => (
  <div className="bg-black py-3 overflow-hidden border-y border-white/5">
    <div className="flex whitespace-nowrap animate-marquee">
      {[1, 2].map((g) => (
        <div key={g} className="flex items-center">
          {['SEM ESTIMULANTES', 'FÓRMULA PREMIUM', 'EQUILÍBRIO', 'CONFIANÇA', '7 ATIVOS', 'SUDOREX'].map((t) => (
            <span key={`${g}-${t}`} className="mx-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Leaf size={12} className="text-sudorex" /> {t}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-black py-12 border-t border-white/5">
    <motion.div className="max-w-6xl mx-auto px-4 text-center">
      <div className="flex flex-col items-center gap-3 mb-4">
        <BrandLogo className="h-12 md:h-14 w-auto max-w-[220px] mx-auto" />
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">{BRAND.company}</p>
      <p className="text-[10px] text-slate-600 leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
        Este produto não substitui orientação médica. SudoreX® não é medicamento e não substitui tratamentos para hiperidrose. Resultados podem variar. Suplemento alimentar.
      </p>
      <p className="text-[10px] text-slate-600 mt-6">© {new Date().getFullYear()} {BRAND.company}. Todos os direitos reservados.</p>
    </motion.div>
  </footer>
);

const StickyCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="sticky-cta"
        >
          <a href="#oferta" className="btn-cta w-full text-center text-sm py-3.5">
            Comprar com desconto
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LandingPageProps {
  onSelectOffer: (offer: Offer) => void;
}

export default function LandingPage({ onSelectOffer }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Marquee />
      <PainSection />
      <TruthSection />
      <SolutionSection />
      <BenefitsSection />
      <HowItWorksSection />
      <CompositionSection />
      <TestimonialsSection />
      <PricingSection onSelectOffer={onSelectOffer} />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </div>
  );
}
