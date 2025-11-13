const STORAGE_KEY = "adarRewardsState";

const storage = (() => {
  try {
    const testKey = "adarRewardsStorageTest";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    console.warn("LocalStorage jest niedostępny, dane nie będą zapisywane.", error);
    return {
      getItem: () => null,
      setItem: () => {},
    };
  }
})();

const defaultRewards = [
  { id: "ps5", name: "PlayStation 5", probability: 4.2, fragmentsNeeded: 25 },
  { id: "xbox", name: "Xbox Series X", probability: 4, fragmentsNeeded: 22 },
  { id: "iphone", name: "iPhone 15 Pro", probability: 3.6, fragmentsNeeded: 28 },
  { id: "ipad", name: "iPad Pro", probability: 3.2, fragmentsNeeded: 24 },
  { id: "macbook", name: "MacBook Air M3", probability: 2.8, fragmentsNeeded: 32 },
  { id: "watch", name: "Apple Watch Ultra", probability: 2.6, fragmentsNeeded: 20 },
  { id: "dji", name: "DJI Mini 4 Pro", probability: 2.4, fragmentsNeeded: 26 },
  { id: "steamdeck", name: "Steam Deck OLED", probability: 2.2, fragmentsNeeded: 24 },
  { id: "psvr", name: "PlayStation VR2", probability: 2.1, fragmentsNeeded: 22 },
  { id: "lego", name: "LEGO Technic Lamborghini", probability: 2, fragmentsNeeded: 20 },
  { id: "tv", name: "LG OLED 55\"", probability: 1.8, fragmentsNeeded: 34 },
  { id: "soundbar", name: "Sonos Arc", probability: 1.7, fragmentsNeeded: 18 },
  { id: "camera", name: "Sony ZV-E10", probability: 1.6, fragmentsNeeded: 26 },
  { id: "switch", name: "Nintendo Switch OLED", probability: 1.5, fragmentsNeeded: 20 },
  { id: "s23", name: "Samsung Galaxy S23 Ultra", probability: 1.5, fragmentsNeeded: 30 },
  { id: "lenovo", name: "Lenovo Legion Pro", probability: 1.4, fragmentsNeeded: 28 },
  { id: "beats", name: "Beats Studio Pro", probability: 1.3, fragmentsNeeded: 16 },
  { id: "bose", name: "Bose QC Ultra", probability: 1.2, fragmentsNeeded: 14 },
  { id: "rolex", name: "Rolex Explorer", probability: 0.6, fragmentsNeeded: 48 },
  { id: "tag", name: "TAG Heuer Carrera", probability: 0.7, fragmentsNeeded: 46 },
  { id: "dyson", name: "Dyson Supersonic", probability: 1.4, fragmentsNeeded: 18 },
  { id: "coffee", name: "Sage Barista Pro", probability: 1.3, fragmentsNeeded: 18 },
  { id: "vacuum", name: "Roborock S8 Pro", probability: 1.2, fragmentsNeeded: 20 },
  { id: "gopro", name: "GoPro Hero 12", probability: 1.5, fragmentsNeeded: 18 },
  { id: "speaker", name: "Bang & Olufsen Beosound", probability: 0.9, fragmentsNeeded: 32 },
  { id: "bike", name: "Specialized Turbo Vado", probability: 0.8, fragmentsNeeded: 44 },
  { id: "monitor", name: "Alienware QD-OLED", probability: 1.2, fragmentsNeeded: 26 },
  { id: "pc", name: "RTX 4090 Gaming PC", probability: 0.7, fragmentsNeeded: 50 },
  { id: "projector", name: "XGIMI Horizon Pro", probability: 1, fragmentsNeeded: 28 },
  { id: "luggage", name: "Rimowa Classic", probability: 1.1, fragmentsNeeded: 22 },
  { id: "guitar", name: "Fender Stratocaster", probability: 1, fragmentsNeeded: 24 },
  { id: "harley", name: "Harley Davidson Weekend", probability: 0.5, fragmentsNeeded: 52 },
  { id: "vacay", name: "Weekend w SPA", probability: 1.6, fragmentsNeeded: 20 },
  { id: "citybreak", name: "City Break w Barcelonie", probability: 1.3, fragmentsNeeded: 24 },
  { id: "watch2", name: "Garmin Fenix 7", probability: 1.5, fragmentsNeeded: 22 },
  { id: "theragun", name: "Theragun Elite", probability: 1.4, fragmentsNeeded: 16 },
  { id: "bike2", name: "Elektryczna hulajnoga Segway", probability: 1.2, fragmentsNeeded: 22 },
  { id: "vr", name: "Meta Quest 3", probability: 1.6, fragmentsNeeded: 20 },
  { id: "chair", name: "Fotel Secretlab Titan", probability: 1.4, fragmentsNeeded: 18 },
  { id: "keyboard", name: "Klawiatura Keychron Q1", probability: 1.5, fragmentsNeeded: 12 },
  { id: "microphone", name: "Shure MV7", probability: 1.4, fragmentsNeeded: 14 },
  { id: "bundle", name: "Zestaw LEGO Star Wars", probability: 1.5, fragmentsNeeded: 16 },
  { id: "art", name: "Limitowany plakat Adar", probability: 2, fragmentsNeeded: 10 },
  { id: "vinyl", name: "Kolekcja winyli", probability: 1.1, fragmentsNeeded: 18 },
  { id: "whisky", name: "Whisky Macallan 18", probability: 0.9, fragmentsNeeded: 24 },
  { id: "wine", name: "Selecja win premium", probability: 1.2, fragmentsNeeded: 18 },
  { id: "spa", name: "Voucher SPA Deluxe", probability: 1.8, fragmentsNeeded: 14 },
  { id: "hotel", name: "Weekend w hotelu 5*", probability: 1.4, fragmentsNeeded: 20 },
  { id: "dinner", name: "Kolacja Michelin", probability: 1.1, fragmentsNeeded: 18 },
  { id: "karting", name: "VIP karting", probability: 1.3, fragmentsNeeded: 16 },
  { id: "flight", name: "Lot balonem", probability: 1.2, fragmentsNeeded: 16 },
  { id: "club", name: "Ekskluzywny klub golfowy", probability: 0.8, fragmentsNeeded: 40 },
];

