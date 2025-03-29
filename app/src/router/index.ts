import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'Home',
      path: '/',
      // @ts-ignore
      component: () => import('../components/PageHome.vue'),
    },
    {
      name: 'Topics',
      path: '/topics/:topic?',
      // @ts-ignore
      component: () => import('../components/PageTopics.vue'),
    },
    {
      name: 'Users',
      path: '/users/:author?',
      // @ts-ignore
      component: () => import('../components/PageUsers.vue'),
    },
    {
      name: 'Profile',
      path: '/profile',
      // @ts-ignore
      component: () => import('../components/PageProfile.vue'),
    },
    {
      name: 'Tweet',
      path: '/tweet/:tweet',
      // @ts-ignore
      component: () => import('../components/PageTweet.vue'),
    },
    {
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
      // @ts-ignore
      component: () => import('../components/PageNotFound.vue'),
    },
  ],
})

export default router
