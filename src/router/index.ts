import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddExpense from '../views/AddExpense.vue';
import EditExpense from '../views/EditExpense.vue';
import Settings from '../views/Settings.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/add',
            name: 'add',
            component: AddExpense
        },
        {
            path: '/edit/:id',
            name: 'edit',
            component: EditExpense
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings
        }
    ]
});

export default router;
