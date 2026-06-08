import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'
import { FREE_SHIPPING_KES } from '@/constants/commerce'

export type CurrencyCode = 'KES' | 'USD' | 'UGX' | 'TZS' | 'RWF' | 'ETB'

export interface CurrencyOption {
  code: CurrencyCode
  name: string
  locale: string
  /** Multiply KES base amount to get this currency */
  rateFromKes: number
  /** ISO 4217 minor unit digits */
  fractionDigits: number
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'KES', name: 'Kenyan Shilling', locale: 'en-KE', rateFromKes: 1, fractionDigits: 0 },
  { code: 'USD', name: 'US Dollar', locale: 'en-US', rateFromKes: 1 / 130, fractionDigits: 2 },
  { code: 'UGX', name: 'Ugandan Shilling', locale: 'en-UG', rateFromKes: 29, fractionDigits: 0 },
  { code: 'TZS', name: 'Tanzanian Shilling', locale: 'en-TZ', rateFromKes: 19, fractionDigits: 0 },
  { code: 'RWF', name: 'Rwandan Franc', locale: 'en-RW', rateFromKes: 10, fractionDigits: 0 },
  { code: 'ETB', name: 'Ethiopian Birr', locale: 'en-ET', rateFromKes: 0.45, fractionDigits: 2 },
]

const CURRENCY_KEY = 'lumi_currency'
const VALID_CODES = new Set(CURRENCIES.map((c) => c.code))

function normalizeCurrency(code: string | null | undefined): CurrencyCode {
  return VALID_CODES.has(code as CurrencyCode) ? (code as CurrencyCode) : 'KES'
}

export const useCurrencyStore = defineStore('currency', () => {
  const currency = ref<CurrencyCode>(normalizeCurrency(getStorage<string>(CURRENCY_KEY, 'KES')))

  const current = computed(() => CURRENCIES.find((c) => c.code === currency.value) ?? CURRENCIES[0])

  const freeShippingThresholdKes = computed(() => FREE_SHIPPING_KES)
  const freeShippingThreshold = computed(() => convertFromKes(FREE_SHIPPING_KES))

  function setCurrency(code: CurrencyCode) {
    currency.value = normalizeCurrency(code)
  }

  function convertFromKes(amountKes: number): number {
    return amountKes * current.value.rateFromKes
  }

  function format(amountKes: number): string {
    const converted = convertFromKes(amountKes)
    const digits = current.value.fractionDigits
    return new Intl.NumberFormat(current.value.locale, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(converted)
  }

  watch(currency, (val) => setStorage(CURRENCY_KEY, val))

  return { currency, current, CURRENCIES, setCurrency, convertFromKes, format, freeShippingThreshold, freeShippingThresholdKes }
})
