import { Helmet } from "react-helmet-async";

/**
 * Inject one or more JSON-LD schema.org blocks into <head>.
 * Pass a single object or an array; renders one <script> per item.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}

export default JsonLd;
