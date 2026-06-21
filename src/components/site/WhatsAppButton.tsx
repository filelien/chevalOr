import { MessageCircle } from "lucide-react";
import { HOTEL } from "@/lib/content";

export function WhatsAppButton() {
  const url = `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent("Bonjour, je souhaite des informations sur l'Hôtel Le Cheval d'Or.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
