/**
 * Pages institutionnelles — FRANÇAIS. Reflète exactement content/pages/en.ts (master) : mêmes clés, mêmes
 * longueurs de tableaux, même structure. Traduction uniquement, aucune affirmation ni aucun chiffre ajoutés.
 * Statut : brouillon — en attente de relecture par un rédacteur spécialisé du secteur poids lourds.
 */
import type en from './en';

const fr: typeof en = {
  about: {
    title: 'À propos d’Özteknik',
    lead: 'Fondée en 1971 par İbrahim Öztürk dans un atelier de 50 m². Aujourd’hui, Özteknik fabrique les pièces EGEROT, HYDCAB et REVOL dans deux usines à İzmir, pour les constructeurs en première monte et pour le marché de la rechange.',
    intro: [
      'Depuis plus de 50 ans, nous produisons des pièces automobiles — d’abord des moules, puis des composants pour les constructeurs en tant que fournisseur de rang 1 et de rang 2, et depuis 2004 nos propres marques pour véhicules poids lourds.',
      'Nous servons les camions et autobus lourds, les machines agricoles et les engins de chantier. Notre objectif est simple : élargir la gamme dont nos partenaires ont besoin sans compromis sur la qualité ni sur la continuité d’approvisionnement — et renforcer l’image du « Made in Türkiye » avec des pièces que nous concevons et produisons nous-mêmes.',
    ],
    facts: [
      { v: '1971', l: 'Fondée à İzmir' },
      { v: '2', l: 'Usines à İzmir' },
      { v: '3', l: 'Marques : EGEROT, HYDCAB, REVOL' },
      { v: '65+', l: 'Pays d’export' },
    ],
    timeline: [
      { y: '1971', t: 'Fondation par İbrahim Öztürk pour la fabrication de moules.' },
      { y: '1975', t: 'Premier contrat majeur avec l’industrie automobile.' },
      { y: '1988', t: 'Installation dans une nouvelle usine à Pınarbaşı, İzmir ; fournisseur de rang 1 et de rang 2 des constructeurs.' },
      { y: '1996', t: 'Création d’Özteknik Motorlu Taşıtlar ve Makina San. Tic. Ltd. Şti. dans le cadre d’une réorganisation.' },
      { y: '2001', t: 'Certification du management de la qualité ISO 9001:2000.' },
      { y: '2003', t: 'Installation dans l’usine actuelle de Kemalpaşa, İzmir.' },
      { y: '2004', t: 'Création de HYDCAB avec un investissement dans les systèmes de basculement de cabine pour véhicules utilitaires lourds.' },
      { y: '2005', t: 'Dépôt de la marque EGEROT avec un investissement dans les systèmes de direction et de suspension.' },
      { y: '2006', t: 'Création de la société de commerce extérieur EgeROT San. Tic. Ltd. Şti.' },
      { y: '2007', t: 'Certification ISO/TS 16949:2002.' },
      { y: '2009', t: 'L’usine de forge à chaud Taşsan A.Ş. rejoint le groupe Özteknik.' },
      { y: '2012', t: 'Investissement dans les vérins d’assistance de direction ; brevet pour un élément de palier à bague extérieure revêtue de métal, produit par injection plastique.' },
      { y: '2013', t: 'Création de REVOL avec un investissement dans la production d’embrayages poids lourds.' },
      { y: '2016', t: 'Modèle d’utilité pour la technologie de fabrication de la bague de retenue.' },
      { y: '2020', t: 'Modèle d’utilité pour le soudage par bossages raccord/manchon sur vérins hydrauliques ; début de la production de pièces pour engins de chantier et machines agricoles.' },
    ],
    afterSalesTitle: 'Service après-vente',
    afterSales:
      'Tous les produits bénéficient de la garantie du fabricant contre les défauts de fabrication. Notre équipe technique après-vente rend régulièrement visite aux clients pour suivre sur le terrain l’évolution des équipements et des produits, et accompagne nos partenaires sur les questions techniques.',
    vision: 'Être une force orientée stratégie, qui progresse en permanence avec l’ensemble de nos parties prenantes et apporte de la valeur ajoutée au secteur.',
    mission: 'Renforcer l’image du « Made in Türkiye » grâce aux pièces que nous concevons et fabriquons, dans le respect de nos valeurs d’entreprise.',
    group: ['Fabricant des pièces EGEROT, HYDCAB et REVOL, avec deux usines à İzmir.', 'La société de commerce international du groupe.', 'Forge à chaud qui fournit les ébauches forgées des rotules, embouts de biellette et corps.'],
    ip: [
      { y: '2012', t: 'Élément de roulement à bague extérieure revêtue de métal, fabriqué par injection plastique' },
      { y: '2016', t: 'Technologie de fabrication de l’anneau de sécurité' },
      { y: '2020', t: 'Soudage port/fût des vérins hydrauliques par soudage par bossages' },
    ],
  },
  production: {
    intro: [
      'La production s’appuie sur des lignes modernes équipées de centres d’usinage CNC, de logiciels de conception récents et des principes du lean manufacturing. Les opérations suivent le principe du flux et sont pilotées en temps réel pour livrer dans les délais sans compromis sur la qualité.',
      'L’usine de forge à chaud du groupe (Taşsan A.Ş., depuis 2009) fournit les ébauches forgées : les étapes critiques, de l’acier à la pièce finie, restent ainsi sous un même toit.',
    ],
    steps: [
      { t: 'Forge à chaud', d: 'Ébauches forgées pour axes de rotule, embouts et boîtiers, issues de l’usine de forge du groupe.' },
      { t: 'Usinage CNC', d: 'Tours verticaux, centres d’usinage horizontaux et fraisage CNC pour des ajustements précis.' },
      { t: 'Formage de tubes', d: 'Cintrage, rétreint et expansion des extrémités de tube pour barres d’accouplement et barres de réaction.' },
      { t: 'Soudage', d: 'Soudage par résistance et par bossages — y compris notre soudage raccord/manchon pour vérins hydrauliques, protégé par un modèle d’utilité.' },
      { t: 'Traitement thermique', d: 'Four de traitement thermique interne pour obtenir les propriétés de matériau requises.' },
      { t: 'Préparation de surface', d: 'Sablage et lavage industriel des pièces avant revêtement et assemblage.' },
      { t: 'Assemblage', d: 'Bagues, joints, mécanismes et disques d’embrayage assemblés en interne ; pièces d’embrayage équilibrées sur notre équilibreuse.' },
      { t: 'Essais et contrôle final', d: 'Essais d’étanchéité, d’endurance et de contrôle final sur nos propres bancs avant expédition.' },
    ],
    machines: [
      'Tour vertical CNC',
      'Centre d’usinage horizontal CNC',
      'Tour CNC',
      'Fraiseuse CNC',
      'Tour',
      'Presse',
      'Poste de soudage',
      'Four de traitement thermique',
      'Sableuse',
      'Machine de lavage industriel des pièces',
      'Cintreuse',
      'Machine de rétreint d’extrémité de tube',
      'Machine d’expansion d’extrémité de tube',
      'Brocheuse',
      'Équilibreuse',
    ],
    rnd: [
      'Notre équipe R&D développe des pièces pour des véhicules et des marchés qui ne figurent pas encore dans notre portefeuille, conçoit à partir des demandes clients et améliore les produits existants grâce aux retours du terrain — pour une durée de vie plus longue en conditions réelles d’utilisation, au coût cible.',
      'Chaque nouvelle pièce est validée sur nos propres bancs de mesure et d’essai selon les procédures SAE et ISO avant sa mise sur le marché.',
    ],
    testGroups: [
      {
        line: 'HYDCAB — hydraulique',
        tests: [
          'SAE J1336 — Essai d’étanchéité des vérins hydrauliques',
          'SAE J1334 — Essai d’intégrité des vérins hydrauliques',
          'SAE J1374 — Essai d’endurance des joints de tige',
          'SAE J1335 — Essai de frottement à vide',
          'ISO 7986 — Performance des joints dans les applications hydrauliques à mouvement alternatif',
          'ISO 10771-1:2015 — Essai de fatigue en pression des enveloppes métalliques sous pression',
          'Essais de réception des vérins hydrauliques',
          'Contrôle final des vérins de basculement de cabine',
          'Contrôle final des pompes de basculement de cabine',
          'Essai de fuite interne',
          'Essai de pression du bouton-poussoir',
        ],
      },
      {
        line: 'EGEROT — direction et suspension',
        tests: [
          'Essai de durabilité des barres de direction et des rotules',
          'Essai de moment des rotules de direction',
          'Essai de choc des axes de rotule',
          'Essai de durabilité des barres d’accouplement pour poids lourds',
          'Essai en caisson à poussière',
          'Essai de résistance et de durabilité',
          'Essais d’endurance et d’impulsion',
        ],
      },
      {
        line: 'REVOL — embrayage',
        tests: [
          'Essai de performance du mécanisme d’embrayage',
          'Essai de fatigue du mécanisme d’embrayage',
          'Essai du diaphragme',
          'Essai d’oscillation libre et de débattement de progressivité du disque d’embrayage',
          'Essai de couple du disque d’embrayage',
        ],
      },
    ],
    keyTests: [
      'SAE J1336 étanchéité',
      'SAE J1374 endurance des joints de tige',
      'ISO 10771-1 fatigue en pression',
      'Moment des rotules de direction',
      'Choc des axes de rotule',
      'Durabilité des barres d’accouplement',
      'Fatigue du mécanisme d’embrayage',
      'Couple du disque d’embrayage',
    ],
    videoPending: 'Vidéo d’essai en cours de production',
  },
  quality: {
    intro:
      'Nous faisons certifier notre approche du management de la qualité et la capabilité de nos procédés de production par des organismes indépendants accrédités au niveau international, et nous les améliorons en continu grâce à des audits internes et externes.',
    certs: [
      { key: 'iatf', name: 'IATF 16949:2016', d: 'Norme de management de la qualité de l’industrie automobile. Atteste une qualité standardisée des produits et services tout au long de la chaîne d’approvisionnement.' },
      { key: 'iso9001', name: 'ISO 9001:2015', d: 'Système de management de la qualité couvrant l’orientation client, le leadership, l’approche processus, l’amélioration et la prise de décision fondée sur des preuves.' },
      { key: 'iso14064', name: 'ISO 14064-1:2018', d: 'Vérification de l’inventaire des émissions de gaz à effet de serre d’Özteknik selon la norme internationale.' },
      { key: 'eac', name: 'EAC', d: 'Conformité aux règlements techniques de l’Union économique eurasiatique (Russie, Biélorussie, Kazakhstan, Kirghizistan, Arménie).' },
    ],
    lab: 'Nos bancs d’essai réalisent des essais d’étanchéité hydraulique, d’endurance des joints et de fatigue en pression selon les procédures SAE et ISO, ainsi que des essais de durabilité, de moment et de choc pour les pièces de direction, et des essais de couple, de fatigue et de progressivité pour les embrayages.',
  },
  sustainability: {
    intro: 'Nous nous sommes fixé un objectif de zéro émission nette conformément à l’Accord de Paris et faisons vérifier notre inventaire de gaz à effet de serre selon ISO 14064-1. Voici les mesures qui le sous-tendent.',
    figures: [
      { v: '1,46 GWh', l: 'Production annuelle prévue de notre centrale solaire en toiture' },
      { v: '99 %', l: 'Part de notre consommation électrique annuelle qu’elle est conçue pour couvrir' },
      { v: '6', l: 'Projets d’efficacité énergétique, à court et à long terme' },
      { v: '~3,5 ans', l: 'Délai de retour sur investissement calculé de l’installation solaire' },
    ],
    figuresNote: 'Valeurs prévisionnelles issues de l’étude de rentabilité du projet ; les valeurs réelles seront publiées une fois mesurées.',
    pillars: [
      {
        t: 'Environnement',
        items: [
          'Déchets suivis jusqu’à leur fin de vie et gérés selon la hiérarchie des déchets.',
          'Objectif zéro émission nette et feuille de route de réduction concrète, conformes à l’Accord de Paris.',
          'Projets climatiques développés à plus grande échelle grâce au financement vert.',
          'Protection des sols et de l’eau par la prévention de la pollution ; pratiques favorables à la biodiversité.',
        ],
      },
      {
        t: 'Humain',
        items: [
          'Politiques visant à accroître la participation des femmes et leur représentation au sein de la direction.',
          'Processus de promotion, de rémunération et de carrière transparents ; tolérance zéro envers le harcèlement et la discrimination.',
          'Formations régulières sur l’égalité et l’inclusion ; programmes pour les personnes en situation de handicap et les jeunes.',
          'Partenariats avec l’industrie, le secteur public, le monde universitaire et les ONG.',
        ],
      },
      {
        t: 'Économie',
        items: [
          'Six projets d’efficacité énergétique réduisant la consommation d’énergie et de matières premières.',
          'Récupération de chaleur fatale, équipements à haut rendement et solaire en toiture pour décarboner nos usines.',
          'Modèles d’économie circulaire créant des emplois verts qualifiés.',
          'Outils numériques et R&D pour accroître la productivité.',
        ],
      },
    ],
    solarTitle: 'Centrale solaire en toiture',
    solar: [
      'Le projet a été inscrit à l’ordre du jour du conseil d’administration fin 2022 afin de couvrir nos besoins énergétiques croissants par une source renouvelable et de devenir indépendants sur le plan énergétique.',
      'Avec une production prévue d’environ 1 460 000 kWh par an, la centrale est conçue pour couvrir 99 % de notre consommation électrique annuelle. Sa durée de vie prévue est de 25 ans.',
      'Le projet s’inscrit dans notre alignement sur le Pacte vert pour l’Europe — l’Union européenne étant l’un des marchés d’exportation les plus importants de la Turquie.',
    ],
  },
  sectors: [
    { key: 'trucks', t: 'Camions et tracteurs routiers', d: 'Pièces de direction, de suspension, de basculement de cabine et d’embrayage pour poids lourds européens et russes.' },
    { key: 'buses', t: 'Autobus et autocars', d: 'Barres d’accouplement, embouts et embrayages pour autobus urbains et autocars.' },
    { key: 'agri', t: 'Machines agricoles', d: 'Vérins hydrauliques et pièces pour tracteurs, outils agricoles et véhicules d’irrigation.' },
    { key: 'construction', t: 'Engins de chantier', d: 'Pièces pour engins de chantier depuis 2020 — et projets spéciaux sur plan client.' },
  ],
  brands: {
    egerot: {
      founded: '2005',
      tagline: 'Systèmes de direction et de suspension pour véhicules poids lourds.',
      story: 'EGEROT couvre les barres de réaction, bras en V, barres d’accouplement, embouts et biellettes de stabilisateur pour camions et autobus européens et russes — formage de tubes, usinage, soudage et assemblage dans nos propres usines.',
      structure: [
        { t: 'Corps tubulaire', d: 'Tube d’acier formé, coupé à longueur et mis en forme aux extrémités.' },
        { t: 'Silentbloc (bague caoutchouc-métal)', d: 'Emmanché dans chaque œil pour absorber chocs et vibrations.' },
        { t: 'Axe / manchon', d: 'Axe en acier usiné qui positionne la barre sur l’essieu et le châssis.' },
      ],
    },
    hydcab: {
      founded: '2004',
      tagline: 'Hydraulique de basculement de cabine et vérins d’assistance de direction.',
      story: 'HYDCAB fabrique des vérins et pompes de basculement de cabine, des verrous de cabine, des vérins d’assistance de direction et de relevage d’essieu ainsi que des kits de réparation pour véhicules poids lourds et machines agricoles — avec contrôle final des vérins et des pompes sur nos propres bancs d’essai.',
      structure: [
        { t: 'Tube de vérin', d: 'Tube de précision avec raccords soudés.' },
        { t: 'Piston et tige', d: 'Tige de piston et piston usinés.' },
        { t: 'Joints', d: 'Joints de tige et de piston validés par des essais d’endurance SAE J1374.' },
        { t: 'Bloc de valves', d: 'Commande la levée, la descente et le verrouillage de la cabine.' },
      ],
    },
    revol: {
      founded: '2013',
      tagline: 'Systèmes d’embrayage pour véhicules utilitaires lourds.',
      story: 'REVOL fournit des kits d’embrayage, mécanismes d’embrayage, disques d’embrayage et butées d’embrayage pour poids lourds européens et russes — chaque kit associant mécanisme, disque et butée appariés.',
      structure: [
        { t: 'Mécanisme d’embrayage', d: 'Mécanisme à diaphragme ; testé en fatigue et en performance.' },
        { t: 'Disque d’embrayage', d: 'Garnitures de friction, segments de progressivité, ressorts d’amortisseur de torsion et moyeu cannelé.' },
        { t: 'Butée d’embrayage', d: 'Transmet l’effort de la pédale au diaphragme.' },
      ],
    },
  },
  disc: {
    title: 'Au cœur d’un disque d’embrayage REVOL',
    lead: 'CD8 007 072 — disque de 430 mm du kit d’embrayage CK0 122 801. Données CAO réelles, démontées couche par couche.',
    parts: {
      'plate-top': 'Plaque de recouvrement',
      'plate-mid': 'Plaque porteuse',
      'plate-bottom': 'Plaque de retenue',
      'facing-top': 'Garniture de friction',
      'facing-bottom': 'Garniture de friction',
      cushion: 'Segments de progressivité',
      'rivet-ring': 'Rivets',
      'damper-spring': 'Ressorts d’amortisseur de torsion',
      'stop-pin': 'Goupilles d’arrêt',
      hub: 'Moyeu cannelé',
      'hub-flange': 'Bride de moyeu et rondelle de friction',
    },
  },
};

export default fr;
