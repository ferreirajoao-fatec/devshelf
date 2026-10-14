import type { GitHubErrorReason } from "@/lib/github"

const MESSAGES: Record<GitHubErrorReason, string> = {
  unauthorized: "Sua autorização do GitHub não é mais válida. Saia e entre novamente para reconectar.",
  rate_limited: "O GitHub limitou as requisições por enquanto. Tente de novo em alguns minutos.",
  not_found: "Repositório não encontrado. Só é possível importar repositórios públicos da sua conta.",
  unavailable: "Não foi possível falar com o GitHub agora. Tente de novo em instantes.",
}

export function githubErrorMessage(reason: GitHubErrorReason) {
  return MESSAGES[reason]
}

// IDs de repositório do GitHub são inteiros positivos; qualquer outra coisa é inválida.
export function parseRepoId(value: string) {
  return /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : null
}
