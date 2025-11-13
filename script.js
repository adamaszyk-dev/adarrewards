const rarityOrder = ["ultimate", "mythic", "legendary", "epic", "rare", "common"];

const defaultRarityLabels = {
  ultimate: "Ultimate drop",
  mythic: "Mityczny drop",
  legendary: "Legendarny drop",
  epic: "Epicki drop",
  rare: "Rzadki drop",
  common: "Standardowy drop",
};

const rarityShortLabels = {
  ultimate: "ULT",
  mythic: "MYT",
  legendary: "LEG",
  epic: "EPC",
  rare: "RARE",
  common: "STD",
};

let rarityLabels = { ...defaultRarityLabels };

const defaultPack = {
  email: "gracz@adarrewards.com",
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  fragments: [
    {
      id: "xbox",
      name: "Xbox Series X",
      count: 2,
      required: 22,
      rarity: "legendary",
      accent: "#42ffd5",
      art: "linear-gradient(150deg, rgba(64, 226, 209, 0.85), rgba(12, 26, 56, 0.95)), url('https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "iphone",
      name: "iPhone 15 Pro",
      count: 1,
      required: 28,
      rarity: "epic",
      accent: "#9c8bff",
      art: "linear-gradient(150deg, rgba(142, 126, 244, 0.78), rgba(9, 16, 44, 0.95)), url('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ps5",
      name: "PlayStation 5",
      count: 1,
      required: 25,
      rarity: "epic",
      accent: "#63cfff",
      art: "linear-gradient(150deg, rgba(87, 171, 255, 0.78), rgba(10, 20, 52, 0.92)), url('https://images.unsplash.com/photo-1606813902914-9b41ecad3491?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "steam-deck",
      name: "Steam Deck OLED",
      count: 1,
      required: 24,
      rarity: "rare",
      accent: "#4fffc4",
      art: "linear-gradient(150deg, rgba(103, 255, 212, 0.72), rgba(10, 18, 36, 0.94)), url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=600&q=80')",
    },
  ],
};

let rewardsCatalog = generateRewardsCatalog();
let activePackData = null;
let currentEmail = "";

const elements = {
  userInfo: document.querySelector("#user-info"),
  expiredCard: document.querySelector("#expired-card"),
  packCard: document.querySelector("#pack-card"),
  cardsCard: document.querySelector("#cards-card"),
  collectionCard: document.querySelector("#collection-card"),
  packCount: document.querySelector("#pack-count"),
  openPack: document.querySelector("#open-pack"),
  addToCollection: document.querySelector("#add-to-collection"),
  cardsGrid: document.querySelector("#cards-grid"),
  collectionGrid: document.querySelector("#collection-grid"),
  year: document.querySelector("#year"),
  pack: document.querySelector(".pack"),
  packCards: document.querySelector("#pack-cards"),
  packBurst: document.querySelector("#pack-burst"),
  ambientParticles: document.querySelector("#ambient-particles"),
  collectionStatus: document.querySelector("#collection-status"),
  collectionStatusSubtitle: document.querySelector("#collection-status-subtitle"),
  adminLink: document.querySelector("#admin-link"),
  adminPanel: document.querySelector("#admin-panel"),
  adminRewards: document.querySelector("#admin-rewards"),
  rarityForm: document.querySelector("#rarity-form"),
  adminSave: document.querySelector("#admin-save"),
};

document.addEventListener("DOMContentLoaded", () => {
  elements.year.textContent = new Date().getFullYear();

  elements.packCard.hidden = true;
  elements.cardsCard.hidden = true;
  elements.collectionCard.hidden = true;

  const packData = resolvePackData();
  activePackData = {
    ...packData,
    fragments: packData.fragments.map((fragment) => ({ ...fragment })),
  };

  setupUser(packData.email);

  initAmbientParticles();
  initAdminPanel();
  updateActiveFragmentsFromCatalog();

  if (isExpired(packData.expiresAt)) {
    elements.expiredCard.hidden = false;
    return;
  }

  elements.packCount.textContent = activePackData.fragments.reduce((sum, f) => sum + f.count, 0);
  elements.packCard.hidden = false;

  elements.openPack?.addEventListener("click", () => handleOpenPack());
  elements.addToCollection?.addEventListener("click", () => handleAddToCollection());
});

function resolvePackData() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") ?? defaultPack.email;
  const expiresParam = params.get("expires");
  const fragmentsParam = params.get("fragments");
  let fragments = defaultPack.fragments;

  if (fragmentsParam) {
    try {
      const decoded = JSON.parse(atob(fragmentsParam));
      if (Array.isArray(decoded)) {
        fragments = decoded.map((fragment) => ({
          ...fragment,
          art:
            fragment.art ??
            "linear-gradient(140deg, rgba(103,183,255,0.7), rgba(10, 16, 44, 0.92))",
        }));
      }
    } catch (error) {
      console.warn("Nie udało się odczytać fragmentów z parametru URL:", error);
    }
  }

  const expiresAt = expiresParam ? new Date(expiresParam).toISOString() : defaultPack.expiresAt;

  return { email, expiresAt, fragments };
}

function isExpired(expiresAt) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  return expiryDate.getTime() < now.getTime();
}

function setupUser(email) {
  currentEmail = email;
  elements.userInfo.textContent = `Zalogowano jako: ${email}`;
}

