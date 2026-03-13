"use client"

import { useEffect, useState } from "react"
import { getUserAddresses, addUserAddress } from "@/app/actions/user-actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, CheckCircle2, MapPin } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog" // Need to ensure Dialog is created/installed? I installed @radix-ui/react-dialog but need the component file. 
// I will assume I need to create components/ui/dialog.tsx if it doesn't exist.
// Checking previous file list, I didn't see dialog.tsx. I will assume I need to create it or I can just create it now just in case.
// Wait, I will use a simple inline form if I can't check dialog existence easily, but the plan said "Dialog".
// I'll create the component assuming Dialog exists or I'll genericize it.
// Actually, I'll create components/ui/dialog.tsx in the next step if I haven't.

import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Address {
    id: string
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    zip_code: string
    country: string
    phone?: string
    email?: string
    is_default: boolean
}

interface AddressSelectionProps {
    onSelect: (address: Address) => void
}

export function AddressSelection({ onSelect }: AddressSelectionProps) {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        loadAddresses()
    }, [])

    async function loadAddresses() {
        setIsLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        console.log("User ID:", user?.id)

        if (!user) {
            setAddresses([])
            setIsLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })

        console.log("Raw Address Data:", data, error)

        if (error) {
            console.error("Error fetching addresses:", error)
            toast.error("Failed to load addresses")
            setAddresses([])
        } else {
            // @ts-ignore - Supabase returns what it returns, casting to Address[] usually works if schema matches
            setAddresses(data as unknown as Address[] || [])

            // Auto-select if we have addresses and none selected
            if (data && data.length > 0 && !selectedId) {
                const firstAddr = data[0] as unknown as Address
                setSelectedId(firstAddr.id)
                onSelect(firstAddr)
            }
        }

        setIsLoading(false)
    }

    async function handleAddAddress(formData: FormData) {
        const address = {
            id: `guest-${Date.now()}`,
            full_name: formData.get('name') as string,
            address_line1: formData.get('line1') as string,
            address_line2: formData.get('line2') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zip_code: formData.get('postal_code') as string,
            country: formData.get('country') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            is_default: false
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const result = await addUserAddress(formData)
            if (result?.error) {
                toast.error(result.error)
                return
            }
            toast.success("Address added")
            setIsDialogOpen(false)
            loadAddresses()
            // We don't handleSelect here immediately because loadAddresses will auto-select the latest, 
            // but for immediate feedback we could. Let loadAddresses handle it.
        } else {
            setAddresses(prev => [address, ...prev])
            toast.success("Address added")
            setIsDialogOpen(false)
            handleSelect(address)
        }
    }

    const handleSelect = (address: Address) => {
        setSelectedId(address.id)
        onSelect(address)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <Card
                        key={addr.id}
                        className={cn(
                            "cursor-pointer transition-all hover:border-zinc-400 dark:hover:border-zinc-700",
                            selectedId === addr.id ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100" : ""
                        )}
                        onClick={() => handleSelect(addr)}
                    >
                        <CardContent className="p-4 relative">
                            {selectedId === addr.id && (
                                <div className="absolute top-2 right-2 text-zinc-900 dark:text-zinc-100">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-semibold">{addr.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                                    {addr.address_line2 && <p className="text-sm text-muted-foreground">{addr.address_line2}</p>}
                                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip_code}</p>
                                    <p className="text-sm text-muted-foreground">{addr.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add New Button / Dialog Trigger */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer border-dashed hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-center p-6 min-h-[140px] bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Plus className="h-8 w-8" />
                                <span className="font-medium">Add New Address</span>
                            </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Shipping Address</DialogTitle>
                            <DialogDescription>Enter your delivery details below.</DialogDescription>
                        </DialogHeader>
                        <form action={handleAddAddress} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" required placeholder="full name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line1">Address Line 1</Label>
                                <Input id="line1" name="line1" required placeholder="123 Main St" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                                <Input id="line2" name="line2" placeholder="Apt 4B" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" name="state" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input id="postal_code" name="postal_code" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" name="country" required defaultValue="India" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" required placeholder="+91-000000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" required placeholder="User@gmail.com" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Address</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    )
}
