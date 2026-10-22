/** WhatsApp click-to-chat links. Staff tap send themselves; nothing is sent automatically. */

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

/**
 * The alumni invitation, as the owner framed it on 2026-10-22: Alpha is
 * building an alumni platform and digital network, and the story form,
 * which also takes the person's email and phone, is the first step into it.
 */
const ALUMNI_PITCH =
  "Alpha Schools is building an alumni platform and digital network for our former students, " +
  "and we would love you to be part of it. Start by sharing your story, it takes a minute:";

export function inviteMessage(fullName: string, link: string): string {
  return `Hello ${firstName(fullName)}, ${ALUMNI_PITCH} ${link}`;
}

export function generalMessage(link: string): string {
  return `Did you study at Alpha? ${ALUMNI_PITCH} ${link}`;
}

/** With no number, WhatsApp asks the sender which chat, group or status to use. */
export function whatsappUrl(phone: string | null, text: string): string {
  const query = `text=${encodeURIComponent(text)}`;
  if (!phone) return `https://wa.me/?${query}`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?${query}`;
}

const PARENT_PITCH =
  "Alpha Schools would love to share your experience as a parent on our website. It takes a minute:";

export function parentInviteMessage(fullName: string, link: string): string {
  return `Hello ${firstName(fullName)}, ${PARENT_PITCH} ${link}`;
}

export function parentGeneralMessage(link: string): string {
  return `Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. It takes a minute: ${link}`;
}
