import type { Locale } from '@/lib/i18n';

/**
 * Kategori sayfası SSS (GEO + FAQPage) — veriden üretilir: ürün sayısı ve en sık araç markaları gerçek katalogdan.
 * ⚠ AI ilk çeviri; sektör editörü onayı bekler.
 */
type F = (o: { one: string; many: string; n: number; makes: string; brand: string }) => { q: string; a: string }[];
export const CATEGORY_FAQ: Record<Locale, F> = {
  en: (o) => [
    { q: `Which vehicle makes do your ${o.many.toLowerCase()} fit?`, a: `Our ${o.n} ${o.brand} ${o.many.toLowerCase()} cover ${o.makes} and other makes. Every product page lists its OE numbers and compatible models.` },
    { q: `How do I find the right ${o.one.toLowerCase()} by OE number?`, a: `Type the OE or competitor number into the search box. Spaces, dots and dashes are ignored, so A 001 250 97 01 and A0012509701 find the same part. For long lists, use multi search.` },
    { q: `Can I order ${o.many.toLowerCase()} together with other product lines?`, a: `Yes. EGEROT, HYDCAB and REVOL parts can be combined on one quote list and shipped together from İzmir. Our export team replies within 24 hours.` },
  ],
  tr: (o) => [
    { q: `${o.many} hangi araç markalarına uygun?`, a: `${o.n} adet ${o.brand} ürünümüz ${o.makes} ve diğer markaları kapsar. Her ürün sayfasında OE numaraları ve uyumlu modeller listelenir.` },
    { q: `Doğru ürünü OE numarasıyla nasıl bulurum?`, a: `OE ya da rakip numarasını arama kutusuna yazın. Boşluk, nokta ve tire yok sayılır; A 001 250 97 01 ile A0012509701 aynı parçayı bulur. Uzun listeler için çoklu aramayı kullanın.` },
    { q: `Bu ürünleri diğer ürün hatlarıyla birlikte sipariş edebilir miyim?`, a: `Evet. EGEROT, HYDCAB ve REVOL ürünleri tek teklif listesinde birleştirilip İzmir’den birlikte sevk edilebilir. İhracat ekibimiz 24 saat içinde dönüş yapar.` },
  ],
  de: (o) => [
    { q: `Für welche Fahrzeugmarken passen Ihre ${o.many}?`, a: `Unsere ${o.n} ${o.brand}-Artikel decken ${o.makes} und weitere Marken ab. Jede Produktseite nennt OE-Nummern und passende Modelle.` },
    { q: `Wie finde ich das richtige Teil über die OE-Nummer?`, a: `Geben Sie die OE- oder Vergleichsnummer in das Suchfeld ein. Leerzeichen, Punkte und Bindestriche werden ignoriert – A 001 250 97 01 und A0012509701 finden dasselbe Teil. Für lange Listen nutzen Sie die Mehrfachsuche.` },
    { q: `Kann ich diese Teile zusammen mit anderen Produktlinien bestellen?`, a: `Ja. EGEROT-, HYDCAB- und REVOL-Teile lassen sich auf einer Angebotsliste kombinieren und gemeinsam ab İzmir versenden. Unser Exportteam antwortet innerhalb von 24 Stunden.` },
  ],
  fr: (o) => [
    { q: `Sur quelles marques de véhicules vos ${o.many.toLowerCase()} se montent-elles ?`, a: `Nos ${o.n} références ${o.brand} couvrent ${o.makes} et d’autres marques. Chaque fiche produit indique les numéros OE et les modèles compatibles.` },
    { q: `Comment trouver la bonne pièce par numéro OE ?`, a: `Saisissez le numéro OE ou concurrent dans le champ de recherche. Les espaces, points et tirets sont ignorés : A 001 250 97 01 et A0012509701 trouvent la même pièce. Pour les longues listes, utilisez la recherche multiple.` },
    { q: `Puis-je commander ces pièces avec d’autres gammes ?`, a: `Oui. Les pièces EGEROT, HYDCAB et REVOL peuvent être regroupées sur une même liste de devis et expédiées ensemble depuis İzmir. Notre équipe export répond sous 24 heures.` },
  ],
  es: (o) => [
    { q: `¿Para qué marcas de vehículos sirven sus ${o.many.toLowerCase()}?`, a: `Nuestras ${o.n} referencias ${o.brand} cubren ${o.makes} y otras marcas. Cada ficha de producto indica los números OE y los modelos compatibles.` },
    { q: `¿Cómo encuentro la pieza correcta por número OE?`, a: `Escriba el número OE o de la competencia en el buscador. Se ignoran espacios, puntos y guiones: A 001 250 97 01 y A0012509701 encuentran la misma pieza. Para listas largas, use la búsqueda múltiple.` },
    { q: `¿Puedo pedir estas piezas junto con otras líneas?`, a: `Sí. Las piezas EGEROT, HYDCAB y REVOL pueden combinarse en una sola lista de cotización y enviarse juntas desde İzmir. Nuestro equipo de exportación responde en 24 horas.` },
  ],
  it: (o) => [
    { q: `Per quali marchi di veicoli sono adatti i vostri ${o.many.toLowerCase()}?`, a: `I nostri ${o.n} codici ${o.brand} coprono ${o.makes} e altri marchi. Ogni scheda prodotto riporta i numeri OE e i modelli compatibili.` },
    { q: `Come trovo il ricambio giusto con il numero OE?`, a: `Inserisca il numero OE o della concorrenza nella ricerca. Spazi, punti e trattini vengono ignorati: A 001 250 97 01 e A0012509701 trovano lo stesso ricambio. Per elenchi lunghi usi la ricerca multipla.` },
    { q: `Posso ordinare questi ricambi insieme ad altre linee?`, a: `Sì. I ricambi EGEROT, HYDCAB e REVOL possono essere combinati in un’unica lista preventivo e spediti insieme da İzmir. Il nostro team export risponde entro 24 ore.` },
  ],
  ru: (o) => [
    { q: `Для каких марок подходят ваши ${o.many.toLowerCase()}?`, a: `Наш ассортимент ${o.brand} (позиций: ${o.n}) охватывает ${o.makes} и другие марки. На странице каждого товара указаны номера OE и применимые модели.` },
    { q: `Как найти нужную деталь по номеру OE?`, a: `Введите номер OE или номер конкурента в строку поиска. Пробелы, точки и дефисы игнорируются: A 001 250 97 01 и A0012509701 находят одну и ту же деталь. Для длинных списков используйте множественный поиск.` },
    { q: `Можно ли заказать эти детали вместе с другими линейками?`, a: `Да. Детали EGEROT, HYDCAB и REVOL можно объединить в одном запросе цены и отгрузить вместе из Измира. Экспортный отдел отвечает в течение 24 часов.` },
  ],
  ar: (o) => [
    { q: `ما ماركات المركبات التي تناسبها ${o.many}؟`, a: `تغطي منتجات ${o.brand} لدينا (عددها ${o.n}) ماركات ${o.makes} وغيرها. تعرض صفحة كل منتج أرقام OE والطرازات المتوافقة.` },
    { q: `كيف أجد القطعة الصحيحة برقم OE؟`, a: `اكتب رقم OE أو رقم المنافس في مربع البحث. يتم تجاهل المسافات والنقاط والشرطات، فـ A 001 250 97 01 وA0012509701 يجدان القطعة نفسها. للقوائم الطويلة استخدم البحث المتعدد.` },
    { q: `هل يمكنني طلب هذه القطع مع خطوط منتجات أخرى؟`, a: `نعم. يمكن جمع قطع EGEROT وHYDCAB وREVOL في قائمة عرض سعر واحدة وشحنها معًا من إزمير. يرد فريق التصدير خلال 24 ساعة.` },
  ],
};
