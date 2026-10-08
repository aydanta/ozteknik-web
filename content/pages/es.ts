/**
 * Contenido de las páginas corporativas — ESPAÑOL. Refleja exactamente la estructura de en.ts (archivo maestro).
 * Pendiente de revisión por un editor del sector. Solo traduce el significado; no añade datos ni afirmaciones.
 */
import type en from './en';

const es: typeof en = {
  about: {
    title: 'Acerca de Özteknik',
    lead: 'Fundada en 1971 por İbrahim Öztürk en un taller de 50 m². Hoy, Özteknik fabrica piezas EGEROT, HYDCAB y REVOL en dos plantas de İzmir para fabricantes de equipo original y para el mercado de reposición.',
    intro: [
      'Desde hace más de 50 años producimos piezas de automoción: primero moldes, después componentes para clientes de primer equipo como proveedor Tier 1 y Tier 2 y, desde 2004, nuestras propias marcas para vehículos pesados.',
      'Abastecemos a los sectores de camiones y autobuses pesados, maquinaria agrícola y maquinaria de construcción. Nuestro objetivo es sencillo: ampliar la gama que necesitan nuestros socios sin renunciar a la calidad ni a la continuidad del suministro, y reforzar la imagen de “Made in Türkiye” con piezas que diseñamos y producimos nosotros mismos.',
    ],
    facts: [
      { v: '1971', l: 'Fundación en İzmir' },
      { v: '2', l: 'Plantas en İzmir' },
      { v: '3', l: 'Marcas: EGEROT, HYDCAB, REVOL' },
      { v: '65+', l: 'Países de exportación' },
    ],
    timeline: [
      { y: '1971', t: 'Fundada por İbrahim Öztürk para la fabricación de moldes.' },
      { y: '1975', t: 'Primer gran contrato con la industria automotriz.' },
      { y: '1988', t: 'Traslado a una nueva planta en Pınarbaşı, İzmir; suministro Tier 1 y Tier 2 a fabricantes de primer equipo.' },
      { y: '1996', t: 'Fundación de Özteknik Motorlu Taşıtlar ve Makina San. Tic. Ltd. Şti. mediante una reorganización.' },
      { y: '2001', t: 'Certificación del sistema de gestión de la calidad ISO 9001:2000.' },
      { y: '2003', t: 'Traslado a la planta actual en Kemalpaşa, İzmir.' },
      { y: '2004', t: 'Fundación de HYDCAB con una inversión en sistemas de basculación de cabina para vehículos comerciales pesados.' },
      { y: '2005', t: 'Registro de la marca EGEROT con una inversión en sistemas de dirección y suspensión.' },
      { y: '2006', t: 'Fundación de la empresa de comercio exterior EgeROT San. Tic. Ltd. Şti.' },
      { y: '2007', t: 'Certificación ISO/TS 16949:2002.' },
      { y: '2009', t: 'La planta de forja en caliente Taşsan A.Ş. se incorpora al Grupo Özteknik.' },
      { y: '2012', t: 'Inversión en cilindros de servodirección; patente de un elemento de cojinete con cojinete exterior recubierto de metal, producido por inyección de plástico.' },
      { y: '2013', t: 'Fundación de REVOL con una inversión en la producción de embragues para vehículos pesados.' },
      { y: '2016', t: 'Modelo de utilidad para la tecnología de producción del anillo de retención.' },
      { y: '2020', t: 'Modelo de utilidad para la soldadura por proyección de conexión/casquillo en cilindros hidráulicos; comienza la producción de piezas para maquinaria de construcción y agrícola.' },
    ],
    afterSalesTitle: 'Asistencia posventa',
    afterSales:
      'Todos los productos cuentan con la garantía del fabricante frente a defectos de fabricación. Nuestro equipo técnico de posventa visita periódicamente a los clientes para seguir sobre el terreno los cambios de equipos y productos, y asesora a los socios en cuestiones técnicas.',
    vision: 'Ser una fuerza orientada a la estrategia que mejora constantemente junto con todas nuestras partes interesadas y aporta valor añadido al sector.',
    mission: 'Reforzar la imagen de “Made in Türkiye” con las piezas que diseñamos y fabricamos, guiados por nuestros valores corporativos.',
    group: ['Fabricante de las piezas EGEROT, HYDCAB y REVOL, con dos plantas en İzmir.', 'La empresa de comercio exterior del grupo.', 'Planta de forja en caliente que suministra piezas forjadas en bruto para rótulas, terminales de dirección y carcasas.'],
    ip: [
      { y: '2012', t: 'Elemento de rodamiento con pista exterior revestida de metal, fabricado por inyección de plástico' },
      { y: '2016', t: 'Tecnología de fabricación del anillo de seguridad' },
      { y: '2020', t: 'Soldadura de puerto/camisa en cilindros hidráulicos mediante soldadura por proyección' },
    ],
  },
  production: {
    intro: [
      'La producción se realiza en líneas modernas con centros de mecanizado CNC, software de diseño actualizado y fabricación ajustada (lean). Las operaciones siguen el principio de flujo y se supervisan en tiempo real para cumplir los plazos sin comprometer la calidad.',
      'La planta de forja en caliente propia del grupo (Taşsan A.Ş., desde 2009) suministra las piezas forjadas en bruto, de modo que los pasos críticos, del acero a la pieza terminada, se mantienen bajo un mismo techo.',
    ],
    steps: [
      { t: 'Forja en caliente', d: 'Piezas forjadas en bruto para pernos de rótula, terminales de barra y carcasas, procedentes de la planta de forja del grupo.' },
      { t: 'Mecanizado CNC', d: 'Tornos verticales, centros de mecanizado horizontales y fresado CNC para ajustes precisos.' },
      { t: 'Conformado de tubos', d: 'Curvado, reducción y expansión de extremos de tubo para barras de dirección y barras de reacción.' },
      { t: 'Soldadura', d: 'Soldadura por resistencia y por proyección, incluida nuestra soldadura de conexión/casquillo para cilindros hidráulicos, protegida como modelo de utilidad.' },
      { t: 'Tratamiento térmico', d: 'Horno de tratamiento térmico propio para obtener las propiedades de material requeridas.' },
      { t: 'Preparación de superficies', d: 'Chorreado de arena y lavado industrial de piezas antes del recubrimiento y el montaje.' },
      { t: 'Montaje', d: 'Montaje propio de casquillos, juntas, platos de presión y discos; las piezas de embrague se equilibran en nuestra equilibradora.' },
      { t: 'Ensayo e inspección final', d: 'Ensayos de fugas, de larga duración y de control final en nuestros propios bancos antes del envío.' },
    ],
    machines: [
      'Torno vertical CNC',
      'Centro de mecanizado horizontal CNC',
      'Torno CNC',
      'Fresadora CNC',
      'Torno',
      'Prensa',
      'Máquina de soldar',
      'Horno de tratamiento térmico',
      'Máquina de chorreado de arena',
      'Lavadora industrial de piezas',
      'Curvadora',
      'Máquina de reducción de extremos de tubo',
      'Máquina de expansión de extremos de tubo',
      'Brochadora',
      'Equilibradora',
    ],
    rnd: [
      'Nuestro equipo de I+D desarrolla piezas para vehículos y mercados que aún no forman parte de nuestra cartera, planifica diseños a partir de las solicitudes de los clientes y mejora los productos existentes con la información recogida sobre el terreno, para lograr una mayor vida útil en condiciones reales de funcionamiento y al costo objetivo.',
      'Cada pieza nueva se valida en nuestros propios bancos de medición y ensayo conforme a procedimientos SAE e ISO antes de su lanzamiento.',
    ],
    testGroups: [
      {
        line: 'HYDCAB — hidráulica',
        tests: [
          'SAE J1336 — Ensayo de fugas de cilindros hidráulicos',
          'SAE J1334 — Ensayo de integridad de cilindros hidráulicos',
          'SAE J1374 — Ensayo de larga duración de juntas de vástago',
          'SAE J1335 — Ensayo de fricción sin carga',
          'ISO 7986 — Rendimiento de juntas en aplicaciones hidráulicas alternativas',
          'ISO 10771-1:2015 — Ensayo de presión por fatiga de envolventes metálicas sometidas a presión',
          'Ensayos de aceptación de cilindros hidráulicos',
          'Control final del cilindro de basculación de cabina',
          'Control final de la bomba de basculación de cabina',
          'Ensayo de fugas internas',
          'Ensayo de presión del pulsador',
        ],
      },
      {
        line: 'EGEROT — dirección y suspensión',
        tests: [
          'Ensayo de durabilidad de barra de mando y rótula',
          'Ensayo de momento de la rótula de dirección',
          'Ensayo de impacto del perno de rótula',
          'Ensayo de durabilidad de barras de dirección para camiones pesados',
          'Ensayo en cámara de polvo',
          'Ensayo de resistencia y durabilidad',
          'Ensayos de larga duración y de impulsos',
        ],
      },
      {
        line: 'REVOL — embrague',
        tests: [
          'Ensayo de rendimiento del conjunto de plato de presión',
          'Ensayo de fatiga del conjunto de plato de presión',
          'Ensayo del muelle de diafragma',
          'Ensayo de oscilación libre y de deflexión de amortiguación del disco de embrague',
          'Ensayo de par del disco de embrague',
        ],
      },
    ],
    keyTests: [
      'SAE J1336 fugas',
      'SAE J1374 larga duración de juntas de vástago',
      'ISO 10771-1 presión por fatiga',
      'Momento de la rótula de dirección',
      'Impacto del perno de rótula',
      'Durabilidad de la barra de dirección',
      'Fatiga del plato de presión',
      'Par del disco de embrague',
    ],
    videoPending: 'Video del ensayo en preparación',
  },
  quality: {
    intro:
      'Hacemos certificar nuestro enfoque de gestión de la calidad y la capacidad de nuestros procesos de producción por organismos independientes acreditados internacionalmente, y los mejoramos de forma continua mediante auditorías internas y externas.',
    certs: [
      { key: 'iatf', name: 'IATF 16949:2016', d: 'Norma de gestión de la calidad del sector automotriz. Confirma la calidad estandarizada de productos y servicios a lo largo de toda la cadena de suministro.' },
      { key: 'iso9001', name: 'ISO 9001:2015', d: 'Sistema de gestión de la calidad que abarca el enfoque al cliente, el liderazgo, el enfoque basado en procesos, la mejora y la toma de decisiones basada en la evidencia.' },
      { key: 'iso14064', name: 'ISO 14064-1:2018', d: 'Verificación del inventario de emisiones de gases de efecto invernadero de Özteknik conforme a la norma internacional.' },
      { key: 'eac', name: 'EAC', d: 'Conformidad con los reglamentos técnicos de la Unión Económica Euroasiática (Rusia, Bielorrusia, Kazajistán, Kirguistán, Armenia).' },
    ],
    lab: 'Nuestros bancos de ensayo realizan ensayos de fugas hidráulicas, de larga duración de juntas y de presión por fatiga según procedimientos SAE e ISO, además de ensayos de durabilidad, momento e impacto para piezas de dirección y ensayos de par, fatiga y amortiguación para embragues.',
  },
  sustainability: {
    intro: 'Nos hemos fijado un objetivo de cero emisiones netas en línea con el Acuerdo de París y verificamos nuestro inventario de gases de efecto invernadero según ISO 14064-1. Estas son las medidas que lo respaldan.',
    figures: [
      { v: '1,46 GWh', l: 'Producción anual prevista de nuestra planta solar en cubierta' },
      { v: '99 %', l: 'Porcentaje de nuestro consumo eléctrico anual que está diseñada para cubrir' },
      { v: '6', l: 'Proyectos de eficiencia energética, a corto y largo plazo' },
      { v: '~3,5 años', l: 'Plazo de amortización calculado de la inversión solar' },
    ],
    figuresNote: 'Valores previstos según el plan de negocio del proyecto; los valores reales se publicarán una vez medidos.',
    pillars: [
      {
        t: 'Medio ambiente',
        items: [
          'Residuos controlados hasta el final de su vida útil y gestionados según la jerarquía de residuos.',
          'Objetivo de cero emisiones netas y una hoja de ruta concreta de reducción en línea con el Acuerdo de París.',
          'Proyectos climáticos ampliados mediante financiación verde.',
          'Protección del suelo y del agua mediante la prevención de la contaminación; prácticas que favorecen la biodiversidad.',
        ],
      },
      {
        t: 'Personas',
        items: [
          'Políticas para aumentar la participación de las mujeres y su representación en la dirección.',
          'Procesos de promoción, retribución y carrera transparentes; tolerancia cero con el acoso y la discriminación.',
          'Formación periódica en igualdad e inclusión; programas para personas con discapacidad y para jóvenes.',
          'Colaboraciones con la industria, el sector público, el mundo académico y las ONG.',
        ],
      },
      {
        t: 'Economía',
        items: [
          'Seis proyectos de eficiencia energética que reducen el consumo de energía y de materias primas.',
          'Recuperación de calor residual, equipos de alta eficiencia y energía solar en cubierta para descarbonizar nuestras plantas.',
          'Modelos de economía circular que crean empleos verdes cualificados.',
          'Herramientas digitales e I+D para aumentar la productividad.',
        ],
      },
    ],
    solarTitle: 'Planta solar fotovoltaica en cubierta',
    solar: [
      'El proyecto se incluyó en el orden del día del Consejo de Administración a finales de 2022 para cubrir nuestra creciente demanda de energía con una fuente renovable y lograr la independencia energética.',
      'Con una producción prevista de unos 1.460.000 kWh al año, la planta está diseñada para cubrir el 99 % de nuestro consumo eléctrico anual. Su vida útil prevista es de 25 años.',
      'Forma parte de nuestra adaptación al Pacto Verde Europeo, dado que la Unión Europea es uno de los mercados de exportación más importantes de Türkiye.',
    ],
  },
  sectors: [
    { key: 'trucks', t: 'Camiones y tractocamiones', d: 'Piezas de dirección, suspensión, basculación de cabina y embrague para camiones pesados europeos y rusos.' },
    { key: 'buses', t: 'Autobuses y autocares', d: 'Barras de dirección, terminales de barra y embragues para autobuses urbanos y de larga distancia.' },
    { key: 'agri', t: 'Maquinaria agrícola', d: 'Cilindros hidráulicos y piezas para tractores, implementos y vehículos de riego.' },
    { key: 'construction', t: 'Maquinaria de construcción', d: 'Piezas para maquinaria de construcción desde 2020, y proyectos especiales según planos del cliente.' },
  ],
  brands: {
    egerot: {
      founded: '2005',
      tagline: 'Sistemas de dirección y suspensión para vehículos pesados.',
      story: 'EGEROT abarca barras de reacción, brazos en V, barras de dirección, terminales de barra y bieletas de estabilizadora para camiones y autobuses europeos y rusos, con conformado de tubos, mecanizado, soldadura y montaje en nuestras propias plantas.',
      structure: [
        { t: 'Cuerpo tubular', d: 'Tubo de acero conformado, cortado a medida y con los extremos conformados.' },
        { t: 'Silentblock (casquillo caucho-metal)', d: 'Prensado en cada ojo para absorber golpes y vibraciones.' },
        { t: 'Perno / casquillo', d: 'Perno de acero mecanizado que posiciona la barra en el eje y en el chasis.' },
      ],
    },
    hydcab: {
      founded: '2004',
      tagline: 'Hidráulica de basculación de cabina y cilindros de servodirección.',
      story: 'HYDCAB fabrica cilindros y bombas de basculación de cabina, cierres de cabina, cilindros de servodirección y de elevación de eje, así como kits de reparación para vehículos pesados y maquinaria agrícola, con control final de cilindros y bombas en nuestros propios bancos de ensayo.',
      structure: [
        { t: 'Tubo del cilindro', d: 'Tubo de precisión con conexiones soldadas.' },
        { t: 'Pistón y vástago', d: 'Vástago y pistón mecanizados.' },
        { t: 'Juntas', d: 'Juntas de vástago y de pistón validadas en ensayos de larga duración SAE J1374.' },
        { t: 'Bloque de válvulas', d: 'Controla la elevación, el descenso y el bloqueo de la cabina.' },
      ],
    },
    revol: {
      founded: '2013',
      tagline: 'Sistemas de embrague para vehículos comerciales pesados.',
      story: 'REVOL suministra kits de embrague, platos de presión, discos de embrague y collarines de embrague para vehículos pesados europeos y rusos; cada kit combina plato de presión, disco y collarín emparejados entre sí.',
      structure: [
        { t: 'Plato de presión', d: 'Conjunto de plato con muelle de diafragma; sometido a ensayos de fatiga y de rendimiento.' },
        { t: 'Disco de embrague', d: 'Forros de fricción, segmentos de amortiguación, muelles amortiguadores de torsión y cubo estriado.' },
        { t: 'Collarín de embrague', d: 'Transmite la fuerza del pedal al muelle de diafragma.' },
      ],
    },
  },
  disc: {
    title: 'El interior de un disco de embrague REVOL',
    lead: 'CD8 007 072 — disco de 430 mm del kit de embrague CK0 122 801. Datos CAD reales, desmontado capa por capa.',
    parts: {
      'plate-top': 'Placa de cubierta',
      'plate-mid': 'Placa portadora',
      'plate-bottom': 'Placa de retención',
      'facing-top': 'Forro de fricción',
      'facing-bottom': 'Forro de fricción',
      cushion: 'Segmentos de amortiguación',
      'rivet-ring': 'Remaches',
      'damper-spring': 'Muelles amortiguadores de torsión',
      'stop-pin': 'Pernos de tope',
      hub: 'Cubo estriado',
      'hub-flange': 'Brida del cubo y arandela de fricción',
    },
  },
};

export default es;
