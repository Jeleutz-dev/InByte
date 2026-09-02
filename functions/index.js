const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });

exports.createCheckout = onRequest((req, res) => {
    // Wrap the request in CORS to allow your frontend to communicate with it securely
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        // 1. Enter your PayMongo Secret Key here
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
                            amount: 5000, // 5000 centavos = ₱50.00
                            name: "InByte Custom Invitation",
                            quantity: 1,
                            description: "Interactive movie date invite link"
                        }
                    ],
                    success_url: "https://inbyte.date/web-generator/index.html?payment=success",
                    cancel_url: "https://inbyte.date/web-generator/index.html?payment=cancelled"
                }
            }
        };

        try {
            const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            res.status(200).send(data);
        } catch (error) {
            console.error("PayMongo Error:", error);
            res.status(500).send({ error: "Failed to initialize payment" });
        }
    });
});