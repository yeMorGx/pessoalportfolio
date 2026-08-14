import type { Project } from "@/lib/projects";

export type Locale = "en" | "pt";

export function homePath(locale: Locale) {
  return locale === "pt" ? "/pt" : "/";
}

export function projectsPath(locale: Locale) {
  return locale === "pt" ? "/pt/projetos" : "/projects";
}

export function resumePath(locale: Locale) {
  return locale === "pt" ? "/pt/curriculo" : "/resume";
}

export function resumeStatusPath(locale: Locale) {
  return `${resumePath(locale)}/status`;
}

export function projectPath(locale: Locale, slug: string) {
  return `${projectsPath(locale)}/${slug}`;
}

export function localizedAlternates(locale: Locale, englishPath: string, portuguesePath: string) {
  return {
    canonical: locale === "pt" ? portuguesePath : englishPath,
    languages: {
      en: englishPath,
      "pt-BR": portuguesePath,
      "x-default": englishPath
    }
  };
}

export const siteCopy = {
  en: {
    header: {
      homeLabel: "Gabriel Morgado - home",
      navigationLabel: "Primary navigation",
      mobileNavigationLabel: "Mobile navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      cta: "Let's talk",
      navItems: [
        { href: "#sobre", label: "About" },
        { href: "#projetos", label: "Projects" },
        { href: "#stack", label: "Stack" },
        { href: "#contato", label: "Contact" }
      ]
    },
    hero: {
      eyebrow: "Interfaces / Systems / Security",
      tagline: "I build digital products across interfaces, systems and security.",
      projects: "View projects",
      contactShort: "Contact",
      contact: "Get in touch",
      explore: "Scroll to explore"
    },
    about: {
      sectionLabel: "Profile / approach",
      portraitAlt: "Portrait of Gabriel Morgado",
      availability: "Available for new projects",
      eyebrow: "Full-stack developer",
      heading: "Product thinking does not end when the code begins.",
      body: "I combine visual direction, full-stack engineering and security fundamentals to build digital products that are easy to understand, reliable to operate and strong to present.",
      capabilities: [
        ["Product", "I turn needs into clear flows and interfaces that support better decisions."],
        ["Engineering", "I build frontend, APIs, authentication and data as one coherent solution."],
        ["Security", "I bring a defensive perspective to architecture, operations and experience."]
      ],
      work: "Explore the work"
    },
    projects: {
      sectionLabel: "Selected projects",
      heading: "Products built to perform and persuade.",
      body: "Each case covers the problem, product decisions and technical foundation behind the delivery.",
      all: "View all projects",
      defaultRole: "Digital product",
      featured: "Featured",
      caseLabel: "Case",
      explore: "Explore product",
      coverAlt: "Cover for the project"
    },
    experience: {
      sectionLabel: "Technical system",
      heading: "Technologies connected by intent.",
      body: "A multidisciplinary foundation for shaping the experience, supporting operations and protecting the product.",
      technologies: "technologies",
      groups: [
        ["Dev / Front", "Interfaces, components and responsive experiences."],
        ["Dev / Back", "Services, authentication, data and integrations."],
        ["Cyber", "Application monitoring, response and security."],
        ["AI / Automation", "Models, agents and workflows that turn ideas into useful systems."]
      ]
    },
    contact: {
      sectionLabel: "Contact / availability",
      eyebrow: "Let's talk",
      heading: "Have a product to build or a team that could use more momentum?",
      body: "I am open to full-stack opportunities and projects where engineering, experience and clarity need to move together.",
      cta: "Start a conversation",
      location: "Santos region / Brazil",
      form: {
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        emailPlaceholder: "you@company.com",
        subject: "Subject",
        subjectPlaceholder: "What would you like to build?",
        message: "Message",
        messagePlaceholder: "Share the context, goal and where I can help.",
        privacy: "Your message is stored securely and used only to reply to this conversation.",
        submit: "Send message",
        sending: "Sending",
        success: "Message received. I will reply by email.",
        error: "The message could not be sent. Please try again.",
        rateLimit: "You have sent several messages. Please wait 15 minutes and try again."
      }
    },
    resume: {
      linkLabel: "Resume",
      back: "Back to portfolio",
      eyebrow: "Professional profile / controlled access",
      heading: "Request access to my resume.",
      body: "To keep professional information within relevant conversations, each request is reviewed before a temporary download link is released.",
      steps: [
        ["01", "Request", "Share who you are and the context of the opportunity."],
        ["02", "Review", "I review the request manually and confirm the fit."],
        ["03", "Access", "An approved request receives a private link valid for 72 hours."]
      ],
      form: {
        name: "Name",
        namePlaceholder: "Your full name",
        email: "Professional email",
        emailPlaceholder: "you@company.com",
        company: "Company",
        companyPlaceholder: "Company name",
        jobTitle: "Role",
        jobTitlePlaceholder: "Your role",
        linkedin: "LinkedIn (optional)",
        linkedinPlaceholder: "https://linkedin.com/in/...",
        purpose: "Opportunity context",
        purposePlaceholder: "Tell me about the role, team and why you would like to review my resume.",
        privacy: "This information is used only to review your request and manage temporary access.",
        submit: "Request access",
        sending: "Submitting",
        success: "Request received and awaiting review.",
        track: "Track request",
        trackingCode: "Keep this private tracking link. It is the only way to check the request without email.",
        error: "The request could not be submitted. Please try again.",
        rateLimit: "Several requests were sent from this connection. Please try again tomorrow."
      },
      status: {
        eyebrow: "Resume request",
        heading: "Request status",
        tokenLabel: "Private tracking code",
        tokenPlaceholder: "Paste the tracking code",
        check: "Check status",
        loading: "Checking",
        pending: "Under review",
        pendingBody: "Your request was received and is waiting for a manual review.",
        approved: "Approved",
        approvedBody: "A private access link has been prepared. Check the reply sent to your professional email or the message shared directly by Gabriel.",
        rejected: "Not approved",
        rejectedBody: "The request was reviewed, but access was not released at this time.",
        revoked: "Access ended",
        revokedBody: "The temporary access granted to this request has been revoked.",
        expired: "Access expired",
        expiredBody: "The 72-hour access period has ended. Submit a new request if access is still needed.",
        notFound: "This tracking code is invalid or no longer available."
      },
      access: {
        eyebrow: "Protected document",
        heading: "Private resume access",
        body: "This link is personal, temporary and should not be forwarded. The generated download address expires after 60 seconds.",
        download: "Download PDF",
        preparing: "Preparing download",
        expired: "This access has expired or was revoked.",
        unavailable: "The resume is temporarily unavailable. Please contact Gabriel."
      }
    },
    location: {
      ariaLabel: "Open the Santos region in Google Maps",
      base: "Based on the coast of Sao Paulo",
      body: "Santos region, Brazil. Available for remote work and connections beyond the coast.",
      map: "View on map"
    },
    wordmark: {
      signature: "Signature / Portfolio",
      open: "Open for work",
      projects: "New projects"
    },
    archive: {
      home: "Back home",
      label: "Project archive",
      eyebrow: "Product / Engineering / Security",
      heading: "Projects in motion.",
      body: "A continuous view of products, systems and experiences built from strategy through implementation.",
      evolving: "An evolving collection",
      openCase: "Open case",
      next: "Next conversation",
      nextHeading: "A strong product starts with a clear conversation.",
      nextBody: "Available for digital products, internal systems and product experiences with technical direction.",
      cta: "Start a conversation",
      previous: "Previous project",
      following: "Next project"
    },
    showcase: {
      back: "Back to projects",
      defaultRole: "Digital product",
      open: "Open product",
      repository: "Repository",
      coverAlt: "Cover for the project",
      role: "Role",
      technologies: "Technologies",
      inSolution: "in the solution",
      status: "Status",
      published: "Published case",
      overview: "Product overview",
      resolves: "What the product solves.",
      stack: "Project stack",
      demo: "Demo",
      moving: "The product in motion.",
      gallery: "Gallery",
      galleryHeading: "Product screens and details.",
      features: "Features",
      built: "What was built.",
      impact: "Impact",
      value: "The value delivered.",
      next: "Next step",
      nextBody: "Explore the other products.",
      all: "View all projects",
      fallbackFeatures: ["Responsive experience", "Core flow implemented", "A foundation ready to evolve"],
      fallbackResults: ["Presentation-ready product", "Clean architecture", "Consistent experience"]
    },
    gallery: {
      carousel: "carousel",
      galleryOf: "Gallery of",
      openScreen: "Open details for screen",
      screen: "Screen",
      moving: "Gallery in motion",
      image: "Product image",
      singular: "screen",
      plural: "screens",
      closeDetails: "Close image details",
      close: "Close",
      about: "About this screen.",
      previous: "Previous image",
      next: "Next image"
    }
  },
  pt: {
    header: {
      homeLabel: "Gabriel Morgado - início",
      navigationLabel: "Navegação principal",
      mobileNavigationLabel: "Navegação móvel",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      cta: "Vamos conversar",
      navItems: [
        { href: "#sobre", label: "Sobre" },
        { href: "#projetos", label: "Projetos" },
        { href: "#stack", label: "Stack" },
        { href: "#contato", label: "Contato" }
      ]
    },
    hero: {
      eyebrow: "Interface / Sistemas / Segurança",
      tagline: "Desenvolvo produtos digitais entre interface, sistemas e segurança.",
      projects: "Ver projetos",
      contactShort: "Contato",
      contact: "Entrar em contato",
      explore: "Role para explorar"
    },
    about: {
      sectionLabel: "Perfil / abordagem",
      portraitAlt: "Retrato de Gabriel Morgado",
      availability: "Disponível para novos projetos",
      eyebrow: "Full-stack developer",
      heading: "A visão do produto não termina quando o código começa.",
      body: "Uno direção visual, engenharia full-stack e fundamentos de segurança para construir produtos digitais que sejam fáceis de entender, confiáveis para operar e fortes para apresentar.",
      capabilities: [
        ["Produto", "Transformo necessidades em fluxos claros e interfaces que ajudam a decidir."],
        ["Engenharia", "Construo frontend, APIs, autenticação e dados como uma solução única."],
        ["Segurança", "Trago visão de defesa para a arquitetura, a operação e a experiência."]
      ],
      work: "Conheça o trabalho"
    },
    projects: {
      sectionLabel: "Projetos selecionados",
      heading: "Produtos construídos para funcionar e convencer.",
      body: "Cada case mostra o problema, as decisões de produto e a base técnica por trás da entrega.",
      all: "Ver todos os projetos",
      defaultRole: "Produto digital",
      featured: "Destaque",
      caseLabel: "Case",
      explore: "Explorar produto",
      coverAlt: "Capa do projeto"
    },
    experience: {
      sectionLabel: "Sistema técnico",
      heading: "Tecnologias conectadas por intenção.",
      body: "Uma base multidisciplinar para desenhar a experiência, sustentar a operação e proteger o produto.",
      technologies: "tecnologias",
      groups: [
        ["Dev / Front", "Interfaces, componentes e experiências responsivas."],
        ["Dev / Back", "Serviços, autenticação, dados e integrações."],
        ["Ciber", "Monitoramento, resposta e segurança de aplicações."],
        ["IA / Automação", "Modelos, agentes e fluxos que transformam ideias em sistemas úteis."]
      ]
    },
    contact: {
      sectionLabel: "Contato / disponibilidade",
      eyebrow: "Vamos conversar",
      heading: "Tem um produto para construir ou uma equipe que precisa de mais força?",
      body: "Estou aberto a oportunidades full-stack e projetos em que engenharia, experiência e clareza precisam andar juntas.",
      cta: "Iniciar conversa",
      location: "Baixada Santista / Brasil",
      form: {
        name: "Nome",
        namePlaceholder: "Seu nome",
        email: "E-mail",
        emailPlaceholder: "voce@empresa.com",
        subject: "Assunto",
        subjectPlaceholder: "O que você gostaria de construir?",
        message: "Mensagem",
        messagePlaceholder: "Conte o contexto, o objetivo e como posso ajudar.",
        privacy: "Sua mensagem é armazenada com segurança e usada apenas para responder esta conversa.",
        submit: "Enviar mensagem",
        sending: "Enviando",
        success: "Mensagem recebida. Vou responder por e-mail.",
        error: "Não foi possível enviar a mensagem. Tente novamente.",
        rateLimit: "Você enviou várias mensagens. Aguarde 15 minutos e tente novamente."
      }
    },
    resume: {
      linkLabel: "Currículo",
      back: "Voltar ao portfólio",
      eyebrow: "Perfil profissional / acesso controlado",
      heading: "Solicite acesso ao meu currículo.",
      body: "Para manter as informações profissionais dentro de conversas relevantes, cada solicitação é revisada antes da liberação de um link temporário.",
      steps: [
        ["01", "Solicitação", "Conte quem você é e o contexto da oportunidade."],
        ["02", "Revisão", "Eu reviso a solicitação manualmente e confirmo a aderência."],
        ["03", "Acesso", "Uma solicitação aprovada recebe um link privado válido por 72 horas."]
      ],
      form: {
        name: "Nome",
        namePlaceholder: "Seu nome completo",
        email: "E-mail profissional",
        emailPlaceholder: "voce@empresa.com",
        company: "Empresa",
        companyPlaceholder: "Nome da empresa",
        jobTitle: "Cargo",
        jobTitlePlaceholder: "Seu cargo",
        linkedin: "LinkedIn (opcional)",
        linkedinPlaceholder: "https://linkedin.com/in/...",
        purpose: "Contexto da oportunidade",
        purposePlaceholder: "Conte sobre a vaga, a equipe e por que gostaria de analisar meu currículo.",
        privacy: "Essas informações são usadas apenas para revisar a solicitação e controlar o acesso temporário.",
        submit: "Solicitar acesso",
        sending: "Enviando",
        success: "Solicitação recebida e aguardando revisão.",
        track: "Acompanhar solicitação",
        trackingCode: "Guarde este link privado. Ele é a única forma de consultar a solicitação sem e-mail.",
        error: "Não foi possível enviar a solicitação. Tente novamente.",
        rateLimit: "Várias solicitações foram enviadas por esta conexão. Tente novamente amanhã."
      },
      status: {
        eyebrow: "Solicitação de currículo",
        heading: "Estado da solicitação",
        tokenLabel: "Código privado de acompanhamento",
        tokenPlaceholder: "Cole o código de acompanhamento",
        check: "Consultar estado",
        loading: "Consultando",
        pending: "Em análise",
        pendingBody: "Sua solicitação foi recebida e aguarda revisão manual.",
        approved: "Aprovada",
        approvedBody: "Um link privado foi preparado. Confira a resposta enviada ao seu e-mail profissional ou a mensagem compartilhada diretamente pelo Gabriel.",
        rejected: "Não aprovada",
        rejectedBody: "A solicitação foi revisada, mas o acesso não foi liberado neste momento.",
        revoked: "Acesso encerrado",
        revokedBody: "O acesso temporário concedido a esta solicitação foi revogado.",
        expired: "Acesso expirado",
        expiredBody: "O período de 72 horas terminou. Envie uma nova solicitação se o acesso ainda for necessário.",
        notFound: "Este código de acompanhamento é inválido ou não está mais disponível."
      },
      access: {
        eyebrow: "Documento protegido",
        heading: "Acesso privado ao currículo",
        body: "Este link é pessoal, temporário e não deve ser encaminhado. O endereço de download gerado expira após 60 segundos.",
        download: "Baixar PDF",
        preparing: "Preparando download",
        expired: "Este acesso expirou ou foi revogado.",
        unavailable: "O currículo está temporariamente indisponível. Entre em contato com Gabriel."
      }
    },
    location: {
      ariaLabel: "Abrir Baixada Santista no Google Maps",
      base: "Base / litoral de São Paulo",
      body: "Baixada Santista, Brasil. Disponível para trabalho remoto e conexões além do litoral.",
      map: "Ver no mapa"
    },
    wordmark: {
      signature: "Assinatura / Portfólio",
      open: "Agenda aberta",
      projects: "Novos projetos"
    },
    archive: {
      home: "Voltar ao início",
      label: "Arquivo de projetos",
      eyebrow: "Produto / Engenharia / Segurança",
      heading: "Projetos em movimento.",
      body: "Uma visão contínua dos produtos, sistemas e experiências construídos entre estratégia e implementação.",
      evolving: "Acervo em evolução",
      openCase: "Abrir case",
      next: "Próxima conversa",
      nextHeading: "Um produto forte começa com uma conversa clara.",
      nextBody: "Disponível para projetos digitais, sistemas internos e experiências de produto com direção técnica.",
      cta: "Iniciar conversa",
      previous: "Projeto anterior",
      following: "Próximo projeto"
    },
    showcase: {
      back: "Voltar aos projetos",
      defaultRole: "Produto digital",
      open: "Abrir produto",
      repository: "Repositório",
      coverAlt: "Capa do projeto",
      role: "Papel",
      technologies: "Tecnologias",
      inSolution: "na solução",
      status: "Estado",
      published: "Case publicado",
      overview: "Visão do produto",
      resolves: "O que o produto resolve.",
      stack: "Stack do projeto",
      demo: "Demonstração",
      moving: "Produto em movimento.",
      gallery: "Galeria",
      galleryHeading: "Telas e detalhes do produto.",
      features: "Features",
      built: "O que foi construído.",
      impact: "Impacto",
      value: "O valor entregue.",
      next: "Próximo passo",
      nextBody: "Explore os outros produtos.",
      all: "Ver todos os projetos",
      fallbackFeatures: ["Experiência responsiva", "Fluxo principal implementado", "Base pronta para evolução"],
      fallbackResults: ["Produto apresentável", "Arquitetura limpa", "Experiência consistente"]
    },
    gallery: {
      carousel: "carrossel",
      galleryOf: "Galeria de",
      openScreen: "Abrir detalhes da tela",
      screen: "Tela",
      moving: "Galeria em movimento",
      image: "Imagem do produto",
      singular: "tela",
      plural: "telas",
      closeDetails: "Fechar detalhes da imagem",
      close: "Fechar",
      about: "Sobre esta tela.",
      previous: "Imagem anterior",
      next: "Próxima imagem"
    }
  }
} as const;

