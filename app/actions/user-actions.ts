'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getUserAddresses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching addresses:", error)
        return []
    }

    return data
}

export async function addUserAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const address = {
        user_id: user.id,
        full_name: formData.get('name'),
        address_line1: formData.get('line1'),
        address_line2: formData.get('line2'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('postal_code'),
        country: formData.get('country'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        is_default: false
    }

    const { error } = await supabase.from('addresses').insert(address)

    if (error) {
        console.error("Error adding address:", error)
        return { error: error.message }
    }

    revalidatePath('/checkout')
    return { success: true }
}

export async function updateUserAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const id = formData.get('id')
    const address = {
        full_name: formData.get('name'),
        address_line1: formData.get('line1'),
        address_line2: formData.get('line2'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('postal_code'),
        country: formData.get('country'),
        phone: formData.get('phone'),
        email: formData.get('email')
    }

    const { error } = await supabase
        .from('addresses')
        .update(address)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error updating address:", error)
        return { error: error.message }
    }

    revalidatePath('/account/addresses')
    return { success: true }
}

export async function deleteUserAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error deleting address:", error)
        return { error: error.message }
    }

    revalidatePath('/account/addresses')
    return { success: true }
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // First set all to false
    await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

    // Then set selected to true
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error setting default address:", error)
        return { error: error.message }
    }

    revalidatePath('/account/addresses')
    return { success: true }
}
