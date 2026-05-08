export type LocalSeoContent = {
  city: string;
  state: string;
  slug: string;
  nearbyCities: string[];
  neighborhoods: string[];
  headline: string;
  intro: string;
  reasons: {
    title: string;
    description: string;
  }[];
  useCases: {
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

const defaultReasons = [
  {
    title: "Rede 100% fibra optica",
    description:
      "A conexao foi pensada para entregar estabilidade no uso diario, com alta velocidade para downloads, uploads, streaming, jogos e videochamadas.",
  },
  {
    title: "Planos de ate 1000 Mega",
    description:
      "A Velpro trabalha com planos para casas conectadas, familias com muitos dispositivos e empresas que precisam de mais desempenho.",
  },
  {
    title: "Atendimento local",
    description:
      "O suporte conhece a regiao atendida e consegue orientar melhor sobre cobertura, instalacao e disponibilidade por endereco.",
  },
  {
    title: "Wi-Fi e entretenimento",
    description:
      "Planos selecionados contam com recursos de Wi-Fi, canais e beneficios para transformar a internet em uma experiencia completa.",
  },
];

const defaultUseCases = [
  {
    title: "Internet para jogar online",
    description:
      "Baixa latencia, estabilidade e velocidade para partidas online, atualizacoes grandes e transmissao de gameplay.",
  },
  {
    title: "Internet para home office",
    description:
      "Conexao preparada para reunioes por video, sistemas em nuvem, envio de arquivos e rotina profissional em casa.",
  },
  {
    title: "Internet para streaming",
    description:
      "Velocidade para assistir filmes, series, lives e videos em alta resolucao com menos travamentos.",
  },
  {
    title: "Internet para empresas",
    description:
      "Planos para negocios que dependem de conexao confiavel, atendimento rapido e boa experiencia para equipe e clientes.",
  },
];

const contentBySlug: Record<string, LocalSeoContent> = {
  "cidade-ocidental": {
    city: "Cidade Ocidental",
    state: "GO",
    slug: "cidade-ocidental",
    nearbyCities: ["Luziânia", "Valparaíso de Goiás", "Jardim Ingá", "Novo Gama"],
    neighborhoods: [
      "Centro",
      "Ocidental Park",
      "Parque Nápolis",
      "Recreio Mossoró",
      "Colina Verde",
      "Residencial Dom Bosco",
      "Jardim ABC",
      "Jardim Edite",
      "Parque das Américas",
      "SQ 13",
    ],
    headline: "Internet fibra em Cidade Ocidental com velocidade para casa, jogos e trabalho",
    intro:
      "A Velpro atende Cidade Ocidental com internet fibra optica, planos de alta velocidade e foco em instalacao rapida. A pagina foi criada para quem procura uma conexao local, estavel e com atendimento proximo.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: "A Velpro tem internet fibra em Cidade Ocidental?",
        answer:
          "Sim. A Velpro atende Cidade Ocidental e consulta a disponibilidade por CEP e endereco antes da contratacao para confirmar a cobertura no ponto exato.",
      },
      {
        question: "Quais planos de internet estao disponiveis em Cidade Ocidental?",
        answer:
          "A disponibilidade pode variar por endereco, mas a Velpro trabalha com planos residenciais de alta velocidade, incluindo opcoes de ate 1000 Mega.",
      },
      {
        question: "A internet da Velpro serve para jogos online?",
        answer:
          "Sim. A rede fibra optica oferece estabilidade e baixa latencia, pontos importantes para jogos competitivos, downloads e transmissao ao vivo.",
      },
      {
        question: "Como consultar cobertura em Cidade Ocidental?",
        answer:
          "Use o formulario de cobertura da pagina ou fale pelo WhatsApp informando CEP, rua, numero e bairro para validacao de disponibilidade.",
      },
      {
        question: "A Velpro atende empresas em Cidade Ocidental?",
        answer:
          "Sim. Alem dos planos residenciais, a Velpro oferece solucoes para empresas que precisam de conexao confiavel e atendimento especializado.",
      },
    ],
  },
  luziania: {
    city: "Luziânia",
    state: "GO",
    slug: "luziania",
    nearbyCities: ["Jardim Ingá", "Cidade Ocidental", "Valparaíso de Goiás", "Novo Gama"],
    neighborhoods: [
      "Centro",
      "Parque Estrela Dalva",
      "Parque Santa Fe",
      "Jardim Ingá",
      "Mandu",
      "Setor Aeroporto",
      "Cidade Jardim Marília",
      "Parque Residencial Faro",
    ],
    headline: "Internet fibra em Luziânia para navegar, jogar e trabalhar com estabilidade",
    intro:
      "A Velpro disputa Luziânia com planos fortes, fibra optica e uma proposta direta: entregar velocidade real, suporte proximo e uma experiencia melhor para residencias e empresas.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: "A Velpro atende Luziânia?",
        answer:
          "Sim. A Velpro atende areas de Luziânia e valida a disponibilidade por endereco, incluindo regioes proximas como Jardim Ingá.",
      },
      {
        question: "Qual plano escolher em Luziânia?",
        answer:
          "Para uso basico, planos intermediarios atendem bem. Para muitos dispositivos, jogos, streaming 4K e home office intenso, os planos maiores entregam mais folga.",
      },
      {
        question: "Tem internet para empresas em Luziânia?",
        answer:
          "Sim. A Velpro oferece atendimento para empresas, com foco em estabilidade, suporte e produtividade.",
      },
      {
        question: "Como saber se chega fibra na minha rua?",
        answer:
          "Informe CEP, rua, numero e bairro no atendimento da Velpro para confirmar a viabilidade tecnica de instalacao.",
      },
    ],
  },
  "valparaiso-de-goias": {
    city: "Valparaíso de Goiás",
    state: "GO",
    slug: "valparaiso-de-goias",
    nearbyCities: ["Cidade Ocidental", "Luziânia", "Novo Gama", "Jardim Ingá"],
    neighborhoods: [
      "Centro",
      "Jardim Oriente",
      "Parque Rio Branco",
      "Esplanada",
      "Parque São Bernardo",
      "Cidade Jardins",
      "Mansões Ilha Bela",
      "Morada Nobre",
    ],
    headline: "Internet fibra em Valparaíso de Goiás com planos de alta velocidade",
    intro:
      "A Velpro atende quem busca internet em Valparaíso de Goiás com fibra optica, planos competitivos e suporte para casas, apartamentos, lojas e empresas.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: "A Velpro tem cobertura em Valparaíso de Goiás?",
        answer:
          "Sim. A Velpro atende Valparaíso de Goiás mediante consulta de disponibilidade por CEP e endereco.",
      },
      {
        question: "A internet fibra da Velpro e boa para apartamento?",
        answer:
          "Sim. A equipe valida a disponibilidade tecnica do endereco e orienta a melhor solucao de Wi-Fi para o tamanho do imovel.",
      },
      {
        question: "Quais velocidades estao disponiveis em Valparaíso?",
        answer:
          "A Velpro possui planos de alta velocidade e opcoes de ate 1000 Mega, conforme disponibilidade tecnica na regiao.",
      },
      {
        question: "Posso contratar pelo WhatsApp?",
        answer:
          "Sim. Voce pode iniciar a contratacao pelo WhatsApp informando cidade, bairro, rua, numero e CEP.",
      },
    ],
  },
  "jardim-inga-luziania": {
    city: "Jardim Ingá - Luziânia",
    state: "GO",
    slug: "jardim-inga-luziania",
    nearbyCities: ["Luziânia", "Cidade Ocidental", "Valparaíso de Goiás", "Novo Gama"],
    neighborhoods: ["Jardim Ingá", "Mansões Recreio Estrela Dalva", "Parque Mingone", "Região do Ingá"],
    headline: "Internet fibra no Jardim Ingá com planos Velpro de alta velocidade",
    intro:
      "A Velpro atende o Jardim Ingá e regiao com internet fibra optica para familias, estudantes, jogadores e negocios que precisam de conexao estavel.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: "A Velpro atende o Jardim Ingá?",
        answer:
          "Sim. A Velpro consulta cobertura no Jardim Ingá por CEP e endereco para confirmar a viabilidade da instalacao.",
      },
      {
        question: "Tem plano com Wi-Fi para o Jardim Ingá?",
        answer:
          "Sim. Os planos podem incluir recursos de Wi-Fi conforme a oferta contratada e a disponibilidade tecnica.",
      },
      {
        question: "A internet serve para aulas online e home office?",
        answer:
          "Sim. A fibra optica ajuda a manter estabilidade para aulas, chamadas de video, trabalho remoto e sistemas online.",
      },
    ],
  },
  "ponte-alta-norte-gama": {
    city: "Ponte Alta Norte Gama",
    state: "DF",
    slug: "ponte-alta-norte-gama",
    nearbyCities: ["Cidade Ocidental", "Valparaíso de Goiás", "Novo Gama", "Luziânia"],
    neighborhoods: ["Ponte Alta Norte", "Região do Gama", "Setor de Chácaras"],
    headline: "Internet fibra na Ponte Alta Norte Gama com atendimento Velpro",
    intro:
      "A Velpro atende a Ponte Alta Norte Gama com planos de internet fibra optica, suporte proximo e consulta de cobertura por endereco.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: "A Velpro atende Ponte Alta Norte Gama?",
        answer:
          "Sim. A cobertura deve ser confirmada por CEP e endereco para validar a disponibilidade tecnica.",
      },
      {
        question: "Tem internet para chacaras e casas na regiao?",
        answer:
          "A disponibilidade depende do ponto de instalacao. Informe o endereco completo para avaliacao de viabilidade.",
      },
    ],
  },
};

export function getLocalSeoContent(slug: string | null | undefined, cityName?: string | null) {
  if (slug && contentBySlug[slug]) {
    return contentBySlug[slug];
  }

  if (!slug || !cityName) {
    return null;
  }

  return {
    city: cityName,
    state: "GO",
    slug,
    nearbyCities: ["Cidade Ocidental", "Luziânia", "Valparaíso de Goiás"],
    neighborhoods: [],
    headline: `Internet fibra em ${cityName}`,
    intro:
      "Consulte a disponibilidade da Velpro para contratar internet fibra optica com velocidade, estabilidade e suporte local.",
    reasons: defaultReasons,
    useCases: defaultUseCases,
    faqs: [
      {
        question: `A Velpro atende ${cityName}?`,
        answer:
          "A disponibilidade deve ser confirmada por CEP e endereco para validar a viabilidade tecnica de instalacao.",
      },
    ],
  } satisfies LocalSeoContent;
}
