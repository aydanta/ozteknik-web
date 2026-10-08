/**
 * Corporate page content — ENGLISH (master). Source: current ozteknikoto.com pages (About, Production,
 * R&D, Certificates, Sustainability, Sectors, After-sales), rewritten short and evidence-first
 * (spec: "kısa, kanıtlı, ürün odaklı"). Facts only from the source; nothing invented.
 * Other locales mirror this structure exactly.
 */
const pages = {
  about: {
    title: 'About Özteknik',
    lead: 'Founded in 1971 by İbrahim Öztürk in a 50 m² workshop. Today Özteknik makes EGEROT, HYDCAB and REVOL parts in two plants in İzmir for original equipment manufacturers and the aftermarket.',
    intro: [
      'For more than 50 years we have produced automotive parts — first moulds, then components for main-industry customers as a Tier 1 and Tier 2 supplier, and since 2004 our own brands for heavy-duty vehicles.',
      'We serve heavy-duty trucks and buses, agricultural machinery and construction equipment. Our aim is simple: widen the range our partners need without compromising on quality or continuity of supply — and strengthen the image of “Made in Türkiye” with parts we design and produce ourselves.',
    ],
    facts: [
      { v: '1971', l: 'Founded in İzmir' },
      { v: '2', l: 'Plants in İzmir' },
      { v: '3', l: 'Brands: EGEROT, HYDCAB, REVOL' },
      { v: '65+', l: 'Export countries' },
    ],
    timeline: [
      { y: '1971', t: 'Founded by İbrahim Öztürk for mould production.' },
      { y: '1975', t: 'First major contract with the automotive industry.' },
      { y: '1988', t: 'Move to a new plant in Pınarbaşı, İzmir; Tier 1 and Tier 2 supply to main-industry companies.' },
      { y: '1996', t: 'Özteknik Motorlu Taşıtlar ve Makina San. Tic. Ltd. Şti. founded through reorganisation.' },
      { y: '2001', t: 'ISO 9001:2000 quality management certification.' },
      { y: '2003', t: 'Move to the current plant in Kemalpaşa, İzmir.' },
      { y: '2004', t: 'HYDCAB founded with an investment in cab tilting systems for heavy commercial vehicles.' },
      { y: '2005', t: 'EGEROT trademark registered with an investment in steering and suspension systems.' },
      { y: '2006', t: 'Foreign trade company EgeROT San. Tic. Ltd. Şti. founded.' },
      { y: '2007', t: 'ISO/TS 16949:2002 certification.' },
      { y: '2009', t: 'Hot-forging plant Taşsan A.Ş. joins the Özteknik Group.' },
      { y: '2012', t: 'Investment in steering assist cylinders; patent for a bearing element with a metal-coated outer bearing produced by plastic injection.' },
      { y: '2013', t: 'REVOL founded with an investment in heavy-duty clutch production.' },
      { y: '2016', t: 'Utility model for the production technology of the restraint ring.' },
      { y: '2020', t: 'Utility model for port/sleeve projection welding in hydraulic cylinders; production of parts for construction and agricultural machinery begins.' },
    ],
    afterSalesTitle: 'After-sales support',
    afterSales:
      'All products carry the manufacturer’s warranty against production defects. Our after-sales technical team visits customers regularly to follow equipment and product changes in the field and supports partners on technical questions.',
    vision: 'To be a strategy-driven force that keeps improving together with all our stakeholders and adds value to the industry.',
    mission: 'To strengthen the image of “Made in Türkiye” with the parts we design and produce, guided by our corporate values.',
    group: ['Manufacturer of EGEROT, HYDCAB and REVOL parts, with two plants in İzmir.', 'The group’s foreign trade company.', 'Hot-forging plant that supplies forged blanks for ball pins, tie rod ends and housings.'],
    ip: [
      { y: '2012', t: 'Bearing element with a metal-clad outer race, produced by plastic injection' },
      { y: '2016', t: 'Production technology for the safety ring' },
      { y: '2020', t: 'Port/barrel welding on hydraulic cylinders by projection welding' },
    ],
  },
  production: {
    intro: [
      'Production runs on modern lines with CNC machining centres, up-to-date design software and lean manufacturing. Operations follow the flow principle and are tracked in real time to deliver on schedule without compromising quality.',
      'The group’s own hot-forging plant (Taşsan A.Ş., since 2009) supplies forged blanks, so the critical steps from steel to finished part stay under one roof.',
    ],
    steps: [
      { t: 'Hot forging', d: 'Forged blanks for ball pins, rod ends and housings from the group’s forging plant.' },
      { t: 'CNC machining', d: 'Vertical lathes, horizontal machining centres and CNC milling for precise fits.' },
      { t: 'Tube forming', d: 'Bending, tube-end reduction and tube-end extension for tie rods and torque rods.' },
      { t: 'Welding', d: 'Resistance and projection welding — including our utility-model port/sleeve welding for hydraulic cylinders.' },
      { t: 'Heat treatment', d: 'In-house heat-treatment furnace for the required material properties.' },
      { t: 'Surface preparation', d: 'Sandblasting and industrial parts washing before coating and assembly.' },
      { t: 'Assembly', d: 'Bushings, seals, pressure plates and discs assembled in-house; clutch parts balanced on our balancing machine.' },
      { t: 'Test & final inspection', d: 'Leakage, endurance and final-control tests on our own benches before shipment.' },
    ],
    machines: [
      'CNC vertical lathe',
      'CNC horizontal machining centre',
      'CNC turning machine',
      'CNC milling machine',
      'Turning machine',
      'Press',
      'Welding machine',
      'Heat-treatment furnace',
      'Sandblasting machine',
      'Industrial parts washing machine',
      'Bending machine',
      'Tube-end reduction machine',
      'Tube-end extension machine',
      'Broaching machine',
      'Balancing machine',
    ],
    rnd: [
      'Our R&D team develops parts for vehicles and markets not yet in our portfolio, plans designs from customer requests and improves existing products using field feedback — for longer life under real operating conditions and at target cost.',
      'Every new part is validated on our own measurement and test benches against SAE and ISO procedures before release.',
    ],
    testGroups: [
      {
        line: 'HYDCAB — hydraulics',
        tests: [
          'SAE J1336 — Hydraulic cylinder leakage test',
          'SAE J1334 — Hydraulic cylinder integrity test',
          'SAE J1374 — Rod seal endurance test',
          'SAE J1335 — No-load friction test',
          'ISO 7986 — Performance of seals in reciprocating hydraulic applications',
          'ISO 10771-1:2015 — Fatigue pressure testing of metal pressure-containing envelopes',
          'Hydraulic cylinder acceptance tests',
          'Cab tilting cylinder final control',
          'Cab tilting pump final control',
          'Internal leakage test',
          'Push-button pressure test',
        ],
      },
      {
        line: 'EGEROT — steering & suspension',
        tests: [
          'Drag link and ball joint durability test',
          'Tie rod end moment test',
          'Ball pin impact test',
          'Durability testing of heavy-duty truck tie rods',
          'Dust box test',
          'Strength and durability test',
          'Endurance and impulse tests',
        ],
      },
      {
        line: 'REVOL — clutch',
        tests: [
          'Clutch cover assembly performance test',
          'Clutch cover assembly fatigue test',
          'Diaphragm spring test',
          'Clutch disc free oscillation and cushion deflection test',
          'Clutch disc torque test',
        ],
      },
    ],
    keyTests: [
      'SAE J1336 leakage',
      'SAE J1374 rod seal endurance',
      'ISO 10771-1 fatigue pressure',
      'Tie rod end moment',
      'Ball pin impact',
      'Tie rod durability',
      'Clutch cover fatigue',
      'Clutch disc torque',
    ],
    videoPending: 'Test video in production',
  },
  quality: {
    intro:
      'We have our approach to quality management and the capability of our production processes certified by internationally accredited, independent bodies, and improve them continuously through internal and external audits.',
    certs: [
      { key: 'iatf', name: 'IATF 16949:2016', d: 'Automotive quality management standard. Confirms standardised quality of products and services throughout the supply chain.' },
      { key: 'iso9001', name: 'ISO 9001:2015', d: 'Quality management system covering customer focus, leadership, process approach, improvement and evidence-based decisions.' },
      { key: 'iso14064', name: 'ISO 14064-1:2018', d: 'Verification of Özteknik’s greenhouse-gas emissions inventory against the international standard.' },
      { key: 'eac', name: 'EAC', d: 'Conformity with the technical regulations of the Eurasian Economic Union (Russia, Belarus, Kazakhstan, Kyrgyzstan, Armenia).' },
    ],
    lab: 'Our test benches run hydraulic leakage, seal endurance and fatigue-pressure tests to SAE and ISO procedures, plus durability, moment and impact tests for steering parts and torque, fatigue and cushion tests for clutches.',
  },
  sustainability: {
    intro: 'We set a net-zero emissions target in line with the Paris Agreement and verify our greenhouse-gas inventory to ISO 14064-1. These are the measures behind it.',
    figures: [
      { v: '1.46 GWh', l: 'Planned annual output of our rooftop solar plant' },
      { v: '99%', l: 'Share of our annual electricity it is designed to cover' },
      { v: '6', l: 'Energy-efficiency projects, short and long term' },
      { v: '~3.5 yrs', l: 'Calculated payback of the solar investment' },
    ],
    figuresNote: 'Planned values from the project business case; realised values will be published once measured.',
    pillars: [
      {
        t: 'Environment',
        items: [
          'Waste tracked to end of life and managed by the waste hierarchy.',
          'Net-zero target and a concrete reduction roadmap in line with the Paris Agreement.',
          'Climate projects scaled up with green financing.',
          'Soil and water protection through pollution prevention; practices that support biodiversity.',
        ],
      },
      {
        t: 'People',
        items: [
          'Policies to increase women’s participation and representation in management.',
          'Transparent promotion, pay and career processes; zero tolerance for harassment and discrimination.',
          'Regular training on equality and inclusion; programmes for people with disabilities and young people.',
          'Partnerships with industry, public sector, academia and NGOs.',
        ],
      },
      {
        t: 'Economy',
        items: [
          'Six energy-efficiency projects cutting energy and raw-material use.',
          'Waste-heat recovery, high-efficiency equipment and rooftop solar to decarbonise our plants.',
          'Circular-economy models creating qualified green jobs.',
          'Digital tools and R&D to raise productivity.',
        ],
      },
    ],
    solarTitle: 'Rooftop solar power plant',
    solar: [
      'The project was put on the Board’s agenda at the end of 2022 to meet our growing energy demand from a renewable source and become energy-independent.',
      'With a planned output of about 1,460,000 kWh per year, the plant is designed to cover 99% of our annual electricity consumption. Its expected service life is 25 years.',
      'It is part of aligning with the EU Green Deal — the European Union being one of Türkiye’s most important export markets.',
    ],
  },
  sectors: [
    { key: 'trucks', t: 'Trucks & tractors', d: 'Steering, suspension, cab tilting and clutch parts for European and Russian heavy-duty trucks.' },
    { key: 'buses', t: 'Buses & coaches', d: 'Tie rods, rod ends and clutches for city buses and coaches.' },
    { key: 'agri', t: 'Agricultural machinery', d: 'Hydraulic cylinders and parts for tractors, implements and irrigation vehicles.' },
    { key: 'construction', t: 'Construction equipment', d: 'Parts for construction machinery since 2020 — and special projects to customer drawings.' },
  ],
  brands: {
    egerot: {
      founded: '2005',
      tagline: 'Steering and suspension systems for heavy-duty vehicles.',
      story: 'EGEROT covers torque rods, V-stays, tie rods, rod ends and stabilizer links for European and Russian trucks and buses — tube forming, machining, welding and assembly in our own plants.',
      structure: [
        { t: 'Tube body', d: 'Formed steel tube, cut and end-formed to length.' },
        { t: 'Rubber-metal bushing', d: 'Pressed into each eye to absorb shock and vibration.' },
        { t: 'Pin / sleeve', d: 'Machined steel pin that locates the rod on the axle and chassis.' },
      ],
    },
    hydcab: {
      founded: '2004',
      tagline: 'Cab tilting hydraulics and steering cylinders.',
      story: 'HYDCAB makes cab tilting cylinders, pumps, latches, steering assist and axle lift cylinders and repair kits for heavy-duty vehicles and agricultural machinery — with final control of cylinders and pumps on our own test benches.',
      structure: [
        { t: 'Cylinder tube', d: 'Precision tube with welded ports.' },
        { t: 'Piston & rod', d: 'Machined piston rod and piston.' },
        { t: 'Seals', d: 'Rod and piston seals validated on SAE J1374 endurance tests.' },
        { t: 'Valve block', d: 'Controls lifting, lowering and locking of the cab.' },
      ],
    },
    revol: {
      founded: '2013',
      tagline: 'Clutch systems for heavy-duty commercial vehicles.',
      story: 'REVOL supplies clutch kits, pressure plates, clutch discs and release bearings for European and Russian heavy-duty vehicles — each kit matched as pressure plate, disc and bearing.',
      structure: [
        { t: 'Pressure plate', d: 'Diaphragm-spring cover assembly; fatigue- and performance-tested.' },
        { t: 'Clutch disc', d: 'Friction facings, cushion segments, torsional damper springs and splined hub.' },
        { t: 'Release bearing', d: 'Transfers pedal force to the diaphragm spring.' },
      ],
    },
  },
  disc: {
    title: 'Inside a REVOL clutch disc',
    lead: 'CD8 007 072 — 430 mm disc from the CK0 122 801 clutch kit. Real CAD data, taken apart layer by layer.',
    parts: {
      'plate-top': 'Cover plate',
      'plate-mid': 'Carrier plate',
      'plate-bottom': 'Retainer plate',
      'facing-top': 'Friction facing',
      'facing-bottom': 'Friction facing',
      cushion: 'Cushion segments',
      'rivet-ring': 'Rivets',
      'damper-spring': 'Torsional damper springs',
      'stop-pin': 'Stop pins',
      hub: 'Splined hub',
      'hub-flange': 'Hub flange & friction washer',
    },
  },
};

export default pages;
