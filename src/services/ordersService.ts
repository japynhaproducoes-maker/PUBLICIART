import { ordersApi } from "@/lib/api";

export const ordersService = {
  listForUser: ordersApi.listForUser.bind(ordersApi),
  listAll: ordersApi.listAll.bind(ordersApi),
  createOrder: ordersApi.create.bind(ordersApi),
  updateOrder: ordersApi.update.bind(ordersApi),
  updateOrderStatus: ordersApi.setStatus.bind(ordersApi),
};