function initAdminPanel() {
  if (!elements.adminPanel || !elements.adminLink) {
    return;
  }

  elements.adminLink.addEventListener("click", (event) => {
    event.preventDefault();
    openAdminPanel();
  });

  const closers = elements.adminPanel.querySelectorAll("[data-admin-close]");
  closers.forEach((node) => {
    node.addEventListener("click", () => closeAdminPanel());
  });

  elements.adminPanel.addEventListener("click", (event) => {
    if (event.target === elements.adminPanel) {
      closeAdminPanel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.adminPanel.hidden) {
      closeAdminPanel();
    }
  });

  elements.adminSave?.addEventListener("click", () => handleAdminSave());
}

function openAdminPanel() {
  if (!elements.adminPanel) return;
  renderAdminRewards();
  renderRarityForm();
  elements.adminPanel.hidden = false;
  requestAnimationFrame(() => {
    elements.adminPanel.classList.add("is-visible");
  });
}

function closeAdminPanel() {
  if (!elements.adminPanel || elements.adminPanel.hidden) {
    return;
  }
  elements.adminPanel.classList.remove("is-visible");
  const onTransitionEnd = () => {
    elements.adminPanel.hidden = true;
  };
  elements.adminPanel.addEventListener("transitionend", onTransitionEnd, { once: true });
}

function renderAdminRewards() {
  if (!elements.adminRewards) {
    return;
  }
  elements.adminRewards.innerHTML = "";

  rewardsCatalog.forEach((reward, index) => {
    const row = document.createElement("div");
    row.className = "admin-reward";
    row.dataset.rewardId = reward.id;

    const probability = Number.isFinite(reward.probability)
      ? reward.probability
      : computeDefaultProbability(reward.required);

    const header = document.createElement("div");
    header.className = "admin-reward__header";

    const badge = document.createElement("span");
    badge.className = "admin-reward__badge";
    badge.textContent = String(index + 1).padStart(2, "0");
    header.appendChild(badge);

    const nameInput = document.createElement("input");
    nameInput.className = "admin-input admin-reward__name";
    nameInput.type = "text";
    nameInput.value = reward.name;
    nameInput.dataset.field = "name";
    header.appendChild(nameInput);

    const inputs = document.createElement("div");
    inputs.className = "admin-reward__inputs";

    const probabilityField = document.createElement("label");
    probabilityField.className = "admin-field";
    const probabilityLabel = document.createElement("span");
    probabilityLabel.className = "admin-field__label";
    probabilityLabel.textContent = "Prawdopodobieństwo (%)";
    const probabilityInput = document.createElement("input");
    probabilityInput.className = "admin-input";
    probabilityInput.type = "number";
    probabilityInput.min = "0";
    probabilityInput.max = "100";
    probabilityInput.step = "0.1";
    probabilityInput.value = probability;
    probabilityInput.dataset.field = "probability";
    probabilityField.append(probabilityLabel, probabilityInput);

    const requiredField = document.createElement("label");
    requiredField.className = "admin-field";
    const requiredLabel = document.createElement("span");
    requiredLabel.className = "admin-field__label";
    requiredLabel.textContent = "Wymagane fragmenty";
    const requiredInput = document.createElement("input");
    requiredInput.className = "admin-input";
    requiredInput.type = "number";
    requiredInput.min = "1";
    requiredInput.value = reward.required;
    requiredInput.dataset.field = "required";
    requiredField.append(requiredLabel, requiredInput);

    inputs.append(probabilityField, requiredField);

    row.append(header, inputs);

    elements.adminRewards.appendChild(row);
  });
}

function renderRarityForm() {
  if (!elements.rarityForm) {
    return;
  }
  elements.rarityForm.innerHTML = "";

  rarityOrder.forEach((key) => {
    const label = rarityLabels[key] ?? defaultRarityLabels[key] ?? `${capitalize(key)} drop`;
    const field = document.createElement("label");
    field.className = "admin-rarity";
    field.dataset.rarity = key;
    field.innerHTML = `
      <span class="admin-rarity__label">${formatAdminRarityLabel(key)}</span>
      <input class="admin-input" type="text" value="${label}" data-rarity="${key}" />
    `;
    elements.rarityForm.appendChild(field);
  });
}

function handleAdminSave() {
  if (!elements.adminRewards) {
    return;
  }

  const rows = elements.adminRewards.querySelectorAll(".admin-reward");
  rows.forEach((row) => {
    const id = row.dataset.rewardId;
    if (!id) return;
    const reward = rewardsCatalog.find((item) => item.id === id);
    if (!reward) return;

    const nameInput = row.querySelector('[data-field="name"]');
    const probabilityInput = row.querySelector('[data-field="probability"]');
    const requiredInput = row.querySelector('[data-field="required"]');

    const nextName = (nameInput?.value ?? reward.name).trim() || reward.name;
    const parsedProbability = parseFloat(probabilityInput?.value ?? "0");
    const parsedRequired = parseInt(requiredInput?.value ?? `${reward.required}`, 10);

    reward.name = nextName;
    reward.required = Number.isFinite(parsedRequired) && parsedRequired > 0 ? parsedRequired : reward.required;
    const normalizedProbability = Number.isFinite(parsedProbability)
      ? Math.min(100, Math.max(0, parsedProbability))
      : undefined;

    reward.probability = normalizedProbability !== undefined
      ? Number(normalizedProbability.toFixed(1))
      : reward.probability ?? computeDefaultProbability(reward.required);
  });

  if (elements.rarityForm) {
    const inputs = elements.rarityForm.querySelectorAll("input[data-rarity]");
    inputs.forEach((input) => {
      const key = input.dataset.rarity;
      if (!key) return;
      const value = input.value.trim();
      rarityLabels[key] = value || defaultRarityLabels[key] || `${capitalize(key)} drop`;
    });
  }

  updateActiveFragmentsFromCatalog();
  applyRarityLabelUpdates();

  if (!elements.collectionCard.hidden) {
    renderCollection();
  }

  if (!elements.cardsCard.hidden) {
    refreshVisibleFragmentCards();
  }

  closeAdminPanel();
}

