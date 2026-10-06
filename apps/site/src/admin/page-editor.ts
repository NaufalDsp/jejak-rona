import {
  BlockSchema,
  PageSchema,
  type Block,
  type Page,
} from "@jejak-rona/schema";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { openMediaPicker } from "./media-manager.js";
import { PublishingWorkflow } from "./publishing-workflow.js";

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: Page["status"];
  draft: unknown;
  published: unknown;
  seo: Page["seo"];
  is_home: boolean;
  updated_at: string;
}

type EditablePage = Page & { published: unknown };
type BlockKind = Block["type"];

const root = document.getElementById("page-editor");

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function createId(): string {
  return crypto.randomUUID();
}

function makeBlock(type: BlockKind): Block {
  const id = createId();
  if (type === "hero_media") {
    return {
      id,
      type,
      variant: "staggered",
      line1: "Judul baris satu",
      line2: "Judul baris dua",
      subtext: "",
      ctaLabel: "",
      ctaUrl: "",
      media: {
        id: createId(),
        kind: "image",
        url: "",
        filename: "hero-image.jpg",
        mimeType: "image/jpeg",
        alt: "",
        focalX: 50,
        focalY: 50,
        variants: [],
      },
      focalPoint: {
        desktop: { x: 50, y: 50 },
        mobile: { x: 50, y: 50 },
      },
      scrimStrength: "medium",
    };
  }

  if (type === "rich_text") {
    return { id, type, heading: "", content: "Tulis isi bagian ini." };
  }

  return {
    id,
    type,
    variant: "full",
    media: {
      id: createId(),
      kind: "image",
      url: "",
      filename: "image.jpg",
      mimeType: "image/jpeg",
      alt: "",
      focalX: 50,
      focalY: 50,
      variants: [],
    },
    caption: "",
  };
}

function rowToPage(row: PageRow): EditablePage {
  const rawDraft = Array.isArray(row.draft) ? row.draft : [];
  const rawPublished = Array.isArray(row.published) ? row.published : [];
  const source =
    rawDraft.length > 0 || row.status === "draft" ? rawDraft : rawPublished;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    isHome: row.is_home,
    seo: row.seo,
    blocks: source as Block[],
    updatedAt: row.updated_at,
    published: row.published,
  };
}

