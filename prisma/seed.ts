import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"
import { migrationDatabaseUrl } from "../src/lib/database-url"

// Cliente próprio: src/lib/prisma.ts importa "server-only" e só roda dentro do Next.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: migrationDatabaseUrl() }),
})

// Tecnologias iniciais (nome, slug, cor da marca). Usuários poderão criar outras.
const TECHNOLOGIES: { name: string; slug: string; color: string }[] = [
  // Linguagens
  { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
  { name: "TypeScript", slug: "typescript", color: "#3178C6" },
  { name: "Python", slug: "python", color: "#3776AB" },
  { name: "Java", slug: "java", color: "#ED8B00" },
  { name: "C#", slug: "csharp", color: "#512BD4" },
  { name: "Go", slug: "go", color: "#00ADD8" },
  { name: "Rust", slug: "rust", color: "#DEA584" },
  { name: "PHP", slug: "php", color: "#777BB4" },
  { name: "Kotlin", slug: "kotlin", color: "#7F52FF" },
  { name: "Swift", slug: "swift", color: "#F05138" },
  { name: "Dart", slug: "dart", color: "#0175C2" },
  { name: "C", slug: "c", color: "#A8B9CC" },
  { name: "C++", slug: "cpp", color: "#00599C" },
  { name: "Ruby", slug: "ruby", color: "#CC342D" },
  // Frontend
  { name: "React", slug: "react", color: "#61DAFB" },
  { name: "Next.js", slug: "nextjs", color: "#000000" },
  { name: "Vue.js", slug: "vuejs", color: "#4FC08D" },
  { name: "Angular", slug: "angular", color: "#DD0031" },
  { name: "Svelte", slug: "svelte", color: "#FF3E00" },
  { name: "Tailwind CSS", slug: "tailwindcss", color: "#06B6D4" },
  { name: "HTML", slug: "html", color: "#E34F26" },
  { name: "CSS", slug: "css", color: "#1572B6" },
  // Backend
  { name: "Node.js", slug: "nodejs", color: "#5FA04E" },
  { name: "Express", slug: "express", color: "#000000" },
  { name: "NestJS", slug: "nestjs", color: "#E0234E" },
  { name: "Django", slug: "django", color: "#092E20" },
  { name: "FastAPI", slug: "fastapi", color: "#009688" },
  { name: "Flask", slug: "flask", color: "#000000" },
  { name: "Spring Boot", slug: "spring-boot", color: "#6DB33F" },
  { name: ".NET", slug: "dotnet", color: "#512BD4" },
  { name: "Laravel", slug: "laravel", color: "#FF2D20" },
  // Mobile
  { name: "React Native", slug: "react-native", color: "#61DAFB" },
  { name: "Flutter", slug: "flutter", color: "#02569B" },
  // Dados
  { name: "PostgreSQL", slug: "postgresql", color: "#4169E1" },
  { name: "MySQL", slug: "mysql", color: "#4479A1" },
  { name: "MongoDB", slug: "mongodb", color: "#47A248" },
  { name: "SQLite", slug: "sqlite", color: "#003B57" },
  { name: "Redis", slug: "redis", color: "#FF4438" },
  { name: "Prisma", slug: "prisma", color: "#2D3748" },
  { name: "Firebase", slug: "firebase", color: "#DD2C00" },
  { name: "Supabase", slug: "supabase", color: "#3FCF8E" },
  // Infra e ferramentas
  { name: "Docker", slug: "docker", color: "#2496ED" },
  { name: "Kubernetes", slug: "kubernetes", color: "#326CE5" },
  { name: "AWS", slug: "aws", color: "#FF9900" },
  { name: "Vercel", slug: "vercel", color: "#000000" },
  { name: "GraphQL", slug: "graphql", color: "#E10098" },
]

async function main() {
  for (const tech of TECHNOLOGIES) {
    await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, color: tech.color },
      create: tech,
    })
  }
  console.log(`Seed concluído: ${TECHNOLOGIES.length} tecnologias.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
