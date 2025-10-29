"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { adminNavItems } from "@/lib/config/navigation"
import { usersApi } from "@/lib/api/users"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Lock, Plus, RefreshCcw, Trash2, UserPlus, Users } from "lucide-react"

interface UserFormState {
  name: string
  email: string
  role: User["role"]
  status: User["status"]
}

const statusLabels: Record<User["status"], string> = {
  active: "Active",
  suspended: "Suspended",
}

const statusVariants: Record<User["status"], "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  suspended: "destructive",
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formState, setFormState] = useState<UserFormState>({
    name: "",
    email: "",
    role: "client",
    status: "active",
  })

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Failed to load users",
        description: "We could not retrieve the user directory. Try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleStatusToggle = async (user: User) => {
    try {
      const nextStatus = user.status === "active" ? "suspended" : "active"
      await usersApi.updateStatus(user.id, nextStatus)
      toast({
        title: "Status updated",
        description: `${user.name} is now marked as ${statusLabels[nextStatus].toLowerCase()}.`,
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Unable to update status",
        description: "We ran into a problem while switching the account status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete the account for ${user.name}? This action cannot be undone.`)) return

    try {
      const success = await usersApi.delete(user.id)
      if (!success) {
        toast({
          title: "Delete failed",
          description: "We could not remove this account. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "User removed",
        description: `${user.name}'s account has been deleted.`,
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred while removing the account.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormState({
      name: "",
      email: "",
      role: "client",
      status: "active",
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormState({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formState)
        toast({
          title: "User updated",
          description: `${formState.name}'s details were saved successfully.`,
        })
      } else {
        await usersApi.create(formState)
        toast({
          title: "User added",
          description: `${formState.name} can now access the platform.`,
        })
      }

      setDialogOpen(false)
      resetForm()
      loadUsers()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "We could not save these changes. Please review the form and try again.",
        variant: "destructive",
      })
    }
  }

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((user) => user.status === "active").length
    const admins = users.filter((user) => user.role === "admin").length
    const clients = users.filter((user) => user.role === "client").length
    return { total, active, admins, clients }
  }, [users])

  return (
    <DashboardLayout sidebarItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">User directory</h1>
            <p className="text-muted-foreground">
              Manage administrative access, suspend accounts, and invite new operators.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCcw className="ml-2 h-4 w-4" />
              Refresh list
            </Button>
            <Button onClick={openCreateDialog}>
              <UserPlus className="ml-2 h-4 w-4" />
              Invite user
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total users" value={stats.total} icon={<Users className="h-4 w-4" />} />
          <StatCard title="Active" value={stats.active} icon={<Plus className="h-4 w-4" />} />
          <StatCard title="Administrators" value={stats.admins} icon={<Lock className="h-4 w-4" />} />
          <StatCard title="Clients" value={stats.clients} icon={<UserPlus className="h-4 w-4" />} />
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading users…</div>
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No accounts found. Use “Invite user” to add someone new.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name &amp; email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.role === "admin" ? "Administrator" : "Client"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[user.status]}>{statusLabels[user.status]}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString("fa-IR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} aria-label="Edit user">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusToggle(user)}
                          aria-label="Toggle status"
                        >
                          {user.status === "active" ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit user" : "Invite user"}</DialogTitle>
            <DialogDescription>Provide basic account details and choose the default role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, role: value as User["role"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as User["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? "Save changes" : "Create account"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
