import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/home.vue";
import Registration from "@/pages/registration.vue";
import Waitlist from "@/pages/waitlist.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: "home", path: "/", component: Home },
    { name: "registration", path: "/registration", component: Registration },
    { name: "waitlist", path: "/waitlist", component: Waitlist }
  ]
});
