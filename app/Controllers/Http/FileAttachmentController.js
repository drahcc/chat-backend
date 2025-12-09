'use strict'

const FileAttachment = use('App/Models/FileAttachment')
const Message = use('App/Models/Message')
const Helpers = use('Helpers')

class FileAttachmentController {
  // Upload file for a message
  async upload ({ request, auth, response, params }) {
    try {
      const user = await auth.getUser()
      const messageId = params.messageId

      // Check if message exists and user owns it
      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      if (message.user_id !== user.id) {
        return response.status(403).json({ error: 'You can only attach files to your own messages' })
      }

      const file = request.file('file', {
        size: '10mb'
      })

      if (!file) {
        return response.status(400).json({ error: 'No file provided' })
      }

      const fileName = `${user.id}_${new Date().getTime()}_${file.clientName}`
      await file.move(Helpers.publicPath('uploads/files'), {
        name: fileName,
        overwrite: true
      })

      if (!file.moved()) {
        return response.status(500).json({ error: file.error() })
      }

      // Create attachment record
      const attachment = await FileAttachment.create({
        message_id: messageId,
        filename: fileName,
        original_name: file.clientName,
        mime_type: file.type,
        file_size: file.size,
        file_path: `/uploads/files/${fileName}`
      })

      return response.json({ attachment })
    } catch (error) {
      console.error('Upload file error:', error)
      return response.status(500).json({ error: 'Failed to upload file' })
    }
  }

  // Delete file attachment
  async delete ({ auth, response, params }) {
    try {
      const user = await auth.getUser()
      const attachmentId = params.id

      const attachment = await FileAttachment.find(attachmentId)
      if (!attachment) {
        return response.status(404).json({ error: 'Attachment not found' })
      }

      // Check if user owns the message
      const message = await Message.find(attachment.message_id)
      if (message.user_id !== user.id) {
        return response.status(403).json({ error: 'You can only delete your own attachments' })
      }

      await attachment.delete()
      return response.json({ success: true })
    } catch (error) {
      console.error('Delete attachment error:', error)
      return response.status(500).json({ error: 'Failed to delete attachment' })
    }
  }
}

module.exports = FileAttachmentController
