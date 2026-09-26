import { ApiError } from '@/utils/errors'
import { wait } from '@/mocks/config'

const aliases = {
  'demo-kafe': 'burger-house',
}

const restaurants = {
  'burger-house': {
    id: 'ven_burger_house',
    slug: 'burger-house',
    name: 'Burger House',
    logo: 'photo-1568901346375-23c9450c58cd',
    description: {
      tr: 'Ateşte pişen burgerler, taş fırın pizzalar ve ev yapımı tatlılar.',
      en: 'Fire-grilled burgers, stone-baked pizzas, and house-made desserts.',
    },
    hours: {
      tr: 'Her gün 11:00 – 23:30',
      en: 'Open daily, 11:00 – 23:30',
    },
    phone: '+90 212 555 01 90',
    address: {
      tr: 'İstiklal Caddesi No: 48, Beyoğlu, İstanbul',
      en: '48 Istiklal Avenue, Beyoglu, Istanbul',
    },
    mapsUrl: 'https://maps.google.com/?q=Istiklal+Caddesi+48+Beyoglu+Istanbul',
    socials: [
      { name: 'Instagram', url: 'https://instagram.com/burgerhouse' },
      { name: 'Facebook', url: 'https://facebook.com/burgerhouse' },
      { name: 'X', url: 'https://x.com/burgerhouse' },
    ],
    categories: [
      {
        id: 'pub_starters',
        name: { tr: 'Başlangıçlar', en: 'Starters' },
        isActive: true,
        sortOrder: 1,
        products: [
          product(
            'pub_fries',
            'Trüf patates',
            'Truffle fries',
            'Parmesan ve trüf yağı ile.',
            'Parmesan and truffle oil.',
            145,
            null,
            'photo-1573080496219-bb080dd4f877',
            true,
            true,
            1,
          ),
          product(
            'pub_rings',
            'Soğan halkası',
            'Onion rings',
            'Çıtır kaplama, sarımsaklı sos.',
            'Crisp coating, garlic dip.',
            120,
            null,
            'photo-1639024471283-03518883512d',
            true,
            false,
            2,
          ),
          product(
            'pub_hummus',
            'Ev yapımı humus',
            'House hummus',
            'Zeytinyağı ve köz biber.',
            'Olive oil and roasted pepper.',
            135,
            null,
            'photo-1540189549336-e6e99c3679fe',
            false,
            false,
            3,
          ),
        ],
      },
      {
        id: 'pub_burgers',
        name: { tr: 'Burger', en: 'Burgers' },
        isActive: true,
        sortOrder: 2,
        products: [
          product(
            'pub_house',
            'House Burger',
            'House Burger',
            '180 g dana, cheddar, turşu, ev sosu.',
            '180 g beef, cheddar, pickles, house sauce.',
            285,
            245,
            'photo-1568901346375-23c9450c58cd',
            true,
            true,
            1,
          ),
          product(
            'pub_cheese',
            'Cheeseburger',
            'Cheeseburger',
            'Çift cheddar ve karamelize soğan.',
            'Double cheddar and caramelized onion.',
            265,
            null,
            'photo-1550547660-d9450f859349',
            true,
            false,
            2,
          ),
          product(
            'pub_mushroom',
            'Mantarlı burger',
            'Mushroom burger',
            'Köz mantar ve eski kaşar.',
            'Roasted mushroom and aged cheese.',
            295,
            null,
            'photo-1571091718767-18b5b1457add',
            true,
            false,
            3,
          ),
          product(
            'pub_chicken',
            'Acılı tavuk',
            'Hot chicken',
            'Çıtır tavuk, acı mayo, marul.',
            'Crispy chicken, hot mayo, lettuce.',
            275,
            null,
            'photo-1606755962773-d324e0a13086',
            false,
            false,
            4,
          ),
        ],
      },
      {
        id: 'pub_pizza',
        name: { tr: 'Pizza', en: 'Pizza' },
        isActive: true,
        sortOrder: 3,
        products: [
          product(
            'pub_margherita',
            'Margherita',
            'Margherita',
            'Domates, mozzarella, fesleğen.',
            'Tomato, mozzarella, basil.',
            240,
            null,
            'photo-1574071318508-1cdbab80d002',
            true,
            false,
            1,
          ),
          product(
            'pub_pepperoni',
            'Pepperoni',
            'Pepperoni',
            'Bol pepperoni, taş fırın.',
            'Loaded pepperoni, stone oven.',
            270,
            245,
            'photo-1628840042765-356cda07504e',
            true,
            true,
            2,
          ),
          product(
            'pub_garden',
            'Sebzeli',
            'Garden',
            'Kabak, biber, zeytin.',
            'Zucchini, pepper, olive.',
            255,
            null,
            'photo-1565299624946-b28f40a0ae38',
            true,
            false,
            3,
          ),
        ],
      },
      {
        id: 'pub_pasta',
        name: { tr: 'Makarna', en: 'Pasta' },
        isActive: true,
        sortOrder: 4,
        products: [
          product(
            'pub_alfredo',
            'Fettuccine Alfredo',
            'Fettuccine Alfredo',
            'Tereyağı, parmesan, karabiber.',
            'Butter, parmesan, black pepper.',
            260,
            null,
            'photo-1621996346565-e3dbc646d9a9',
            true,
            false,
            1,
          ),
          product(
            'pub_penne',
            'Domatesli penne',
            'Tomato penne',
            'Yavaş pişmiş domates sosu.',
            'Slow-cooked tomato sauce.',
            230,
            null,
            'photo-1473093295043-cdd812d0e601',
            true,
            false,
            2,
          ),
        ],
      },
      {
        id: 'pub_dessert',
        name: { tr: 'Tatlı', en: 'Dessert' },
        isActive: true,
        sortOrder: 5,
        products: [
          product(
            'pub_san',
            'San Sebastian',
            'San Sebastian',
            'Yanık cheesecake, bir dilim.',
            'Burnt cheesecake, one slice.',
            195,
            175,
            'photo-1533134486753-c833f0ed4866',
            true,
            true,
            1,
          ),
          product(
            'pub_brownie',
            'Brownie',
            'Brownie',
            'Sıcak, dondurma ile.',
            'Warm, with ice cream.',
            160,
            null,
            'photo-1606313564200-e75d5e30476c',
            true,
            false,
            2,
          ),
        ],
      },
      {
        id: 'pub_coffee',
        name: { tr: 'Kahve', en: 'Coffee' },
        isActive: true,
        sortOrder: 6,
        products: [
          product(
            'pub_espresso',
            'Espresso',
            'Espresso',
            'Kısa, yoğun çekim.',
            'Short and intense.',
            80,
            null,
            'photo-1511920170033-f8396924c348',
            true,
            false,
            1,
          ),
          product(
            'pub_filter',
            'Filtre kahve',
            'Filter coffee',
            'Günün çekirdeği.',
            'Coffee of the day.',
            95,
            null,
            'photo-1495474472287-4d71bcdd2085',
            true,
            false,
            2,
          ),
        ],
      },
      {
        id: 'pub_cold',
        name: { tr: 'Soğuk İçecekler', en: 'Cold drinks' },
        isActive: true,
        sortOrder: 7,
        products: [
          product(
            'pub_lemonade',
            'Limonata',
            'Lemonade',
            'Taze nane ile.',
            'With fresh mint.',
            90,
            null,
            'photo-1523677011781-c91d1bbe2fd9',
            true,
            false,
            1,
          ),
          product(
            'pub_cola',
            'Ev yapımı kola',
            'House cola',
            'Baharatlı, buzlu.',
            'Spiced, over ice.',
            75,
            null,
            'photo-1629203851122-3726ecdf080e',
            true,
            false,
            2,
          ),
        ],
      },
      {
        id: 'pub_hot',
        name: { tr: 'Sıcak İçecekler', en: 'Hot drinks' },
        isActive: true,
        sortOrder: 8,
        products: [
          product(
            'pub_tea',
            'Çay',
            'Tea',
            'Demlik çay.',
            'Freshly brewed tea.',
            45,
            null,
            'photo-1556679343-c7306c1976bc',
            true,
            false,
            1,
          ),
          product(
            'pub_salep',
            'Salep',
            'Salep',
            'Tarçın ile.',
            'With cinnamon.',
            95,
            null,
            'photo-1544787219-7f47ccb76574',
            true,
            false,
            2,
          ),
        ],
      },
    ],
  },
}

