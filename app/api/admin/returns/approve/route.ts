import { decideReturn } from "@/lib/server/returns"

export async function POST(req: Request) {
    return decideReturn(req, "approved")
}
