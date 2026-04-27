import React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { Link } from "gatsby"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, SearchX } from "lucide-react"

const NotFoundPage: React.FC<PageProps> = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to home
        </Link>
      </Button>
    </div>
  </Layout>
)

export default NotFoundPage

export const Head: HeadFC = () => <title>404 · Alban Petit</title>
