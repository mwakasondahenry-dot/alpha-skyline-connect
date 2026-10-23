/**
 * One story, top to bottom: the whole photo (tap for full size), "How it will
 * look", the edit fields, the private details, and the sticky action bar.
 * `story` null is a new story typed in by staff.
 *
 * Every action reports in three places: its button (busy, then a check), the
 * story's card (a plain-language error if it failed), and the shell's outcome
 * line with Undo. A conflict (someone else moved the story) refetches it.
 *
 * Unsaved edits are kept as a draft in sessionStorage, so a sign-in that
 * expires mid-edit loses nothing, and leaving the page asks first.
 */
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ImagePlus, Mail, MessageCircle, Phone, Save, Trash2, X } from "lucide-react";
import {
  AdminButton,
  AdminSheet,
  ConfirmDialog,
  StickyBar,
  adminButtonClass,
  useOutcome,
} from "@/components/admin/kit";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import { copyText, useAccessToken } from "@/components/admin/invites/ui";
import { friendlyError } from "@/lib/admin/errors";
import { clearDraft, draftKey, readDraft, saveDraft } from "@/lib/admin/drafts";
import { contactLinks, formatAdminDate } from "@/lib/admin/format";
import {
  createStory,
  deleteStory,
  removeStoryPhoto,
  replaceStoryPhoto,
  saveStoryEdit,
  setFeatured,
  type AdminStory,
} from "@/lib/admin/stories-data";
import { STATUS_LABEL, transition, type StoryStatus } from "@/lib/admin/story-status";
import {
  EMPTY_STORY_FORM,
  STAFF_CONSENT_TEXT,
  barActions,
  cardLines,
  formToEdit,
  isFormDirty,
  moveExtra,
  nextFeaturedOrder,
  refeatureOrder,
  outcomeText,
  possessive,
  shownPhoto,
  storySource,
  storyToForm,
  firstInvalidField,
  validateStoryForm,
  type BarActionKind,
  type StoryFormErrors,
  type StoryFormValues,
} from "@/lib/admin/stories-view";
import { reissueDeclinedInvite } from "@/lib/invites.functions";
import { CONTACT_FIELDS, PHOTO_ACCEPT, STORY_PROMPTS } from "@/lib/story/fields";
import { PARENT_PROMPTS } from "@/lib/story/parent-fields";
import { ActionBar } from "./action-bar";
import { StoryForm } from "./story-form";
import { StoryPreview } from "./story-preview";
import {
  CONFLICT,
  STORIES_LIST_KEY,
  useStoriesUi,
  useStoryData,
  type StateMove,
} from "./use-stories";

/** How long a button shows its check before the screen moves on. */
const DONE_PAUSE_MS = 400;

const ANSWER_PROMPTS = [...STORY_PROMPTS, ...PARENT_PROMPTS];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function errorWords(err: unknown): string {
  // Server functions send staff-facing sentences; network failures get the mapping.
  if (err instanceof Error && err.message && !(err instanceof TypeError)) return err.message;
  return friendlyError(err);
}

