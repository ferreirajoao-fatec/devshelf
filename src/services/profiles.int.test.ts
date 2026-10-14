import { describe, expect, it } from "vitest"

import { createUser } from "../../test/factories"

import { findAvailableUsername, getViewableProfile, updateProfile, UsernameTakenError } from "./profiles"

describe("getViewableProfile", () => {
  it("perfil desativado só aparece para o dono", async () => {
    const owner = await createUser({ username: "dona", isPublic: false })
    const visitor = await createUser()

    expect(await getViewableProfile("dona", null)).toBeNull()
    expect(await getViewableProfile("dona", visitor.id)).toBeNull()
    expect(await getViewableProfile("dona", owner.id)).toMatchObject({ id: owner.id })
  })

  it("perfil ativo aparece para todos, sem diferenciar maiúsculas no endereço", async () => {
    await createUser({ username: "publica", isPublic: true })
    expect(await getViewableProfile("PUBLICA", null)).toMatchObject({ username: "publica" })
  })
})

describe("updateProfile", () => {
  const data = { name: "Nova", username: "nova", bio: "Oi", isPublic: true }

  it("salva nome, username, bio e visibilidade", async () => {
    const user = await createUser()
    await updateProfile(user.id, data)
    expect(await getViewableProfile("nova", null)).toMatchObject({ name: "Nova", bio: "Oi", isPublic: true })
  })

  it("recusa username de outra pessoa, mas aceita manter o próprio", async () => {
    await createUser({ username: "ocupado" })
    const user = await createUser({ username: "meu" })

    await expect(updateProfile(user.id, { ...data, username: "ocupado" })).rejects.toBeInstanceOf(UsernameTakenError)
    await expect(updateProfile(user.id, { ...data, username: "meu" })).resolves.toBeUndefined()
  })
})

describe("findAvailableUsername", () => {
  it("usa o login do GitHub quando está livre", async () => {
    expect(await findAvailableUsername("Octocat")).toBe("octocat")
  })

  it("escolhe uma variação livre quando o login já foi adotado", async () => {
    await createUser({ username: "octocat" })
    await createUser({ username: "octocat-2" })
    expect(await findAvailableUsername("octocat")).toBe("octocat-3")
  })
})
