/** WhatsApp click-to-chat links. Staff tap send themselves; nothing is sent automatically. */

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

const PITCH =
  "Alpha Schools would love to feature your story on our alumni page. It takes about 5 minutes:";

export function inviteMessage(fullName: string, link: string): string {
  return `Hello ${firstName(fullName)}, ${PITCH} ${link}`;
}

export function generalMessage(link: string): string {
  return `Did you study at Alpha? ${PITCH} ${link}`;
}

/** With no number, WhatsApp asks the sender which chat, group or status to use. */
export function whatsappUrl(phone: string | null, text: string): string {
  const query = `text=${encodeURIComponent(text)}`;
  if (!phone) return `https://wa.me/?${query}`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?${query}`;
}

const PARENT_PITCH =
  "Alpha Schools would love to share your experience as a parent on our website. It takes about 5 minutes:";

export function parentInviteMessage(fullName: string, link: string): string {
  return `Hello ${firstName(fullName)}, ${PARENT_PITCH} ${link}`;
}

export function parentGeneralMessage(link: string): string {
  return `Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. It takes about 5 minutes: ${link}`;
}
