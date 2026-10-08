/**
 * Unternehmensseiten — DEUTSCH. Spiegelt content/pages/en.ts (Master) exakt: gleiche Schlüssel, gleiche
 * Array-Längen, gleiche Struktur. Nur Übersetzung, keine neuen Aussagen oder Zahlen.
 * Status: Entwurf — Prüfung durch einen Fachredakteur der Nutzfahrzeugbranche ausstehend.
 */
import type en from './en';

const de: typeof en = {
  about: {
    title: 'Über Özteknik',
    lead: 'Gegründet 1971 von İbrahim Öztürk in einer 50 m² großen Werkstatt. Heute fertigt Özteknik in zwei Werken in İzmir EGEROT-, HYDCAB- und REVOL-Teile für Erstausrüster und den Aftermarket.',
    intro: [
      'Seit mehr als 50 Jahren produzieren wir Automobilteile – zunächst Formen, dann Komponenten für die Fahrzeugindustrie als Tier-1- und Tier-2-Zulieferer und seit 2004 eigene Marken für schwere Nutzfahrzeuge.',
      'Wir beliefern die Bereiche schwere Lkw und Busse, Landmaschinen und Baumaschinen. Unser Ziel ist einfach: das Sortiment, das unsere Partner benötigen, zu erweitern, ohne Abstriche bei Qualität oder Liefersicherheit – und das Image von „Made in Türkiye“ mit selbst entwickelten und gefertigten Teilen zu stärken.',
    ],
    facts: [
      { v: '1971', l: 'Gegründet in İzmir' },
      { v: '2', l: 'Werke in İzmir' },
      { v: '3', l: 'Marken: EGEROT, HYDCAB, REVOL' },
      { v: '65+', l: 'Exportländer' },
    ],
    timeline: [
      { y: '1971', t: 'Gründung durch İbrahim Öztürk für den Formenbau.' },
      { y: '1975', t: 'Erster großer Auftrag aus der Automobilindustrie.' },
      { y: '1988', t: 'Umzug in ein neues Werk in Pınarbaşı, İzmir; Belieferung von Unternehmen der Fahrzeugindustrie als Tier-1- und Tier-2-Zulieferer.' },
      { y: '1996', t: 'Gründung der Özteknik Motorlu Taşıtlar ve Makina San. Tic. Ltd. Şti. im Zuge einer Umstrukturierung.' },
      { y: '2001', t: 'Zertifizierung des Qualitätsmanagements nach ISO 9001:2000.' },
      { y: '2003', t: 'Umzug in das heutige Werk in Kemalpaşa, İzmir.' },
      { y: '2004', t: 'Gründung von HYDCAB mit einer Investition in Fahrerhauskippsysteme für schwere Nutzfahrzeuge.' },
      { y: '2005', t: 'Eintragung der Marke EGEROT mit einer Investition in Lenkungs- und Fahrwerkssysteme.' },
      { y: '2006', t: 'Gründung der Außenhandelsgesellschaft EgeROT San. Tic. Ltd. Şti.' },
      { y: '2007', t: 'Zertifizierung nach ISO/TS 16949:2002.' },
      { y: '2009', t: 'Das Warmschmiedewerk Taşsan A.Ş. wird Teil der Özteknik-Gruppe.' },
      { y: '2012', t: 'Investition in Lenkhilfezylinder; Patent für ein Lagerelement mit metallbeschichtetem Außenlager, hergestellt im Kunststoffspritzguss.' },
      { y: '2013', t: 'Gründung von REVOL mit einer Investition in die Fertigung von Kupplungen für schwere Nutzfahrzeuge.' },
      { y: '2016', t: 'Gebrauchsmuster für die Fertigungstechnologie des Halterings.' },
      { y: '2020', t: 'Gebrauchsmuster für das Buckelschweißen von Anschluss/Hülse an Hydraulikzylindern; Beginn der Fertigung von Teilen für Bau- und Landmaschinen.' },
    ],
    afterSalesTitle: 'After-Sales-Service',
    afterSales:
      'Alle Produkte unterliegen der Herstellergarantie gegen Fertigungsfehler. Unser technisches After-Sales-Team besucht Kunden regelmäßig, verfolgt Änderungen an Ausrüstung und Produkten im Feld und unterstützt Partner bei technischen Fragen.',
    vision: 'Eine strategisch ausgerichtete Kraft zu sein, die sich gemeinsam mit allen Stakeholdern ständig weiterentwickelt und der Branche Mehrwert bietet.',
    mission: 'Mit den Teilen, die wir entwickeln und fertigen, und im Einklang mit unseren Unternehmenswerten das Image von „Made in Türkiye“ zu stärken.',
    group: ['Hersteller der Teile von EGEROT, HYDCAB und REVOL mit zwei Werken in İzmir.', 'Die Außenhandelsgesellschaft der Gruppe.', 'Gesenkschmiede, die Schmiederohlinge für Kugelzapfen, Spurstangenköpfe und Gehäuse liefert.'],
    ip: [
      { y: '2012', t: 'Lagerelement mit metallummantelter Außenschale, im Kunststoffspritzguss hergestellt' },
      { y: '2016', t: 'Fertigungstechnologie für den Sicherungsring' },
      { y: '2020', t: 'Port-/Rohrschweißung an Hydraulikzylindern im Buckelschweißverfahren' },
    ],
  },
  production: {
    intro: [
      'Gefertigt wird auf modernen Linien mit CNC-Bearbeitungszentren, aktueller Konstruktionssoftware und nach den Prinzipien der Lean Production. Die Abläufe folgen dem Fließprinzip und werden in Echtzeit verfolgt, um termingerecht und ohne Abstriche bei der Qualität zu liefern.',
      'Das gruppeneigene Warmschmiedewerk (Taşsan A.Ş., seit 2009) liefert die Schmiederohlinge – so bleiben die kritischen Schritte vom Stahl bis zum Fertigteil unter einem Dach.',
    ],
    steps: [
      { t: 'Warmschmieden', d: 'Schmiederohlinge für Kugelzapfen, Gelenkköpfe und Gehäuse aus dem gruppeneigenen Schmiedewerk.' },
      { t: 'CNC-Bearbeitung', d: 'Vertikaldrehmaschinen, horizontale Bearbeitungszentren und CNC-Fräsen für präzise Passungen.' },
      { t: 'Rohrumformung', d: 'Biegen, Rohrendenreduzierung und Rohrendenaufweitung für Spurstangen und Achsstreben.' },
      { t: 'Schweißen', d: 'Widerstands- und Buckelschweißen – einschließlich unseres als Gebrauchsmuster geschützten Anschluss-/Hülsenschweißens für Hydraulikzylinder.' },
      { t: 'Wärmebehandlung', d: 'Eigener Wärmebehandlungsofen für die geforderten Werkstoffeigenschaften.' },
      { t: 'Oberflächenvorbereitung', d: 'Sandstrahlen und industrielle Teilereinigung vor Beschichtung und Montage.' },
      { t: 'Montage', d: 'Buchsen, Dichtungen, Kupplungsdruckplatten und Kupplungsscheiben werden im eigenen Haus montiert; Kupplungsteile werden auf unserer Auswuchtmaschine ausgewuchtet.' },
      { t: 'Prüfung & Endkontrolle', d: 'Dichtheits-, Dauerlauf- und Endkontrollprüfungen auf eigenen Prüfständen vor dem Versand.' },
    ],
    machines: [
      'CNC-Vertikaldrehmaschine',
      'CNC-Horizontal-Bearbeitungszentrum',
      'CNC-Drehmaschine',
      'CNC-Fräsmaschine',
      'Drehmaschine',
      'Presse',
      'Schweißmaschine',
      'Wärmebehandlungsofen',
      'Sandstrahlanlage',
      'Industrielle Teilewaschanlage',
      'Biegemaschine',
      'Rohrenden-Reduziermaschine',
      'Rohrenden-Aufweitmaschine',
      'Räummaschine',
      'Auswuchtmaschine',
    ],
    rnd: [
      'Unser F&E-Team entwickelt Teile für Fahrzeuge und Märkte, die noch nicht in unserem Portfolio sind, plant Konstruktionen nach Kundenanforderungen und verbessert bestehende Produkte anhand von Rückmeldungen aus dem Feld – für eine längere Lebensdauer unter realen Einsatzbedingungen und zu Zielkosten.',
      'Jedes neue Teil wird vor der Freigabe auf eigenen Mess- und Prüfständen nach SAE- und ISO-Verfahren validiert.',
    ],
    testGroups: [
      {
        line: 'HYDCAB – Hydraulik',
        tests: [
          'SAE J1336 – Dichtheitsprüfung von Hydraulikzylindern',
          'SAE J1334 – Integritätsprüfung von Hydraulikzylindern',
          'SAE J1374 – Dauerprüfung der Stangendichtung',
          'SAE J1335 – Reibungsprüfung ohne Last',
          'ISO 7986 – Leistung von Dichtungen in hydraulischen Anwendungen mit Hubbewegung',
          'ISO 10771-1:2015 – Druckschwellprüfung drucktragender Metallhüllen',
          'Abnahmeprüfungen für Hydraulikzylinder',
          'Endkontrolle Fahrerhauskippzylinder',
          'Endkontrolle Fahrerhauskipppumpe',
          'Prüfung auf innere Leckage',
          'Druckprüfung Druckknopf',
        ],
      },
      {
        line: 'EGEROT – Lenkung & Fahrwerk',
        tests: [
          'Dauerfestigkeitsprüfung von Lenkstange und Kugelgelenk',
          'Momentprüfung Spurstangenkopf',
          'Schlagprüfung Kugelzapfen',
          'Dauerfestigkeitsprüfung von Spurstangen für schwere Lkw',
          'Staubkammerprüfung',
          'Festigkeits- und Dauerfestigkeitsprüfung',
          'Dauerlauf- und Impulsprüfungen',
        ],
      },
      {
        line: 'REVOL – Kupplung',
        tests: [
          'Leistungsprüfung der Kupplungsdruckplatte',
          'Ermüdungsprüfung der Kupplungsdruckplatte',
          'Prüfung der Membranfeder',
          'Prüfung von Freischwingverhalten und Belagfederung der Kupplungsscheibe',
          'Drehmomentprüfung der Kupplungsscheibe',
        ],
      },
    ],
    keyTests: [
      'SAE J1336 Dichtheit',
      'SAE J1374 Dauerprüfung Stangendichtung',
      'ISO 10771-1 Druckschwellprüfung',
      'Moment Spurstangenkopf',
      'Schlagprüfung Kugelzapfen',
      'Dauerfestigkeit Spurstange',
      'Ermüdung Kupplungsdruckplatte',
      'Drehmoment Kupplungsscheibe',
    ],
    videoPending: 'Testvideo in Produktion',
  },
  quality: {
    intro:
      'Unser Qualitätsmanagement und die Fähigkeit unserer Fertigungsprozesse lassen wir von international akkreditierten, unabhängigen Stellen zertifizieren und verbessern beides kontinuierlich durch interne und externe Audits.',
    certs: [
      { key: 'iatf', name: 'IATF 16949:2016', d: 'Qualitätsmanagementnorm der Automobilindustrie. Bestätigt eine standardisierte Qualität von Produkten und Dienstleistungen entlang der gesamten Lieferkette.' },
      { key: 'iso9001', name: 'ISO 9001:2015', d: 'Qualitätsmanagementsystem mit Kundenorientierung, Führung, prozessorientiertem Ansatz, Verbesserung und faktengestützter Entscheidungsfindung.' },
      { key: 'iso14064', name: 'ISO 14064-1:2018', d: 'Verifizierung der Treibhausgasbilanz von Özteknik nach der internationalen Norm.' },
      { key: 'eac', name: 'EAC', d: 'Konformität mit den technischen Vorschriften der Eurasischen Wirtschaftsunion (Russland, Belarus, Kasachstan, Kirgisistan, Armenien).' },
    ],
    lab: 'Auf unseren Prüfständen laufen hydraulische Dichtheits-, Dichtungsdauer- und Druckschwellprüfungen nach SAE- und ISO-Verfahren sowie Dauerfestigkeits-, Moment- und Schlagprüfungen für Lenkungsteile und Drehmoment-, Ermüdungs- und Belagfederungsprüfungen für Kupplungen.',
  },
  sustainability: {
    intro: 'Im Einklang mit dem Pariser Abkommen haben wir uns ein Netto-Null-Emissionsziel gesetzt und lassen unsere Treibhausgasbilanz nach ISO 14064-1 verifizieren. Dahinter stehen die folgenden Maßnahmen.',
    figures: [
      { v: '1,46 GWh', l: 'Geplanter Jahresertrag unserer Photovoltaik-Dachanlage' },
      { v: '99 %', l: 'Anteil unseres jährlichen Strombedarfs, den sie decken soll' },
      { v: '6', l: 'Energieeffizienzprojekte, kurz- und langfristig' },
      { v: '~3,5 Jahre', l: 'Berechnete Amortisationszeit der Solarinvestition' },
    ],
    figuresNote: 'Planwerte aus der Wirtschaftlichkeitsrechnung des Projekts; Istwerte werden veröffentlicht, sobald sie gemessen sind.',
    pillars: [
      {
        t: 'Umwelt',
        items: [
          'Abfälle werden bis zum Ende ihres Lebenszyklus verfolgt und nach der Abfallhierarchie bewirtschaftet.',
          'Netto-Null-Ziel und konkreter Reduktionsfahrplan im Einklang mit dem Pariser Abkommen.',
          'Klimaprojekte, die mit grüner Finanzierung ausgebaut werden.',
          'Schutz von Boden und Wasser durch Vermeidung von Verschmutzung; Maßnahmen zur Förderung der Biodiversität.',
        ],
      },
      {
        t: 'Mensch',
        items: [
          'Maßnahmen zur Stärkung der Beteiligung von Frauen und ihrer Vertretung im Management.',
          'Transparente Beförderungs-, Vergütungs- und Karriereprozesse; null Toleranz gegenüber Belästigung und Diskriminierung.',
          'Regelmäßige Schulungen zu Gleichstellung und Inklusion; Programme für Menschen mit Behinderung und junge Menschen.',
          'Partnerschaften mit Industrie, öffentlichem Sektor, Wissenschaft und Nichtregierungsorganisationen.',
        ],
      },
      {
        t: 'Wirtschaft',
        items: [
          'Sechs Energieeffizienzprojekte, die den Energie- und Rohstoffverbrauch senken.',
          'Abwärmenutzung, hocheffiziente Anlagen und Photovoltaik auf dem Dach zur Dekarbonisierung unserer Werke.',
          'Kreislaufwirtschaftsmodelle, die qualifizierte grüne Arbeitsplätze schaffen.',
          'Digitale Werkzeuge und F&E zur Steigerung der Produktivität.',
        ],
      },
    ],
    solarTitle: 'Photovoltaik-Dachanlage',
    solar: [
      'Das Projekt wurde Ende 2022 auf die Agenda des Verwaltungsrats gesetzt, um unseren wachsenden Energiebedarf aus einer erneuerbaren Quelle zu decken und energieunabhängig zu werden.',
      'Mit einem geplanten Jahresertrag von rund 1.460.000 kWh soll die Anlage 99 % unseres jährlichen Stromverbrauchs decken. Ihre erwartete Lebensdauer beträgt 25 Jahre.',
      'Sie ist Teil unserer Ausrichtung am europäischen Green Deal – die Europäische Union ist einer der wichtigsten Exportmärkte der Türkei.',
    ],
  },
  sectors: [
    { key: 'trucks', t: 'Lkw & Sattelzugmaschinen', d: 'Lenkungs-, Fahrwerks-, Fahrerhauskipp- und Kupplungsteile für europäische und russische schwere Lkw.' },
    { key: 'buses', t: 'Stadt- & Reisebusse', d: 'Spurstangen, Gelenkköpfe und Kupplungen für Stadt- und Reisebusse.' },
    { key: 'agri', t: 'Landmaschinen', d: 'Hydraulikzylinder und Teile für Traktoren, Anbaugeräte und Bewässerungsfahrzeuge.' },
    { key: 'construction', t: 'Baumaschinen', d: 'Teile für Baumaschinen seit 2020 – sowie Sonderprojekte nach Kundenzeichnung.' },
  ],
  brands: {
    egerot: {
      founded: '2005',
      tagline: 'Lenkungs- und Fahrwerkssysteme für schwere Nutzfahrzeuge.',
      story: 'EGEROT umfasst Achsstreben, Dreieckslenker, Spurstangen, Gelenkköpfe und Stabilisatorstreben für europäische und russische Lkw und Busse – Rohrumformung, Bearbeitung, Schweißen und Montage in unseren eigenen Werken.',
      structure: [
        { t: 'Rohrkörper', d: 'Umgeformtes Stahlrohr, abgelängt und an den Enden umgeformt.' },
        { t: 'Gummi-Metall-Lager', d: 'In jedes Auge eingepresst, um Stöße und Schwingungen zu dämpfen.' },
        { t: 'Bolzen / Hülse', d: 'Bearbeiteter Stahlbolzen, der die Strebe an Achse und Rahmen fixiert.' },
      ],
    },
    hydcab: {
      founded: '2004',
      tagline: 'Fahrerhauskipphydraulik und Lenkhilfezylinder.',
      story: 'HYDCAB fertigt Fahrerhauskippzylinder, Fahrerhauskipppumpen, Fahrerhausverriegelungen, Lenkhilfe- und Liftachszylinder sowie Reparatursätze für schwere Nutzfahrzeuge und Landmaschinen – mit Endkontrolle der Zylinder und Pumpen auf eigenen Prüfständen.',
      structure: [
        { t: 'Zylinderrohr', d: 'Präzisionsrohr mit angeschweißten Anschlüssen.' },
        { t: 'Kolben & Kolbenstange', d: 'Bearbeitete Kolbenstange und Kolben.' },
        { t: 'Dichtungen', d: 'Stangen- und Kolbendichtungen, validiert in Dauerprüfungen nach SAE J1374.' },
        { t: 'Ventilblock', d: 'Steuert Heben, Senken und Verriegeln des Fahrerhauses.' },
      ],
    },
    revol: {
      founded: '2013',
      tagline: 'Kupplungssysteme für schwere Nutzfahrzeuge.',
      story: 'REVOL liefert Kupplungssätze, Kupplungsdruckplatten, Kupplungsscheiben und Ausrücklager für europäische und russische schwere Nutzfahrzeuge – jeder Satz aus aufeinander abgestimmter Druckplatte, Scheibe und Ausrücklager.',
      structure: [
        { t: 'Kupplungsdruckplatte', d: 'Druckplatte mit Membranfeder; auf Ermüdung und Leistung geprüft.' },
        { t: 'Kupplungsscheibe', d: 'Reibbeläge, Belagfedersegmente, Torsionsdämpferfedern und Keilnabe.' },
        { t: 'Ausrücklager', d: 'Überträgt die Pedalkraft auf die Membranfeder.' },
      ],
    },
  },
  disc: {
    title: 'Im Inneren einer REVOL-Kupplungsscheibe',
    lead: 'CD8 007 072 – 430-mm-Scheibe aus dem Kupplungssatz CK0 122 801. Echte CAD-Daten, Schicht für Schicht zerlegt.',
    parts: {
      'plate-top': 'Deckscheibe',
      'plate-mid': 'Trägerscheibe',
      'plate-bottom': 'Haltescheibe',
      'facing-top': 'Reibbelag',
      'facing-bottom': 'Reibbelag',
      cushion: 'Belagfedersegmente',
      'rivet-ring': 'Nieten',
      'damper-spring': 'Torsionsdämpferfedern',
      'stop-pin': 'Anschlagbolzen',
      hub: 'Keilnabe',
      'hub-flange': 'Nabenflansch & Reibscheibe',
    },
  },
};

export default de;
