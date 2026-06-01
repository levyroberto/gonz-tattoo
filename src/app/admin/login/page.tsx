import Link from "next/link"
import { LockKeyhole } from "lucide-react"

import { loginAdmin } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin")
  }

  const params = await searchParams
  const hasError = params.error === "invalid"
  const hasConfigError = params.error === "config"

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 text-center text-3xl tracking-wider">
          <span>GONZ</span>
          <span className="text-primary"> TATTOO</span>
        </Link>

        <Card className="rounded-lg border border-border/70 bg-card/90">
          <CardHeader className="gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted">
              <LockKeyhole className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-wide">Acceso admin</CardTitle>
              <CardDescription>Ingresá para gestionar el contenido del sitio.</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form action={loginAdmin} className="grid gap-4">
              <label className="grid gap-2 text-sm text-muted-foreground">
                Email
                <input
                  className="h-11 rounded-md border border-border bg-input px-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm text-muted-foreground">
                Contraseña
                <input
                  className="h-11 rounded-md border border-border bg-input px-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {hasError && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Email o contraseña incorrectos.
                </p>
              )}

              {hasConfigError && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Faltan variables de entorno de Supabase.
                </p>
              )}

              <Button className="h-11 text-base tracking-wider" type="submit">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
