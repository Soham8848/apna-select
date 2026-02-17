"use client"

import { useState } from "react"
import { Address } from "@/types" // We assume types exist or we adapt
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    MapPin,
    MoreVertical,
    Pencil,
    Trash2,
    Check
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { addUserAddress, deleteUserAddress, setDefaultAddress, updateUserAddress } from "@/app/actions/user-actions"

// AddressType replaced by imported Address

export function AddressBookList({ initialAddresses }: { initialAddresses: any[] }) {
    // Cast initialAddresses to Address[]
    const [addresses] = useState<Address[]>(initialAddresses as Address[])
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    async function handleAdd(formData: FormData) {
        const result = await addUserAddress(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Address added successfully")
            setIsAddOpen(false)
            // In a real app we might verify optimistcally or router.refresh handles it
            // Since this is a server component parent, router.refresh is best but here we rely on parent re-render?
            // Actually client component can't force parent re-render easily without router.refresh
            window.location.reload() // Brute force refresh for simplicity or use router
        }
    }

    async function handleUpdate(formData: FormData) {
        if (!editingAddress) return
        formData.append('id', editingAddress.id)
        const result = await updateUserAddress(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Address updated")
            setEditingAddress(null)
            window.location.reload()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this address?")) return
        const result = await deleteUserAddress(id)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Address deleted")
            window.location.reload()
        }
    }

    async function handleSetDefault(id: string) {
        const result = await setDefaultAddress(id)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Default address updated")
            window.location.reload()
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add New Card */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer border-dashed border-2 hover:border-zinc-400 dark:hover:border-zinc-700 flex flex-col items-center justify-center p-6 min-h-[200px] bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <Plus className="h-6 w-6 text-zinc-500" />
                        </div>
                        <h3 className="font-semibold text-lg">Add New Address</h3>
                        <p className="text-sm text-muted-foreground">Add a new destination for delivery</p>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm action={handleAdd} />
                </DialogContent>
            </Dialog>

            {/* Address Cards */}
            {addresses.map((addr) => (
                <Card key={addr.id} className={`relative overflow-hidden ${addr.is_default ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100' : ''}`}>
                    {addr.is_default && (
                        <div className="absolute top-0 right-0 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-bl-lg">
                            Default
                        </div>
                    )}
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{addr.full_name}</span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingAddress(addr)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    {!addr.is_default && (
                                        <DropdownMenuItem onClick={() => handleSetDefault(addr.id)}>
                                            <Check className="mr-2 h-4 w-4" /> Set as Default
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleDelete(addr.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{addr.address_line1}</p>
                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                            <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                            <p>{addr.country}</p>
                            {addr.phone && <p className="pt-2">{addr.phone}</p>}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Edit Dialog */}
            <Dialog open={!!editingAddress} onOpenChange={(open) => !open && setEditingAddress(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    {editingAddress && (
                        <AddressForm
                            action={handleUpdate}
                            initialData={editingAddress}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function AddressForm({ action, initialData }: { action: (formData: FormData) => void, initialData?: Address }) {
    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required defaultValue={initialData?.full_name} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <Input id="line1" name="line1" required defaultValue={initialData?.address_line1} placeholder="123 Main St" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input id="line2" name="line2" defaultValue={initialData?.address_line2 || ''} placeholder="Apt 4B" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required defaultValue={initialData?.city} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" required defaultValue={initialData?.state} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" name="postal_code" required defaultValue={initialData?.postal_code} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" required defaultValue={initialData?.country || 'United States'} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" required defaultValue={initialData?.phone} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required defaultValue={initialData?.email} placeholder="john@example.com" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save Address</Button>
            </DialogFooter>
        </form>
    )
}
