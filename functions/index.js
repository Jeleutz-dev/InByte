const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// 1. CREATE CHECKOUT & PENDING INVITE
exports.createCheckout = onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        try {
            const { inviteData, userId } = req.body;

            if (!inviteData || !userId) {
                return res.status(400).json({ error: "Missing required invite details." });
            }

            // Server-side: Create document locked in 'pending_payment'
            const docRef = await db.collection("invites").add({
                ...inviteData,
                userId: userId,
                status: "pending_payment",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: Date.now(),
                views: 0
            });

            const secretKey = process.env.PAYMONGO_SECRET_KEY;
            const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");

            const payload = {
                data: {
                    attributes: {
                        send_email_receipt: false,
                        show_description: true,
                        show_line_items: true,
                        payment_method_types: ["card", "gcash", "qrph", "paymaya"],
                        line_items: [
                            {
                                currency: "PHP",
                                amount: 24900, // ₱249.00
                                name: "InByte Custom Invitation",
                                quantity: 1,
                                description: "Interactive movie date invite link"
                            }
                        ],
                        success_url: `https://inbyte.date/web-generator/index.html?payment=success&invite_id=${docRef.id}`,
                        cancel_url: "https://inbyte.date/web-generator/index.html?payment=cancelled",
                        metadata: {
                            inviteId: docRef.id
                        }
                    }
                }
            };

            const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            console.error("PayMongo / Firestore Error:", error);
            return res.status(500).json({ error: "Failed to initialize checkout." });
        }
    });
});

// 2. SECURE PAYMONGO WEBHOOK LISTENER
exports.paymongoWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const signatureHeader = req.headers["paymongo-signature"];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
        return res.status(400).send("Missing signature header or secret.");
    }

    // Parse signature header (t=timestamp, te=test signature, li=live signature)
    const signatureParts = signatureHeader.split(",").reduce((acc, part) => {
        const [key, value] = part.trim().split("=");
        acc[key] = value;
        return acc;
    }, {});

    const timestamp = signatureParts.t;
    const receivedSig = signatureParts.li || signatureParts.te;
    const rawPayload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    // Compute expected HMAC SHA256 signature
    const computedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(`${timestamp}.${rawPayload}`)
        .digest("hex");

    if (receivedSig !== computedSig) {
        console.error("Invalid Webhook Signature.");
        return res.status(401).send("Invalid signature.");
    }

    const event = req.body.data;
    const eventType = event?.attributes?.type;

    if (eventType === "checkout_session.payment.paid") {
        const sessionData = event.attributes.data;
        const inviteId = sessionData?.attributes?.metadata?.inviteId;

        if (inviteId) {
            await db.collection("invites").doc(inviteId).update({
                status: "active",
                paidAt: Date.now()
            });
            console.log(`Invite ${inviteId} successfully activated via verified payment.`);
        }
    }

    return res.status(200).json({ received: true });
});