function updateActiveFragmentsFromCatalog() {
  const applyRewardData = (fragment) => {
    const reward = rewardsCatalog.find((item) => item.id === fragment.id);
    if (!reward) return fragment;
    return {
      ...fragment,
      name: reward.name,
      required: reward.required,
    };
  };

  if (activePackData) {
    activePackData.fragments = activePackData.fragments.map(applyRewardData);
  }

  defaultPack.fragments = defaultPack.fragments.map(applyRewardData);
}

function applyRarityLabelUpdates() {
  rarityOrder.forEach((key) => {
    if (!rarityLabels[key] || !rarityLabels[key].trim()) {
      rarityLabels[key] = defaultRarityLabels[key] || `${capitalize(key)} drop`;
    }
  });
}

function refreshVisibleFragmentCards() {
  const groups = elements.cardsGrid?.querySelectorAll(".card-group");
  if (!groups) {
    return;
  }

  groups.forEach((group) => {
    const rewardId = group.dataset.rewardId;
    if (!rewardId) return;
    const fragment = activePackData?.fragments.find((item) => item.id === rewardId);
    if (!fragment) return;

    const title = group.querySelector("[data-title]");
    if (title) {
      title.textContent = fragment.name;
    }

    const rarityLabel = fragment.rarity ? ` · ${formatRarity(fragment.rarity)}` : "";
    const count = group.querySelector("[data-count]");
    if (count) {
      count.textContent = `${fragment.count} fragmentów · cel ${fragment.required}${rarityLabel}`;
    }

    const rarityText = group.querySelector("[data-rarity-text]");
    if (rarityText && fragment.rarity) {
      rarityText.textContent = formatRarity(fragment.rarity);
    }

    const chips = group.querySelectorAll(".card-chip__rarity");
    chips.forEach((node) => {
      const chipRarity = node.closest(".card-chip")?.dataset.rarity;
      if (chipRarity) {
        node.textContent = formatRarityShort(chipRarity);
      }
    });
  });
}

function handleOpenPack(packData = activePackData) {
  if (!packData) return;
  elements.pack.classList.add("pack--opening");
  elements.openPack.disabled = true;
  hideCollectionStatus();
  elements.cardsCard.classList.remove("card--ready");
  elements.cardsCard.classList.remove("card--sending");
  elements.addToCollection.disabled = true;

  spawnPackCards(packData.fragments);
  triggerBurst();

  setTimeout(() => {
    elements.pack.classList.add("pack--opened");
    elements.packCard.classList.add("card--closing");
    setTimeout(() => {
      elements.packCard.hidden = true;
      elements.packCard.classList.remove("card--closing");
    }, 650);

    elements.cardsCard.hidden = false;
    elements.cardsCard.classList.add("card--revealing");
    elements.cardsCard.classList.remove("card--closing");
    revealFragmentGroups(packData.fragments);
  }, 2200);
}

function revealFragmentGroups(fragments) {
  elements.cardsGrid.innerHTML = "";
  const template = document.querySelector("#card-group-template");
  const baseDelay = 680;

  fragments.forEach((fragment, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.rewardId = fragment.id;
    if (fragment.rarity) {
      node.dataset.rarity = fragment.rarity;
    }

    node.style.setProperty("--stagger", `${index * 0.22}s`);

    const accent = fragment.accent ?? getRarityAccent(fragment.rarity);
    if (accent) {
      node.style.setProperty("--rarity-accent", accent);
    }

    const art = node.querySelector("[data-art]");
    art.style.backgroundImage = fragment.art;

    const title = node.querySelector("[data-title]");
    title.textContent = fragment.name;

    const count = node.querySelector("[data-count]");
    const rarity = fragment.rarity ? ` · ${formatRarity(fragment.rarity)}` : "";
    count.textContent = `${fragment.count} fragmentów · cel ${fragment.required}${rarity}`;

    const rarityTag = node.querySelector("[data-rarity-text]");
    if (rarityTag) {
      rarityTag.textContent = formatRarity(fragment.rarity);
    }

    const shardsBadge = node.querySelector("[data-shards]");
    if (shardsBadge) {
      shardsBadge.textContent = `+${fragment.count}`;
    }

    const preview = node.querySelector(".card-preview");
    if (preview && accent) {
      preview.style.setProperty("--rarity-accent", accent);
    }

    const stack = node.querySelector("[data-stack]");
    createCardStack(stack, fragment.count, fragment.rarity, accent);

    elements.cardsGrid.appendChild(node);

    requestAnimationFrame(() => {
      setTimeout(() => {
        node.classList.add("revealed");
        preview?.classList.add("card-preview--revealed");
        animateStack(stack);
      }, index * baseDelay + 240);
    });
  });

  setTimeout(() => {
    elements.addToCollection.disabled = false;
    elements.cardsCard.classList.remove("card--revealing");
    elements.cardsCard.classList.add("card--ready");
  }, fragments.length * baseDelay + 1600);
}

