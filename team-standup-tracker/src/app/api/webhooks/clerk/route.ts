import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name, imageUrl: image_url },
      create: { clerkId: id, email, name, imageUrl: image_url },
    });

    // Auto-accept any pending invites for this email
    const pendingInvites = await prisma.teamInvite.findMany({
      where: { email, status: "PENDING" },
    });

    const user = await prisma.user.findUnique({ where: { clerkId: id } });
    if (user) {
      for (const invite of pendingInvites) {
        await prisma.teamMembership.upsert({
          where: { userId_teamId: { userId: user.id, teamId: invite.teamId } },
          update: {},
          create: { userId: user.id, teamId: invite.teamId, role: "MEMBER" },
        });
        await prisma.teamInvite.update({
          where: { id: invite.id },
          data: { status: "ACCEPTED" },
        });
      }
    }
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    if (id) {
      await prisma.user.deleteMany({ where: { clerkId: id } });
    }
  }

  return NextResponse.json({ received: true });
}
