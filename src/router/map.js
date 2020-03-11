import Home from '@/views/Home'
import MaskMap from '@/views/MaskMap'
import oldHome from '@/views/oldHome.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {}
  },
  {
    path: '/maskMap',
    name: 'MaskMap',
    component: MaskMap,
    meta: {}
  },
  {
    path: '/oldHome',
    name: 'oldHome',
    component: oldHome,
    meta: {}
  }
]
