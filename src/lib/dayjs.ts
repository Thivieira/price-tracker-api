import dayjs from 'dayjs'

import 'dayjs/locale/pt-br.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.locale('pt-br')

dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