export function mountPageEditor(client: SupabaseClient, user: User): void {
  if (!root || root.dataset.mounted === "true") return;
  root.dataset.mounted = "true";

  const list = document.getElementById("page-list");
  const editor = document.getElementById("page-edit-view");
  const listView = document.getElementById("page-list-view");
  const blockList = document.getElementById("block-list");
  const fields = document.getElementById("block-fields");
  const message = document.getElementById("editor-message");
  const saveStatus = document.getElementById("draft-save-status");
  const preview = document.getElementById(
    "draft-preview",
  ) as HTMLIFrameElement | null;
  const pageForm = document.getElementById(
    "page-form",
  ) as HTMLFormElement | null;
  const deleteDialog = document.getElementById(
    "delete-page-dialog",
  ) as HTMLDialogElement | null;
  const deleteName = document.getElementById(
    "delete-page-name",
  ) as HTMLInputElement | null;
  const deleteConfirm = document.getElementById(
    "delete-page-confirm",
  ) as HTMLButtonElement | null;

  if (
    !list ||
    !editor ||
    !listView ||
    !blockList ||
    !fields ||
    !message ||
    !saveStatus ||
    !preview ||
    !pageForm ||
    !deleteDialog ||
    !deleteName ||
    !deleteConfirm
  )
    return;

  let pages: EditablePage[] = [];
  let current: EditablePage | null = null;
  let selectedBlockId: string | null = null;
  let saveTimer: number | undefined;
  let saveVersion = 0;
  let history: EditablePage[] = [];
  let redoHistory: EditablePage[] = [];
  let filterText = "";
  let previewTemplates: {
    hero: HTMLElement;
    richText: HTMLElement;
    imageFull: HTMLElement;
  } | null = null;

  const announce = (text: string, kind: "error" | "success" = "error") => {
    message.textContent = text;
    message.classList.remove("hidden", "error", "success");
    message.classList.add(kind);
  };

  const clearAnnouncement = () => {
    message.textContent = "";
    message.classList.add("hidden");
    message.classList.remove("error", "success");
  };

  const setSaveStatus = (text: string, state: string) => {
    saveStatus.textContent = text;
    saveStatus.dataset.state = state;
  };

  const validatePage = (page: EditablePage): string[] => {
    const result = PageSchema.safeParse(page);
    if (result.success) return [];
    return result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
  };

  const renderPreview = () => {
    const frameDocument = preview.contentDocument;
    const main = frameDocument?.querySelector<HTMLElement>("#main-content");
    if (!current || !frameDocument || !main || !previewTemplates) return;

    const renderedBlocks = current.blocks.map((block) => {
      if (block.type === "hero_media") {
        const hero = previewTemplates!.hero.cloneNode(true) as HTMLElement;
        hero.classList.remove(
          "hero--scrim-light",
          "hero--scrim-medium",
          "hero--scrim-heavy",
        );
        hero.classList.add(
          `hero--scrim-${block.scrimStrength}`,
          `hero--${block.variant}`,
        );
        const focalPoint = block.focalPoint?.desktop ?? {
          x: block.media.focalX,
          y: block.media.focalY,
        };
        hero.style.setProperty("--focus-x", `${focalPoint.x}%`);
        hero.style.setProperty("--focus-y", `${focalPoint.y}%`);

        const lines = hero.querySelectorAll<HTMLElement>(".hero__line > span");
        if (lines[0]) lines[0].textContent = block.line1;
        if (lines[1]) lines[1].textContent = block.line2;
        const subtext = hero.querySelector<HTMLElement>(".hero__aside p");
        if (subtext) {
          subtext.textContent = block.subtext;
          subtext.hidden = !block.subtext;
        }
        const cta = hero.querySelector<HTMLAnchorElement>(".hero__cta");
        if (cta) {
          cta.firstChild!.textContent = block.ctaLabel ?? "";
          cta.href = block.ctaUrl || "#";
          cta.hidden = !block.ctaLabel;
        }
        const image = hero.querySelector<HTMLImageElement>(
          ".hero__image, .hero__poster",
        );
        if (image) {
          image.src =
            block.media.kind === "image"
              ? block.media.url
              : block.poster || block.media.posterUrl || "";
          image.alt = "";
        }
        return hero;
      }

      if (block.type === "rich_text") {
        const section = previewTemplates!.richText.cloneNode(
          true,
        ) as HTMLElement;
        const heading = section.querySelector<HTMLElement>("h2");
        if (heading) {
          heading.textContent = block.heading || "";
          heading.hidden = !block.heading;
        }
        const paragraph = section.querySelector<HTMLElement>("p");
        if (paragraph)
          paragraph.textContent = block.content.replace(/<\/?p>/gi, "").trim();
        return section;
      }

      const figure = previewTemplates!.imageFull.cloneNode(true) as HTMLElement;
      figure.classList.toggle("image-full--inset", block.variant === "inset");
      const image = figure.querySelector<HTMLImageElement>("img");
      if (image) {
        image.src = block.media.url;
        image.alt = block.media.alt;
      }
      const caption = figure.querySelector<HTMLElement>("figcaption");
      const captionText = [block.caption, block.media.credit]
        .filter(Boolean)
        .join(" · ");
      if (caption) {
        caption.textContent = captionText;
        caption.hidden = !captionText;
      }
      return figure;
    });

    main.replaceChildren(...renderedBlocks);
    const cookieBanner =
      frameDocument.querySelector<HTMLElement>(".cookie-banner");
    if (cookieBanner) cookieBanner.hidden = true;
  };

  const updatePreview = () => {
    if (current) renderPreview();
  };

  preview.addEventListener("load", () => {
    const frameDocument = preview.contentDocument;
    const main = frameDocument?.querySelector<HTMLElement>("#main-content");
    const hero = main?.querySelector<HTMLElement>(".hero");
    const richText = main?.querySelector<HTMLElement>(".text-section");
    const imageFull = main?.querySelector<HTMLElement>(".image-full");
    if (!hero || !richText || !imageFull) {
      announce(
        "Pratinjau publik tidak dapat dimuat. Pastikan halaman beranda publik tersedia.",
      );
      return;
    }
    previewTemplates = {
      hero: hero.cloneNode(true) as HTMLElement,
      richText: richText.cloneNode(true) as HTMLElement,
      imageFull: imageFull.cloneNode(true) as HTMLElement,
    };
    renderPreview();
  });
  preview.src = "/";

  const renderPageList = () => {
    const matchingPages = pages.filter((page) =>
      `${page.title} ${page.slug}`
        .toLowerCase()
        .includes(filterText.toLowerCase()),
    );

    list.replaceChildren();
    if (matchingPages.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = filterText
        ? "Tidak ada halaman yang cocok."
        : "Belum ada halaman.";
      list.append(empty);
      return;
    }

    for (const page of matchingPages) {
      const row = document.createElement("div");
      row.className = "page-row";
      const hasUnpublishedChanges =
        page.status === "published" &&
        Array.isArray(page.published) &&
        JSON.stringify(page.blocks) !== JSON.stringify(page.published);
      const statusLabel = page.isHome
        ? "Beranda"
        : hasUnpublishedChanges
          ? "Terbit · Draf Baru"
          : page.status === "published"
            ? "Terbit"
            : "Draf";
      const statusBadgeClass = page.isHome
        ? "badge badge-home"
        : page.status === "published"
          ? "badge badge-published"
          : "badge badge-draft";

      const label = document.createElement("button");
      label.className = "page-row__open";
      label.type = "button";
      label.innerHTML = `
        <div class="page-row__info">
          <strong class="page-row__title">${escapeHtml(page.title)}</strong>
          <span class="page-row__slug">/${escapeHtml(page.slug)}</span>
        </div>
        <span class="${statusBadgeClass}">${statusLabel}</span>
      `;
      label.addEventListener("click", () => openPage(page.id));

      const actions = document.createElement("div");
      actions.className = "page-row__actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn-secondary btn-sm";
      editBtn.type = "button";
      editBtn.textContent = "Sunting";
      editBtn.addEventListener("click", () => openPage(page.id));

      const duplicate = document.createElement("button");
      duplicate.className = "btn-secondary btn-sm";
      duplicate.type = "button";
      duplicate.textContent = "Duplikat";
      duplicate.setAttribute("aria-label", `Duplikat ${page.title}`);
      duplicate.addEventListener("click", () => duplicatePage(page));

      actions.append(editBtn, duplicate);
      row.append(label, actions);
      list.append(row);
    }
  };

  const getSelectedBlock = (): Block | null =>
    current?.blocks.find((block) => block.id === selectedBlockId) ?? null;

  const pushHistory = () => {
    if (!current) return;
    history = [...history.slice(-29), structuredClone(current)];
    redoHistory = [];
  };

  const queueSave = () => {
    if (!current) return;
    const issues = validatePage(current);
    if (issues.length > 0) {
      setSaveStatus("Perlu perbaikan", "error");
      announce(issues[0] ?? "Periksa bidang yang ditandai.");
      updatePreview();
      return;
    }

    clearAnnouncement();
    setSaveStatus("Belum tersimpan", "pending");
    updatePreview();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => void savePage(), 650);
  };

  const savePage = async () => {
    if (!current) return;
    const page = structuredClone(current);
    const thisVersion = ++saveVersion;
    setSaveStatus("Menyimpan…", "saving");
    const payload = {
      title: page.title,
      slug: page.slug,
      seo: page.seo,
      draft: page.blocks,
      is_home: page.isHome,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (page.isHome) {
      const { error: clearHomeError } = await client
        .from("pages")
        .update({ is_home: false })
        .eq("is_home", true)
        .neq("id", page.id);
      if (clearHomeError) {
        setSaveStatus("Gagal menyimpan", "error");
        announce(`Beranda tidak dapat dipindahkan: ${clearHomeError.message}`);
        return;
      }
    }

    const { error } = await client
      .from("pages")
      .update(payload)
      .eq("id", page.id);
    if (thisVersion !== saveVersion) return;
    if (error) {
      setSaveStatus("Gagal menyimpan", "error");
      announce(`Draf gagal disimpan: ${error.message}`);
      return;
    }

    current = { ...page, updatedAt: payload.updated_at };
    pages = pages.map((entry) =>
      entry.id === page.id ? (current as EditablePage) : entry,
    );
    setSaveStatus("Tersimpan", "saved");
    clearAnnouncement();
    renderPageList();
  };

  const addField = (
    labelText: string,
    value: string,
    onChange: (value: string) => void,
    options: { multiline?: boolean; type?: string; maxLength?: number } = {},
  ) => {
    const label = document.createElement("label");
    label.className = "editor-field";
    const title = document.createElement("span");
    title.textContent = labelText;
    const control = options.multiline
      ? document.createElement("textarea")
      : document.createElement("input");
    if (control instanceof HTMLInputElement)
      control.type = options.type ?? "text";
    if (options.maxLength) control.maxLength = options.maxLength;
    control.value = value;
    control.addEventListener("input", () => {
      onChange(control.value);
    });
    label.append(title, control);
    fields.append(label);
  };

  const addSelect = (
    labelText: string,
    value: string,
    choices: string[],
    onChange: (value: string) => void,
  ) => {
    const label = document.createElement("label");
    label.className = "editor-field";
    const title = document.createElement("span");
    title.textContent = labelText;
    const select = document.createElement("select");
    for (const choice of choices) {
      const option = document.createElement("option");
      option.value = choice;
      option.textContent = choice;
      option.selected = choice === value;
      select.append(option);
    }
    select.addEventListener("change", () => {
      onChange(select.value);
    });
    label.append(title, select);
    fields.append(label);
  };

  const renderBlockFields = () => {
    fields.replaceChildren();
    const block = getSelectedBlock();
    if (!current || !block) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Pilih blok untuk mengubah bidangnya.";
      fields.append(empty);
      return;
    }

    const updateBlock = (update: (target: Block) => void) => {
      pushHistory();
      const target = getSelectedBlock();
      if (!target) return;
      update(target);
      queueSave();
      renderBlockList();
    };

    if (block.type === "hero_media") {
      addField(
        "Headline baris 1",
        block.line1,
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media") target.line1 = value;
          }),
        { maxLength: 18 },
      );
      addField(
        "Headline baris 2",
        block.line2,
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media") target.line2 = value;
          }),
        { maxLength: 18 },
      );
      addField(
        "Subteks",
        block.subtext,
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media") target.subtext = value;
          }),
        { multiline: true, maxLength: 140 },
      );
      addSelect("Jenis media", block.media.kind, ["image", "video"], (value) =>
        updateBlock((target) => {
          if (target.type === "hero_media")
            target.media.kind = value as "image" | "video";
        }),
      );

      const heroMediaPickerBtn = document.createElement("button");
      heroMediaPickerBtn.type = "button";
      heroMediaPickerBtn.className = "btn-secondary";
      heroMediaPickerBtn.style.margin = "0.25rem 0 0.5rem 0";
      heroMediaPickerBtn.textContent = "Pilih dari Pustaka Media";
      heroMediaPickerBtn.onclick = () => {
        openMediaPicker((item) => {
          updateBlock((target) => {
            if (target.type === "hero_media") {
              target.media.url = item.url;
              target.media.filename = item.filename;
              target.media.mimeType = item.mimeType;
              target.media.alt = item.alt;
              target.media.kind = item.kind;
              if (item.posterUrl) target.poster = item.posterUrl;
            }
          });
          renderBlockFields();
        });
      };
      fields.append(heroMediaPickerBtn);

      addField(
        "URL media",
        block.media.url,
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media") target.media.url = value;
          }),
        { type: "url" },
      );
      addField("Nama file", block.media.filename, (value) =>
        updateBlock((target) => {
          if (target.type === "hero_media") target.media.filename = value;
        }),
      );
      addField("MIME type", block.media.mimeType, (value) =>
        updateBlock((target) => {
          if (target.type === "hero_media") target.media.mimeType = value;
        }),
      );
      addField("Teks alt", block.media.alt, (value) =>
        updateBlock((target) => {
          if (target.type === "hero_media") target.media.alt = value;
        }),
      );
      if (block.media.kind === "video")
        addField(
          "URL poster",
          block.poster ?? "",
          (value) =>
            updateBlock((target) => {
              if (target.type === "hero_media") target.poster = value;
            }),
          { type: "url" },
        );
      addSelect(
        "Scrim",
        block.scrimStrength,
        ["light", "medium", "heavy"],
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media")
              target.scrimStrength = value as "light" | "medium" | "heavy";
          }),
      );
      addField("Label tautan", block.ctaLabel ?? "", (value) =>
        updateBlock((target) => {
          if (target.type === "hero_media") target.ctaLabel = value;
        }),
      );
      addField(
        "URL tautan",
        block.ctaUrl ?? "",
        (value) =>
          updateBlock((target) => {
            if (target.type === "hero_media") target.ctaUrl = value;
          }),
        { type: "url" },
      );
    } else if (block.type === "rich_text") {
      addField("Judul bagian", block.heading ?? "", (value) =>
        updateBlock((target) => {
          if (target.type === "rich_text") target.heading = value;
        }),
      );
      addField(
        "Isi teks",
        block.content,
        (value) =>
          updateBlock((target) => {
            if (target.type === "rich_text") target.content = value;
          }),
        { multiline: true },
      );
    } else {
      addSelect("Tata letak", block.variant, ["full", "inset"], (value) =>
        updateBlock((target) => {
          if (target.type === "image_full")
            target.variant = value as "full" | "inset";
        }),
      );

      const imageMediaPickerBtn = document.createElement("button");
      imageMediaPickerBtn.type = "button";
      imageMediaPickerBtn.className = "btn-secondary";
      imageMediaPickerBtn.style.margin = "0.25rem 0 0.5rem 0";
      imageMediaPickerBtn.textContent = "Pilih dari Pustaka Media";
      imageMediaPickerBtn.onclick = () => {
        openMediaPicker((item) => {
          updateBlock((target) => {
            if (target.type === "image_full") {
              target.media.url = item.url;
              target.media.filename = item.filename;
              target.media.mimeType = item.mimeType;
              target.media.alt = item.alt;
            }
          });
          renderBlockFields();
        });
      };
      fields.append(imageMediaPickerBtn);

      addField(
        "URL gambar",
        block.media.url,
        (value) =>
          updateBlock((target) => {
            if (target.type === "image_full") target.media.url = value;
          }),
        { type: "url" },
      );
      addField("Nama file", block.media.filename, (value) =>
        updateBlock((target) => {
          if (target.type === "image_full") target.media.filename = value;
        }),
      );
      addField("MIME type", block.media.mimeType, (value) =>
        updateBlock((target) => {
          if (target.type === "image_full") target.media.mimeType = value;
        }),
      );
      addField("Teks alt", block.media.alt, (value) =>
        updateBlock((target) => {
          if (target.type === "image_full") target.media.alt = value;
        }),
      );
      addField(
        "Keterangan",
        block.caption ?? "",
        (value) =>
          updateBlock((target) => {
            if (target.type === "image_full") target.caption = value;
          }),
        { multiline: true },
      );
    }

    const parsed = BlockSchema.safeParse(block);
    if (!parsed.success) {
      const errors = document.createElement("ul");
      errors.className = "validation-errors";
      for (const issue of parsed.error.issues) {
        const item = document.createElement("li");
        item.textContent = issue.message;
        errors.append(item);
      }
      fields.append(errors);
    }
  };

  const moveBlock = (index: number, delta: number) => {
    if (!current) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= current.blocks.length) return;
    pushHistory();
    const nextBlocks = [...current.blocks];
    [nextBlocks[index], nextBlocks[targetIndex]] = [
      nextBlocks[targetIndex]!,
      nextBlocks[index]!,
    ];
    current = { ...current, blocks: nextBlocks };
    renderBlockList();
    renderBlockFields();
    queueSave();
  };

  const renderBlockList = () => {
    blockList.replaceChildren();
    if (!current) return;

    current.blocks.forEach((block, index) => {
      const row = document.createElement("div");
      row.className = `block-row${block.id === selectedBlockId ? " selected" : ""}`;
      const select = document.createElement("button");
      select.className = "block-row__select";
      select.type = "button";
      select.textContent = `${index + 1}. ${block.type.replaceAll("_", " ")}`;
      select.setAttribute("aria-pressed", String(block.id === selectedBlockId));
      select.addEventListener("click", () => {
        selectedBlockId = block.id;
        renderBlockList();
        renderBlockFields();
      });

      const actions = document.createElement("div");
      actions.className = "block-row__actions";
      const makeAction = (
        label: string,
        title: string,
        action: () => void,
        disabled = false,
      ) => {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.type = "button";
        button.textContent = label;
        button.title = title;
        button.setAttribute("aria-label", title);
        button.disabled = disabled;
        button.addEventListener("click", action);
        actions.append(button);
      };

      makeAction(
        "↑",
        "Pindahkan ke atas",
        () => moveBlock(index, -1),
        index === 0,
      );
      makeAction(
        "↓",
        "Pindahkan ke bawah",
        () => moveBlock(index, 1),
        index === current!.blocks.length - 1,
      );
      makeAction("⧉", "Duplikat blok", () => {
        if (!current) return;
        pushHistory();
        const copy = structuredClone(block);
        copy.id = createId();
        current = {
          ...current,
          blocks: [
            ...current.blocks.slice(0, index + 1),
            copy,
            ...current.blocks.slice(index + 1),
          ],
        };
        selectedBlockId = copy.id;
        renderBlockList();
        renderBlockFields();
        queueSave();
      });
      makeAction("×", "Hapus blok", () => {
        if (!current) return;
        pushHistory();
        current = {
          ...current,
          blocks: current.blocks.filter((entry) => entry.id !== block.id),
        };
        selectedBlockId = current.blocks[Math.max(0, index - 1)]?.id ?? null;
        renderBlockList();
        renderBlockFields();
        queueSave();
      });
      row.append(select, actions);
      blockList.append(row);
    });
  };

  const renderEditor = () => {
    if (!current || !pageForm) return;
    (pageForm.elements.namedItem("title") as HTMLInputElement).value =
      current.title;
    (pageForm.elements.namedItem("slug") as HTMLInputElement).value =
      current.slug;
    (pageForm.elements.namedItem("seo-title") as HTMLInputElement).value =
      current.seo.title;
    (
      pageForm.elements.namedItem("seo-description") as HTMLTextAreaElement
    ).value = current.seo.description;
    (pageForm.elements.namedItem("is-home") as HTMLInputElement).checked =
      current.isHome;
    renderBlockList();
    renderBlockFields();
    updatePreview();
    editor.classList.remove("hidden");
    listView.classList.add("hidden");
  };

  const openPage = (id: string) => {
    const page = pages.find((entry) => entry.id === id);
    if (!page) return;
    current = structuredClone(page);
    history = [];
    redoHistory = [];
    selectedBlockId = current.blocks[0]?.id ?? null;
    setSaveStatus("Tersimpan", "saved");
    clearAnnouncement();
    renderEditor();
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

  const createPage = async () => {
    const title = "Halaman baru";
    const baseSlug = "halaman-baru";
    let slug = baseSlug;
    let suffix = 2;
    while (pages.some((page) => page.slug === slug))
      slug = `${baseSlug}-${suffix++}`;
    const { data, error } = await client
      .from("pages")
      .insert({
        title,
        slug,
        status: "draft",
        draft: [],
        seo: { title, description: "", noIndex: true },
        is_home: false,
        updated_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      announce(`Halaman baru gagal dibuat: ${error.message}`);
      return;
    }

    const page = rowToPage(data as PageRow);
    pages = [page, ...pages];
    openPage(page.id);
    renderPageList();
  };

  const duplicatePage = async (source: EditablePage) => {
    const title = `${source.title} (salinan)`;
    const baseSlug = `${slugify(source.slug)}-salinan`;
    let slug = baseSlug;
    let suffix = 2;
    while (pages.some((page) => page.slug === slug))
      slug = `${baseSlug}-${suffix++}`;
    const { data, error } = await client
      .from("pages")
      .insert({
        title,
        slug,
        status: "draft",
        draft: structuredClone(source.blocks),
        seo: { ...source.seo, title },
        is_home: false,
        updated_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      announce(`Duplikat gagal dibuat: ${error.message}`);
      return;
    }
    const page = rowToPage(data as PageRow);
    pages = [page, ...pages];
    renderPageList();
    openPage(page.id);
  };

  const loadPages = async () => {
    setSaveStatus("Memuat halaman…", "saving");
    const { data, error } = await client
      .from("pages")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      announce(`Daftar halaman tidak dapat dimuat: ${error.message}`);
      setSaveStatus("Gagal memuat", "error");
      return;
    }
    pages = (data as PageRow[]).map(rowToPage);
    renderPageList();
    setSaveStatus("Siap", "saved");
  };

  document
    .getElementById("create-page")
    ?.addEventListener("click", () => void createPage());
  document.getElementById("page-search")?.addEventListener("input", (event) => {
    filterText = (event.currentTarget as HTMLInputElement).value;
    renderPageList();
  });
  document.getElementById("back-to-pages")?.addEventListener("click", () => {
    editor.classList.add("hidden");
    listView.classList.remove("hidden");
    renderPageList();
  });
  document.getElementById("add-block")?.addEventListener("click", () => {
    const select = document.getElementById(
      "new-block-type",
    ) as HTMLSelectElement | null;
    if (!current || !select) return;
    pushHistory();
    const block = makeBlock(select.value as BlockKind);
    current = { ...current, blocks: [...current.blocks, block] };
    selectedBlockId = block.id;
    renderBlockList();
    renderBlockFields();
    queueSave();
  });

  pageForm.addEventListener("input", (event) => {
    if (!current) return;
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.name === "is-home") return;
    pushHistory();
    if (target.name === "title") {
      current.title = target.value;
      current.seo = { ...current.seo, title: target.value.slice(0, 70) };
      (pageForm.elements.namedItem("seo-title") as HTMLInputElement).value =
        current.seo.title;
      const slugInput = pageForm.elements.namedItem("slug") as HTMLInputElement;
      if (slugInput.dataset.edited !== "true") {
        current.slug = slugify(target.value);
        slugInput.value = current.slug;
      }
    } else if (target.name === "slug") {
      target.dataset.edited = "true";
      current.slug = slugify(target.value);
      target.value = current.slug;
    } else if (target.name === "seo-title") {
      current.seo = { ...current.seo, title: target.value };
    } else if (target.name === "seo-description") {
      current.seo = { ...current.seo, description: target.value };
    }
    queueSave();
  });

  pageForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name !== "is-home" || !current) return;
    pushHistory();
    current.isHome = target.checked;
    queueSave();
  });

  document.getElementById("delete-page")?.addEventListener("click", () => {
    if (!current || current.isHome) return;
    deleteName.value = "";
    deleteConfirm.disabled = true;
    deleteDialog.showModal();
  });
  deleteName.addEventListener("input", () => {
    deleteConfirm.disabled = deleteName.value !== current?.title;
  });
  document
    .getElementById("cancel-delete")
    ?.addEventListener("click", () => deleteDialog.close());
  deleteConfirm.addEventListener("click", async () => {
    if (!current || deleteName.value !== current.title) return;
    const { error } = await client.from("pages").delete().eq("id", current.id);
    if (error) {
      deleteDialog.close();
      announce(`Halaman gagal dihapus: ${error.message}`);
      return;
    }
    pages = pages.filter((page) => page.id !== current?.id);
    current = null;
    deleteDialog.close();
    editor.classList.add("hidden");
    listView.classList.remove("hidden");
    renderPageList();
  });

  document.getElementById("undo-edit")?.addEventListener("click", () => {
    if (!current || history.length === 0) return;
    redoHistory = [...redoHistory.slice(-29), structuredClone(current)];
    current = history.pop() ?? current;
    selectedBlockId = current.blocks[0]?.id ?? null;
    renderEditor();
    queueSave();
  });
  document.getElementById("redo-edit")?.addEventListener("click", () => {
    if (!current || redoHistory.length === 0) return;
    history = [...history.slice(-29), structuredClone(current)];
    current = redoHistory.pop() ?? current;
    selectedBlockId = current.blocks[0]?.id ?? null;
    renderEditor();
    queueSave();
  });

  document.addEventListener("keydown", (event) => {
    if (
      !current ||
      !event.altKey ||
      !["ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    const index = current.blocks.findIndex(
      (block) => block.id === selectedBlockId,
    );
    if (index < 0) return;
    event.preventDefault();
    moveBlock(index, event.key === "ArrowUp" ? -1 : 1);
  });

  root
    .querySelectorAll<HTMLButtonElement>("[data-preview-size]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        root
          .querySelectorAll("[data-preview-size]")
          .forEach((item) => item.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        preview.dataset.size = button.dataset.previewSize ?? "desktop";
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>("[data-admin-view]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.adminView;
        document
          .getElementById("dashboard")
          ?.classList.toggle("hidden", view !== "dashboard");
        root?.classList.toggle("hidden", view !== "pages");
        document
          .querySelectorAll("[data-admin-view]")
          .forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        if (view === "pages") void loadPages();
      });
    });

  const publishing = new PublishingWorkflow(client, user);

  // Handler tombol Publish Halaman (Tahap 8)
  document
    .getElementById("publish-page-btn")
    ?.addEventListener("click", async () => {
      if (!current) return;
      const btn = document.getElementById(
        "publish-page-btn",
      ) as HTMLButtonElement | null;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Menerbitkan…";
      }
      setSaveStatus("Menerbitkan draf…", "saving");

      const res = await publishing.publishPage(current.id);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Terbitkan Halaman";
      }

      if (!res.success) {
        alert(res.message);
        setSaveStatus("Gagal terbit", "error");
      } else {
        alert(res.message);
        setSaveStatus("Terbit & Tayang", "saved");
        current.status = "published";
        renderPageList();
      }
    });

  // Handler tombol Riwayat Revisi & Pemulihan (Tahap 8)
  const revisionsDialog = document.getElementById(
    "revisions-dialog",
  ) as HTMLDialogElement | null;
  document
    .getElementById("close-revisions-dialog")
    ?.addEventListener("click", () => revisionsDialog?.close());

  document
    .getElementById("view-revisions-btn")
    ?.addEventListener("click", async () => {
      if (!current) return;
      const tbody = document.getElementById("revisions-table-body");
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="muted" style="text-align:center; padding:1rem;">Mengambil catatan revisi…</td></tr>';
      }
      revisionsDialog?.showModal();

      const revs = await publishing.getRevisions(current.id);
      if (!tbody) return;
      tbody.replaceChildren();

      if (revs.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          '<td colspan="4" class="muted" style="text-align:center; padding:1.5rem;">Belum ada riwayat revisi. Halaman ini belum pernah diterbitkan.</td>';
        tbody.append(tr);
        return;
      }

      for (const rev of revs) {
        const tr = document.createElement("tr");
        const dateStr = new Date(rev.created_at).toLocaleString("id-ID");
        const blocksCount = rev.snapshot.blocks?.length || 0;
        tr.innerHTML = `
        <td><strong>${dateStr}</strong></td>
        <td>${rev.snapshot.title || "-"}</td>
        <td>${blocksCount} blok</td>
        <td style="text-align: right;">
          <button class="btn-secondary" style="font-size: 11px; padding: 3px 8px;" data-restore-rev="${rev.id}">Pulihkan ke Draf</button>
        </td>
      `;

        tr.querySelector(`[data-restore-rev="${rev.id}"]`)?.addEventListener(
          "click",
          async () => {
            if (
              !confirm(
                `Pulihkan draf halaman ke versi tanggal ${dateStr}? Perubahan yang belum tersimpan akan tertimpa.`,
              )
            )
              return;
            const restoreRes = await publishing.restoreRevision(
              current!.id,
              rev.id,
            );
            if (!restoreRes.success) {
              alert(restoreRes.message);
            } else {
              alert(restoreRes.message);
              revisionsDialog?.close();
              if (restoreRes.restoredBlocks) {
                current!.blocks = restoreRes.restoredBlocks;
                current!.title = rev.snapshot.title;
                current!.slug = rev.snapshot.slug;
                current!.seo = rev.snapshot.seo;
                current!.isHome = rev.snapshot.is_home;
                selectedBlockId = current!.blocks[0]?.id ?? null;
                renderEditor();
                renderBlockList();
                renderBlockFields();
                renderPreview();
              }
            }
          },
        );

        tbody.append(tr);
      }
    });

  pageForm.addEventListener("submit", (event) => event.preventDefault());

  void loadPages();
}
