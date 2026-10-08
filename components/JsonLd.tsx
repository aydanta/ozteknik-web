/** JSON-LD — sunucu HTML'inde; "<" kaçışlı (XSS'e karşı). */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
