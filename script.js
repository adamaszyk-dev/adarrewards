const defaultPack = {
  email: "gracz@adarrewards.com",
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  fragments: [
    {
      id: "xbox",
      name: "Xbox Series X",
      count: 3,
      required: 22,
      art: "linear-gradient(140deg, rgba(76, 211, 202, 0.8), rgba(12, 26, 56, 0.95)), url('https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "iphone",
      name: "iPhone 15 Pro",
      count: 4,
      required: 28,
      art: "linear-gradient(140deg, rgba(142, 126, 244, 0.7), rgba(9, 16, 44, 0.95)), url('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ps5",
      name: "PlayStation 5",
      count: 5,
      required: 25,
      art: "linear-gradient(140deg, rgba(87, 171, 255, 0.75), rgba(10, 20, 52, 0.92)), url('https://images.unsplash.com/photo-1606813902914-9b41ecad3491?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "dron",
      name: "Drone Explorer",
      count: 3,
      required: 18,
      art: "linear-gradient(140deg, rgba(255, 160, 122, 0.7), rgba(24, 22, 56, 0.92)), url('https://images.unsplash.com/photo-1465146633011-14f8e0781093?auto=format&fit=crop&w=600&q=80')",
    },
  ],
};

const rewardsCatalog = generateRewardsCatalog();

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
};

document.addEventListener("DOMContentLoaded", () => {
  elements.year.textContent = new Date().getFullYear();

  const packData = resolvePackData();
  setupUser(packData.email);

  if (isExpired(packData.expiresAt)) {
    elements.expiredCard.hidden = false;
    return;
  }

  elements.packCount.textContent = packData.fragments.reduce((sum, f) => sum + f.count, 0);
  elements.packCard.hidden = false;

  elements.openPack?.addEventListener("click", () => handleOpenPack(packData));
  elements.addToCollection?.addEventListener("click", () => handleAddToCollection(packData));
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
  elements.userInfo.textContent = `Zalogowano jako: ${email}`;
}

function handleOpenPack(packData) {
  elements.pack.classList.add("pack--opening");
  elements.openPack.disabled = true;

  setTimeout(() => {
    elements.cardsCard.hidden = false;
    revealFragmentGroups(packData.fragments);
  }, 1100);
}

function revealFragmentGroups(fragments) {
  elements.cardsGrid.innerHTML = "";
  const template = document.querySelector("#card-group-template");

  fragments.forEach((fragment, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.rewardId = fragment.id;

    const art = node.querySelector("[data-art]");
    art.style.backgroundImage = fragment.art;

    const title = node.querySelector("[data-title]");
    title.textContent = fragment.name;

    const count = node.querySelector("[data-count]");
    count.textContent = `${fragment.count} fragmentów · cel ${fragment.required}`;

    const stack = node.querySelector("[data-stack]");
    createCardStack(stack, fragment.count);

    elements.cardsGrid.appendChild(node);

    requestAnimationFrame(() => {
      setTimeout(() => {
        node.classList.add("revealed");
        animateStack(stack);
      }, index * 400 + 200);
    });
  });

  setTimeout(() => {
    elements.addToCollection.disabled = false;
  }, fragments.length * 400 + 1200);
}

function createCardStack(container, count) {
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement("div");
    card.className = "card-chip";
    card.textContent = `+1`;
    card.style.transitionDelay = `${i * 80}ms`;
    container.appendChild(card);
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

function handleAddToCollection(packData) {
  elements.addToCollection.disabled = true;
  const groups = [...elements.cardsGrid.querySelectorAll(".card-group")];

  groups.forEach((group, index) => {
    setTimeout(() => {
      group.classList.add("card-group--sent");
    }, index * 120);
  });

  setTimeout(() => {
    elements.collectionCard.hidden = false;
    updateCollection(packData.fragments);
  }, groups.length * 120 + 600);
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

  rewardsCatalog.forEach((reward) => {
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
      bar.style.background = "linear-gradient(120deg, #4fd3aa, #a8ff78)";
      count.textContent += " · Nagroda gotowa!";
    }

    if (reward.justUpdated) {
      node.classList.add("collection-item--active");
      setTimeout(() => {
        node.classList.remove("collection-item--active");
        reward.justUpdated = false;
      }, 2400);
    }

    elements.collectionGrid.appendChild(node);
  });
}

function generateRewardsCatalog() {
  const featured = [
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
      id: "dron",
      name: "Drone Explorer",
      required: 18,
      collected: 8,
      art: "linear-gradient(120deg, rgba(255, 160, 122, 0.35), rgba(28, 22, 60, 0.9)), url('https://images.unsplash.com/photo-1465146633011-14f8e0781093?auto=format&fit=crop&w=600&q=80')",
    },
  ];

  const extraNames = [
    "Gaming Laptop",
    "Smartwatch Titanium",
    "Electric Scooter",
    "VR Headset",
    "Soundbar Premium",
    "Kamera Sportowa",
    "Projektor 4K",
    "Zestaw Audio Hi-Fi",
    "Smart TV 65\"",
    "Robot Sprzątający",
    "Zestaw Klocków Technic",
    "Voucher Podróżny",
    "Zestaw Fitness",
    "Rowerek MTB",
    "Drukarka 3D",
    "Gitara Elektryczna",
    "Zestaw Baristy",
    "Konsola Retro",
    "Kurs Online",
    "Tablet Pro",
    "Kamera Bezlusterkowa",
    "Monitor UltraWide",
    "Fotel Gamingowy",
    "Zestaw Smart Home",
    "Głośnik Premium",
    "Kolekcja Win",
    "Rower Elektryczny",
    "Ekspres do Kawy",
    "Zestaw Narzędzi Pro",
    "Kurs Pilotażu Drona",
    "Weekend SPA",
    "Zestaw Ogrodowy",
    "Kamera 360°",
    "Pakiet Kursów IT",
    "Voucher Restauracyjny",
    "Zestaw Planszówek",
    "Abonament Muzyczny",
    "Pakiet Streamingowy",
    "Zestaw Fotograficzny",
    "Desk Setup",
    "Podróż w Nieznane",
    "Biżuteria Premium",
    "Zestaw LEGO Collector",
    "Kolekcja Komiksów",
    "Zestaw Teatralny",
    "Sprzęt Wspinaczkowy",
    "Pakiet Nauki Języka",
    "Zestaw Smakosza",
    "Kolekcja Winylowa",
    "Adventure Box",
  ];

  const palette = [
    "linear-gradient(120deg, rgba(103, 183, 255, 0.3), rgba(8, 12, 28, 0.92))",
    "linear-gradient(120deg, rgba(87, 255, 203, 0.3), rgba(6, 10, 24, 0.9))",
    "linear-gradient(120deg, rgba(255, 192, 130, 0.3), rgba(20, 12, 44, 0.9))",
    "linear-gradient(120deg, rgba(255, 108, 168, 0.3), rgba(28, 12, 44, 0.9))",
    "linear-gradient(120deg, rgba(156, 108, 255, 0.3), rgba(16, 12, 44, 0.9))",
  ];

  const rewards = [...featured];

  extraNames.forEach((name, index) => {
    rewards.push({
      id: `reward-${index}`,
      name,
      required: 15 + ((index * 3) % 20),
      collected: Math.floor(Math.random() * 10),
      art: `${palette[index % palette.length]}, url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80')`,
    });
  });

  return rewards.slice(0, 50);
}

renderCollection();