function formatRarity(rarity) {
  if (!rarity) {
    return "Fragment nagrody";
  }
  const label = rarityLabels[rarity];
  if (label && label.trim()) {
    return label;
  }
  return defaultRarityLabels[rarity] ?? `${capitalize(rarity)} drop`;
}

function formatRarityShort(rarity) {
  if (!rarity) {
    return "FRG";
  }
  return rarityShortLabels[rarity] ?? rarity.slice(0, 3).toUpperCase();
}

function formatAdminRarityLabel(key) {
  const base = defaultRarityLabels[key];
  if (base) {
    return base.replace(/\s*drop$/i, "");
  }
  return capitalize(key);
}

function capitalize(value) {
  if (!value) return "";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getRarityAccent(rarity) {
  const colors = {
    ultimate: "#ff9559",
    mythic: "#ff6f91",
    legendary: "#ffd166",
    epic: "#b397ff",
    rare: "#67b7ff",
    common: "#8fd1ff",
  };
  return colors[rarity] ?? "#67b7ff";
}

function createCardStack(container, totalCount, rarity, accent) {
  container.innerHTML = "";
  const visualCount = Math.min(totalCount, 5);

  for (let i = 0; i < visualCount; i += 1) {
    const card = document.createElement("div");
    card.className = "card-chip";
    const progress = visualCount === 1 ? 0.5 : i / (visualCount - 1);
    const rotation = (progress - 0.5) * 22;
    const offsetX = (progress - 0.5) * 46;
    const offsetY = (Math.random() - 0.5) * 18;
    const depth = progress * 14;
    card.style.setProperty("--rotate", `${rotation}deg`);
    card.style.setProperty("--offset-x", `${offsetX}px`);
    card.style.setProperty("--offset-y", `${offsetY}px`);
    card.style.setProperty("--depth", `${depth}px`);
    card.style.setProperty("--float-delay", `${0.6 + Math.random() * 1.8}s`);
    if (accent) {
      card.style.setProperty("--accent", accent);
    }
    card.innerHTML = `
      <div class="card-chip__inner">
        <span class="card-chip__shine"></span>
        <span class="card-chip__label">Fragment</span>
        <span class="card-chip__value">+1</span>
        <span class="card-chip__rarity">${formatRarityShort(rarity)}</span>
      </div>
    `;
    card.dataset.rarity = rarity ?? "common";
    card.style.transitionDelay = `${i * 110}ms`;
    container.appendChild(card);
  }

  if (totalCount > visualCount) {
    const summaryCard = document.createElement("div");
    summaryCard.className = "card-chip card-chip--total";
    summaryCard.dataset.rarity = rarity ?? "common";
    if (accent) {
      summaryCard.style.setProperty("--accent", accent);
    }
    summaryCard.innerHTML = `
      <div class="card-chip__inner">
        <span class="card-chip__shine"></span>
        <span class="card-chip__label">Łącznie</span>
        <span class="card-chip__value">+${totalCount}</span>
        <span class="card-chip__rarity">${formatRarityShort(rarity)}</span>
      </div>
    `;
    summaryCard.style.setProperty("--rotate", "0deg");
    summaryCard.style.setProperty("--offset-x", "0px");
    summaryCard.style.setProperty("--offset-y", "-4px");
    summaryCard.style.setProperty("--depth", "18px");
    summaryCard.style.setProperty("--float-delay", `${1.2 + visualCount * 0.2}s`);
    summaryCard.style.transitionDelay = `${visualCount * 110}ms`;
    container.appendChild(summaryCard);
  }
}

function animateStack(container) {
  const cards = container.querySelectorAll(".card-chip");
  cards.forEach((card) => {
    requestAnimationFrame(() => {
      card.classList.add("revealed");
    });
  });
}

function handleAddToCollection(packData = activePackData) {
  if (!packData) return;
  elements.addToCollection.disabled = true;
  elements.cardsCard.classList.add("card--sending");
  const groups = [...elements.cardsGrid.querySelectorAll(".card-group")];

  groups.forEach((group, index) => {
    const delay = index * 160;
    setTimeout(() => {
      group.classList.add("card-group--sent");
    }, delay);
  });

  const exitDuration = groups.length * 160 + 700;

  setTimeout(() => {
    elements.cardsCard.classList.add("card--closing");
  }, Math.max(exitDuration - 260, 0));

  setTimeout(() => {
    elements.collectionCard.hidden = false;
    updateCollection(packData.fragments);
    celebrateCollection();
    showCollectionStatus();
    requestAnimationFrame(() => {
      elements.collectionCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, exitDuration);

  setTimeout(() => {
    elements.cardsCard.hidden = true;
    elements.cardsGrid.innerHTML = "";
    elements.cardsCard.classList.remove("card--sending");
    elements.cardsCard.classList.remove("card--ready");
    elements.cardsCard.classList.remove("card--revealing");
    elements.cardsCard.classList.remove("card--closing");
  }, exitDuration + 320);
}

function updateCollection(newFragments) {
  newFragments.forEach((fragment) => {
    const reward = rewardsCatalog.find((item) => item.id === fragment.id);
    if (reward) {
      reward.collected = Math.min(reward.required, reward.collected + fragment.count);
      reward.justUpdated = true;
    }
  });

  renderCollection();
}

function renderCollection() {
  elements.collectionGrid.innerHTML = "";
  const template = document.querySelector("#collection-item-template");

  const visibleRewards = rewardsCatalog
    .filter((reward) => reward.collected > 0)
    .sort((a, b) => {
      if (a.justUpdated && !b.justUpdated) return -1;
      if (!a.justUpdated && b.justUpdated) return 1;
      const aProgress = a.collected / a.required;
      const bProgress = b.collected / b.required;
      return bProgress - aProgress;
    });

  if (!visibleRewards.length) {
    const empty = document.createElement("p");
    empty.className = "collection-empty";
    empty.textContent = "Jeszcze nie masz żadnych fragmentów w swoim zbiorze.";
    elements.collectionGrid.appendChild(empty);
    return;
  }

  visibleRewards.forEach((reward) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.rewardId = reward.id;

    const art = node.querySelector("[data-art]");
    art.style.backgroundImage = reward.art;

    const title = node.querySelector("[data-title]");
    title.textContent = reward.name;

    const count = node.querySelector("[data-count]");
    count.textContent = `${reward.collected} z ${reward.required} fragmentów`;

    const bar = node.querySelector("[data-bar]");
    const progress = Math.min(100, Math.round((reward.collected / reward.required) * 100));
    bar.style.width = `${progress}%`;

    if (reward.collected >= reward.required) {
      node.classList.add("collection-item--complete");
      bar.style.background = "linear-gradient(120deg, #4fd3aa, #a8ff78)";
      count.textContent += " · Nagroda gotowa!";
    }

    if (reward.justUpdated) {
      node.classList.add("collection-item--active");
      setTimeout(() => {
        node.classList.remove("collection-item--active");
        reward.justUpdated = false;
      }, 2800);
    }

    elements.collectionGrid.appendChild(node);
  });
}

function showCollectionStatus() {
  if (!elements.collectionStatus || !elements.collectionStatusSubtitle) {
    return;
  }
  const safeEmail = currentEmail || "twój adres";
  elements.collectionStatusSubtitle.textContent = `Klient przypisany do adresu ${safeEmail} posiada pełne uprawnienia. Nie wykryto podejrzanej aktywności.`;
  elements.collectionStatus.hidden = false;
  requestAnimationFrame(() => {
    elements.collectionStatus.classList.add("collection-status--visible");
  });
}

function hideCollectionStatus() {
  if (!elements.collectionStatus) {
    return;
  }
  const node = elements.collectionStatus;
  if (node.hidden) {
    node.classList.remove("collection-status--visible");
    return;
  }
  node.classList.remove("collection-status--visible");
  const onTransitionEnd = () => {
    node.hidden = true;
    node.removeEventListener("transitionend", onTransitionEnd);
  };
  node.addEventListener("transitionend", onTransitionEnd);
}

function computeDefaultProbability(required) {
  const baseline = 52;
  const diff = Math.max(0, baseline - (required ?? 0));
  const raw = diff * 0.6 + 2.5;
  const clamped = Math.min(40, Math.max(0.5, raw));
  return Number(clamped.toFixed(1));
}

function generateRewardsCatalog() {
  const rewards = [
    {
      id: "xbox",
      name: "Xbox Series X",
      required: 22,
      collected: 9,
      art: "linear-gradient(120deg, rgba(67, 240, 220, 0.3), rgba(20, 30, 66, 0.9)), url('https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "iphone",
      name: "iPhone 15 Pro",
      required: 28,
      collected: 12,
      art: "linear-gradient(120deg, rgba(142, 126, 244, 0.25), rgba(12, 16, 44, 0.92)), url('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ps5",
      name: "PlayStation 5",
      required: 25,
      collected: 17,
      art: "linear-gradient(120deg, rgba(87, 171, 255, 0.3), rgba(8, 14, 32, 0.9)), url('https://images.unsplash.com/photo-1606813902914-9b41ecad3491?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "rog-laptop",
      name: "ROG Zephyrus G16",
      required: 30,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 115, 87, 0.35), rgba(15, 18, 38, 0.92)), url('https://images.unsplash.com/photo-1587202372775-98927cf68826?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "meta-quest",
      name: "Meta Quest 3",
      required: 20,
      collected: 11,
      art: "linear-gradient(120deg, rgba(87, 255, 203, 0.35), rgba(10, 20, 44, 0.92)), url('https://images.unsplash.com/photo-1587613864265-2c1e33b6e37b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "dron",
      name: "Drone Explorer",
      required: 18,
      collected: 8,
      art: "linear-gradient(120deg, rgba(255, 160, 122, 0.35), rgba(28, 22, 60, 0.9)), url('https://images.unsplash.com/photo-1465146633011-14f8e0781093?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "macbook-pro",
      name: "MacBook Pro 16\"",
      required: 32,
      collected: 10,
      art: "linear-gradient(120deg, rgba(118, 168, 255, 0.3), rgba(12, 18, 34, 0.9)), url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "alienware-monitor",
      name: "Alienware QD-OLED",
      required: 24,
      collected: 4,
      art: "linear-gradient(120deg, rgba(123, 255, 244, 0.3), rgba(10, 18, 46, 0.9)), url('https://images.unsplash.com/photo-1587202372775-bc37aa1d8c9e?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "beats-headphones",
      name: "Beats Studio Pro",
      required: 18,
      collected: 7,
      art: "linear-gradient(120deg, rgba(255, 108, 168, 0.3), rgba(26, 12, 44, 0.9)), url('https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "sony-soundbar",
      name: "Sony Dolby Atmos Soundbar",
      required: 19,
      collected: 9,
      art: "linear-gradient(120deg, rgba(255, 196, 87, 0.3), rgba(20, 14, 32, 0.9)), url('https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "dyson-supersonic",
      name: "Dyson Supersonic",
      required: 16,
      collected: 3,
      art: "linear-gradient(120deg, rgba(255, 128, 186, 0.32), rgba(28, 12, 40, 0.9)), url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "mavic-3",
      name: "DJI Mavic 3",
      required: 26,
      collected: 14,
      art: "linear-gradient(120deg, rgba(255, 174, 87, 0.35), rgba(18, 18, 44, 0.92)), url('https://images.unsplash.com/photo-1508612761958-e931b20e272b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "canon-r6",
      name: "Canon EOS R6 II",
      required: 27,
      collected: 13,
      art: "linear-gradient(120deg, rgba(102, 205, 255, 0.32), rgba(12, 16, 40, 0.92)), url('https://images.unsplash.com/photo-1508898578281-774ac4893c0c?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "gopro-hero",
      name: "GoPro Hero 12",
      required: 18,
      collected: 5,
      art: "linear-gradient(120deg, rgba(87, 255, 222, 0.32), rgba(10, 16, 36, 0.92)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ipad-pro",
      name: "iPad Pro 13\"",
      required: 21,
      collected: 9,
      art: "linear-gradient(120deg, rgba(142, 126, 244, 0.28), rgba(12, 16, 44, 0.92)), url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "lenovo-legion",
      name: "Lenovo Legion Tower",
      required: 29,
      collected: 6,
      art: "linear-gradient(120deg, rgba(88, 145, 255, 0.35), rgba(12, 14, 34, 0.92)), url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "asus-proart",
      name: "Asus ProArt Studio",
      required: 28,
      collected: 3,
      art: "linear-gradient(120deg, rgba(255, 204, 160, 0.32), rgba(26, 22, 44, 0.92)), url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "razer-chair",
      name: "Razer Iskur V2",
      required: 17,
      collected: 8,
      art: "linear-gradient(120deg, rgba(144, 255, 174, 0.35), rgba(10, 18, 20, 0.9)), url('https://images.unsplash.com/photo-1587206668281-6cb0a06da9f2?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "logitech-g-pro",
      name: "Logitech G Pro Set",
      required: 16,
      collected: 2,
      art: "linear-gradient(120deg, rgba(97, 201, 255, 0.32), rgba(12, 16, 32, 0.92)), url('https://images.unsplash.com/photo-1587202372775-98927cf68826?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "steelseries-arctis",
      name: "SteelSeries Arctis Nova",
      required: 14,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 108, 168, 0.28), rgba(24, 12, 44, 0.9)), url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ferrari-experience",
      name: "Ferrari Track Day",
      required: 40,
      collected: 12,
      art: "linear-gradient(120deg, rgba(255, 81, 81, 0.32), rgba(34, 10, 18, 0.92)), url('https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "cyberpunk-bike",
      name: "Custom Cyberpunk Bike",
      required: 35,
      collected: 5,
      art: "linear-gradient(120deg, rgba(255, 158, 66, 0.32), rgba(26, 18, 44, 0.92)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "tag-heuer",
      name: "TAG Heuer Carrera",
      required: 27,
      collected: 9,
      art: "linear-gradient(120deg, rgba(108, 255, 221, 0.32), rgba(10, 14, 26, 0.92)), url('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "marshall-speaker",
      name: "Marshall Woburn III",
      required: 20,
      collected: 11,
      art: "linear-gradient(120deg, rgba(255, 186, 108, 0.32), rgba(24, 18, 18, 0.92)), url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "brompton-bike",
      name: "Brompton Electric",
      required: 33,
      collected: 7,
      art: "linear-gradient(120deg, rgba(255, 207, 87, 0.32), rgba(16, 22, 30, 0.92)), url('https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "nike-sneakers",
      name: "Nike Air Mag",
      required: 22,
      collected: 5,
      art: "linear-gradient(120deg, rgba(127, 255, 212, 0.32), rgba(8, 18, 36, 0.92)), url('https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "fender-strat",
      name: "Fender Stratocaster",
      required: 24,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 126, 159, 0.32), rgba(26, 16, 32, 0.9)), url('https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "espresso-luxe",
      name: "La Marzocco Linea Mini",
      required: 28,
      collected: 12,
      art: "linear-gradient(120deg, rgba(255, 172, 120, 0.32), rgba(26, 16, 24, 0.92)), url('https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "leica-q3",
      name: "Leica Q3",
      required: 36,
      collected: 9,
      art: "linear-gradient(120deg, rgba(255, 208, 150, 0.32), rgba(26, 22, 18, 0.92)), url('https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "samsung-neo",
      name: "Samsung Neo QLED 75\"",
      required: 30,
      collected: 10,
      art: "linear-gradient(120deg, rgba(87, 205, 255, 0.32), rgba(14, 20, 28, 0.92)), url('https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "nordic-track",
      name: "NordicTrack S22i",
      required: 26,
      collected: 4,
      art: "linear-gradient(120deg, rgba(147, 255, 181, 0.32), rgba(12, 18, 16, 0.92)), url('https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "yacht-weekend",
      name: "Yacht Weekend",
      required: 42,
      collected: 15,
      art: "linear-gradient(120deg, rgba(120, 210, 255, 0.32), rgba(12, 18, 32, 0.92)), url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "paris-trip",
      name: "Luksusowy Weekend w Paryżu",
      required: 34,
      collected: 13,
      art: "linear-gradient(120deg, rgba(255, 188, 144, 0.32), rgba(32, 18, 24, 0.92)), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "gaming-room",
      name: "Metamorfoza Gaming Room",
      required: 38,
      collected: 11,
      art: "linear-gradient(120deg, rgba(123, 144, 255, 0.32), rgba(12, 14, 32, 0.92)), url('https://images.unsplash.com/photo-1587202372775-98927cf68826?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "lego-ucs",
      name: "LEGO Star Wars UCS",
      required: 23,
      collected: 7,
      art: "linear-gradient(120deg, rgba(255, 165, 89, 0.32), rgba(26, 16, 20, 0.92)), url('https://images.unsplash.com/photo-1585366119957-5ef211ef4136?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "vinyl-collection",
      name: "Kolekcja Winylowa Deluxe",
      required: 19,
      collected: 5,
      art: "linear-gradient(120deg, rgba(255, 108, 164, 0.32), rgba(26, 16, 32, 0.92)), url('https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "chef-masterclass",
      name: "Masterclass Szefa Kuchni",
      required: 21,
      collected: 8,
      art: "linear-gradient(120deg, rgba(255, 214, 141, 0.32), rgba(28, 18, 14, 0.92)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "zen-retreat",
      name: "Retreat Wellness w Alpach",
      required: 37,
      collected: 9,
      art: "linear-gradient(120deg, rgba(172, 255, 219, 0.32), rgba(12, 18, 18, 0.92)), url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "martini-bar",
      name: "Premium Martini Bar",
      required: 25,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 201, 142, 0.32), rgba(20, 12, 16, 0.92)), url('https://images.unsplash.com/photo-1546171753-97d7676e0ed1?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "astro-experience",
      name: "Noc w Obserwatorium",
      required: 20,
      collected: 4,
      art: "linear-gradient(120deg, rgba(144, 160, 255, 0.32), rgba(12, 12, 28, 0.92)), url('https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "luxury-watch",
      name: "Omega Speedmaster",
      required: 29,
      collected: 7,
      art: "linear-gradient(120deg, rgba(255, 218, 157, 0.32), rgba(28, 22, 16, 0.92)), url('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "signature-perfume",
      name: "Signature Fragrance Atelier",
      required: 18,
      collected: 3,
      art: "linear-gradient(120deg, rgba(255, 174, 217, 0.32), rgba(26, 16, 26, 0.92)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "atelier-tailor",
      name: "Szyty na miarę Garnitur",
      required: 24,
      collected: 6,
      art: "linear-gradient(120deg, rgba(170, 220, 255, 0.32), rgba(16, 18, 26, 0.92)), url('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "luxury-parfum",
      name: "Tom Ford Private Blend",
      required: 17,
      collected: 5,
      art: "linear-gradient(120deg, rgba(255, 210, 172, 0.32), rgba(22, 16, 12, 0.92)), url('https://images.unsplash.com/photo-1524583036995-1523491db425?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "smart-home",
      name: "Kompletny Smart Home",
      required: 33,
      collected: 12,
      art: "linear-gradient(120deg, rgba(132, 212, 255, 0.32), rgba(12, 22, 32, 0.92)), url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "tesla-test-drive",
      name: "Weekend z Teslą Model S",
      required: 35,
      collected: 9,
      art: "linear-gradient(120deg, rgba(255, 94, 94, 0.32), rgba(26, 16, 18, 0.92)), url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "steam-deck",
      name: "Steam Deck OLED",
      required: 24,
      collected: 8,
      art: "linear-gradient(120deg, rgba(111, 255, 214, 0.32), rgba(10, 18, 36, 0.92)), url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "maldives-retreat",
      name: "Maldives Infinity Retreat",
      required: 42,
      collected: 7,
      art: "linear-gradient(120deg, rgba(118, 236, 255, 0.32), rgba(10, 26, 40, 0.92)), url('https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "lamborghini-huracan",
      name: "Lamborghini Huracán Evo",
      required: 48,
      collected: 10,
      art: "linear-gradient(120deg, rgba(255, 123, 84, 0.35), rgba(34, 12, 18, 0.92)), url('https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "private-jet",
      name: "Weekend w Prywatnym Odrzutowcu",
      required: 55,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 215, 180, 0.32), rgba(24, 22, 32, 0.92)), url('https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "grand-prix",
      name: "Monaco Grand Prix VIP",
      required: 52,
      collected: 9,
      art: "linear-gradient(120deg, rgba(255, 94, 151, 0.35), rgba(34, 10, 28, 0.92)), url('https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "antarctic-expedition",
      name: "Ekspedycja Antarktyczna",
      required: 60,
      collected: 5,
      art: "linear-gradient(120deg, rgba(168, 220, 255, 0.35), rgba(12, 18, 26, 0.92)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "diamond-collection",
      name: "Diamentowa Kolekcja",
      required: 40,
      collected: 8,
      art: "linear-gradient(120deg, rgba(255, 255, 255, 0.32), rgba(18, 20, 32, 0.92)), url('https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "luxury-yacht",
      name: "Rejs Luksusowym Jachtem",
      required: 47,
      collected: 9,
      art: "linear-gradient(120deg, rgba(120, 210, 255, 0.32), rgba(12, 18, 32, 0.92)), url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "metaverse-suite",
      name: "Metaverse Suite VR",
      required: 36,
      collected: 11,
      art: "linear-gradient(120deg, rgba(151, 126, 255, 0.32), rgba(14, 10, 32, 0.92)), url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "sky-villa",
      name: "Sky Villa Penthouse",
      required: 44,
      collected: 12,
      art: "linear-gradient(120deg, rgba(255, 205, 148, 0.32), rgba(22, 18, 24, 0.92)), url('https://images.unsplash.com/photo-1524234107056-1c1f48f64ab7?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "zen-garden",
      name: "Prywatny Japoński Ogród",
      required: 30,
      collected: 9,
      art: "linear-gradient(120deg, rgba(183, 255, 200, 0.32), rgba(12, 26, 18, 0.92)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ultimate-pc",
      name: "Ultimate Creator PC",
      required: 34,
      collected: 14,
      art: "linear-gradient(120deg, rgba(123, 200, 255, 0.32), rgba(12, 16, 28, 0.92)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "immersive-simulator",
      name: "Symulator F1 360°",
      required: 39,
      collected: 6,
      art: "linear-gradient(120deg, rgba(255, 137, 105, 0.32), rgba(26, 16, 26, 0.92)), url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "aurora-cabin",
      name: "Domek pod Zorzą Polarną",
      required: 38,
      collected: 7,
      art: "linear-gradient(120deg, rgba(146, 212, 255, 0.32), rgba(12, 20, 34, 0.92)), url('https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "skydiving-pro",
      name: "Skydiving Pro Tour",
      required: 28,
      collected: 8,
      art: "linear-gradient(120deg, rgba(255, 196, 122, 0.32), rgba(18, 18, 32, 0.92)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80')",
    },
  ];

  return rewards
    .map((reward) => ({
      ...reward,
      probability: reward.probability ?? computeDefaultProbability(reward.required),
    }))
    .slice(0, 50);
}

