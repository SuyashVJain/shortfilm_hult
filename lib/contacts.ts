// Organiser contacts shown on the public site (owner-provided; open-questions D5, D6).

export type Contact = { name: string; role: string; phone: string };

export const CONTACTS: Contact[] = [
  { name: "Dhruvi Namdeo", role: "Campus Director", phone: "+919171595792" },
  { name: "Suyash Vasal Jain", role: "Deputy Campus Director", phone: "+919343379736" },
];

export const INSTAGRAM = { handle: "@hultprize.suas", url: "https://www.instagram.com/hultprize.suas/" };

/** WhatsApp chat link: https://wa.me/<digits, no plus>. */
export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/** "+919171595792" -> "+91 91715 95792" */
export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : phone;
}