export function StoryDetail({
  story,
  stories,
  signed,
  backTab,
}: {
  story: AdminStory | null;
  stories: AdminStory[];
  signed: Record<string, string>;
  backTab: StoryStatus;
}) {
  const id = story?.id ?? "new";
  const key = draftKey("stories", id);
  const isNew = story === null;

  const navigate = useNavigate();
  const qc = useQueryClient();
  const outcome = useOutcome();
  const ui = useStoriesUi();
  const data = useStoryData();
  const accessToken = useAccessToken();

  const [form, setForm] = useState<StoryFormValues>(() => {
    const draft = readDraft<StoryFormValues>(key);
    return draft ?? (story ? storyToForm(story) : EMPTY_STORY_FORM);
  });
  const [restored, setRestored] = useState(() => {
    const draft = readDraft<StoryFormValues>(key);
    return !!draft && isFormDirty(draft, story);
  });
  const [errors, setErrors] = useState<StoryFormErrors>({});
  const [busyKind, setBusyKind] = useState<string | null>(null);
  const [doneKind, setDoneKind] = useState<BarActionKind | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  /** The decline sheet was asked to save edits that do not pass the checks. */
  const [fixFirst, setFixFirst] = useState(false);
  const focusOnClose = useRef<keyof StoryFormValues | null>(null);
  const editRef = useRef<HTMLElement>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [removePhotoOpen, setRemovePhotoOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const dirty = isFormDirty(form, story);
  const hasErrors = Object.keys(errors).length > 0;
  const error = ui.errors[id];
  const name = story?.author_name ?? form.author_name;

  // Keep the draft while there is something unsaved; drop it once there is not.
  useEffect(() => {
    if (dirty) saveDraft(key, form);
    else clearDraft(key);
  }, [dirty, key, form]);

  // Leaving with unsaved changes asks first: links, Back, and closing the tab.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const skipBlock = useRef(false);
  const proceeding = useRef(false);
  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      dirtyRef.current && !skipBlock.current && current.pathname !== next.pathname,
    enableBeforeUnload: () => dirtyRef.current && !skipBlock.current,
    withResolver: true,
  });

  function change(patch: Partial<StoryFormValues>) {
    setForm((f) => ({ ...f, ...patch }));
    if (hasErrors) setErrors({});
  }

  function discardDraft() {
    setForm(story ? storyToForm(story) : EMPTY_STORY_FORM);
    setErrors({});
    setRestored(false);
    clearDraft(key);
  }

  /** Move the cursor to a form field, bringing it into view. */
  function focusField(field: keyof StoryFormValues) {
    const el = editRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.focus({ preventScroll: true });
  }

  /** Check the fields, showing their errors. Returns the first field to fix, or null. */
  function checkEdits(): keyof StoryFormValues | null {
    const errs = validateStoryForm(form, { isNew: false });
    setErrors(errs);
    return firstInvalidField(errs);
  }

  /** Check and save the fields. On success the form is the saved story. */
  async function saveEdits(): Promise<boolean> {
    if (!story || !data.client) return false;
    const errs = validateStoryForm(form, { isNew: false });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return false;
    const ok = await data.run(story.id, () =>
      saveStoryEdit(data.client!, story.id, formToEdit(form), story.status),
    );
    if (!ok) return false;
    clearDraft(key);
    setRestored(false);
    const row = await data.refreshStory(story.id);
    if (row) setForm(storyToForm(row));
    return true;
  }

  async function saveOnly() {
    if (!story) return;
    const invalid = checkEdits();
    if (invalid) {
      focusField(invalid);
      return;
    }
    setBusyKind("save");
    const ok = await saveEdits();
    setBusyKind(null);
    if (!ok) return;
    ui.flashRow(story.id);
    outcome.show({ text: outcomeText("save", form.author_name || name) });
  }

  async function createNew() {
    if (!data.client) return;
    const errs = validateStoryForm(form, { isNew: true });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusyKind("create");
    ui.setError(id, null);
    const result = await createStory(data.client, formToEdit(form), { text: STAFF_CONSENT_TEXT });
    if (!result.ok) {
      setBusyKind(null);
      ui.setError(id, friendlyError(result.error));
      return;
    }
    clearDraft(key);
    skipBlock.current = true;
    await data.refreshStory(result.id);
    data.countsChanged();
    await navigate({
      to: "/admin/stories/$id",
      params: { id: result.id },
      search: { tab: "hidden" },
    });
    ui.flashRow(result.id);
    outcome.show({ text: outcomeText("create", form.author_name) });
  }

  /** Back to the list this story was in, then let its card leave. */
  async function leaveAfter(action: StateMove, current: AdminStory) {
    skipBlock.current = true;
    await navigate({ to: "/admin/stories", search: { tab: current.status } });
    const sitePage = action === "publish" || action === "show";
    outcome.show({
      text: outcomeText(action, current.author_name),
      undo: data.undoMove(current.id, action, current),
      link: sitePage
        ? { to: `/testimonials#story-${current.id}`, label: "View on site" }
        : undefined,
    });
    await data.leaveList(current.id, {
      status: transition(action).to,
      decided_at: new Date().toISOString(),
      ...moveExtra(action),
      ...(action === "decline" ? { decline_reason: declineReason.trim() || null } : {}),
    });
    void data.refreshStory(current.id);
  }

  /** Publish, Decline, Restore, Hide, Show. Unsaved edits are saved first. */
  async function stateMove(action: StateMove, extra: Record<string, unknown> = {}) {
    if (!story) return;
    if (dirty) {
      const invalid = checkEdits();
      if (invalid) {
        // From the decline sheet the form is hidden behind it: say so there.
        if (action === "decline") setFixFirst(true);
        else focusField(invalid);
        return;
      }
    }
    setBusyKind(action);
    if (dirty && !(await saveEdits())) {
      setBusyKind(null);
      return;
    }
    const ok = await data.move(story, action, extra);
    setBusyKind(null);
    if (!ok) return;
    setDeclineOpen(false);
    setDoneKind(action);
    await wait(DONE_PAUSE_MS);
    await leaveAfter(action, story);
  }

  async function toggleFeature() {
    if (!story || !data.client) return;
    const sb = data.client;
    const on = !story.featured;
    const order = on ? nextFeaturedOrder(stories) : null;
    const previousOrder = story.featured_order;
    setBusyKind("feature");
    const ok = await data.run(story.id, () => setFeatured(sb, story.id, on, order));
    setBusyKind(null);
    if (!ok) return;
    data.patch(story.id, { featured: on, featured_order: order });
    data.countsChanged();
    ui.flashRow(story.id);
    const storyId = story.id;
    outcome.show({
      text: outcomeText(on ? "feature" : "unfeature", story.author_name),
      undo: async () => {
        const list = qc.getQueryData<AdminStory[]>(STORIES_LIST_KEY) ?? [];
        const back = !on;
        // Undo of unfeature puts it back in the place it had.
        const result = await setFeatured(
          sb,
          storyId,
          back,
          back ? refeatureOrder(storyId, previousOrder, list) : null,
        );
        await data.refreshStory(storyId);
        if (!result.ok) throw "conflict" in result ? CONFLICT : result.error;
        ui.flashRow(storyId);
      },
    });
  }

  async function inviteAgain() {
    if (!story) return;
    setBusyKind("invite-again");
    ui.setError(story.id, null);
    ui.setBusy(story.id, true);
    try {
      const { link } = await reissueDeclinedInvite({ data: { accessToken, storyId: story.id } });
      setInviteLink(link);
      const copied = await copyText(link);
      const first = story.author_name.trim().split(/\s+/)[0] || "them";
      outcome.show({
        text: copied
          ? `New link for ${first} copied. Send it to them; their new story will arrive under Waiting.`
          : `New link made for ${first}. Copy it from the story and send it to them.`,
      });
    } catch (err) {
      ui.setError(story.id, errorWords(err));
    } finally {
      ui.setBusy(story.id, false);
      setBusyKind(null);
      await data.refreshStory(story.id);
      data.countsChanged();
    }
  }

  function onAction(kind: BarActionKind) {
    if (kind === "decline") {
      setFixFirst(false);
      setDeclineOpen(true);
    } else if (kind === "delete") setDeleteOpen(true);
    else if (kind === "feature") void toggleFeature();
    else if (kind === "invite-again") void inviteAgain();
    else void stateMove(kind);
  }

  async function onPhotoChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !story || !data.client) return;
    const sb = data.client;
    setBusyKind("photo");
    const ok = await data.run(story.id, () => replaceStoryPhoto(sb, story, file));
    setBusyKind(null);
    if (!ok) return;
    await data.refreshStory(story.id);
    ui.flashRow(story.id);
    outcome.show({
      text:
        story.status === "live"
          ? `Saved the new photo on ${possessive(story.author_name)} story. It will appear on the website within about 5 minutes.`
          : `Saved the new photo on ${possessive(story.author_name)} story.`,
    });
  }

  async function removePhoto() {
    if (!story || !data.client) return;
    const result = await removeStoryPhoto(data.client, story);
    if (!result.ok) {
      if ("conflict" in result) {
        await data.refreshStory(story.id);
        throw CONFLICT;
      }
      throw result.error;
    }
    await data.refreshStory(story.id);
    ui.flashRow(story.id);
    outcome.show({ text: `Removed the photo from ${possessive(story.author_name)} story.` });
  }

  async function deleteForGood() {
    if (!story || !data.client) return;
    const result = await deleteStory(data.client, story);
    if (!result.ok) {
      if ("conflict" in result) {
        await data.refreshStory(story.id);
        throw CONFLICT;
      }
      throw result.error;
    }
    clearDraft(key);
    data.countsChanged();
    skipBlock.current = true;
    const storyId = story.id;
    const tab = story.status;
    const text = outcomeText("delete", story.author_name);
    // Close the dialog before the page changes under it.
    setDeleteOpen(false);
    await navigate({ to: "/admin/stories", search: { tab } });
    outcome.show({ text });
    await data.leaveList(storyId, null);
  }

  const photo = story ? shownPhoto(story, signed) : null;
  const hasPhoto = !!story && !!(story.pending_photo_path || story.photo_url);
  const photoLoading = !!story?.pending_photo_path && !photo;
  const actions = story ? barActions(story) : [];
  const noConsent = !!story && !story.consent_at;

  return (
    <article aria-labelledby="story-detail-heading" className="space-y-6 lg:px-5 lg:pt-5">
      <h1 className="sr-only lg:hidden">Stories</h1>
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/admin/stories"
          search={{ tab: backTab }}
          className={adminButtonClass("quiet", "-ml-3 px-3 lg:hidden")}
        >
          <span aria-hidden>←</span> All stories
        </Link>
        <Link
          to="/admin/stories"
          search={{ tab: backTab }}
          className={adminButtonClass("quiet", "ml-auto hidden px-0 lg:inline-flex")}
        >
          <X aria-hidden className="h-5 w-5" strokeWidth={2} />
          <span className="sr-only">Close the story</span>
        </Link>
      </div>

      <header className="space-y-2">
        <h2
          id="story-detail-heading"
          className="break-words font-display text-xl font-bold leading-snug text-[var(--color-deep-blue)]"
        >
          {isNew ? "New story" : story.author_name}
        </h2>
        {story ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 font-semibold text-[var(--color-deep-blue)]">
              {STATUS_LABEL[story.status]}
            </span>
            <span>{cardLines(story).date}</span>
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
            For words received on paper or in person. It is saved under Hidden until you press Show
            on site.
          </p>
        )}
        {noConsent ? (
          <p className="flex gap-1.5 text-sm font-semibold leading-snug text-[var(--color-deep-blue)]">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            No consent on record
          </p>
        ) : null}
        {story?.status === "declined" ? (
          <p className="text-sm leading-snug text-[var(--color-ink)]">
            <span className="font-semibold text-[var(--color-deep-blue)]">Reason: </span>
            {story.decline_reason || "None given."}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="flex gap-1.5 rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm leading-snug text-[var(--color-danger)]"
          >
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{error}</span>
          </p>
        ) : null}
        {inviteLink ? (
          <div className="space-y-2 rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface-muted)] p-3 text-sm">
            <p className="font-semibold text-[var(--color-deep-blue)]">New invite link</p>
            <p className="break-all text-[var(--color-ink)]">{inviteLink}</p>
            <AdminButton
              onClick={() => {
                void copyText(inviteLink).then((ok) =>
                  outcome.show({
                    text: ok ? "Link copied." : "Could not copy. Select the link and copy it.",
                  }),
                );
              }}
            >
              Copy link
            </AdminButton>
          </div>
        ) : null}
      </header>

      {story ? (
        <section aria-label="Photo" className="space-y-3">
          {hasPhoto && photo ? (
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              className="admin-press block w-full overflow-hidden rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              <WholePhoto
                key={photo}
                src={photo}
                name={story.author_name}
                original
                className="h-72 w-full sm:h-80"
              />
              <span className="sr-only">View the photo full size</span>
            </button>
          ) : (
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-[var(--color-ink-soft)]">
              {photoLoading ? "Loading the photo…" : "No photo."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              className={adminButtonClass(
                "secondary",
                busyKind === "photo" ? "pointer-events-none opacity-60" : undefined,
              )}
            >
              <ImagePlus aria-hidden className="h-4 w-4" strokeWidth={2} />
              {busyKind === "photo" ? "Saving photo…" : hasPhoto ? "Replace photo" : "Add photo"}
              <input
                type="file"
                accept={PHOTO_ACCEPT}
                className="sr-only"
                onChange={(e) => void onPhotoChosen(e)}
                disabled={busyKind !== null}
              />
            </label>
            {hasPhoto ? (
              <AdminButton
                variant="quiet"
                icon={Trash2}
                disabled={busyKind !== null}
                onClick={() => setRemovePhotoOpen(true)}
              >
                Remove photo
              </AdminButton>
            ) : null}
          </div>
        </section>
      ) : null}

      <StoryPreview values={form} photo={photo} />

      <section ref={editRef} aria-labelledby="story-edit-heading" className="space-y-4">
        <h2
          id="story-edit-heading"
          className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
        >
          {isNew ? "The story" : "Edit"}
        </h2>
        {restored ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] px-3 py-1 text-sm text-[var(--color-ink)]">
            <span className="py-2">Your unsaved changes from earlier are back.</span>
            <AdminButton variant="quiet" className="px-2" onClick={discardDraft}>
              Discard them
            </AdminButton>
          </div>
        ) : null}
        <StoryForm values={form} errors={errors} onChange={change} isNew={isNew} />
        {isNew ? (
          <p className="text-sm text-[var(--color-ink-soft)]">You can add a photo after saving.</p>
        ) : null}
      </section>

      {story ? <PrivateDetails story={story} /> : null}

      {story ? (
        <ActionBar
          actions={actions}
          busyKind={busyKind}
          doneKind={doneKind}
          disabled={{ publish: noConsent }}
          onAction={onAction}
          note={
            hasErrors
              ? "Some fields need attention. They are marked above."
              : noConsent && story.status === "waiting"
                ? "This story has no consent on record, so it cannot be published."
                : dirty
                  ? "You have unsaved changes. Any action saves them first."
                  : undefined
          }
          leading={
            dirty ? (
              <AdminButton
                variant="secondary"
                icon={Save}
                busy={busyKind === "save"}
                busyLabel="Saving…"
                disabled={busyKind !== null && busyKind !== "save"}
                onClick={() => void saveOnly()}
                className="flex-1 sm:flex-none"
              >
                Save changes
              </AdminButton>
            ) : null
          }
        />
      ) : (
        <StickyBar
          note={hasErrors ? "Some fields need attention. They are marked above." : undefined}
        >
          <AdminButton
            variant="primary"
            icon={Save}
            busy={busyKind === "create"}
            busyLabel="Saving…"
            onClick={() => void createNew()}
            className="flex-1 sm:flex-none"
          >
            Save story
          </AdminButton>
          <Link
            to="/admin/stories"
            search={{ tab: backTab }}
            className={adminButtonClass("secondary", "flex-1 sm:flex-none")}
          >
            Cancel
          </Link>
        </StickyBar>
      )}

      {story ? (
        <>
          <AdminSheet
            open={declineOpen}
            onOpenChange={(open) => {
              if (busyKind === "decline") return;
              setDeclineOpen(open);
              setFixFirst(false);
            }}
            onCloseAutoFocus={(e) => {
              const field = focusOnClose.current;
              if (!field) return;
              focusOnClose.current = null;
              e.preventDefault();
              focusField(field);
            }}
            title={`Decline ${possessive(story.author_name)} story?`}
            description="It is kept under Declined, with its photo, so you can restore it later."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void stateMove("decline", { decline_reason: declineReason.trim() || null });
              }}
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="decline-reason"
                  className="block text-sm font-semibold text-[var(--color-deep-blue)]"
                >
                  Reason (optional, only staff see it)
                </label>
                <textarea
                  id="decline-reason"
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="block min-h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30 sm:text-sm"
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm leading-snug text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}
              {fixFirst ? (
                <div className="space-y-3">
                  <p role="alert" className="text-sm leading-snug text-[var(--color-danger)]">
                    Some fields need attention. Close this and fix them first.
                  </p>
                  <AdminButton
                    variant="primary"
                    onClick={() => {
                      focusOnClose.current = firstInvalidField(errors);
                      setFixFirst(false);
                      setDeclineOpen(false);
                    }}
                  >
                    Close and fix them
                  </AdminButton>
                </div>
              ) : (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <AdminButton
                    variant="secondary"
                    disabled={busyKind === "decline"}
                    onClick={() => setDeclineOpen(false)}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    variant="primary"
                    icon={X}
                    busy={busyKind === "decline"}
                    busyLabel="Declining…"
                  >
                    Decline story
                  </AdminButton>
                </div>
              )}
            </form>
          </AdminSheet>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={`Delete ${story.author_name}'s story?`}
            body="The story and its photo are removed for good. This cannot be undone."
            confirmLabel="Delete permanently"
            busyLabel="Deleting…"
            danger
            onConfirm={deleteForGood}
          />

          <ConfirmDialog
            open={removePhotoOpen}
            onOpenChange={setRemovePhotoOpen}
            title={`Remove ${possessive(story.author_name)} photo?`}
            body={
              story.pending_photo_path
                ? "The photo they sent is deleted. This cannot be undone."
                : "The photo is taken off the story and deleted."
            }
            confirmLabel="Remove photo"
            busyLabel="Removing…"
            danger
            onConfirm={removePhoto}
          />

          {photo ? (
            <AdminSheet
              open={photoOpen}
              onOpenChange={setPhotoOpen}
              title={`${possessive(story.author_name)} photo`}
              wide
            >
              <img
                src={photo}
                alt={`Photo of ${story.author_name}`}
                className="mx-auto block h-auto max-h-[75dvh] w-auto max-w-full rounded-[var(--radius-btn)]"
              />
            </AdminSheet>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        open={blocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open && !proceeding.current) blocker.reset?.();
        }}
        title="Leave without saving?"
        body={`Your changes to ${isNew ? "the new story" : `${possessive(name)} story`} are not saved.`}
        confirmLabel="Leave"
        cancelLabel="Stay"
        danger
        onConfirm={() => {
          proceeding.current = true;
          clearDraft(key);
          blocker.proceed?.();
        }}
      />
    </article>
  );
}

