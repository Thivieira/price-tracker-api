// import { FastifyReply, FastifyRequest } from 'fastify'
// import { env } from '@/env'
// import { isImage } from '@/utils/is-image'
// import { UserProfileService } from '@/services/prisma/user-profile'
// import { makeUpdateUserProfileUseCase } from '@/use-cases/factories/profile/make-update-user-profile-use-case'
// import { SupabaseStorageService } from '@/services/supabase'
// import { SharpService } from '@/services/sharp'
// import { EncryptionService } from '@/services/encryption'

// interface UpdateProfileRequest {
//   avatar: any
// }

// export async function updateProfilePhoto(
//   request: FastifyRequest<{ Body: UpdateProfileRequest }>,
//   reply: FastifyReply,
// ) {
//   const FileUpload = request.body.avatar

//   if (!FileUpload) {
//     return reply.status(400).send(
//       json({
//         success: false,
//         message: 'Invalid image format',
//       }),
//     )
//   }

//   const FileUploadBuffer = await FileUpload.toBuffer()

//   // Extract MIME type from buffer
//   const mimeType = extractMimeType(FileUploadBuffer)

//   if (!mimeType || !isImage(mimeType)) {
//     return reply.status(400).send(
//       json({
//         success: false,
//         message: 'Invalid image format',
//       }),
//     )
//   }

//   const sharpService = new SharpService()
//   const convertedImage = await sharpService.convertToJpg(FileUploadBuffer)

//   const userProfileService = new UserProfileService()
//   const user = await userProfileService.getLoggedInUser(request)

//   const supabaseStorageService = new SupabaseStorageService(
//     env.SUPABASE_API_URL,
//     env.SUPABASE_API_KEY,
//     'avatar',
//   )

//   const encryptionService = new EncryptionService(env.SUPABASE_API_KEY)
//   const userId = encryptionService.encrypt(String(Number(user.ID)))

//   const path = `${userId}/avatar.jpeg`
//   const data = await supabaseStorageService.uploadFile(convertedImage, path, 'image/jpeg')
//   const publicUrl = await supabaseStorageService.getPublicFileUrl(data.path)

//   const updateUserProfileUseCase = makeUpdateUserProfileUseCase()
//   const seed = Math.floor(Math.random() * 1000)
//   await updateUserProfileUseCase.updateUser(Number(user.ID), {
//     avatar: `${publicUrl}?version=${seed}`,
//   })

//   reply.status(200).send(
//     json({
//       success: true,
//       message: 'Profile photo updated successfully',
//     }),
//   )
// }

// function extractMimeType(buffer: Buffer): string | undefined {
//   // Basic check to ensure buffer has minimum length for MIME type detection
//   if (buffer.length < 4) return

//   // Determine MIME type based on magic numbers
//   const magicNumbers = buffer.toString('hex', 0, 4).toUpperCase()
//   switch (magicNumbers) {
//     case 'FFD8FFE0':
//     case 'FFD8FFE1':
//       return 'image/jpeg'
//     case '47494638':
//       return 'image/gif'
//     case '89504E47':
//       return 'image/png'
//     default:
//       return
//   }
// }
