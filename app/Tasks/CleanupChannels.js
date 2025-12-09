const Channel = use('App/Models/Channel')

/**
 * Delete channels inactive for more than 30 days
 */
async function cleanupInactiveChannels() {
  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    const deleted = await Channel
      .query()
      .where('last_message_at', '<', cutoff.toISOString())
      .orWhereNull('last_message_at')
      .delete()

    console.log(`✅ Cleanup completed: ${deleted} inactive channels deleted`)
    return deleted
  } catch (error) {
    console.error('❌ Cleanup error:', error.message)
    throw error
  }
}

module.exports = { cleanupInactiveChannels }