/** Contact details, answers, consent and where it came from. Never published. */
function PrivateDetails({ story }: { story: AdminStory }) {
  const answers = (story.answers ?? {}) as Record<string, unknown>;
  const text = (k: string) => (typeof answers[k] === "string" ? (answers[k] as string).trim() : "");
  const email = text("email");
  const phone = text("phone");
  const links = contactLinks({ phone, email, name: story.author_name });
  const answered = ANSWER_PROMPTS.filter((p) => text(p.key));
  const audience = story.grad_year != null ? "alumni" : "parent";
  const fromInvite = !!story.invite_id || typeof answers.previous_invite_id === "string";

  return (
    <details className="group rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      <summary className="admin-press flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-card)] px-4 text-sm font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]">
        Private details (never published)
        <span aria-hidden className="text-[var(--color-ink-soft)] group-open:rotate-180">
          ▾
        </span>
      </summary>
      <dl className="space-y-4 px-4 pb-4 pt-1 text-sm">
        {email || phone ? (
          <div className="space-y-2">
            <dt className="font-semibold text-[var(--color-deep-blue)]">Contact</dt>
            <dd className="space-y-2">
              {CONTACT_FIELDS.filter((c) => text(c.key)).map((c) => (
                <p key={c.key} className="break-words text-[var(--color-ink)]">
                  <span className="text-[var(--color-ink-soft)]">{c.label}: </span>
                  {text(c.key)}
                </p>
              ))}
              <div className="flex flex-wrap gap-2">
                {links.whatsapp ? (
                  <a
                    href={links.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className={adminButtonClass("secondary")}
                  >
                    <MessageCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
                    WhatsApp
                  </a>
                ) : null}
                {links.tel ? (
                  <a href={links.tel} className={adminButtonClass("secondary")}>
                    <Phone aria-hidden className="h-4 w-4" strokeWidth={2} />
                    Call
                  </a>
                ) : null}
                {links.mailto ? (
                  <a href={links.mailto} className={adminButtonClass("secondary")}>
                    <Mail aria-hidden className="h-4 w-4" strokeWidth={2} />
                    Email
                  </a>
                ) : null}
              </div>
            </dd>
          </div>
        ) : null}
        {story.city_country ? (
          <div>
            <dt className="font-semibold text-[var(--color-deep-blue)]">Where they live</dt>
            <dd className="text-[var(--color-ink)]">{story.city_country}</dd>
          </div>
        ) : null}
        {answered.map((p) => (
          <div key={p.key}>
            <dt className="font-semibold text-[var(--color-deep-blue)]">{p.label}</dt>
            <dd className="whitespace-pre-line text-[var(--color-ink)]">{text(p.key)}</dd>
          </div>
        ))}
        <div>
          <dt className="font-semibold text-[var(--color-deep-blue)]">Consent</dt>
          <dd className="text-[var(--color-ink)]">
            {story.consent_at ? (
              <>
                Agreed {formatAdminDate(story.consent_at)}
                {story.consent_text ? `: “${story.consent_text}”` : "."}
              </>
            ) : (
              "No consent on record."
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--color-deep-blue)]">Came from</dt>
          <dd className="flex flex-wrap items-center gap-x-3 text-[var(--color-ink)]">
            <span>{storySource(story)}</span>
            {fromInvite ? (
              <Link
                to="/admin/stories/invite"
                search={{ audience }}
                className="inline-flex min-h-11 items-center font-semibold text-[var(--color-deep-blue)] underline underline-offset-4"
              >
                See the invites
              </Link>
            ) : null}
          </dd>
        </div>
      </dl>
    </details>
  );
}
