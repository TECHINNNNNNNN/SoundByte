import cron from 'node-cron'
import { processPendingDigests } from './digest.service.js'
import { prisma } from '../lib/db.js'

let schedulerJob = null
let cleanupJob = null

/**
 * Start the scheduler - runs every hour to check for pending digests
 */
export function startScheduler() {
  // Run every hour at minute 0
  schedulerJob = cron.schedule('0 * * * *', async () => {
    const hour = new Date().getUTCHours()
    console.log(`⏰ Scheduler check at ${hour}:00 UTC`)
    
    try {
      const results = await processPendingDigests()
      
      if (results.length > 0) {
        const successful = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length
        
        console.log(`📊 Processed ${results.length} digests:`)
        console.log(`  ✅ Success: ${successful}`)
        if (failed > 0) {
          console.log(`  ❌ Failed: ${failed}`)
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error.message)
    }
  })
  
  schedulerJob.start()
  console.log('📅 Scheduler started - checking every hour')
  
  // Start cleanup job - runs every 15 minutes to clean expired auth codes
  cleanupJob = cron.schedule('*/15 * * * *', async () => {
    try {
      const deleted = await prisma.authCode.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      })
      if (deleted.count > 0) {
        console.log(`🧹 Cleaned up ${deleted.count} expired auth codes`)
      }
    } catch (error) {
      console.error('Auth code cleanup error:', error.message)
    }
  })
  
  cleanupJob.start()
  console.log('🧹 Cleanup job started - checking every 15 minutes')
  
  // Run once on startup
  processPendingDigests().then(results => {
    if (results.length > 0) {
      console.log(`🚀 Startup: Processed ${results.length} pending digests`)
    }
  }).catch(console.error)
  
  // Clean expired auth codes on startup
  prisma.authCode.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  }).then(deleted => {
    if (deleted.count > 0) {
      console.log(`🧹 Startup: Cleaned up ${deleted.count} expired auth codes`)
    }
  }).catch(console.error)
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (schedulerJob) {
    schedulerJob.stop()
    schedulerJob = null
    console.log('📅 Scheduler stopped')
  }
  if (cleanupJob) {
    cleanupJob.stop()
    cleanupJob = null
    console.log('🧹 Cleanup job stopped')
  }
}

/**
 * Manually trigger digest processing (for testing)
 */
export async function triggerDigests() {
  console.log('🚀 Manually triggering digest processing...')
  const results = await processPendingDigests()
  return results
}