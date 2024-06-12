import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/'
})

api.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    'x-token': window.localStorage.getItem('TOKEN')
  }

  return config
})

export default api