import { WHATSAPP_URL } from "@/lib/site";

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 rounded-full bg-brand-accent px-5 py-3 font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
    >
      ¡Habla con un Agente!
    </a>
  );
}
