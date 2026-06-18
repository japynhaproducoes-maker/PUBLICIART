/**
 * Endpoints — Orders (esteira de produção)
 */

import { ordersApi } from "@/lib/api";
import { apiClient } from "../client";
import { toApiError } from "../errors";
import type { Order, OrderStatus, CreateOrderInput } from "../types";

export const ordersEndpoints = {
  async listOrders(userId: string): Promise<Order[]> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Order[]>("/orders", { query: { user_id: userId } });
      return await ordersApi.listForUser(userId);
    } catch (e) { throw toApiError(e); }
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Order>("/orders", { method: "POST", body: input });
      return await ordersApi.create(input);
    } catch (e) { throw toApiError(e); }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/orders/${id}/status`, { method: "PATCH", body: { status } });
        return;
      }
      await ordersApi.setStatus(id, status);
    } catch (e) { throw toApiError(e); }
  },

  /** Lista global — requer role admin no backend real. */
  async listAdminOrders(): Promise<Order[]> {
    try {
      if (apiClient.isRemote) return apiClient.request<Order[]>("/admin/orders");
      return await ordersApi.listAll();
    } catch (e) { throw toApiError(e); }
  },
};