const productDetails = {
  pub_fries: {
    portion: { tr: '180 g', en: '180 g' },
    ingredients: {
      tr: 'Patates, parmesan, trüf yağı, tuz.',
      en: 'Potatoes, parmesan, truffle oil, salt.',
    },
    allergens: ['milk'],
  },
  pub_rings: {
    portion: { tr: '6 adet', en: '6 pieces' },
    ingredients: {
      tr: 'Soğan, galeta unu, sarımsaklı sos.',
      en: 'Onion, breadcrumbs, garlic dip.',
    },
    allergens: ['gluten'],
  },
  pub_hummus: {
    portion: { tr: '150 g', en: '150 g' },
    ingredients: {
      tr: 'Nohut, tahin, zeytinyağı, köz biber, limon.',
      en: 'Chickpeas, tahini, olive oil, roasted pepper, lemon.',
    },
    allergens: ['sesame'],
  },
  pub_house: {
    portion: { tr: '180 g et', en: '180 g beef' },
    ingredients: {
      tr: 'Dana köfte, brioche ekmek, cheddar, turşu, ev sosu, marul.',
      en: 'Beef patty, brioche bun, cheddar, pickles, house sauce, lettuce.',
    },
    allergens: ['gluten', 'milk', 'egg', 'mustard'],
  },
  pub_cheese: {
    portion: { tr: '160 g et', en: '160 g beef' },
    ingredients: {
      tr: 'Dana köfte, çift cheddar, karamelize soğan, brioche ekmek.',
      en: 'Beef patty, double cheddar, caramelized onion, brioche bun.',
    },
    allergens: ['gluten', 'milk', 'egg'],
  },
  pub_mushroom: {
    portion: { tr: '160 g et', en: '160 g beef' },
    ingredients: {
      tr: 'Dana köfte, köz mantar, eski kaşar, brioche ekmek.',
      en: 'Beef patty, roasted mushroom, aged cheese, brioche bun.',
    },
    allergens: ['gluten', 'milk'],
  },
  pub_chicken: {
    portion: { tr: '1 porsiyon', en: '1 serving' },
    ingredients: {
      tr: 'Çıtır tavuk, acı mayonez, marul, turşu, ekmek.',
      en: 'Crispy chicken, hot mayonnaise, lettuce, pickles, bun.',
    },
    allergens: ['gluten', 'egg', 'mustard'],
  },
  pub_margherita: {
    portion: { tr: '32 cm', en: '32 cm' },
    ingredients: {
      tr: 'Domates sosu, mozzarella, taze fesleğen, zeytinyağı.',
      en: 'Tomato sauce, mozzarella, fresh basil, olive oil.',
    },
    allergens: ['gluten', 'milk'],
  },
  pub_pepperoni: {
    portion: { tr: '32 cm', en: '32 cm' },
    ingredients: {
      tr: 'Domates sosu, mozzarella, pepperoni.',
      en: 'Tomato sauce, mozzarella, pepperoni.',
    },
    allergens: ['gluten', 'milk'],
  },
  pub_garden: {
    portion: { tr: '32 cm', en: '32 cm' },
    ingredients: {
      tr: 'Domates sosu, mozzarella, kabak, biber, zeytin, mantar.',
      en: 'Tomato sauce, mozzarella, zucchini, pepper, olive, mushroom.',
    },
    allergens: ['gluten', 'milk'],
  },
  pub_alfredo: {
    portion: { tr: '320 g', en: '320 g' },
    ingredients: {
      tr: 'Fettuccine, krema, parmesan, tereyağı, karabiber.',
      en: 'Fettuccine, cream, parmesan, butter, black pepper.',
    },
    allergens: ['gluten', 'milk'],
  },
  pub_penne: {
    portion: { tr: '320 g', en: '320 g' },
    ingredients: {
      tr: 'Penne, domates sosu, sarımsak, fesleğen.',
      en: 'Penne, tomato sauce, garlic, basil.',
    },
    allergens: ['gluten'],
  },
  pub_san: {
    portion: { tr: '1 dilim', en: '1 slice' },
    ingredients: {
      tr: 'Krem peynir, krema, yumurta, şeker.',
      en: 'Cream cheese, cream, egg, sugar.',
    },
    allergens: ['milk', 'egg'],
  },
  pub_brownie: {
    portion: { tr: '1 dilim', en: '1 slice' },
    ingredients: {
      tr: 'Bitter çikolata, tereyağı, yumurta, un, ceviz, vanilyalı dondurma.',
      en: 'Dark chocolate, butter, egg, flour, walnut, vanilla ice cream.',
    },
    allergens: ['gluten', 'milk', 'egg', 'nuts'],
  },
  pub_espresso: {
    portion: { tr: '30 ml', en: '30 ml' },
    ingredients: { tr: 'Espresso çekirdeği.', en: 'Espresso beans.' },
    allergens: [],
  },
  pub_filter: {
    portion: { tr: '200 ml', en: '200 ml' },
    ingredients: { tr: 'Filtre kahve, su.', en: 'Filter coffee, water.' },
    allergens: [],
  },
  pub_lemonade: {
    portion: { tr: '300 ml', en: '300 ml' },
    ingredients: { tr: 'Limon, nane, şeker, su.', en: 'Lemon, mint, sugar, water.' },
    allergens: [],
  },
  pub_cola: {
    portion: { tr: '330 ml', en: '330 ml' },
    ingredients: { tr: 'Kola şurubu, baharat, soda, buz.', en: 'Cola syrup, spice, soda, ice.' },
    allergens: [],
  },
  pub_tea: {
    portion: { tr: '1 bardak', en: '1 glass' },
    ingredients: { tr: 'Siyah çay.', en: 'Black tea.' },
    allergens: [],
  },
  pub_salep: {
    portion: { tr: '200 ml', en: '200 ml' },
    ingredients: { tr: 'Süt, salep, şeker, tarçın.', en: 'Milk, salep, sugar, cinnamon.' },
    allergens: ['milk'],
  },
}

