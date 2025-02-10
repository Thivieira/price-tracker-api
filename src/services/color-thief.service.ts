import axios from 'axios'
import ColorThief from 'colorthief'

export class ColorThiefService {
  async getDominantColor(imageUrl: string): Promise<string | null> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      })

      const buffer = Buffer.from(response.data)
      const color = await ColorThief.getColor(buffer)

      return `#${color[0].toString(16).padStart(2, '0')}${color[1]
        .toString(16)
        .padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`
    } catch (error) {
      console.error(`Error extracting color from ${imageUrl}:`, error)
      return null // Return null instead of default color to handle errors in the sync service
    }
  }
} 