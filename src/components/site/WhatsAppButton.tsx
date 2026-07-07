import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { HOTEL } from "@/lib/content";
import { getSiteSetting } from "@/lib/site-settings";
import { fetchHotelInfo } from "@/lib/cms";
import { buildWhatsAppUrl, normalizeWhatsAppPhone } from "@/lib/whatsapp-utils";

type WhatsAppConfig = {
  enabled?: boolean;
  phone?: string;
  defaultMessage?: string;
  color?: string;
  position?: "left" | "right";
  icon?: string;
};

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: true,
  phone: HOTEL.whatsapp,
  defaultMessage: "Bonjour, je souhaite des informations sur l'Hôtel Le Cheval d'Or.",
  color: "#25D366",
  position: "right",
  icon: "message-circle",
};

export function WhatsAppButton() {
  const { data } = useQuery({
    queryKey: ["whatsapp-button"],
    queryFn: async () => {
      const [hotel, config] = await Promise.all([fetchHotelInfo(), getSiteSetting<WhatsAppConfig>("whatsapp_config", DEFAULT_CONFIG)]);
      const rawPhone = config.phone || hotel.whatsapp || HOTEL.whatsapp;
      return {
        ...DEFAULT_CONFIG,
        ...config,
        phone: normalizeWhatsAppPhone(rawPhone),
        defaultMessage: config.defaultMessage || DEFAULT_CONFIG.defaultMessage,
      } as WhatsAppConfig;
    },
    staleTime: 60_000,
  });

  if (!data?.enabled) return null;

  const phone = data.phone || normalizeWhatsAppPhone(HOTEL.whatsapp);
  const url = buildWhatsAppUrl(phone, data.defaultMessage || DEFAULT_CONFIG.defaultMessage || "");
  const pos = data.position === "left" ? "left-6" : "right-6";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className={`fixed bottom-6 ${pos} z-50 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110`}
      style={{ backgroundColor: data.color || DEFAULT_CONFIG.color }}
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
