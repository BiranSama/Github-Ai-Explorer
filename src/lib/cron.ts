import cron from 'node-cron'
import { prisma } from './db'
import { getRecommendations } from './recommend'
import { sendPushNotification } from './webpush'

let job: cron.ScheduledTask | null = null

export function start() {
  if (job) return
  job = cron.schedule('*/30 * * * *', async () => {
    try {
      await runPush()
    } catch (e) {
      console.error('[cron] push error:', e)
    }
  })
  console.log('[cron] started')
}

export function stop() {
  job?.stop()
  job = null
}

async function runPush() {
  const prefs = await prisma.userPreference.findFirst()
  if (!prefs?.notifyEnabled || !prefs.pushSubscription) return

  const sinceMs = prefs.notifyInterval * 60 * 1000
  if (prefs.lastNotifyAt && Date.now() - prefs.lastNotifyAt.getTime() < sinceMs) return

  const langs = ((): string[] => {
    try { return JSON.parse(prefs.preferredLanguages) } catch { return [] }
  })()
  const projects = await getRecommendations({ preferredLanguages: langs, limit: 3 })

  let pushedCount = 0
  for (const project of projects) {
    try {
      await sendPushNotification(prefs.pushSubscription, {
        title: `📈 ${project.name}`,
        body: project.aiSummary?.slice(0, 100) || project.description?.slice(0, 100) || '',
        url: `https://github.com/${project.id}`,
      })
      await prisma.pushLog.create({ data: { projectId: project.id, pushedAt: new Date() } })
      pushedCount++
    } catch (e) {
      console.error(`[cron] failed to push ${project.id}:`, e)
    }
  }

  // 只有成功推送了至少一条才更新 lastNotifyAt
  if (pushedCount > 0) {
    await prisma.userPreference.update({
      where: { id: prefs.id },
      data: { lastNotifyAt: new Date() },
    })
  }
}
