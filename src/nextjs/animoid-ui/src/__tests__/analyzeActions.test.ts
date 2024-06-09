import { test } from 'vitest'
import startScanning, { startSecondScan } from '../app/analyze/actions'

test('firstScan', async ({ expect }) => {
  process.env.GPT4_ONLY = ''
  const formData = new FormData()
  await expect(startScanning(formData)).rejects.toThrow('Missing GPT4_ONLY in .env')

  process.env.GPT4_ONLY = 'true'
  const result = await startScanning(formData)
  expect(result).toBe('Firts scan bypassed...')
})

test('secondScan', async ({ expect }) => {
  process.env.GPT4_ONLY = ''
  const formData = new FormData()
  await expect(startSecondScan(formData)).rejects.toThrow('Missing GPT4_ONLY in .env')
})