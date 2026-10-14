import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileSettingsForm } from "@/features/profile/components/profile-settings-form"
import { ThemeSettings } from "@/features/theme/theme-settings"
import { requireUser } from "@/lib/session"
import { getProfileSettings } from "@/services/profiles"

export const metadata: Metadata = {
  title: "Configurações",
}

export default async function SettingsPage() {
  const user = await requireUser()
  const profile = await getProfileSettings(user.id)
  if (!profile) redirect("/login")

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Seu perfil no DevShelf e preferências de exibição.</p>
      </div>

      <Card id="perfil" className="scroll-mt-20">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Como você aparece no seu perfil público e nos seus projetos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            defaultValues={{
              name: profile.name ?? "",
              username: profile.username ?? "",
              bio: profile.bio ?? "",
              isPublic: profile.isPublic,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>O tema fica salvo neste navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSettings />
        </CardContent>
      </Card>
    </div>
  )
}