const state = {
  rewards: [],
  collection: {},
  description: "Epicki drop — otwórz paczkę i zgarnij fragmenty supernagród.",
  fragmentsAvailable: 0,
  currentDrop: null,
  expiresAt: null,
};

const elements = {
  description: document.getElementById("dropDescription"),
  fragmentsAvailable: document.getElementById("fragmentsAvailable"),
  expiryInfo: document.getElementById("expiryInfo"),
  openPackButton: document.getElementById("openPackButton"),
  entrySection: document.getElementById("entrySection"),
  dropSection: document.getElementById("dropSection"),
  fragmentGroups: document.getElementById("fragmentGroups"),
  addToCollection: document.getElementById("addToCollection"),
  collectionSection: document.getElementById("collectionSection"),
  collectionGrid: document.getElementById("collectionGrid"),
  expiredSection: document.getElementById("expiredSection"),
  packAnimation: document.getElementById("packAnimation"),
  packBurst: document.getElementById("packBurst"),
  admin: {
    open: document.getElementById("openAdmin"),
    modal: document.getElementById("adminModal"),
    close: document.getElementById("closeAdmin"),
    descriptionInput: document.getElementById("descriptionInput"),
    rewardControls: document.getElementById("rewardControls"),
    save: document.getElementById("saveAdmin"),
    template: document.getElementById("rewardControlTemplate"),
  },
};

function loadState() {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    state.rewards = defaultRewards.map((reward) => ({ ...reward }));
    state.collection = Object.fromEntries(state.rewards.map((r) => [r.id, { owned: 0 }]));
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.rewards = (parsed.rewards ?? defaultRewards).map((reward) => ({
      ...reward,
      fragmentsNeeded: Number(reward.fragmentsNeeded) || 1,
      probability: Number(reward.probability) || 1,
    }));
    state.description = parsed.description || state.description;
    state.collection = Object.fromEntries(
      state.rewards.map((reward) => [reward.id, parsed.collection?.[reward.id] ?? { owned: 0 }])
    );
  } catch (error) {
    console.warn("Nie udało się odczytać zapisanych danych.", error);
    state.rewards = defaultRewards.map((reward) => ({ ...reward }));
    state.collection = Object.fromEntries(state.rewards.map((r) => [r.id, { owned: 0 }]));
  }
}

