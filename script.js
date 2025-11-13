const defaultPack = {
  email: "gracz@adarrewards.com",
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  fragments: [
    {
      id: "xbox",
      name: "Xbox Series X",
      count: 3,
      required: 22,
      rarity: "legendary",
      art: "linear-gradient(140deg, rgba(76, 211, 202, 0.8), rgba(12, 26, 56, 0.95)), url('https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "iphone",
      name: "iPhone 15 Pro",
      count: 4,
      required: 28,
      rarity: "epic",
      art: "linear-gradient(140deg, rgba(142, 126, 244, 0.7), rgba(9, 16, 44, 0.95)), url('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "ps5",
      name: "PlayStation 5",
      count: 5,
      required: 25,
      rarity: "epic",
      art: "linear-gradient(140deg, rgba(87, 171, 255, 0.75), rgba(10, 20, 52, 0.92)), url('https://images.unsplash.com/photo-1606813902914-9b41ecad3491?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "rog-laptop",
      name: "ROG Zephyrus G16",
      count: 2,
      required: 30,
      rarity: "mythic",
      art: "linear-gradient(140deg, rgba(255, 115, 87, 0.75), rgba(15, 18, 38, 0.9)), url('https://images.unsplash.com/photo-1587202372775-98927cf68826?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "meta-quest",
      name: "Meta Quest 3",
      count: 3,
      required: 20,
      rarity: "rare",
      art: "linear-gradient(140deg, rgba(87, 255, 203, 0.6), rgba(10, 20, 44, 0.92)), url('https://images.unsplash.com/photo-1587613864265-2c1e33b6e37b?auto=format&fit=crop&w=600&q=80')",
    },
    {
      id: "dron",
      name: "Drone Explorer",
      count: 4,
      required: 18,
      rarity: "rare",
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
  packCards: document.querySelector("#pack-cards"),
  packBurst: document.querySelector("#pack-burst"),
  ambientParticles: document.querySelector("#ambient-particles"),
};

document.addEventListener("DOMContentLoaded", () => {
  elements.year.textContent = new Date().getFullYear();

  const packData = resolvePackData();
  setupUser(packData.email);

  initAmbientParticles();

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

  spawnPackCards(packData.fragments);
  triggerBurst();

  setTimeout(() => {
    elements.cardsCard.hidden = false;
    revealFragmentGroups(packData.fragments);
    elements.pack.classList.add("pack--opened");
  }, 2200);
}

function revealFragmentGroups(fragments) {
  elements.cardsGrid.innerHTML = "";
  const template = document.querySelector("#card-group-template");

  fragments.forEach((fragment, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.rewardId = fragment.id;
    if (fragment.rarity) {
      node.dataset.rarity = fragment.rarity;
    }

    const art = node.querySelector("[data-art]");
    art.style.backgroundImage = fragment.art;

    const title = node.querySelector("[data-title]");
    title.textContent = fragment.name;

    const count = node.querySelector("[data-count]");
    const rarity = fragment.rarity ? ` · ${formatRarity(fragment.rarity)}` : "";
    count.textContent = `${fragment.count} fragmentów · cel ${fragment.required}${rarity}`;

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

function formatRarity(rarity) {
  const labels = {
    mythic: "Mityczny drop",
    legendary: "Legendarny drop",
    epic: "Epicki drop",
    rare: "Rzadki drop",
    common: "Standardowy drop",
  };
  return labels[rarity] ?? rarity;
}

function createCardStack(container, count) {
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement("div");
    card.className = "card-chip";
    const rotation = (Math.random() - 0.5) * 12;
    const offsetX = (Math.random() - 0.5) * 16;
    const offsetY = Math.random() * 6;
    card.style.setProperty("--rotate", `${rotation}deg`);
    card.style.setProperty("--offset-x", `${offsetX}px`);
    card.style.setProperty("--offset-y", `${offsetY}px`);
    card.innerHTML = `
      <div class="card-chip__inner">
        <span class="card-chip__shine"></span>
        <span class="card-chip__value">+1</span>
      </div>
    `;
    card.style.transitionDelay = `${i * 70}ms`;
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
    celebrateCollection();
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
  ];

  return rewards.slice(0, 50);
}

renderCollection();

function spawnPackCards(fragments) {
  if (!elements.packCards) return;
  elements.packCards.innerHTML = "";

  const totalCards = fragments.reduce((sum, fragment) => sum + fragment.count, 0);
  const hologram = document.createElement("div");
  hologram.className = "pack-card pack-card--hologram";
  elements.packCards.appendChild(hologram);

  const cardsToSpawn = Math.min(totalCards, 18);
  for (let i = 0; i < cardsToSpawn; i += 1) {
    const card = document.createElement("div");
    card.className = "pack-card";
    const offset = (i / cardsToSpawn) * 160 - 80;
    card.style.setProperty("--offset", `${offset}px`);
    card.style.setProperty("--delay", `${i * 45}ms`);
    elements.packCards.appendChild(card);
  }
}

function triggerBurst() {
  if (!elements.packBurst) return;

  elements.packBurst.innerHTML = "";
  for (let i = 0; i < 24; i += 1) {
    const particle = document.createElement("span");
    particle.className = "pack-burst__particle";
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    particle.style.setProperty("--tx", `${x}px`);
    particle.style.setProperty("--ty", `${y}px`);
    particle.style.setProperty("--delay", `${Math.random() * 120}ms`);
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