function product(
  id,
  nameTr,
  nameEn,
  descriptionTr,
  descriptionEn,
  price,
  discountedPrice,
  image,
  isAvailable,
  isFeatured,
  sortOrder,
) {
  return {
    id,
    name: { tr: nameTr, en: nameEn },
    description: { tr: descriptionTr, en: descriptionEn },
    price,
    discountedPrice,
    image,
    isAvailable,
    isFeatured,
    sortOrder,
  }
}

function withDetails(item) {
  const details = productDetails[item.id] || {}

  return {
    ...item,
    portion: details.portion || null,
    ingredients: details.ingredients || null,
    allergens: details.allergens || [],
  }
}

function publishedMenu(restaurant) {
  return {
    restaurant: {
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      logo: restaurant.logo,
      description: restaurant.description,
      hours: restaurant.hours,
      phone: restaurant.phone,
      address: restaurant.address,
      mapsUrl: restaurant.mapsUrl,
      socials: restaurant.socials,
    },
    categories: restaurant.categories
      .filter((category) => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        products: [...category.products]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(withDetails),
      })),
  }
}

export async function mockListMenus() {
  await wait()

  return Object.values(restaurants).map((restaurant) => ({
    id: restaurant.id,
    venueId: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    isPublished: true,
  }))
}

export async function mockGetPublicMenu(slug) {
  await wait(80)

  const restaurant = restaurants[aliases[slug] || slug]

  if (!restaurant) {
    throw new ApiError('Menü bulunamadı.', { status: 404 })
  }

  return JSON.parse(JSON.stringify(publishedMenu(restaurant)))
}
