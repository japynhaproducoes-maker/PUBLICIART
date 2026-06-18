import { creditsApi } from "@/lib/api";

export const creditsService = {
  getCredits: creditsApi.listTxForUser.bind(creditsApi),
  consumeCredits: creditsApi.consume.bind(creditsApi),
  addCredits: creditsApi.add.bind(creditsApi),
};