function persistState() {
  const payload = {
    rewards: state.rewards,
    collection: state.collection,
    description: state.description,
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function setupInitialState() {
  const params = new URLSearchParams(window.location.search);
  const fragmentsParam = Number(params.get("fragments"));
  const expiresParam = params.get("expires");
  const issuedAtParam = params.get("issued");

  const fallbackFragments = randomBetween(2, 5);
  state.fragmentsAvailable = Number.isFinite(fragmentsParam) && fragmentsParam > 0 ? fragmentsParam : fallbackFragments;

  if (expiresParam) {
    state.expiresAt = new Date(expiresParam);
  } else if (issuedAtParam) {
    const issued = new Date(issuedAtParam);
    state.expiresAt = new Date(issued.getTime() + 3 * 24 * 60 * 60 * 1000);
  } else {
    state.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  const now = new Date();
  if (!state.expiresAt || now > state.expiresAt) {
    elements.entrySection.classList.add("hidden");
    elements.dropSection.classList.add("hidden");
    elements.collectionSection.classList.add("hidden");
    elements.expiredSection.classList.remove("hidden");
    return;
  }

  elements.fragmentsAvailable.textContent = state.fragmentsAvailable;
  elements.description.textContent = state.description;
  elements.expiryInfo.textContent = state.expiresAt.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(rewards) {
  const totalWeight = rewards.reduce((sum, reward) => sum + reward.probability, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of rewards) {
    if (roll < reward.probability) {
      return reward;
    }
    roll -= reward.probability;
  }
  return rewards[rewards.length - 1];
}

function triggerPackAnimation() {
  elements.packAnimation.classList.remove("open");
  void elements.packAnimation.offsetWidth;
  elements.packAnimation.classList.add("open");
  elements.packBurst?.classList.remove("active");
  void elements.packBurst?.offsetWidth;
  elements.packBurst?.classList.add("active");
  emitPackParticles();
}

function buildDrop() {
  const pulls = state.fragmentsAvailable || randomBetween(2, 5);
  const drop = {};
  for (let index = 0; index < pulls; index += 1) {
    const reward = weightedRandom(state.rewards);
    drop[reward.id] = (drop[reward.id] ?? 0) + 1;
  }
  state.currentDrop = drop;
  state.fragmentsAvailable = 0;
}

function emitPackParticles() {
  const particleCount = randomBetween(6, 10);
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement("span");
    particle.className = "pack-particle";
    particle.style.left = `${40 + Math.random() * 20}%`;
    particle.style.top = `${40 + Math.random() * 10}%`;
    particle.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 160}px`);
    particle.style.animationDelay = `${Math.random() * 0.4}s`;
    elements.packAnimation.appendChild(particle);
    setTimeout(() => particle.remove(), 1800);
  }
}

function renderDrop() {
  elements.fragmentGroups.innerHTML = "";
  if (!state.currentDrop) return;

  const sortedGroups = Object.entries(state.currentDrop).sort(([, a], [, b]) => b - a);
  sortedGroups.forEach(([rewardId, count], index) => {
    const reward = state.rewards.find((item) => item.id === rewardId);
    if (!reward) return;

    const card = document.createElement("article");
    card.className = "fragment-card";
    card.style.animationDelay = `${index * 0.12}s`;

    const stack = document.createElement("div");
    stack.className = "fragment-stack";
    const stackSize = Math.min(count, 4);
    for (let n = 0; n < stackSize; n += 1) {
      const miniCard = document.createElement("span");
      miniCard.className = "card";
      miniCard.style.animationDelay = `${n * -0.8}s`;
      stack.appendChild(miniCard);
    }

    const title = document.createElement("h3");
    title.textContent = reward.name;

    const countBadge = document.createElement("p");
    countBadge.className = "count";
    countBadge.textContent = `+${count}`;

    const progress = document.createElement("p");
    progress.className = "progress";
    const owned = (state.collection[rewardId]?.owned ?? 0) + count;
    progress.textContent = `${owned} z ${reward.fragmentsNeeded} fragmentów`;

    card.append(stack, title, countBadge, progress);
    elements.fragmentGroups.appendChild(card);
  });
}

function renderCollection() {
  elements.collectionGrid.innerHTML = "";
  state.rewards.forEach((reward) => {
    const owned = state.collection[reward.id]?.owned ?? 0;
    const card = document.createElement("article");
    card.className = "reward-card";
    if (owned > 0) card.classList.add("active");

    const title = document.createElement("h3");
    title.className = "reward-title";
    title.textContent = reward.name;

    const progress = document.createElement("p");
    progress.className = "reward-progress";
    progress.innerHTML = `${owned} <span>/ ${reward.fragmentsNeeded}</span>`;

    const fragmentsRow = document.createElement("div");
    fragmentsRow.className = "reward-fragments";
    const indicatorCount = Math.min(Math.max(owned, 3), 8);
    for (let i = 0; i < indicatorCount; i += 1) {
      const fragment = document.createElement("span");
      fragment.style.animationDelay = `${(i % 4) * -1.2}s`;
      fragmentsRow.appendChild(fragment);
    }

    card.append(title, progress, fragmentsRow);
    elements.collectionGrid.appendChild(card);
  });
}

function revealDropSection() {
  elements.dropSection.classList.remove("hidden");
  elements.dropSection.classList.add("revealed");
  elements.addToCollection.focus({ preventScroll: true });
}

function hideEntrySection() {
  elements.entrySection.classList.add("collapsed");
  setTimeout(() => {
    elements.entrySection.classList.add("hidden");
  }, 800);
}

function showOnlyCollectedRewards() {
  elements.collectionGrid.classList.add("only-active");
}

function animateCollectionFlow() {
  const flow = document.createElement("div");
  flow.className = "collection-flow";
  const streaks = randomBetween(8, 14);
  for (let s = 0; s < streaks; s += 1) {
    const streak = document.createElement("span");
    streak.className = "streak";
    streak.style.left = `${Math.random() * 100}%`;
    streak.style.animationDelay = `${Math.random() * 0.35}s`;
    flow.appendChild(streak);
  }
  for (let h = 0; h < 3; h += 1) {
    const halo = document.createElement("span");
    halo.className = "halo";
    halo.style.left = `${20 + h * 30}%`;
    halo.style.top = `${40 + Math.random() * 20}%`;
    flow.appendChild(halo);
  }
  document.body.appendChild(flow);
  setTimeout(() => flow.remove(), 1800);
}

function addDropToCollection() {
  if (!state.currentDrop) return;
  Object.entries(state.currentDrop).forEach(([rewardId, amount]) => {
    const existing = state.collection[rewardId] ?? { owned: 0 };
    existing.owned += amount;
    state.collection[rewardId] = existing;
  });
  state.currentDrop = null;
  persistState();
  renderCollection();
  showOnlyCollectedRewards();
  animateCollectionFlow();
  elements.dropSection.classList.add("hidden");
  elements.collectionSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupAdminPanel() {
  const { admin } = elements;

  function populateControls() {
    admin.rewardControls.innerHTML = "";
    state.rewards.forEach((reward) => {
      const clone = admin.template.content.firstElementChild.cloneNode(true);
      const nameInput = clone.querySelector('[data-field="name"]');
      const probabilityInput = clone.querySelector('[data-field="probability"]');
      const fragmentsInput = clone.querySelector('[data-field="fragmentsNeeded"]');
      nameInput.value = reward.name;
      probabilityInput.value = reward.probability;
      fragmentsInput.value = reward.fragmentsNeeded;
      nameInput.addEventListener("input", () => {
        reward.name = nameInput.value;
        renderCollection();
        if (state.currentDrop) renderDrop();
      });
      probabilityInput.addEventListener("input", () => {
        reward.probability = Math.max(Number(probabilityInput.value) || 0, 0);
      });
      fragmentsInput.addEventListener("input", () => {
        reward.fragmentsNeeded = Math.max(Number(fragmentsInput.value) || 1, 1);
        renderCollection();
        if (state.currentDrop) renderDrop();
      });
      admin.rewardControls.appendChild(clone);
    });
    admin.descriptionInput.value = state.description;
  }

  admin.open.addEventListener("click", () => {
    populateControls();
    admin.modal.classList.remove("hidden");
    admin.descriptionInput.focus();
  });

  admin.close.addEventListener("click", () => {
    admin.modal.classList.add("hidden");
  });

  admin.modal.addEventListener("click", (event) => {
    if (event.target === admin.modal) admin.modal.classList.add("hidden");
  });

  admin.save.addEventListener("click", () => {
    state.description = admin.descriptionInput.value.trim() || state.description;
    elements.description.textContent = state.description;
    persistState();
    admin.modal.classList.add("hidden");
  });
}

function wireEvents() {
  elements.openPackButton.addEventListener("click", () => {
    elements.openPackButton.disabled = true;
    triggerPackAnimation();
    hideEntrySection();
    setTimeout(() => {
      buildDrop();
      renderDrop();
      revealDropSection();
    }, 1300);
  });

  elements.addToCollection.addEventListener("click", () => {
    addDropToCollection();
  });
}

function bootstrap() {
  loadState();
  setupInitialState();
  renderCollection();
  setupAdminPanel();
  wireEvents();
  persistState();
}

document.addEventListener("DOMContentLoaded", bootstrap);
