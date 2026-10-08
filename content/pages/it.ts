/**
 * Contenuti delle pagine aziendali — ITALIANO. Rispecchia esattamente la struttura di en.ts (file master).
 * In attesa di revisione da parte di un redattore del settore. Traduce solo il significato; nessun dato aggiunto.
 */
import type en from './en';

const it: typeof en = {
  about: {
    title: 'Chi è Özteknik',
    lead: 'Fondata nel 1971 da İbrahim Öztürk in un’officina di 50 m². Oggi Özteknik produce ricambi EGEROT, HYDCAB e REVOL in due stabilimenti a İzmir per i costruttori di primo equipaggiamento e per l’aftermarket.',
    intro: [
      'Da oltre 50 anni produciamo componenti automotive: prima stampi, poi componenti per clienti del primo equipaggiamento come fornitore Tier 1 e Tier 2 e, dal 2004, i nostri marchi per veicoli pesanti.',
      'Serviamo i settori di autocarri e autobus pesanti, macchine agricole e macchine per l’edilizia. Il nostro obiettivo è semplice: ampliare la gamma di cui i nostri partner hanno bisogno senza compromessi su qualità e continuità di fornitura, e rafforzare l’immagine del “Made in Türkiye” con ricambi che progettiamo e produciamo noi stessi.',
    ],
    facts: [
      { v: '1971', l: 'Fondata a İzmir' },
      { v: '2', l: 'Stabilimenti a İzmir' },
      { v: '3', l: 'Marchi: EGEROT, HYDCAB, REVOL' },
      { v: '65+', l: 'Paesi di esportazione' },
    ],
    timeline: [
      { y: '1971', t: 'Fondata da İbrahim Öztürk per la produzione di stampi.' },
      { y: '1975', t: 'Primo grande contratto con l’industria automotive.' },
      { y: '1988', t: 'Trasferimento in un nuovo stabilimento a Pınarbaşı, İzmir; forniture Tier 1 e Tier 2 ad aziende del primo equipaggiamento.' },
      { y: '1996', t: 'Fondazione di Özteknik Motorlu Taşıtlar ve Makina San. Tic. Ltd. Şti. a seguito di una riorganizzazione.' },
      { y: '2001', t: 'Certificazione del sistema di gestione per la qualità ISO 9001:2000.' },
      { y: '2003', t: 'Trasferimento nell’attuale stabilimento di Kemalpaşa, İzmir.' },
      { y: '2004', t: 'Nasce HYDCAB con un investimento nei sistemi di ribaltamento cabina per veicoli commerciali pesanti.' },
      { y: '2005', t: 'Registrazione del marchio EGEROT con un investimento nei sistemi di sterzo e sospensione.' },
      { y: '2006', t: 'Fondazione della società di commercio estero EgeROT San. Tic. Ltd. Şti.' },
      { y: '2007', t: 'Certificazione ISO/TS 16949:2002.' },
      { y: '2009', t: 'Lo stabilimento di forgiatura a caldo Taşsan A.Ş. entra nel Gruppo Özteknik.' },
      { y: '2012', t: 'Investimento nei cilindri servosterzo; brevetto per un elemento cuscinetto con cuscinetto esterno rivestito in metallo, prodotto mediante stampaggio a iniezione di plastica.' },
      { y: '2013', t: 'Nasce REVOL con un investimento nella produzione di frizioni per veicoli pesanti.' },
      { y: '2016', t: 'Modello di utilità per la tecnologia di produzione dell’anello di ritegno.' },
      { y: '2020', t: 'Modello di utilità per la saldatura a proiezione attacco/manicotto nei cilindri idraulici; avvio della produzione di ricambi per macchine edili e agricole.' },
    ],
    afterSalesTitle: 'Assistenza post-vendita',
    afterSales:
      'Tutti i prodotti sono coperti dalla garanzia del produttore contro i difetti di fabbricazione. Il nostro team tecnico post-vendita visita regolarmente i clienti per seguire sul campo le modifiche a equipaggiamenti e prodotti e supporta i partner nelle questioni tecniche.',
    vision: 'Essere una forza orientata alla strategia che cresce continuamente insieme a tutti i nostri interlocutori e porta valore aggiunto al settore.',
    mission: 'Rafforzare l’immagine del “Made in Türkiye” con i ricambi che progettiamo e produciamo, nel rispetto dei nostri valori aziendali.',
    group: ['Produttore dei ricambi EGEROT, HYDCAB e REVOL, con due stabilimenti a İzmir.', 'La società di commercio estero del gruppo.', 'Stabilimento di stampaggio a caldo che fornisce i grezzi stampati per perni sferici, testine sterzo e corpi.'],
    ip: [
      { y: '2012', t: 'Elemento di cuscinetto con anello esterno rivestito in metallo, prodotto per stampaggio a iniezione di plastica' },
      { y: '2016', t: 'Tecnologia di produzione dell’anello di sicurezza' },
      { y: '2020', t: 'Saldatura porta/canna sui cilindri idraulici mediante saldatura a proiezione' },
    ],
  },
  production: {
    intro: [
      'La produzione si svolge su linee moderne con centri di lavoro CNC, software di progettazione aggiornati e lean manufacturing. Le operazioni seguono il principio del flusso e sono monitorate in tempo reale per rispettare i tempi di consegna senza compromessi sulla qualità.',
      'Lo stabilimento di forgiatura a caldo del gruppo (Taşsan A.Ş., dal 2009) fornisce i grezzi forgiati: così le fasi critiche, dall’acciaio al ricambio finito, restano sotto lo stesso tetto.',
    ],
    steps: [
      { t: 'Forgiatura a caldo', d: 'Grezzi forgiati per perni sferici, terminali e alloggiamenti, dallo stabilimento di forgiatura del gruppo.' },
      { t: 'Lavorazioni CNC', d: 'Torni verticali, centri di lavoro orizzontali e fresatura CNC per accoppiamenti precisi.' },
      { t: 'Formatura tubi', d: 'Curvatura, riduzione ed espansione delle estremità dei tubi per barre sterzo e barre di reazione.' },
      { t: 'Saldatura', d: 'Saldatura a resistenza e a proiezione, compresa la nostra saldatura attacco/manicotto per cilindri idraulici, tutelata come modello di utilità.' },
      { t: 'Trattamento termico', d: 'Forno di trattamento termico interno per ottenere le proprietà del materiale richieste.' },
      { t: 'Preparazione delle superfici', d: 'Sabbiatura e lavaggio industriale dei pezzi prima di rivestimento e montaggio.' },
      { t: 'Assemblaggio', d: 'Boccole, guarnizioni, spingidischi e dischi assemblati internamente; i componenti frizione vengono equilibrati sulla nostra equilibratrice.' },
      { t: 'Collaudo e controllo finale', d: 'Prove di tenuta, di durata e di controllo finale sui nostri banchi prima della spedizione.' },
    ],
    machines: [
      'Tornio verticale CNC',
      'Centro di lavoro orizzontale CNC',
      'Tornio CNC',
      'Fresatrice CNC',
      'Tornio',
      'Pressa',
      'Saldatrice',
      'Forno di trattamento termico',
      'Sabbiatrice',
      'Lavatrice industriale per pezzi',
      'Curvatrice',
      'Macchina per la riduzione delle estremità dei tubi',
      'Macchina per l’espansione delle estremità dei tubi',
      'Brocciatrice',
      'Equilibratrice',
    ],
    rnd: [
      'Il nostro team di R&S sviluppa ricambi per veicoli e mercati non ancora presenti nel nostro portafoglio, progetta a partire dalle richieste dei clienti e migliora i prodotti esistenti sulla base dei riscontri dal campo, per una maggiore durata in condizioni d’esercizio reali e al costo obiettivo.',
      'Ogni nuovo ricambio viene validato sui nostri banchi di misura e di prova secondo procedure SAE e ISO prima del rilascio.',
    ],
    testGroups: [
      {
        line: 'HYDCAB — idraulica',
        tests: [
          'SAE J1336 — Prova di tenuta dei cilindri idraulici',
          'SAE J1334 — Prova di integrità dei cilindri idraulici',
          'SAE J1374 — Prova di durata delle guarnizioni dello stelo',
          'SAE J1335 — Prova di attrito a vuoto',
          'ISO 7986 — Prestazioni delle guarnizioni in applicazioni idrauliche a moto alternato',
          'ISO 10771-1:2015 — Prova di pressione a fatica degli involucri metallici in pressione',
          'Prove di accettazione dei cilindri idraulici',
          'Controllo finale del cilindro ribaltamento cabina',
          'Controllo finale della pompa ribaltamento cabina',
          'Prova di trafilamento interno',
          'Prova di pressione del pulsante',
        ],
      },
      {
        line: 'EGEROT — sterzo e sospensioni',
        tests: [
          'Prova di durabilità del tirante longitudinale e dello snodo sferico',
          'Prova del momento della testina sterzo',
          'Prova d’urto del perno sferico',
          'Prova di durabilità delle barre sterzo per autocarri pesanti',
          'Prova in camera polveri',
          'Prova di resistenza e durabilità',
          'Prove di durata e a impulsi',
        ],
      },
      {
        line: 'REVOL — frizione',
        tests: [
          'Prova delle prestazioni del gruppo spingidisco',
          'Prova a fatica del gruppo spingidisco',
          'Prova della molla a diaframma',
          'Prova di oscillazione libera e di deflessione della progressività del disco frizione',
          'Prova di coppia del disco frizione',
        ],
      },
    ],
    keyTests: [
      'SAE J1336 tenuta',
      'SAE J1374 durata guarnizioni stelo',
      'ISO 10771-1 pressione a fatica',
      'Momento testina sterzo',
      'Urto perno sferico',
      'Durabilità barra sterzo',
      'Fatica spingidisco',
      'Coppia disco frizione',
    ],
    videoPending: 'Video della prova in lavorazione',
  },
  quality: {
    intro:
      'Facciamo certificare il nostro approccio alla gestione della qualità e la capacità dei nostri processi produttivi da enti indipendenti accreditati a livello internazionale, e li miglioriamo costantemente attraverso audit interni ed esterni.',
    certs: [
      { key: 'iatf', name: 'IATF 16949:2016', d: 'Norma per la gestione della qualità nel settore automotive. Conferma una qualità standardizzata di prodotti e servizi lungo tutta la catena di fornitura.' },
      { key: 'iso9001', name: 'ISO 9001:2015', d: 'Sistema di gestione per la qualità che comprende orientamento al cliente, leadership, approccio per processi, miglioramento e decisioni basate sulle evidenze.' },
      { key: 'iso14064', name: 'ISO 14064-1:2018', d: 'Verifica dell’inventario delle emissioni di gas serra di Özteknik secondo la norma internazionale.' },
      { key: 'eac', name: 'EAC', d: 'Conformità ai regolamenti tecnici dell’Unione Economica Eurasiatica (Russia, Bielorussia, Kazakistan, Kirghizistan, Armenia).' },
    ],
    lab: 'I nostri banchi prova eseguono prove di tenuta idraulica, di durata delle guarnizioni e di pressione a fatica secondo procedure SAE e ISO, oltre a prove di durabilità, momento e urto per i componenti dello sterzo e prove di coppia, fatica e progressività per le frizioni.',
  },
  sustainability: {
    intro: 'Ci siamo posti un obiettivo di zero emissioni nette in linea con l’Accordo di Parigi e verifichiamo il nostro inventario dei gas serra secondo la ISO 14064-1. Queste sono le misure che lo sostengono.',
    figures: [
      { v: '1,46 GWh', l: 'Produzione annua prevista del nostro impianto fotovoltaico su tetto' },
      { v: '99 %', l: 'Quota del nostro consumo elettrico annuo che è progettato per coprire' },
      { v: '6', l: 'Progetti di efficienza energetica, a breve e lungo termine' },
      { v: '~3,5 anni', l: 'Tempo di ritorno calcolato dell’investimento fotovoltaico' },
    ],
    figuresNote: 'Valori previsti dal business case del progetto; i valori effettivi saranno pubblicati una volta misurati.',
    pillars: [
      {
        t: 'Ambiente',
        items: [
          'Rifiuti tracciati fino a fine vita e gestiti secondo la gerarchia dei rifiuti.',
          'Obiettivo zero emissioni nette e una roadmap concreta di riduzione in linea con l’Accordo di Parigi.',
          'Progetti per il clima ampliati grazie alla finanza verde.',
          'Tutela del suolo e dell’acqua attraverso la prevenzione dell’inquinamento; pratiche a sostegno della biodiversità.',
        ],
      },
      {
        t: 'Persone',
        items: [
          'Politiche per aumentare la partecipazione femminile e la presenza delle donne nel management.',
          'Processi trasparenti di promozione, retribuzione e carriera; tolleranza zero verso molestie e discriminazioni.',
          'Formazione periodica su parità e inclusione; programmi per persone con disabilità e per i giovani.',
          'Collaborazioni con industria, settore pubblico, mondo accademico e ONG.',
        ],
      },
      {
        t: 'Economia',
        items: [
          'Sei progetti di efficienza energetica che riducono il consumo di energia e materie prime.',
          'Recupero del calore residuo, apparecchiature ad alta efficienza e fotovoltaico su tetto per decarbonizzare i nostri stabilimenti.',
          'Modelli di economia circolare che creano posti di lavoro verdi qualificati.',
          'Strumenti digitali e R&S per aumentare la produttività.',
        ],
      },
    ],
    solarTitle: 'Impianto fotovoltaico su tetto',
    solar: [
      'Il progetto è stato inserito all’ordine del giorno del Consiglio di amministrazione alla fine del 2022 per coprire il nostro crescente fabbisogno energetico con una fonte rinnovabile e diventare energeticamente indipendenti.',
      'Con una produzione prevista di circa 1.460.000 kWh all’anno, l’impianto è progettato per coprire il 99 % del nostro consumo elettrico annuo. La vita utile prevista è di 25 anni.',
      'Rientra nel nostro allineamento al Green Deal europeo, essendo l’Unione europea uno dei più importanti mercati di esportazione per la Türkiye.',
    ],
  },
  sectors: [
    { key: 'trucks', t: 'Autocarri e trattori stradali', d: 'Ricambi per sterzo, sospensioni, ribaltamento cabina e frizione per autocarri pesanti europei e russi.' },
    { key: 'buses', t: 'Autobus e pullman', d: 'Barre sterzo, terminali e frizioni per autobus urbani e pullman.' },
    { key: 'agri', t: 'Macchine agricole', d: 'Cilindri idraulici e ricambi per trattori, attrezzature e mezzi per l’irrigazione.' },
    { key: 'construction', t: 'Macchine per l’edilizia', d: 'Ricambi per macchine edili dal 2020, oltre a progetti speciali su disegno del cliente.' },
  ],
  brands: {
    egerot: {
      founded: '2005',
      tagline: 'Sistemi di sterzo e sospensione per veicoli pesanti.',
      story: 'EGEROT comprende barre di reazione, bracci a V, barre sterzo, terminali e bielle barra stabilizzatrice per autocarri e autobus europei e russi: formatura tubi, lavorazioni meccaniche, saldatura e assemblaggio nei nostri stabilimenti.',
      structure: [
        { t: 'Corpo tubolare', d: 'Tubo d’acciaio formato, tagliato a misura e con estremità sagomate.' },
        { t: 'Silentblock (boccola gomma-metallo)', d: 'Pressato in ogni occhio per assorbire urti e vibrazioni.' },
        { t: 'Perno / manicotto', d: 'Perno in acciaio lavorato che posiziona la barra sull’assale e sul telaio.' },
      ],
    },
    hydcab: {
      founded: '2004',
      tagline: 'Idraulica di ribaltamento cabina e cilindri servosterzo.',
      story: 'HYDCAB produce cilindri e pompe ribaltamento cabina, chiusure cabina, cilindri servosterzo e di sollevamento assale e kit di riparazione per veicoli pesanti e macchine agricole, con controllo finale di cilindri e pompe sui nostri banchi prova.',
      structure: [
        { t: 'Tubo cilindro', d: 'Tubo di precisione con attacchi saldati.' },
        { t: 'Pistone e stelo', d: 'Stelo e pistone lavorati a macchina.' },
        { t: 'Guarnizioni', d: 'Guarnizioni di stelo e pistone validate con prove di durata SAE J1374.' },
        { t: 'Blocco valvole', d: 'Controlla sollevamento, abbassamento e bloccaggio della cabina.' },
      ],
    },
    revol: {
      founded: '2013',
      tagline: 'Sistemi frizione per veicoli commerciali pesanti.',
      story: 'REVOL fornisce kit frizione, spingidischi, dischi frizione e cuscinetti reggispinta per veicoli pesanti europei e russi: ogni kit abbina spingidisco, disco e cuscinetto.',
      structure: [
        { t: 'Spingidisco', d: 'Gruppo spingidisco con molla a diaframma; sottoposto a prove di fatica e di prestazioni.' },
        { t: 'Disco frizione', d: 'Guarnizioni d’attrito, segmenti di progressività, molle parastrappi e mozzo scanalato.' },
        { t: 'Cuscinetto reggispinta', d: 'Trasmette la forza del pedale alla molla a diaframma.' },
      ],
    },
  },
  disc: {
    title: 'Dentro un disco frizione REVOL',
    lead: 'CD8 007 072 — disco da 430 mm del kit frizione CK0 122 801. Dati CAD reali, smontato strato per strato.',
    parts: {
      'plate-top': 'Piastra di copertura',
      'plate-mid': 'Piastra portante',
      'plate-bottom': 'Piastra di ritegno',
      'facing-top': 'Guarnizione d’attrito',
      'facing-bottom': 'Guarnizione d’attrito',
      cushion: 'Segmenti di progressività',
      'rivet-ring': 'Rivetti',
      'damper-spring': 'Molle parastrappi',
      'stop-pin': 'Perni di arresto',
      hub: 'Mozzo scanalato',
      'hub-flange': 'Flangia del mozzo e rondella d’attrito',
    },
  },
};

export default it;
