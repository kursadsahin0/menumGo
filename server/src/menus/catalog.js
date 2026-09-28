const categories = [
  { id: 'cat_kahvalti', name: 'Kahvaltı', sortOrder: 1 },
  { id: 'cat_baslangic', name: 'Başlangıçlar', sortOrder: 2 },
  { id: 'cat_ana', name: 'Ana Yemekler', sortOrder: 3 },
  { id: 'cat_burger', name: 'Burger', sortOrder: 4 },
  { id: 'cat_pizza', name: 'Pizza', sortOrder: 5 },
  { id: 'cat_makarna', name: 'Makarna', sortOrder: 6 },
  { id: 'cat_tatli', name: 'Tatlı', sortOrder: 7 },
  { id: 'cat_kahve', name: 'Kahve', sortOrder: 8 },
  { id: 'cat_soguk', name: 'Soğuk İçecekler', sortOrder: 9 },
  { id: 'cat_sicak', name: 'Sıcak İçecekler', sortOrder: 10 },
]

const byId = new Map(categories.map((category) => [category.id, category]))

export function categoryFor(categoryId) {
  return (
    byId.get(categoryId) || {
      id: 'uncategorized',
      name: 'Diğer',
      sortOrder: 999,
    }
  )
}
