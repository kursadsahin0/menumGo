import { describe, expect, it } from 'vitest'
import { presentRestaurant } from '@/utils/menuAppearance'

describe('misafir telefonu', () => {
  it('hesap telefonunu bırakıp menü ayarındaki numarayı kullanır', () => {
    const restaurant = presentRestaurant(
      {
        name: 'Demo Kafe',
        phone: '05559876543',
        description: { tr: '', en: '' },
        address: '',
        hours: '',
        socials: [],
      },
      {
        phone: '05551234567',
        name: 'Demo Kafe',
        description: { tr: '', en: '' },
        address: { tr: '', en: '' },
        hours: { tr: '', en: '' },
      },
    )

    expect(restaurant.phone).toBe('05551234567')
  })

  it('menü telefonu boşsa hesap numarasını göstermez', () => {
    const restaurant = presentRestaurant(
      {
        name: 'Demo Kafe',
        phone: '05559876543',
        description: { tr: '', en: '' },
        address: '',
        hours: '',
        socials: [],
      },
      {
        phone: '',
        name: 'Demo Kafe',
        description: { tr: '', en: '' },
        address: { tr: '', en: '' },
        hours: { tr: '', en: '' },
      },
    )

    expect(restaurant.phone).toBe('')
  })
})