type ProjectTranslation = Partial<Pick<Project, "title" | "description" | "product_overview" | "product_role" | "product_features" | "product_results" | "gallery_image_descriptions">>;

const englishProjectTranslations: Record<string, ProjectTranslation> = {
  maisctrl: {
    description: "Manage all your subscriptions in one place!"
  },
  resenha_cs: {
    description: "A website for private Counter-Strike 2 matches."
  },
  convite_casamento: {
    title: "Interactive Wedding Invitation",
    description: "A digital wedding invitation designed to turn a traditional invitation into a modern, elegant and interactive experience. It brings together the ceremony date and time, location, guest guidance, gift list and messages from the couple in one responsive experience for phones and computers."
  },
  nuvio: {
    description: "A help desk platform with a modern, easy-to-use interface.",
    product_overview: "A B2B platform for companies that want a straightforward service and help desk experience for their teams.",
    product_features: ["Help desk", "Modern experience", "Clear interface"],
    product_results: ["Less noise", "No confusion", "Zero friction"]
  },
  "atlas-crm": {
    description: "An operations dashboard for sales teams to track pipeline, revenue and critical tasks in real time.",
    product_overview: "An operational CRM designed to reduce noise between leads, activities and sales decisions. It brings indicators, next steps and customer context into one scannable interface.",
    product_role: "Full-stack developer",
    product_features: ["Visual pipeline", "Real-time indicators", "Sales task management"],
    product_results: ["Less context switching", "Faster pipeline review", "Operations ready for small teams"],
    gallery_image_descriptions: ["The main sales pipeline view, bringing indicators and tasks together for quick review."]
  },
  "pulse-analytics": {
    description: "A product dashboard with actionable metrics, cohort segmentation and decision-focused visualizations.",
    product_overview: "An analytics layer that turns product events into a clear reading of usage, retention and opportunities without burying people in disconnected charts.",
    product_role: "Frontend and visual analytics",
    product_features: ["Cohorts", "Product metrics", "Responsive visualizations"],
    product_results: ["Faster decisions", "Clear retention signals", "Presentation-ready dashboard"],
    gallery_image_descriptions: ["An analytics dashboard that turns usage events into clear metrics for product decisions."]
  },
  "forge-admin": {
    description: "A focused admin area for managing content, uploads and publishing states without touching code.",
    product_overview: "A private dashboard for managing project content, authentication, uploads and featured states without turning the portfolio into a generic CMS.",
    product_role: "Architecture and implementation",
    product_features: ["Authentication", "Project CRUD", "Image uploads"],
    product_results: ["Dashboard-managed content", "Less manual maintenance", "A foundation ready to evolve"],
    gallery_image_descriptions: ["The content workspace, with publishing controls, project editing and media uploads."]
  }
};

export function localizeProject(project: Project, locale: Locale): Project {
  if (locale === "pt") {
    return project;
  }

  const translation = englishProjectTranslations[project.slug];
  return translation ? { ...project, ...translation } : project;
}

export function localizeProjects(projects: Project[], locale: Locale) {
  return projects.map((project) => localizeProject(project, locale));
}
