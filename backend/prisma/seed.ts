/**
 * Seed inicial — planos, templates e usuários de exemplo.
 *
 * Rodar: `npm run seed`
 */

import { PrismaClient, type SectionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding plans…");
  await prisma.plan.createMany({
    skipDuplicates: true,
    data: [
      { id: "start", name: "Start", price: 0, description: "Para começar e testar a plataforma.", credits_per_month: 30, max_projects: 1, features: ["1 projeto ativo", "Templates básicos", "Briefing com IA"], is_popular: false },
      { id: "pro", name: "Pro", price: 4900, description: "Para profissionais e negócios em crescimento.", credits_per_month: 200, max_projects: 10, features: ["10 projetos", "Templates premium", "Publicação ilimitada", "Suporte prioritário"], is_popular: true },
      { id: "business", name: "Business", price: 14900, description: "Para times e agências pequenas.", credits_per_month: 800, max_projects: 50, features: ["50 projetos", "Esteira de produção", "Domínio próprio", "Suporte dedicado"], is_popular: false },
      { id: "full", name: "Full Agency", price: 39900, description: "Plano agência — uso ilimitado.", credits_per_month: 3000, max_projects: -1, features: ["Projetos ilimitados", "Sub-contas", "White-label", "Gerente de conta"], is_popular: false },
    ],
  });

  console.log("Seeding templates…");
  const baseSections: SectionType[] = ["hero", "about", "services", "gallery", "testimonials", "cta", "contact"];
  await prisma.template.createMany({
    skipDuplicates: true,
    data: [
      { name: "Negócio Local", segment: "Negócios locais", description: "Template versátil para comércio e prestadores.", preview_image: "linear-gradient(135deg,#FF6A3D,#7C5CFF)", style_tags: ["popular", "moderno"], sections: baseSections, is_premium: false },
      { name: "Estúdio de Beleza", segment: "Beleza e estética", description: "Visual elegante para salões, barbearias e clínicas.", preview_image: "linear-gradient(135deg,#D4AF37,#0F1115)", style_tags: ["premium", "elegante"], sections: baseSections, is_premium: true },
      { name: "Delivery", segment: "Alimentação", description: "Foco em conversão e WhatsApp.", preview_image: "linear-gradient(135deg,#FF6A3D,#FFB347)", style_tags: ["conversão", "popular"], sections: baseSections, is_premium: false },
      { name: "Advocacia", segment: "Serviços profissionais", description: "Sóbrio, confiável, corporativo.", preview_image: "linear-gradient(135deg,#0F3460,#16213E)", style_tags: ["corporativo", "elegante"], sections: baseSections, is_premium: true },
    ],
  });

  console.log("Seeding admin user…");
  const password_hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@publiciart.app" },
    update: {},
    create: {
      name: "Admin Publiciart",
      email: "admin@publiciart.app",
      password_hash,
      role: "admin",
      plan_id: "full",
      credits_balance: 1000,
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@publiciart.app" },
    update: {},
    create: {
      name: "Cliente Demo",
      email: "demo@publiciart.app",
      password_hash: await bcrypt.hash("demo123", 10),
      role: "user",
      plan_id: "pro",
      credits_balance: 120,
      credit_tx: {
        create: { amount: 120, type: "monthly_grant", description: "Crédito mensal do plano Pro" },
      },
    },
  });

  console.log("✅ Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
