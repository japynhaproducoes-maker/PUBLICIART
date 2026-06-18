/**
 * Endpoints — Assets (uploads, mídias do projeto).
 *
 * Hoje: armazenamento em memória dentro do store (sem persistência de
 * binários). Backend real: presigned URL para S3/R2 + registro em DB.
 */

import { store, uid } from "@/lib/data/store";
import { apiClient } from "../client";
import { ApiError, toApiError } from "../errors";
import type { Asset, UploadAssetInput } from "../types";

const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const assetsEndpoints = {
  async uploadAsset(input: UploadAssetInput): Promise<Asset> {
    try {
      if (apiClient.isRemote) {
        return apiClient.request<Asset>("/assets", { method: "POST", body: input });
      }
      await wait();
      const asset: Asset = {
        id: uid("ast"),
        user_id: input.user_id,
        project_id: input.project_id ?? null,
        type: input.type,
        name: input.name,
        url: input.url,
        created_at: new Date().toISOString(),
      };
      store.update((n) => {
        n.assets = [asset, ...(n.assets ?? [])];
      });
      return asset;
    } catch (e) { throw toApiError(e); }
  },

  async listAssets(userId: string, projectId?: string | null): Promise<Asset[]> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Asset[]>("/assets", {
          query: { user_id: userId, project_id: projectId ?? undefined },
        });
      await wait(60);
      const all = (store.get().assets ?? []) as Asset[];
      return all.filter(
        (a) => a.user_id === userId && (projectId === undefined || a.project_id === projectId),
      );
    } catch (e) { throw toApiError(e); }
  },

  async deleteAsset(id: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/assets/${id}`, { method: "DELETE" });
        return;
      }
      await wait(60);
      const exists = (store.get().assets ?? []).some((a) => a.id === id);
      if (!exists) throw new ApiError("NOT_FOUND", "Asset não encontrado.", 404);
      store.update((n) => {
        n.assets = (n.assets ?? []).filter((a) => a.id !== id);
      });
    } catch (e) { throw toApiError(e); }
  },
};
