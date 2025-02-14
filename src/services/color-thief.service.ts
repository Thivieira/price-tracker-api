import axios from 'axios'
import ColorThief from 'colorthief'

const DEFAULT_CRYPTO_ICON = 'https://static-00.iconduck.com/assets.00/generic-cryptocurrency-icon-2048x2048-8uz1hlry.png'

export class ColorThiefService {
  async getDominantColor(imageUrl: string): Promise<string> {
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
      // Try with default crypto icon if original image fails
      try {
        const response = await axios.get(DEFAULT_CRYPTO_ICON, {
          responseType: 'arraybuffer'
        })

        const buffer = Buffer.from(response.data)
        const color = await ColorThief.getColor(buffer)

        return `#${color[0].toString(16).padStart(2, '0')}${color[1]
          .toString(16)
          .padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`
      } catch {
        // If both attempts fail, return a default color
        return '#000000'
      }
    }
  }
} 