import webpush from 'web-push'
import { prisma } from './db'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:localhost@localhost'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

export async function sendPushNotification(
  subscription: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('[webpush] VAPID keys not configured, skipping push')
    return
  }
  try {
    const sub = JSON.parse(subscription)
    await webpush.sendNotification(sub, JSON.stringify(payload))
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err.statusCode === 404 || err.statusCode === 410) {
      // 订阅失效，清理
      const prefs = await prisma.userPreference.findFirst({ where: { pushSubscription: subscription } })
      if (prefs) {
        await prisma.userPreference.update({
          where: { id: prefs.id },
          data: { pushSubscription: null, notifyEnabled: false },
        })
      }
    }
    throw e
  }
}
