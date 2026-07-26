import Image from "next/image";

/**
 * Logos reales servidos hoy desde el WordPress actual.
 * Los width/height son las dimensiones intrínsecas reales de cada PNG (sólo
 * fijan el aspect ratio; la altura renderizada la controla `h-10`).
 * TODO: migrarlos a /public para no depender del WordPress.
 */
const CERTIFICATIONS = [
  {
    src: "https://compasssolutions.com.mx/wp-content/uploads/2025/08/alcat.png",
    alt: "ALACAT",
    width: 512,
    height: 291,
  },
  {
    src: "https://compasssolutions.com.mx/wp-content/uploads/2025/08/amacarga.png",
    alt: "AMACARGA",
    width: 512,
    height: 291,
  },
  {
    src: "https://compasssolutions.com.mx/wp-content/uploads/2025/08/canacar.png",
    alt: "CANACAR",
    width: 512,
    height: 291,
  },
  {
    src: "https://compasssolutions.com.mx/wp-content/uploads/2025/08/isoeeee.png",
    alt: "ISO",
    width: 512,
    height: 291,
  },
];

export default function Certifications() {
  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-6 text-sm text-slate-500">
          Estamos certificados y asociados con las mejores entidades.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-8 opacity-80 md:gap-10">
          {CERTIFICATIONS.map((cert) => (
            <li key={cert.alt}>
              <Image
                src={cert.src}
                alt={cert.alt}
                width={cert.width}
                height={cert.height}
                className="h-10 w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