renderCollection();

function spawnPackCards(fragments) {
  if (!elements.packCards) return;
  elements.packCards.innerHTML = "";

  const totalCards = fragments.reduce((sum, fragment) => sum + fragment.count, 0);
  const hologram = document.createElement("div");
  hologram.className = "pack-card pack-card--hologram";
  elements.packCards.appendChild(hologram);

  const cardsToSpawn = Math.min(totalCards, 20);
  for (let i = 0; i < cardsToSpawn; i += 1) {
    const card = document.createElement("div");
    card.className = "pack-card";
    const span = cardsToSpawn > 1 ? cardsToSpawn - 1 : 1;
    const offset = (i / span) * 160 - 80;
    const tilt = (Math.random() - 0.5) * 18;
    const rise = 60 + Math.random() * 50;
    const hue = Math.floor(180 + Math.random() * 160);
    card.style.setProperty("--offset", `${offset}px`);
    card.style.setProperty("--tilt", `${tilt}deg`);
    card.style.setProperty("--rise", `${rise}px`);
    card.style.setProperty("--delay", `${i * 55}ms`);
    card.style.setProperty("--hue", `${hue}`);
    elements.packCards.appendChild(card);
  }
}

function triggerBurst() {
  if (!elements.packBurst) return;

  elements.packBurst.innerHTML = "";
  const palette = ["#34d1ff", "#7d6bff", "#ffaf40", "#4fd3aa", "#ff4f6d", "#ffd166"];

  for (let i = 0; i < 28; i += 1) {
    const particle = document.createElement("span");
    particle.className = "pack-burst__particle";
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    particle.style.setProperty("--tx", `${x}px`);
    particle.style.setProperty("--ty", `${y}px`);
    particle.style.setProperty("--delay", `${Math.random() * 160}ms`);
    particle.style.setProperty("--scale", `${0.6 + Math.random() * 0.7}`);
    const color = palette[i % palette.length];
    particle.style.background = color;
    particle.style.boxShadow = `0 0 18px ${color}`;
    elements.packBurst.appendChild(particle);
  }
}

function celebrateCollection() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti";
  document.body.appendChild(confettiContainer);

  const colors = ["#67b7ff", "#34d1ff", "#ffaf40", "#4fd3aa", "#ff4f6d"];
  const confettiCount = 80;
  for (let i = 0; i < confettiCount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti__piece";
    piece.style.background = colors[i % colors.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 200}ms`;
    piece.style.setProperty("--fall", `${80 + Math.random() * 40}vh`);
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.classList.add("confetti--fade");
    setTimeout(() => confettiContainer.remove(), 1200);
  }, 1600);
}

function initAmbientParticles() {
  if (!elements.ambientParticles) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 40; i += 1) {
    const particle = document.createElement("span");
    particle.className = "ambient__particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;
    fragment.appendChild(particle);
  }
  elements.ambientParticles.appendChild(fragment);
}
